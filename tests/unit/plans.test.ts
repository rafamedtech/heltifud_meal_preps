import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deletePlan, getPlans, updatePlan } from '../../layers/menu/server/utils/plans';

const planId = '11111111-1111-4111-8111-111111111111';
const usedVariantId = '22222222-2222-4222-8222-222222222222';
const freeVariantId = '33333333-3333-4333-8333-333333333333';

const { planFindUnique, planFindMany, planDelete, orderCount, transaction } = vi.hoisted(() => ({
  planFindUnique: vi.fn(), planFindMany: vi.fn(), planDelete: vi.fn(), orderCount: vi.fn(), transaction: vi.fn(),
}));
vi.mock('../../layers/menu/server/utils/prisma', () => ({
  prisma: {
    plan: { findUnique: planFindUnique, findMany: planFindMany, delete: planDelete },
    order: { count: orderCount },
    $transaction: transaction,
  },
}));

const input = (variants: Array<{ id?: string; daysCount: number }>) => ({
  title: 'Plan comidas',
  description: 'Comidas de la semana',
  image: 'plans/comidas',
  slotTypes: ['COMIDA' as const],
  isActive: true,
  variants: variants.map((variant) => ({ ...variant, title: `${variant.daysCount} días`, price: 900, isActive: true })),
});

function existingPlan() {
  return {
    id: planId,
    variants: [
      { id: usedVariantId, title: '5 días', _count: { orders: 3 } },
      { id: freeVariantId, title: '3 días', _count: { orders: 0 } },
    ],
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  planFindUnique.mockResolvedValue({ id: planId });
  orderCount.mockResolvedValue(0);
  planDelete.mockResolvedValue({});
});

describe('deletePlan', () => {
  it('deletes a plan without orders', async () => {
    await expect(deletePlan(planId)).resolves.toEqual({ id: planId });
    expect(orderCount).toHaveBeenCalledWith({ where: { planVariant: { planId } } });
    expect(planDelete).toHaveBeenCalledWith({ where: { id: planId } });
  });

  it('refuses with a pause suggestion when its variants have orders', async () => {
    orderCount.mockResolvedValue(4);
    await expect(deletePlan(planId)).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'El plan tiene 4 pedidos y no se puede eliminar. Pausa el plan para dejar de ofrecerlo.',
      data: { code: 'PLAN_HAS_ORDERS', orders: 4 },
    });
    expect(planDelete).not.toHaveBeenCalled();
  });

  it('reports the same conflict when the database restricts the delete', async () => {
    planDelete.mockRejectedValue({ code: 'P2003' });
    await expect(deletePlan(planId)).rejects.toMatchObject({ statusCode: 409, data: { code: 'PLAN_HAS_ORDERS' } });
  });

  it('rejects an invalid id before querying', async () => {
    await expect(deletePlan('no-es-uuid')).rejects.toMatchObject({ statusCode: 400 });
    expect(planFindUnique).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing plan', async () => {
    planFindUnique.mockResolvedValue(null);
    await expect(deletePlan(planId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('updatePlan', () => {
  beforeEach(() => {
    planFindUnique.mockResolvedValue(existingPlan());
  });

  it('refuses to remove a variant that has orders', async () => {
    await expect(updatePlan(planId, input([{ id: freeVariantId, daysCount: 3 }]))).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'La variante «5 días» tiene 3 pedidos y no se puede quitar. Desactívala para dejar de ofrecerla.',
      data: { code: 'VARIANT_HAS_ORDERS' },
    });
    expect(transaction).not.toHaveBeenCalled();
  });

  it('removes a variant without orders', async () => {
    transaction.mockResolvedValue({ id: planId });
    await updatePlan(planId, input([{ id: usedVariantId, daysCount: 5 }]));
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('translates a restricted delete during the transaction', async () => {
    transaction.mockRejectedValue({ code: 'P2003' });
    await expect(updatePlan(planId, input([{ id: usedVariantId, daysCount: 5 }]))).rejects.toMatchObject({
      statusCode: 409, data: { code: 'VARIANT_HAS_ORDERS' },
    });
  });

  it('translates a duplicated title into a useful conflict', async () => {
    transaction.mockRejectedValue({ code: 'P2002', meta: { target: ['title'] } });
    await expect(updatePlan(planId, input([{ id: usedVariantId, daysCount: 5 }, { id: freeVariantId, daysCount: 3 }]))).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'Ya existe un plan llamado «Plan comidas». Usa otro nombre.',
    });
  });

  it('rejects an invalid id', async () => {
    await expect(updatePlan(undefined, input([{ daysCount: 5 }]))).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('getPlans', () => {
  const row = {
    id: planId, title: 'Plan', description: 'd', image: 'i', slotTypes: ['COMIDA'], isActive: true,
    createdAt: new Date('2026-11-01T00:00:00Z'), updatedAt: new Date('2026-11-01T00:00:00Z'),
    variants: [{ id: usedVariantId, title: '5 días', daysCount: 5, price: '900', isActive: true, _count: { orders: 3 } }],
  };

  it('includes order counts in the admin listing', async () => {
    planFindMany.mockResolvedValue([row]);
    const [plan] = await getPlans(false);
    expect(plan?.variants[0]?.orderCount).toBe(3);
  });

  it('never exposes order counts in the public listing', async () => {
    planFindMany.mockResolvedValue([{ ...row, variants: row.variants.map(({ _count, ...variant }) => variant) }]);
    const [plan] = await getPlans(true);
    expect(plan?.variants[0]).not.toHaveProperty('orderCount');
    expect(planFindMany.mock.calls[0]?.[0].include.variants).not.toHaveProperty('include');
  });
});
