/** PostgreSQL verification. All business writes are contained in a rollback-only
 * transaction. A savepoint emulates each endpoint transaction faithfully.
 * Run: node --import tsx --env-file=.env scripts/verify-customer-order.ts
 */
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../layers/menu/generated/prisma/client';
import { getCustomerOffer, submitCustomerOrder, getPrivateCustomerOrder } from '../layers/menu/server/utils/customerOrders';
import { issueCustomerOrderInvitation, revokeOrderLinks } from '../layers/menu/server/utils/orderAccess';
import { getOrderById, updateOrder } from '../layers/menu/server/utils/orders';
import type { CustomerOrderInput } from '../layers/menu/shared/types/customerOrder';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
const previous = globalDb.prisma;
const rollback = new Error('Rollback verification fixtures');
let injectFailure = false;
const checks: string[] = [];
const token = () => randomBytes(32).toString('hex');
try {
  await db.$transaction(async tx => {
    let sequence = 0;
    globalDb.prisma = new Proxy(tx, { get(target, property) {
      if (property === '$transaction') return async (run: (client: Prisma.TransactionClient) => unknown) => {
        const savepoint = `customer_flow_${++sequence}`;
        await tx.$executeRawUnsafe(`SAVEPOINT ${savepoint}`);
        try { const result = await run(globalDb.prisma as unknown as Prisma.TransactionClient); await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${savepoint}`); return result }
        catch (error) { await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${savepoint}`); throw error }
      };
      if (property === 'orderMenuSlot' && injectFailure) return { create: () => { throw new Error('Injected meal persistence failure') } };
      return Reflect.get(target, property);
    } }) as unknown as PrismaClient;
    // Uncommitted changes are invisible to other sessions and restored at exit.
    await tx.weeklyCycle.updateMany({ where: { status: 'OPEN' }, data: { status: 'CLOSED' } });
    const cycle = await tx.weeklyCycle.create({ data: { weekStart: new Date('2098-11-17'), status: 'OPEN', orderCutoffAt: new Date('2098-11-14T02:00:00Z'),
      firstDeliveryAllowedDays: ['LUNES'], secondDeliveryAllowedDays: ['JUEVES'], firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'] } });
    const tag = randomUUID();
    const menu = await tx.weeklyMenu.create({ data: { name: `Verify customer ${tag}`, menuType: 'ESTANDAR', cycleId: cycle.id, cycleScope: 'ESTANDAR',
      startDate: cycle.weekStart, endDate: new Date('2098-11-21'), days: { create: (['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const).map((dayOfWeek, i) => ({ dayOfWeek, order: i + 1,
        slots: { create: { slotType: 'COMIDA', contenedor: 'Contenedor prueba', components: { create: [
          { componentRole: 'PLATILLO_PRINCIPAL', nombre: `Principal ${i}`, descripcion: 'Prueba', calorias: 400, imagen: '', tipo: 'comida' },
          { componentRole: 'GUARNICION_1', nombre: `Arroz ${i}`, descripcion: 'Prueba', calorias: 100, imagen: '', tipo: 'comida' },
        ] } } } })) } } });
    const plan = await tx.plan.create({ data: { title: `Verify customer ${tag}`, description: 'Verificación temporal', image: 'verification/plan.png', slotTypes: ['COMIDA'], variants: { create: { title: '3 días', daysCount: 3, price: 900 } } }, include: { variants: true } });
    const variant = plan.variants[0]!;
    const offer = await getCustomerOffer(variant.id, 'ESTANDAR');
    assert.equal(offer.contact, null);
    assert.equal(JSON.stringify(offer).includes('recipe'), false);
    assert.equal(JSON.stringify(offer).includes('catalogItemId'), false);
    const days = ['LUNES', 'MARTES', 'JUEVES'] as const;
    const input: CustomerOrderInput = { menuId: menu.id, planVariantId: variant.id, offerVersion: offer.menu.version, offerRevision: offer.revision, expectedPrice: offer.variant.price,
      contact: { nombre: 'ZZ Cliente verificación', telefono: '6640000003', correoElectronico: '' }, days: [...days], notes: 'Nota general',
      meals: offer.slots.filter(s => (days as readonly string[]).includes(s.dayOfWeek)).map(s => ({ dayOfWeek: s.dayOfWeek, slotType: s.slotType, notes: `Nota ${s.dayOfWeek}`,
        components: s.components.map(c => ({ originalId: c.originalId, selectedId: c.originalId })) })),
      deliveries: [{ sequence: 1, deliveryDay: 'LUNES', address: 'Dirección primera de verificación' }, { sequence: 2, deliveryDay: 'JUEVES', address: 'Dirección segunda de verificación' }] };
    const replacement = offer.options.find(o => o.componentRole === 'PLATILLO_PRINCIPAL' && o.dayOfWeek === 'VIERNES')!;
    input.meals[0]!.components.find(c => c.originalId === offer.options.find(o => o.dayOfWeek === 'LUNES' && o.componentRole === 'PLATILLO_PRINCIPAL')!.id)!.selectedId = replacement.id;
    assert.ok(!offer.options.some(option => option.nombre === 'Sin menu asignado'));
    const key = randomUUID(); const secret = token();
    await submitCustomerOrder(input, key, secret, 'ESTANDAR');
    const privateOrder = await getPrivateCustomerOrder(secret);
    assert.equal(privateOrder.price, 900); assert.equal(privateOrder.deliveries.length, 2);
    assert.equal(privateOrder.meals[0]!.notes, 'Nota LUNES'); assert.ok(privateOrder.meals[0]!.dishes.includes('Principal 4'));
    assert.equal(privateOrder.contact.nombre, input.contact.nombre);
    const stored = await tx.order.findUniqueOrThrow({ where: { idempotencyKey: key } });
    assert.ok(await tx.orderMenuChange.count({ where: { orderId: stored.id } }));
    assert.equal((await submitCustomerOrder(input, key, secret, 'ESTANDAR')).replayed, true);
    await assert.rejects(submitCustomerOrder(input, key, token(), 'ESTANDAR'), { statusCode: 409 });
    assert.equal(await tx.order.count({ where: { idempotencyKey: key } }), 1);
    checks.push('Public offer, personalised snapshot, contact, notes, two deliveries and idempotent retry');
    await assert.rejects(getPrivateCustomerOrder(token()), { statusCode: 404 });
    const otherToken = token();
    await submitCustomerOrder({ ...input, contact: { ...input.contact, nombre: 'Otro cliente mismo teléfono' } }, randomUUID(), otherToken, 'ESTANDAR');
    const otherLink = await tx.orderAccessLink.findUniqueOrThrow({ where: { tokenHash: (await import('../layers/menu/server/utils/orderAccess')).hashOrderSecret(otherToken) } });
    assert.notEqual(otherLink.customerId, stored.customerId);
    assert.equal((await tx.customer.findUniqueOrThrow({ where: { id: stored.customerId } })).nombre, input.contact.nombre);
    checks.push('Phone does not identify or overwrite an existing customer; random link denies access');
    const countsBefore = [await tx.customer.count(), await tx.order.count(), await tx.orderAccessLink.count()];
    injectFailure = true;
    await assert.rejects(submitCustomerOrder(input, randomUUID(), token(), 'ESTANDAR'), /Injected meal persistence failure/);
    injectFailure = false;
    assert.deepEqual([await tx.customer.count(), await tx.order.count(), await tx.orderAccessLink.count()], countsBefore);
    checks.push('A meal persistence failure rolls back customer, order, deliveries and private link');
    await assert.rejects(submitCustomerOrder({ ...input, expectedPrice: 1 }, randomUUID(), token(), 'ESTANDAR'), { statusCode: 409 });
    await tx.weeklyMenu.update({ where: { id: menu.id }, data: { version: { increment: 1 } } });
    await assert.rejects(submitCustomerOrder(input, randomUUID(), token(), 'ESTANDAR'), { statusCode: 409 });
    await tx.weeklyMenu.update({ where: { id: menu.id }, data: { version: input.offerVersion } });
    await tx.planVariant.update({ where: { id: variant.id }, data: { title: 'Nueva presentación' } });
    await assert.rejects(submitCustomerOrder(input, randomUUID(), token(), 'ESTANDAR'), { statusCode: 409 });
    input.offerRevision = (await getCustomerOffer(variant.id, 'ESTANDAR')).revision;
    checks.push('Stale price, menu and plan variant revisions are rejected');
    const invitation = await issueCustomerOrderInvitation(stored.customerId);
    const invitedToken = invitation.path.split('=')[1]!;
    const invited = await getCustomerOffer(variant.id, 'ESTANDAR', invitedToken);
    assert.equal(invited.contact?.nombre, input.contact.nombre);
    const invitedKey = randomUUID();
    await submitCustomerOrder(input, invitedKey, token(), 'ESTANDAR', invitedToken);
    assert.equal((await tx.order.findUniqueOrThrow({ where: { idempotencyKey: invitedKey } })).customerId, stored.customerId);
    await assert.rejects(getPrivateCustomerOrder(invitedToken), { statusCode: 404 });
    await assert.rejects(getCustomerOffer(variant.id, 'ESTANDAR', secret), { statusCode: 404 });
    await issueCustomerOrderInvitation(stored.customerId);
    await assert.rejects(getCustomerOffer(variant.id, 'ESTANDAR', invitedToken), { statusCode: 404 });
    checks.push('Invitation verifies customer binding, rotates, and cannot read orders; read links cannot configure');
    const detail = (await getOrderById(stored.id))!;
    await updateOrder(stored.id, { version: detail.version, offerVersion: detail.offerVersion, notes: 'Admin conserva notas',
      deliveries: detail.deliveries.map(d => ({ sequence: d.sequence, scheduledDate: d.scheduledDate, locationNumber: d.locationNumber })),
      menuSlots: detail.menuSlots.map(s => ({ dayOfWeek: s.dayOfWeek, dayOrder: s.dayOrder, slotType: s.slotType, contenedor: s.contenedor,
        components: s.components.map(c => ({ componentRole: c.componentRole, position: c.position, orderComponentId: c.id })) })) });
    assert.equal((await getPrivateCustomerOrder(secret)).meals[0]!.notes, 'Nota LUNES');
    checks.push('Administrative edit preserves customer meal instructions');
    await revokeOrderLinks(stored.id);
    await assert.rejects(getPrivateCustomerOrder(secret), { statusCode: 404 });
    await tx.orderAccessLink.updateMany({ where: { orderId: stored.id }, data: { revokedAt: null, expiresAt: new Date('2020-01-01') } });
    await assert.rejects(getPrivateCustomerOrder(secret), { statusCode: 404 });
    checks.push('Revoked and expired links deny consultation');
    await tx.weeklyCycle.update({ where: { id: cycle.id }, data: { orderCutoffAt: new Date('2020-01-01') } });
    await assert.rejects(getCustomerOffer(variant.id, 'ESTANDAR'), { statusCode: 409 });
    await assert.rejects(submitCustomerOrder(input, randomUUID(), token(), 'ESTANDAR'), { statusCode: 409 });
    checks.push('Public cutoff blocks both offer and submission');
    await tx.$executeRawUnsafe('SAVEPOINT unique_open');
    await assert.rejects(tx.weeklyCycle.create({ data: { weekStart: new Date('2098-11-24'), status: 'OPEN', orderCutoffAt: new Date('2098-11-21') } }));
    await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT unique_open');
    checks.push('Database unique index rejects a second open week');
    throw rollback;
  }, { timeout: 120000 });
} catch (error) { if (error !== rollback) throw error }
finally { globalDb.prisma = previous; await db.$disconnect(); await pool.end() }
checks.forEach(check => console.log(`PASS ${check}`));
console.log('All fixtures rolled back.');
