/**
 * CI-only fixture: commits one OPEN week in 2096 with a complete standard menu so
 * the integration scripts that need real concurrent connections (and therefore
 * cannot run inside a rollback-only transaction) find a sellable offer.
 *
 * Run only against a disposable database:
 *   CI_DISPOSABLE_DATABASE=1 node --import tsx scripts/seed-ci-open-week.ts
 *
 * Refuses to write when the flag is missing, when any customer or order exists,
 * or when another week is already OPEN. Plans come from the migrations' seed.
 */
import assert from 'node:assert/strict';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../layers/menu/generated/prisma/client';

assert.equal(process.env.CI_DISPOSABLE_DATABASE, '1', 'Set CI_DISPOSABLE_DATABASE=1: this script commits fixtures');
assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const;
const slotTypes = ['DESAYUNO', 'COMIDA', 'CENA'] as const;

try {
  const [customers, orders, openWeeks] = await Promise.all([
    db.customer.count(), db.order.count(), db.weeklyCycle.count({ where: { status: 'OPEN' } }),
  ]);
  assert.equal(customers + orders, 0, 'Refusing to seed: the database already has customers or orders');
  assert.equal(openWeeks, 0, 'Refusing to seed: another week is already OPEN');

  const sellable = await db.planVariant.count({ where: { daysCount: 3, isActive: true, plan: { isActive: true, slotTypes: { equals: ['COMIDA'] } } } });
  assert.ok(sellable > 0, 'Expected the migrations to seed an active COMIDA plan with a 3-day variant');

  const weekStart = new Date('2096-11-19'); // Monday, unused by the rollback-only scripts' fixtures.
  await db.$transaction(async tx => {
    const cycle = await tx.weeklyCycle.create({ data: {
      weekStart, status: 'OPEN', orderCutoffAt: new Date('2096-11-17T05:00:00Z'),
      firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
      firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
    } });
    await tx.weeklyMenu.create({ data: {
      name: 'CI · Semana abierta', menuType: 'ESTANDAR', cycleId: cycle.id, cycleScope: 'ESTANDAR',
      startDate: weekStart, endDate: new Date('2096-11-23'),
      days: { create: days.map((dayOfWeek, index) => ({ dayOfWeek, order: index + 1,
        slots: { create: slotTypes.map(slotType => ({ slotType,
          components: { create: [
            { componentRole: 'PLATILLO_PRINCIPAL', nombre: `CI ${dayOfWeek} ${slotType}`, descripcion: '', calorias: 450, imagen: '', tipo: 'comida' },
            { componentRole: 'GUARNICION_1', nombre: `CI guarnición ${dayOfWeek} ${slotType}`, descripcion: '', calorias: 120, imagen: '', tipo: 'comida' },
          ] },
        })) },
      })) },
    } });
  });
  console.log('Seeded one OPEN week (2096-11-19) with a complete standard menu.');
} finally {
  await db.$disconnect();
  await pool.end();
}
