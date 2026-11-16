/**
 * Real PostgreSQL verification for order personalisation (stage 2).
 * Run: node --import tsx --env-file=.env scripts/verify-order-personalization.ts
 *
 * Functional checks run inside one rollback-only transaction with fixtures in
 * a week of 2098; menus, catalogue and customers of the business are not
 * touched. The lock check opens two connections against an existing menu row
 * and writes nothing (both transactions roll back).
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { PrismaClient, type Prisma } from '../layers/menu/generated/prisma/client';
import { updateFoodCatalogItem } from '../layers/menu/server/utils/foodCatalog';
import { getOrderPersonalization, replaceCustomerExclusions } from '../layers/menu/server/utils/orderPersonalization';
import { createOrder, getOrderById, getOrderOptions, updateOrder } from '../layers/menu/server/utils/orders';
import type { Order, OrderUpdateInput } from '../layers/menu/shared/types/types';

assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
const previousDb = globalDb.prisma;
const rollback = new Error('Verification finished: roll back all fixtures');
const checks: string[] = [];
const actor = { id: randomUUID(), label: 'Verificación etapa 2' };
const tag = randomUUID().slice(0, 8);

// Every place keeps its saved dish unless `swaps` names a menu option for it.
function editable(order: Order, offerVersion: number, swaps: Record<string, string> = {}): OrderUpdateInput {
  return {
    version: order.version, offerVersion, notes: order.notes,
    deliveries: order.deliveries.map(({ sequence, scheduledDate, locationNumber }) => ({ sequence, scheduledDate, locationNumber })),
    menuSlots: order.menuSlots.map(({ dayOfWeek, dayOrder, slotType, contenedor, components }) => ({
      dayOfWeek, dayOrder, slotType, contenedor,
      components: components.map(({ id, componentRole, position }) => {
        const swap = swaps[`${dayOfWeek}:${componentRole}`];
        return swap ? { componentRole, position, menuComponentId: swap } : { componentRole, position, orderComponentId: id };
      }),
    })),
  };
}
const mainOf = (order: Order, day: string) =>
  order.menuSlots.find(slot => slot.dayOfWeek === day)!.components.find(component => component.componentRole === 'PLATILLO_PRINCIPAL')!;

try {
  await db.$transaction(async (tx) => {
    globalDb.prisma = new Proxy(tx, {
      get(target, property) {
        if (property === '$transaction') {
          return (operation: ((client: Prisma.TransactionClient) => unknown) | Promise<unknown>[]) =>
            typeof operation === 'function' ? operation(tx) : Promise.all(operation);
        }
        return Reflect.get(target, property);
      },
    }) as unknown as PrismaClient;

    const ingredient = (nombre: string) => tx.ingredient.create({ data: { nombre: `${nombre} ${tag}`, nombreNormalizado: `${nombre} ${tag}`.toLowerCase(), categoria: 'Verificación' } });
    const peanut = await ingredient('Cacahuate');
    const chicken = await ingredient('Pollo');
    const item = (nombre: string, ingredientIds: string[]) => tx.foodCatalogItem.create({ data: {
      nombre: `${nombre} ${tag}`, descripcion: '', calorias: 450, imagen: '', tipo: 'comida',
      recipeIngredients: { create: ingredientIds.map((ingredientId, orden) => ({ ingredientId, cantidad: 100, unidad: 'g', orden })) },
    } });
    const satay = await item('Pollo satay', [peanut.id, chicken.id]);
    const grilled = await item('Pollo asado', [chicken.id]);
    const unknown = await item('Guiso sin receta', []);
    const rice = await item('Arroz', [chicken.id]);

    const cycle = await tx.weeklyCycle.create({ data: {
      weekStart: new Date('2098-11-17'), status: 'OPEN', orderCutoffAt: new Date('2098-11-14T02:00:00Z'),
      firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
      firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
    } });
    const dishFor = { LUNES: satay, MARTES: grilled, MIERCOLES: unknown, JUEVES: grilled, VIERNES: grilled } as const;
    const menu = await tx.weeklyMenu.create({ data: {
      name: `Verificación etapa 2 ${tag}`, menuType: 'ESTANDAR', cycleId: cycle.id, cycleScope: 'ESTANDAR',
      startDate: cycle.weekStart, endDate: new Date('2098-11-21'),
      days: { create: Object.entries(dishFor).map(([dayOfWeek, main], index) => ({
        dayOfWeek: dayOfWeek as keyof typeof dishFor, order: index + 1,
        slots: { create: (['COMIDA', 'CENA'] as const).map(slotType => ({ slotType, components: { create: [
          { catalogItemId: main.id, componentRole: 'PLATILLO_PRINCIPAL' as const, nombre: main.nombre, descripcion: '', calorias: 450, imagen: '', tipo: 'comida' },
          { catalogItemId: rice.id, componentRole: 'GUARNICION_1' as const, nombre: rice.nombre, descripcion: '', calorias: 200, imagen: '', tipo: 'comida' },
        ] } })) },
      })) },
    } });
    const customer = await tx.customer.create({ data: {
      nombre: `ZZ Verificación etapa 2 ${tag}`, telefono: '6640000002', tipoCliente: 'menu',
      ubicacion1: 'Casa de prueba 123', firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES',
    } });
    const plan = await tx.plan.create({ data: {
      title: `Verificación etapa 2 ${tag}`, description: 'Temporal', image: 'verification/plan.png', slotTypes: ['COMIDA'],
      variants: { create: [{ title: '3 días', daysCount: 3, price: 900 }] },
    }, include: { variants: true } });
    const variant = plan.variants[0]!;

    // Exclusions: validated, replaced as a whole, enforced by the database.
    await assert.rejects(replaceCustomerExclusions(customer.id, { allergyIngredientIds: [randomUUID()], ingredientIds: [], catalogItemIds: [] }), { statusCode: 400 });
    await assert.rejects(replaceCustomerExclusions(customer.id, { allergyIngredientIds: [peanut.id], ingredientIds: [peanut.id], catalogItemIds: [] }), { statusCode: 400 });
    const exclusions = await replaceCustomerExclusions(customer.id, { allergyIngredientIds: [peanut.id], ingredientIds: [], catalogItemIds: [] });
    assert.deepEqual(exclusions.map(item => [item.kind, item.label]), [['ALERGIA', peanut.nombre]]);
    checks.push('Exclusions validate ids and overlaps, and replace the whole list');

    // Creation applies the allergy on its own and records it.
    const options = await getOrderOptions({ customerId: customer.id, planVariantId: variant.id });
    assert.equal(options.menu.version, 1);
    const input = { customerId: customer.id, planVariantId: variant.id, days: ['LUNES', 'MARTES', 'MIERCOLES'] as const, deliveries: [], notes: 'Temporal etapa 2' };
    await assert.rejects(createOrder({ ...input, days: [...input.days], offerVersion: 0 }, actor), { statusCode: 400 });
    let order = (await createOrder({ ...input, days: [...input.days], offerVersion: options.menu.version }, actor))!;
    assert.equal(order.offerVersion, 1);
    assert.equal(order.menuSlots.length, 3, 'only the meal time the plan sells');
    assert.deepEqual([mainOf(order, 'LUNES').nombre, mainOf(order, 'LUNES').sourceDayOfWeek, mainOf(order, 'LUNES').isSubstitution], [grilled.nombre, 'MARTES', true]);
    assert.equal(mainOf(order, 'MIERCOLES').nombre, unknown.nombre);
    assert.deepEqual(order.menuChanges.map(change => [change.kind, change.dayOfWeek, change.fromNombre, change.toNombre, change.actorLabel]),
      [['AUTOMATICA', 'LUNES', satay.nombre, grilled.nombre, actor.label]]);
    checks.push('Creation swaps an allergen dish for the closest compatible one and logs it');

    let personalization = await getOrderPersonalization(order.id);
    assert.equal(personalization.menuChanged, false);
    assert.ok(personalization.options.every(option => option.slotType === 'COMIDA'), 'only sold meal times');
    const option = (day: string, nombre: string) => personalization.options.find(item => item.dayOfWeek === day && item.nombre === nombre)!;
    assert.equal(option('LUNES', satay.nombre).conflict.status, 'excluded');
    assert.equal(option('MIERCOLES', unknown.nombre).conflict.status, 'unverified');
    assert.equal(personalization.componentConflicts[mainOf(order, 'MIERCOLES').id]!.status, 'unverified');
    assert.equal(personalization.originals['LUNES:COMIDA:PLATILLO_PRINCIPAL:0'], option('LUNES', satay.nombre).id);
    checks.push('Editor options cover sold meal times, mark excluded and unverified dishes, and know each original');

    // Swap, restore and the rules around them.
    await assert.rejects(updateOrder(order.id, editable(order, 1, { 'MARTES:PLATILLO_PRINCIPAL': option('LUNES', satay.nombre).id }), actor), { statusCode: 409 });
    await assert.rejects(updateOrder(order.id, editable(order, 1, { 'MARTES:PLATILLO_PRINCIPAL': option('LUNES', rice.nombre).id }), actor), { statusCode: 400 });
    order = (await updateOrder(order.id, editable(order, 1, { 'MARTES:PLATILLO_PRINCIPAL': option('VIERNES', grilled.nombre).id }), actor))!;
    assert.equal(mainOf(order, 'MARTES').sourceDayOfWeek, 'VIERNES');
    assert.equal(mainOf(order, 'MARTES').isSubstitution, true);
    order = (await updateOrder(order.id, editable(order, 1, { 'MARTES:PLATILLO_PRINCIPAL': option('MARTES', grilled.nombre).id }), actor))!;
    assert.equal(mainOf(order, 'MARTES').isSubstitution, false);
    assert.deepEqual(order.menuChanges.slice(0, 2).map(change => change.kind), ['RESTAURACION', 'SUSTITUCION']);
    // Same dish repeated in every place is allowed.
    order = (await updateOrder(order.id, editable(order, 1, { 'MIERCOLES:PLATILLO_PRINCIPAL': option('MARTES', grilled.nombre).id }), actor))!;
    assert.deepEqual(order.menuSlots.map(slot => mainOf(order, slot.dayOfWeek).nombre), [grilled.nombre, grilled.nombre, grilled.nombre]);
    checks.push('Swaps stay in the menu and role family, excluded dishes are refused, restore and repetition work, all logged');

    // A catalogue change gives the menu a new offer version: stale editors and forms get 409.
    const stale = editable(order, 1, { 'MIERCOLES:PLATILLO_PRINCIPAL': option('MIERCOLES', unknown.nombre).id });
    await updateFoodCatalogItem(rice.id, { nombre: rice.nombre, descripcion: '', calorias: 210, imagen: '', tipo: 'comida', preparacion: '', ingredientes: [{ ingredientId: chicken.id, cantidad: 100, unidad: 'g' }] });
    assert.equal((await tx.weeklyMenu.findUniqueOrThrow({ where: { id: menu.id } })).version, 2);
    await assert.rejects(updateOrder(order.id, stale, actor), (error: { statusCode?: number; data?: { code?: string } }) => error.statusCode === 409 && error.data?.code === 'OFFER_VERSION_CONFLICT');
    await assert.rejects(createOrder({ ...input, days: [...input.days], offerVersion: 1 }, actor), { statusCode: 409 });
    personalization = await getOrderPersonalization(order.id);
    assert.equal(personalization.menuChanged, true);
    order = (await updateOrder(order.id, { ...stale, offerVersion: 2 }, actor))!;
    assert.equal(order.offerVersion, 2);
    checks.push('Catalogue edits bump the offer version; stale edits and creations get 409');

    // An exclusion added later blocks keeping that dish until it is swapped.
    await replaceCustomerExclusions(customer.id, { allergyIngredientIds: [peanut.id], ingredientIds: [], catalogItemIds: [grilled.id] });
    await assert.rejects(updateOrder(order.id, editable(order, 2), actor), { statusCode: 409 });
    assert.equal((await getOrderById(order.id))!.version, order.version, 'rejected edits claim no version');
    checks.push('A later exclusion blocks saving the excluded dish without a swap');

    // The database refuses an exclusion without a coherent target.
    await assert.rejects(tx.$executeRaw`INSERT INTO customer_exclusions (customer_id, kind, ingredient_id) VALUES (${customer.id}::uuid, 'PLATILLO', ${peanut.id})`);
    checks.push('Check constraint rejects a dish exclusion that names an ingredient');
    throw rollback;
  }, { timeout: 120_000 });
} catch (error) {
  if (error !== rollback) throw error;
} finally {
  globalDb.prisma = previousDb;
  await db.$disconnect();
}

// FOR SHARE in the order transaction holds a menu write until it ends.
const reader = new pg.Client({ connectionString: process.env.DATABASE_URL });
const writer = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await Promise.all([reader.connect(), writer.connect()]);
  const { rows: [menu] } = await reader.query('SELECT id FROM "WeeklyMenu" LIMIT 1');
  if (menu) {
    await reader.query('BEGIN');
    await reader.query('SELECT "version" FROM "WeeklyMenu" WHERE "id" = $1 FOR SHARE', [menu.id]);
    await writer.query('BEGIN');
    await writer.query("SET LOCAL lock_timeout = '1s'");
    await assert.rejects(writer.query('UPDATE "WeeklyMenu" SET "version" = "version" WHERE "id" = $1', [menu.id]), { code: '55P03' });
    await writer.query('ROLLBACK');
    await reader.query('ROLLBACK');
    checks.push('A menu write waits while an order transaction holds its offer version');
  }
} finally {
  await Promise.allSettled([reader.end(), writer.end()]);
  await pool.end();
}

console.log(JSON.stringify({ checks, rolledBack: true }, null, 2));
