/**
 * PostgreSQL integration: node --import tsx --env-file=.env scripts/verify-order-idempotency.ts
 * Creates a temporary customer and its orders against an existing open standard menu.
 * Removes only these fixtures in finally; menus and catalogue are never edited.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../layers/menu/server/utils/prisma';
import { createOrder, getOrderOptions } from '../layers/menu/server/utils/orders';
import type { OrderCreateInput } from '../layers/menu/shared/types/types';

const actor = { id: randomUUID(), label: 'Verificación idempotencia' };
const customerId = randomUUID();
const checks: string[] = [];

try {
  await prisma.customer.create({ data: {
    id: customerId, nombre: 'ZZ Verificación idempotencia', telefono: '6640000013', tipoCliente: 'menu',
    ubicacion1: 'Casa 123', ubicacion2: 'Oficina 456', firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES',
  } });
  const variant = await prisma.planVariant.findFirstOrThrow({ where: { daysCount: 3, isActive: true, plan: { isActive: true, slotTypes: { equals: ['COMIDA'] } } } });
  const { menu } = await getOrderOptions({ customerId, planVariantId: variant.id });
  const input: OrderCreateInput = { customerId, planVariantId: variant.id, days: ['LUNES', 'MARTES', 'JUEVES'], deliveries: [], notes: 'Temporal idempotencia', offerVersion: menu.version };
  const count = () => prisma.order.count({ where: { customerId } });

  // Several simultaneous submissions with one key: the unique index lets one
  // transaction create the order and the others answer with that same order.
  const key = randomUUID();
  const results = await Promise.allSettled(Array.from({ length: 4 }, () => createOrder(input, actor, key)));
  assert.ok(results.every(result => result.status === 'fulfilled'), JSON.stringify(results));
  const ids = new Set(results.map(result => (result as PromiseFulfilledResult<Awaited<ReturnType<typeof createOrder>>>).value?.id));
  assert.equal(ids.size, 1);
  assert.equal(await count(), 1);
  const [orderId] = ids;
  const stored = await prisma.order.findUniqueOrThrow({ where: { id: orderId! }, select: { idempotencyKey: true, idempotencyFingerprint: true, folio: true } });
  assert.equal(stored.idempotencyKey, key);
  assert.match(stored.idempotencyFingerprint ?? '', /^[0-9a-f]{64}$/);
  checks.push('4 simultaneous creations with one key: all answer the same order, 1 row stored with key and fingerprint');

  const retry = await createOrder({ ...input, days: ['JUEVES', 'LUNES', 'MARTES'] }, actor, key.toUpperCase());
  assert.equal(retry?.id, orderId);
  assert.equal(retry?.folio, stored.folio);
  assert.equal(await count(), 1);
  checks.push('Later retry with the same key (other casing, reordered days) returns the original order and folio');

  await assert.rejects(createOrder({ ...input, notes: 'Otra nota' }, actor, key), { statusCode: 422 });
  assert.equal(await count(), 1);
  checks.push('Same key with different data rejected with 422 and no write');

  await assert.rejects(createOrder({ ...input, days: ['LUNES', 'MARTES'] }, actor, randomUUID()), { statusCode: 400 });
  const fresh = await createOrder(input, actor, randomUUID());
  assert.notEqual(fresh?.id, orderId);
  assert.equal(await count(), 2);
  checks.push('A failed attempt stores nothing; a new key creates a separate order');

  const unique = await prisma.$queryRaw<Array<{ indexdef: string }>>`SELECT indexdef FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'orders_idempotency_key_key'`;
  assert.match(unique[0]?.indexdef ?? '', /UNIQUE INDEX/);
  checks.push('Database enforces a unique index on orders.idempotency_key');
  console.log(JSON.stringify({ checks, result: 'passed' }, null, 2));
} finally {
  try {
    await prisma.order.deleteMany({ where: { customerId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
  } finally { await prisma.$disconnect(); }
}
