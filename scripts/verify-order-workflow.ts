/**
 * PostgreSQL integration: node --import tsx --env-file=.env scripts/verify-order-workflow.ts
 * Creates a temporary customer and orders against an existing open standard menu.
 * Removes only these fixtures in finally; menus and catalogue are never edited.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { prisma } from '../layers/menu/server/utils/prisma';
import { createOrder, getOrderById, transitionDelivery, transitionOrder, updateOrder } from '../layers/menu/server/utils/orders';
import type { Order, OrderUpdateInput } from '../layers/menu/shared/types/types';

const actor = { id: randomUUID(), label: 'Verificación 1.4' };
const customerId = randomUUID();
const checks: string[] = [];
let orderId: string | undefined;
const editable = (order: Order): OrderUpdateInput => ({
  version: order.version, notes: order.notes,
  deliveries: order.deliveries.map(({ sequence, scheduledDate, locationNumber }) => ({ sequence, scheduledDate, locationNumber })),
  menuSlots: order.menuSlots.map(({ dayOfWeek, dayOrder, slotType, contenedor, components }) => ({
    dayOfWeek, dayOrder, slotType, contenedor, components: components.map(({ id: _id, ...component }) => component),
  })),
});
const sql = new pg.Client({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });

try {
  await prisma.customer.create({ data: {
    id: customerId, nombre: 'ZZ Verificación 1.4', telefono: '6640000014', tipoCliente: 'menu',
    ubicacion1: 'Casa anterior 123', ubicacion2: 'Oficina 456', firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES',
  } });
  const variant = await prisma.planVariant.findFirstOrThrow({ where: { daysCount: 3, isActive: true, plan: { isActive: true, slotTypes: { equals: ['COMIDA'] } } } });
  let order = (await createOrder({ customerId, planVariantId: variant.id, days: ['LUNES', 'MARTES', 'JUEVES'], deliveries: [], notes: 'Temporal 1.4' }, actor))!;
  orderId = order.id;
  assert.equal(order.version, 1);
  assert.equal(order.statusEvents[0]?.actorId, actor.id);
  checks.push('Creation records supplied actor and version 1');

  const badDate = editable(order);
  badDate.deliveries[1]!.scheduledDate = '2099-01-01';
  await assert.rejects(updateOrder(order.id, badDate), { statusCode: 400 });
  const badDays = editable(order); badDays.menuSlots.pop();
  await assert.rejects(updateOrder(order.id, badDays), { statusCode: 400 });
  const noMain = editable(order); noMain.menuSlots[0]!.components.forEach(c => { c.componentRole = 'ADICIONAL'; });
  await assert.rejects(updateOrder(order.id, noMain), { statusCode: 400 });
  assert.equal((await getOrderById(order.id))!.version, 1);
  checks.push('Invalid dates, removed days and missing main dishes rejected without writes');

  await prisma.customer.update({ where: { id: customerId }, data: { ubicacion1: 'Casa nueva 789' } });
  const change = editable(order); change.notes = 'Nueva nota';
  order = (await updateOrder(order.id, change))!;
  assert.ok(order.deliveries.every(d => d.address === 'Casa anterior 123'));
  const move = editable(order); move.deliveries[1]!.locationNumber = 2;
  order = (await updateOrder(order.id, move))!;
  assert.equal(order.deliveries[0]!.address, 'Casa anterior 123');
  assert.equal(order.deliveries[1]!.address, 'Oficina 456');
  checks.push('Frozen address survives customer edit; explicit secondary location changes only that delivery');

  const competing = editable(order);
  const results = await Promise.allSettled([
    updateOrder(order.id, { ...competing, notes: 'Operador A' }),
    updateOrder(order.id, { ...competing, notes: 'Operador B' }),
  ]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const failed = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
  assert.equal(failed.reason.statusCode, 409);
  order = (await getOrderById(order.id))!;
  assert.equal(order.version, competing.version + 1);
  await assert.rejects(transitionOrder(order.id, { version: competing.version, status: 'CONFIRMED', reason: '' }, actor), { statusCode: 409 });
  await assert.rejects(transitionOrder(order.id, { version: order.version, status: 'DELIVERED', reason: '' }, actor), { statusCode: 409 });
  checks.push('Two real concurrent updates: exactly one succeeds; stale state changes and skipped transitions rejected');

  const slotIds = order.menuSlots.map(s => s.id);
  order = (await transitionOrder(order.id, { version: order.version, status: 'CONFIRMED', reason: '' }, actor))!;
  order = (await transitionOrder(order.id, { version: order.version, status: 'PREPARING', reason: '' }, actor))!;
  assert.deepEqual(order.menuSlots.map(s => s.id), slotIds);
  for (const sequence of [1, 2] as const) {
    order = (await transitionDelivery(order.id, sequence, { version: order.version, status: 'OUT_FOR_DELIVERY', reason: '' }, actor))!;
    if (sequence === 1) {
      await assert.rejects(updateOrder(order.id, editable(order)), { statusCode: 409 });
      await assert.rejects(transitionDelivery(order.id, sequence, { version: order.version, status: 'FAILED', reason: '' }, actor), { statusCode: 400 });
      order = (await transitionDelivery(order.id, sequence, { version: order.version, status: 'FAILED', reason: 'Cliente ausente' }, actor))!;
      order = (await transitionDelivery(order.id, sequence, { version: order.version, status: 'OUT_FOR_DELIVERY', reason: 'Segundo intento' }, actor))!;
    }
    order = (await transitionDelivery(order.id, sequence, { version: order.version, status: 'DELIVERED', reason: '' }, actor))!;
    assert.equal(order.status, sequence === 1 ? 'PARTIALLY_DELIVERED' : 'DELIVERED');
    assert.ok(order.deliveries.find(d => d.sequence === sequence)!.deliveredAt);
  }
  await assert.rejects(updateOrder(order.id, editable(order)), { statusCode: 409 });
  await assert.rejects(transitionOrder(order.id, { version: order.version, status: 'CONFIRMED', reason: '' }, actor), { statusCode: 400 });
  checks.push('Delivery failure/retry and deliveredAt; global partial/delivered derived; shipping and closed orders locked');

  order = (await transitionOrder(order.id, { version: order.version, status: 'CONFIRMED', reason: 'Corrección autorizada' }, actor))!;
  assert.ok(order.deliveries.every(d => d.status === 'PENDING' && d.deliveredAt === null));
  assert.ok(order.statusEvents.some(e => e.fromStatus === 'DELIVERED' && e.toStatus === 'CONFIRMED' && e.reason === 'Corrección autorizada'));
  await assert.rejects(transitionOrder(order.id, { version: order.version, status: 'CANCELLED', reason: '' }, actor), { statusCode: 400 });
  order = (await transitionOrder(order.id, { version: order.version, status: 'CANCELLED', reason: 'Cancelación de prueba' }, actor))!;
  await assert.rejects(updateOrder(order.id, editable(order)), { statusCode: 409 });
  order = (await transitionOrder(order.id, { version: order.version, status: 'CONFIRMED', reason: 'Reapertura de prueba' }, actor))!;
  assert.ok(order.statusEvents.every(e => e.actorId === actor.id));
  assert.deepEqual(order.menuSlots.map(s => s.id), slotIds);
  assert.equal(order.deliveries[0]!.address, 'Casa anterior 123');
  checks.push('Delivered/cancelled reopening requires reason, resets deliveries and preserves original history, copies and addresses');

  await sql.connect();
  await sql.query('BEGIN');
  for (const statement of ['UPDATE public.order_status_events SET reason = reason WHERE order_id = $1', 'DELETE FROM public.order_status_events WHERE order_id = $1']) {
    await sql.query('SAVEPOINT immutable');
    let code;
    try { await sql.query(statement, [order.id]); } catch (error) { code = (error as { code: string }).code; }
    await sql.query('ROLLBACK TO SAVEPOINT immutable');
    assert.equal(code, '55000');
  }
  for (const role of ['anon', 'authenticated']) {
    const { rows: [access] } = await sql.query("SELECT has_table_privilege($1, 'public.order_status_events','SELECT,INSERT,UPDATE,DELETE') AS allowed", [role]);
    assert.equal(access.allowed, false);
  }
  const { rows: [rls] } = await sql.query("SELECT relrowsecurity FROM pg_class WHERE oid='public.order_status_events'::regclass");
  assert.equal(rls.relrowsecurity, true);
  await sql.query('ROLLBACK');
  checks.push('Database rejects history UPDATE/DELETE; RLS enabled and client roles have no privileges');
  console.log(JSON.stringify({ checks, result: 'passed' }, null, 2));
} finally {
  await sql.end();
  try {
    if (orderId) await prisma.order.delete({ where: { id: orderId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
  } finally { await prisma.$disconnect(); }
}
