import { describe, expect, it, vi } from 'vitest';
import { getOrders } from '../../layers/menu/server/utils/orders';

const { findMany, groupBy, transaction } = vi.hoisted(() => ({ findMany: vi.fn(), groupBy: vi.fn(), transaction: vi.fn() }));
vi.mock('../../layers/menu/server/utils/prisma', () => ({ prisma: { order: { findMany, groupBy }, $transaction: transaction } }));

describe('customer order history', () => {
  it('filters both results and totals by customer and applies pagination', async () => {
    transaction.mockResolvedValue([[], []]);
    await getOrders({ customerId: 'customer-1', limit: 10, offset: 10 });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { customerId: 'customer-1' }, take: 10, skip: 10 }));
    expect(groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { customerId: 'customer-1' } }));
  });

  it('rejects invalid pagination before querying orders', async () => {
    await expect(getOrders({ customerId: 'customer-1', offset: -1 })).rejects.toMatchObject({ statusCode: 400 });
  });
});
