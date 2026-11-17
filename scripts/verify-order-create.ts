/**
 * Real PostgreSQL verification for stage 1.3, using the production services.
 * Run: node --import tsx --env-file=.env scripts/verify-order-create.ts
 * All fixtures and writes roll back; PostgreSQL folio sequences may leave gaps.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { PrismaClient, type Prisma } from '../layers/menu/generated/prisma/client';
import { createOrder, getOrderById, getOrderOptions, getOrders } from '../layers/menu/server/utils/orders';
import type { DayOfWeek, OrderCreateInput } from '../layers/menu/shared/types/types';

assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
const previousDb = globalDb.prisma;
const rollback = new Error('Verification finished: roll back all fixtures');
const checks: string[] = [];

try {
  await db.$transaction(async (tx) => {
    // Route service transactions into this rollback-only transaction. Both the
    // service's callback and array transaction forms still use real PostgreSQL.
    globalDb.prisma = new Proxy(tx, {
      get(target, property) {
        if (property === '$transaction') {
          return (operation: ((client: Prisma.TransactionClient) => unknown) | Promise<unknown>[]) =>
            typeof operation === 'function' ? operation(tx) : Promise.all(operation);
        }
        return Reflect.get(target, property);
      },
    }) as unknown as PrismaClient;

    // Rollback-only: free the single OPEN slot without changing the live week.
    await tx.weeklyCycle.updateMany({ where: { status: 'OPEN' }, data: { status: 'CLOSED' } });
    const cycle = await tx.weeklyCycle.create({ data: {
      weekStart: new Date('2098-11-17'), status: 'OPEN', orderCutoffAt: new Date('2098-11-14T02:00:00Z'),
      firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
      firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
    } });
    const customers = [];
    for (const tipoCliente of ['menu', 'vegetariano', 'dieta', 'dieta']) {
      customers.push(await tx.customer.create({ data: {
        nombre: `Verificación 1.3 ${tipoCliente} ${randomUUID()}`, telefono: '6640000000', tipoCliente,
        ubicacion1: 'Casa de prueba 123', ubicacion2: 'Oficina de prueba 456',
        firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES',
      } }));
    }
    const plan = await tx.plan.create({ data: {
      title: `Verificación 1.3 ${randomUUID()}`, description: 'Temporal', image: 'verification/plan.png', slotTypes: ['COMIDA', 'CENA'],
      variants: { create: [2, 3, 5].map(daysCount => ({ title: `${daysCount} días`, daysCount, price: 900 })) },
    }, include: { variants: true } });
    const variant = (count: number) => plan.variants.find(item => item.daysCount === count)!;
    const days: DayOfWeek[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const menus = [];
    for (const [index, menuType] of (['ESTANDAR', 'VEGETARIANO', 'PERSONALIZADO'] as const).entries()) {
      menus.push(await tx.weeklyMenu.create({ data: {
        name: `Verificación 1.3 ${menuType}`, menuType, cycleId: cycle.id,
        customerId: index === 2 ? customers[2]!.id : null,
        cycleScope: index === 2 ? customers[2]!.id : menuType,
        startDate: cycle.weekStart, endDate: new Date('2098-11-21'),
        days: { create: days.map((dayOfWeek, i) => ({ dayOfWeek, order: i + 1,
          slots: { create: (['COMIDA', 'CENA'] as const).map(slotType => ({ slotType,
            // Saturday has a complete COMIDA but CENA has only a side dish.
            components: { create: [{
              componentRole: dayOfWeek === 'SABADO' && slotType === 'CENA' ? 'GUARNICION_1' : 'PLATILLO_PRINCIPAL',
              nombre: `${menuType} ${dayOfWeek} ${slotType}`, descripcion: '', calorias: 400, imagen: '', tipo: 'comida',
            }] },
          })) },
        })) },
      } }));
    }
    const input = (index: number, chosen: DayOfWeek[] = ['LUNES', 'MARTES', 'JUEVES']): OrderCreateInput => ({
      customerId: customers[index]!.id, planVariantId: variant(chosen.length).id, days: chosen,
      deliveries: [], notes: 'Verificación transaccional 1.3', offerVersion: 1,
    });

    const folios: number[] = [];
    for (let index = 0; index < 3; index++) {
      const options = await getOrderOptions(input(index));
      assert.equal(options.menu.id, menus[index]!.id);
      assert.deepEqual(options.availableDays, days.slice(0, 5));
      const order = await createOrder(input(index));
      assert.ok(order);
      assert.equal(order.sourceWeeklyMenuId, menus[index]!.id);
      assert.equal(order.cycleId, cycle.id);
      assert.equal(order.capturedAfterCutoff, false);
      assert.equal(order.price, 900);
      assert.equal(order.menuSlots.length, 6);
      assert.deepEqual([...new Set(order.menuSlots.map(slot => slot.dayOfWeek))], ['LUNES', 'MARTES', 'JUEVES']);
      for (const slot of order.menuSlots) {
        assert.equal(slot.deliverySequence, slot.dayOfWeek === 'JUEVES' ? 2 : 1);
        assert.equal(slot.components[0]!.nombre, `${menus[index]!.menuType} ${slot.dayOfWeek} ${slot.slotType}`);
        assert.equal(slot.components[0]!.sourceDayOfWeek, slot.dayOfWeek);
        assert.equal(slot.components[0]!.sourceSlotType, slot.slotType);
        assert.equal(slot.components[0]!.isSubstitution, false);
      }
      assert.deepEqual(order.deliveries.map(d => d.scheduledDate), ['2098-11-17', '2098-11-20']);
      assert.ok(Number.isInteger(order.folio) && order.folio > 0);
      folios.push(order.folio);
      const stored = await getOrderById(order.id);
      assert.equal(stored?.folio, order.folio);
      const search = await getOrders({ customerId: order.customerId, q: `#${order.folio}` });
      assert.equal(search.items[0]?.id, order.id);
      checks.push(`${menus[index]!.menuType}: correct menu, chosen days, complete times, deliveries, origin, cycle and searchable folio`);
    }
    assert.equal(new Set(folios).size, 3);
    assert.ok(folios[1]! > folios[0]! && folios[2]! > folios[1]!);

    const beforeFailures = await tx.order.count();
    await assert.rejects(createOrder(input(3)), { statusCode: 409 });
    await assert.rejects(createOrder(input(0, ['LUNES', 'MARTES', 'SABADO'])), { statusCode: 400 });
    await assert.rejects(createOrder({ ...input(0), days: ['LUNES', 'MARTES'] }), { statusCode: 400 });
    await assert.rejects(createOrder({ ...input(0), days: ['LUNES', 'LUNES', 'MARTES'] }), { statusCode: 400 });
    await assert.rejects(createOrder({ ...input(0), deliveries: [{ sequence: 1, deliveryDay: 'VIERNES', locationNumber: 1 }] }), { statusCode: 400 });
    assert.equal(await tx.order.count(), beforeFailures);
    checks.push('No personalised menu from another customer; incomplete days, count, duplicates and forbidden delivery days rejected without orders');

    for (const chosen of [days.slice(0, 3), days.slice(3, 5)]) {
      const one = await createOrder(input(0, chosen));
      assert.ok(one);
      assert.equal(one.deliveries.length, 1);
      assert.ok(one.menuSlots.every(slot => slot.deliverySequence === one.deliveries[0]!.sequence));
    }
    const override = await createOrder({ ...input(0), deliveries: [
      { sequence: 1, deliveryDay: 'DOMINGO', locationNumber: 2 },
      { sequence: 2, deliveryDay: 'MIERCOLES', locationNumber: 1 },
    ] });
    assert.deepEqual(override!.deliveries.map(d => d.scheduledDate), ['2098-11-16', '2098-11-19']);
    assert.equal(override!.deliveries[0]!.address, 'Oficina de prueba 456');
    const customer = await tx.customer.findUniqueOrThrow({ where: { id: customers[0]!.id } });
    assert.equal(customer.firstDeliveryDay, 'LUNES');
    assert.equal(customer.secondDeliveryDay, 'JUEVES');
    checks.push('Single delivery in either half; per-order delivery day/location overrides preserve customer preferences');

    await tx.customer.update({ where: { id: customer.id }, data: { firstDeliveryDay: 'VIERNES' } });
    const fallback = await createOrder(input(0));
    assert.equal(fallback!.deliveries[0]!.scheduledDate, '2098-11-16');
    const source = await tx.foodComponent.findFirstOrThrow({ where: { daySlot: { menuDay: { weeklyMenuId: menus[0]!.id } } } });
    await tx.foodComponent.update({ where: { id: source.id }, data: { nombre: 'Changed after copy' } });
    const frozen = await getOrderById(fallback!.id);
    assert.ok(frozen!.menuSlots.every(slot => slot.components.every(component => component.nombre !== 'Changed after copy')));
    checks.push('Disallowed customer preference falls back to allowed day; copied dishes stay independent of source edits');

    await tx.daySlot.deleteMany({ where: { menuDay: { weeklyMenuId: menus[2]!.id, dayOfWeek: 'VIERNES' }, slotType: 'CENA' } });
    await assert.rejects(getOrderOptions({ ...input(2), planVariantId: variant(5).id }), { statusCode: 409 });
    await tx.plan.update({ where: { id: plan.id }, data: { isActive: false } });
    await assert.rejects(createOrder(input(2)), { statusCode: 404 });
    await tx.plan.update({ where: { id: plan.id }, data: { isActive: true } });
    checks.push('Plan with insufficient complete days and inactive plan rejected');

    await tx.weeklyCycle.update({ where: { id: cycle.id }, data: { orderCutoffAt: new Date('2020-01-01') } });
    assert.equal((await getOrderOptions(input(2))).cycle.pastCutoff, true);
    assert.equal((await createOrder(input(2)))!.capturedAfterCutoff, true);
    await tx.weeklyCycle.update({ where: { id: cycle.id }, data: { status: 'CLOSED' } });
    await assert.rejects(createOrder(input(2)), { statusCode: 409 });
    checks.push('Admin orders after cutoff flagged; closed cycle rejected');
    throw rollback;
  }, { timeout: 60_000 });
} catch (error) {
  if (error !== rollback) throw error;
  console.log(JSON.stringify({ checks, rolledBack: true }, null, 2));
} finally {
  globalDb.prisma = previousDb;
  await db.$disconnect();
  await pool.end();
}
