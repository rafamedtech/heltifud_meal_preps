import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteCustomer } from '../../layers/menu/server/utils/customers';

const { findUnique, remove, orderCount, menuCount } = vi.hoisted(() => ({
  findUnique: vi.fn(), remove: vi.fn(), orderCount: vi.fn(), menuCount: vi.fn(),
}));
vi.mock('../../layers/menu/server/utils/prisma', () => ({
  prisma: {
    customer: { findUnique, delete: remove },
    order: { count: orderCount },
    weeklyMenu: { count: menuCount },
  },
}));

describe('deleteCustomer', () => {
  beforeEach(() => {
    findUnique.mockReset().mockResolvedValue({ id: 'customer-1' });
    remove.mockReset().mockResolvedValue({});
    orderCount.mockReset().mockResolvedValue(0);
    menuCount.mockReset().mockResolvedValue(0);
  });

  it('deletes a customer without history', async () => {
    await expect(deleteCustomer('customer-1')).resolves.toEqual({ id: 'customer-1' });
    expect(remove).toHaveBeenCalledWith({ where: { id: 'customer-1' } });
  });

  it('refuses with a useful conflict when the customer has orders or menus', async () => {
    orderCount.mockResolvedValue(3);
    menuCount.mockResolvedValue(1);
    await expect(deleteCustomer('customer-1')).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'El cliente tiene 3 pedidos y 1 menú personalizado y no se puede eliminar.',
      data: { code: 'CUSTOMER_HAS_HISTORY', orders: 3, menus: 1 },
    });
    expect(remove).not.toHaveBeenCalled();
  });

  it('reports the same conflict when a record appears during the delete', async () => {
    remove.mockRejectedValue({ code: 'P2003' });
    await expect(deleteCustomer('customer-1')).rejects.toMatchObject({ statusCode: 409, data: { code: 'CUSTOMER_HAS_HISTORY' } });
  });

  it('keeps the 404 for unknown customers', async () => {
    findUnique.mockResolvedValue(null);
    await expect(deleteCustomer('missing')).rejects.toMatchObject({ statusCode: 404 });
  });
});
