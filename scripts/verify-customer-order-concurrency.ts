/** Creates one temporary public order against an existing offer, then removes
 * only its generated contact. Never edits menus, plans, or existing customers.
 * node --import tsx --env-file=.env scripts/verify-customer-order-concurrency.ts
 */
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import { prisma } from '../layers/menu/server/utils/prisma';
import { getCustomerOffer, submitCustomerOrder } from '../layers/menu/server/utils/customerOrders';
import { planOrderDeliveries } from '../layers/menu/shared/utils/orderDeliveries';
import type { CustomerOrderInput } from '../layers/menu/shared/types/customerOrder';

const tag = `ZZ Verificación concurrencia cliente ${randomUUID()}`;
try {
  const variants = await prisma.planVariant.findMany({ where: { isActive: true, plan: { isActive: true } }, orderBy: { daysCount: 'asc' } });
  let offer: Awaited<ReturnType<typeof getCustomerOffer>> | undefined;
  for (const variant of variants) {
    try { offer = await getCustomerOffer(variant.id, 'ESTANDAR'); break } catch { /* Try a sellable variant. */ }
  }
  assert.ok(offer, 'Requires an open standard offer before its cutoff');
  const days = offer.availableDays.slice(0, offer.variant.daysCount);
  const input: CustomerOrderInput = { menuId: offer.menu.id, offerVersion: offer.menu.version, offerRevision: offer.revision, planVariantId: offer.variant.id, expectedPrice: offer.variant.price,
    contact: { nombre: tag, telefono: '6640000003', correoElectronico: '' }, days, notes: 'Fixture temporal de concurrencia',
    meals: offer.slots.filter(s => days.includes(s.dayOfWeek)).map(s => ({ dayOfWeek: s.dayOfWeek, slotType: s.slotType, notes: '', components: s.components.map(c => ({ originalId: c.originalId, selectedId: c.selectedId })) })),
    deliveries: planOrderDeliveries({ weekStart: offer.cycle.weekStart, days, rule: offer.cycle }).map(d => ({ sequence: d.sequence, deliveryDay: d.deliveryDay, address: 'Dirección temporal de verificación' })) };
  const key = randomUUID(); const secret = randomBytes(32).toString('hex');
  const results = await Promise.allSettled(Array.from({ length: 4 }, () => submitCustomerOrder(input, key, secret, 'ESTANDAR')));
  assert.ok(results.every(r => r.status === 'fulfilled'), JSON.stringify(results));
  assert.equal(await prisma.order.count({ where: { idempotencyKey: key } }), 1);
  assert.equal(await prisma.customer.count({ where: { nombre: tag } }), 1);
  const order = await prisma.order.findUniqueOrThrow({ where: { idempotencyKey: key } });
  assert.equal(await prisma.orderAccessLink.count({ where: { orderId: order.id } }), 1);
  console.log('PASS 4 simultaneous submissions produce 1 customer, 1 order and 1 private link');
  const a = new pg.Client({ connectionString: process.env.DATABASE_URL });
  const b = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await a.connect(); await b.connect(); await a.query('BEGIN'); await b.query('BEGIN');
    await a.query('SELECT pg_advisory_xact_lock(726411, 1)');
    assert.equal((await b.query('SELECT pg_try_advisory_xact_lock(726411, 1) AS acquired')).rows[0].acquired, false);
    await a.query('ROLLBACK');
    assert.equal((await b.query('SELECT pg_try_advisory_xact_lock(726411, 1) AS acquired')).rows[0].acquired, true);
    console.log('PASS Publication lock serialises transactions and is released on rollback');
  } finally { await a.query('ROLLBACK').catch(() => {}); await b.query('ROLLBACK').catch(() => {}); await a.end(); await b.end() }
} finally {
  const customers = await prisma.customer.findMany({ where: { nombre: tag }, select: { id: true } });
  await prisma.order.deleteMany({ where: { customerId: { in: customers.map(c => c.id) } } });
  await prisma.customer.deleteMany({ where: { id: { in: customers.map(c => c.id) } } });
  await prisma.$disconnect();
}
console.log('Temporary fixtures removed.');
