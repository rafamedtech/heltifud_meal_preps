/**
 * Real PostgreSQL verification for stage 1.5 (order list, customer search and delete).
 *
 *   node --import tsx --env-file=.env scripts/verify-order-list.ts
 *     Runs every check inside one transaction that always rolls back.
 *
 *   node --import tsx --env-file=.env scripts/verify-order-list.ts --seed
 *   node --import tsx --env-file=.env scripts/verify-order-list.ts --clean
 *     Commit / remove the same fixtures for a browser walkthrough. They live in
 *     two weeks of 2098, use folios from 900001 (the folio sequence is not
 *     consumed) and customers named "ZZ Verificación 1.5 …".
 */
import assert from 'node:assert/strict';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { PrismaClient, type Prisma } from '../layers/menu/generated/prisma/client';

assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });
const globalDb = globalThis as unknown as { prisma?: PrismaClient };

const PREFIX = 'ZZ Verificación 1.5';
const WEEKS = ['2098-11-17', '2098-11-24'] as const;
const FIRST_FOLIO = 900_001;
const CUSTOMERS = 25;
const ORDERS = [55, 5] as const;

async function seed(tx: Prisma.TransactionClient) {
  const cycles = [];
  for (const week of WEEKS) {
    cycles.push(await tx.weeklyCycle.create({ data: {
      weekStart: new Date(week), status: 'DRAFT',
      orderCutoffAt: new Date(new Date(`${week}T02:00:00Z`).getTime() - 3 * 86_400_000),
      firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
      firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
    } }));
  }
  const customers = [];
  for (let index = 1; index <= CUSTOMERS; index++) {
    customers.push(await tx.customer.create({ data: {
      nombre: `${PREFIX} ${String(index).padStart(2, '0')}`, telefono: `66415${String(index).padStart(5, '0')}`,
      tipoCliente: 'menu', status: 'activo', ubicacion1: 'Casa de prueba 123',
    } }));
  }
  let folio = FIRST_FOLIO;
  for (const [cycleIndex, count] of ORDERS.entries()) {
    const week = new Date(WEEKS[cycleIndex]);
    for (let index = 0; index < count; index++) {
      // Customer 25 never gets an order, so it can be deleted.
      const customer = customers[index % (CUSTOMERS - 1)]!;
      await tx.order.create({ data: {
        customerId: customer.id, cycleId: cycles[cycleIndex]!.id, folio: folio++, status: 'CONFIRMED',
        planTitleSnapshot: 'Plan de verificación', planVariantTitleSnapshot: '5 días', priceSnapshot: 1450,
        notes: 'Temporal 1.5', createdAt: new Date(Date.UTC(2098, 10, 1 + cycleIndex, 0, index)),
        deliveries: { create: [
          { sequence: 1, scheduledDate: week, locationNumber: 1, addressSnapshot: customer.ubicacion1 },
          { sequence: 2, scheduledDate: new Date(week.getTime() + 3 * 86_400_000), locationNumber: 1, addressSnapshot: customer.ubicacion1 },
        ] },
      } });
    }
  }
  return { cycles, customers };
}

async function clean(client: PrismaClient) {
  const cycles = await client.weeklyCycle.findMany({ where: { weekStart: { in: WEEKS.map(week => new Date(week)) } }, select: { id: true } });
  const cycleIds = cycles.map(cycle => cycle.id);
  const orders = await client.order.deleteMany({ where: { cycleId: { in: cycleIds }, folio: { gte: FIRST_FOLIO }, notes: 'Temporal 1.5' } });
  const customers = await client.customer.deleteMany({ where: { nombre: { startsWith: PREFIX } } });
  const removed = await client.weeklyCycle.deleteMany({ where: { id: { in: cycleIds }, menus: { none: {} }, orders: { none: {} } } });
  return { orders: orders.count, customers: customers.count, cycles: removed.count };
}

const mode = process.argv[2];
try {
  if (mode === '--seed') {
    const { cycles, customers } = await db.$transaction(seed, { timeout: 120_000, maxWait: 20_000 });
    console.log(JSON.stringify({ seeded: { cycles: cycles.map(cycle => cycle.id), customers: customers.length, orders: ORDERS } }, null, 2));
  } else if (mode === '--clean') {
    console.log(JSON.stringify({ removed: await clean(db) }, null, 2));
  } else {
    const rollback = new Error('Verification finished: roll back all fixtures');
    const checks: string[] = [];
    try {
      await db.$transaction(async (tx) => {
        // Route the services into this rollback-only transaction; queries still hit PostgreSQL.
        globalDb.prisma = new Proxy(tx, {
          get(target, property) {
            if (property === '$transaction') {
              return (operation: ((client: Prisma.TransactionClient) => unknown) | Promise<unknown>[]) =>
                typeof operation === 'function' ? operation(tx) : Promise.all(operation);
            }
            return Reflect.get(target, property);
          },
        }) as unknown as PrismaClient;
        const { getOrders } = await import('../layers/menu/server/utils/orders');
        const { deleteCustomer, getCustomers, updateCustomer } = await import('../layers/menu/server/utils/customers');

        const { cycles, customers } = await seed(tx);
        const [weekA, weekB] = cycles.map(cycle => cycle.id) as [string, string];

        // Pagination over one week reaches every order exactly once.
        const seen = new Set<number>();
        for (const offset of [0, 50, 100]) {
          const page = await getOrders({ cycleId: weekA, limit: 50, offset });
          assert.equal(page.summary.total, 55);
          assert.equal(page.items.length, offset === 0 ? 50 : offset === 50 ? 5 : 0);
          page.items.forEach(item => seen.add(item.folio));
        }
        assert.equal(seen.size, 55);
        assert.deepEqual([Math.min(...seen), Math.max(...seen)], [FIRST_FOLIO, FIRST_FOLIO + 54]);
        checks.push('Pages of 50 return the 55 orders of a week once each, with the filtered total');

        const second = await getOrders({ cycleId: weekB, limit: 50 });
        assert.equal(second.summary.total, 5);
        assert.ok(second.items.every(item => item.weekStart === WEEKS[1]));
        checks.push('Week filter isolates the 5 orders of the other week');

        // Any-delivery date filter combined with the week filter.
        const bySecondDelivery = await getOrders({ cycleId: weekA, from: '2098-11-20', to: '2098-11-20', limit: 50 });
        assert.equal(bySecondDelivery.summary.total, 55);
        const otherWeekDate = await getOrders({ cycleId: weekA, from: '2098-11-24', to: '2098-11-30', limit: 50 });
        assert.equal(otherWeekDate.summary.total, 0);
        checks.push('Week filter combines with the any-delivery date range');

        // Remote customer search finds a customer beyond the first page of 20.
        const firstPage = await getCustomers({ q: PREFIX, limit: 20 });
        assert.equal(firstPage.items.length, 20);
        assert.ok(!firstPage.items.some(item => item.nombre.endsWith(' 25')));
        const found = await getCustomers({ q: `${PREFIX} 25`, limit: 20 });
        assert.deepEqual(found.items.map(item => item.id), [customers[24]!.id]);
        const byPhone = await getCustomers({ q: '6641500007', limit: 20 });
        assert.deepEqual(byPhone.items.map(item => item.id), [customers[6]!.id]);
        checks.push('Customer search by name or phone reaches customers outside the first page');

        // Delete: conflict with history, plain delete without it.
        const withOrders = customers[0]!;
        await assert.rejects(deleteCustomer(withOrders.id), (error: { statusCode?: number, statusMessage?: string, data?: { code?: string, orders?: number } }) => {
          assert.equal(error.statusCode, 409);
          assert.equal(error.data?.code, 'CUSTOMER_HAS_HISTORY');
          assert.equal(error.data?.orders, 4);
          assert.equal(error.statusMessage, 'El cliente tiene 4 pedidos y no se puede eliminar.');
          return true;
        });
        assert.ok(await tx.customer.findUnique({ where: { id: withOrders.id } }));
        checks.push('Deleting a customer with orders answers 409 with the count and keeps the row');

        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...current } = (await getCustomers({ q: withOrders.nombre, limit: 1 })).items[0]!;
        const inactive = await updateCustomer(withOrders.id, { ...current, status: 'inactivo' });
        assert.equal(inactive.status, 'inactivo');
        assert.equal(await tx.order.count({ where: { customerId: withOrders.id } }), 4);
        checks.push('Marking the customer inactive keeps its orders');

        assert.deepEqual(await deleteCustomer(customers[24]!.id), { id: customers[24]!.id });
        assert.equal(await tx.customer.findUnique({ where: { id: customers[24]!.id } }), null);
        checks.push('A customer without history is still deleted');

        // The foreign key itself blocks the delete if the application check is skipped.
        await tx.$executeRaw`SAVEPOINT fk`;
        await assert.rejects(tx.customer.delete({ where: { id: customers[1]!.id } }), { code: 'P2003' });
        await tx.$executeRaw`ROLLBACK TO SAVEPOINT fk`;
        checks.push('PostgreSQL rejects the raw delete with a foreign-key error (P2003)');

        throw rollback;
      }, { timeout: 120_000, maxWait: 20_000 });
    } catch (error) {
      if (error !== rollback) throw error;
    }
    const leftovers = await db.customer.count({ where: { nombre: { startsWith: PREFIX } } });
    assert.equal(leftovers, 0);
    checks.push('No fixture survived the rollback');
    console.log(JSON.stringify({ checks, result: 'passed' }, null, 2));
  }
} finally {
  await db.$disconnect();
  await pool.end();
}
