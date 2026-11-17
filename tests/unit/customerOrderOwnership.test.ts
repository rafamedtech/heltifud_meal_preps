import { randomBytes } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prisma } = vi.hoisted(() => ({ prisma: { orderAccessLink: { findUnique: vi.fn() }, order: { findUniqueOrThrow: vi.fn() } } }));
vi.mock('../../layers/menu/server/utils/prisma', () => ({ prisma }));

const { getPrivateCustomerOrder } = await import('../../layers/menu/server/utils/customerOrders');
const { hashOrderSecret } = await import('../../layers/menu/server/utils/orderAccess');

const tokenA = randomBytes(32).toString('hex');
const tokenB = randomBytes(32).toString('hex');
const links = new Map([
  [hashOrderSecret(tokenA), { orderId: 'order-a', expiresAt: new Date(Date.now() + 60000), revokedAt: null }],
  [hashOrderSecret(tokenB), { orderId: 'order-b', expiresAt: new Date(Date.now() + 60000), revokedAt: null }],
]);
const order = (id: string, nombre: string) => ({ id, folio: id === 'order-a' ? 1 : 2, status: 'CONFIRMED', planTitleSnapshot: 'Plan', planVariantTitleSnapshot: '5 días',
  priceSnapshot: 1000, contactSnapshot: { nombre, telefono: '6640000000', correoElectronico: '' }, customer: { nombre, telefono: '', correoElectronico: null },
  notes: null, deliveries: [], menuSlots: [] });

beforeEach(() => {
  prisma.orderAccessLink.findUnique.mockReset();
  prisma.orderAccessLink.findUnique.mockImplementation(({ where }: { where: { tokenHash: string } }) => Promise.resolve(links.get(where.tokenHash) ?? null));
  prisma.order.findUniqueOrThrow.mockReset();
  prisma.order.findUniqueOrThrow.mockImplementation(({ where }: { where: { id: string } }) => Promise.resolve(order(where.id, where.id === 'order-a' ? 'Cliente A' : 'Cliente B')));
});

describe('private order ownership', () => {
  it('loads only the order bound to the token', async () => {
    await expect(getPrivateCustomerOrder(tokenA)).resolves.toMatchObject({ folio: 1, contact: { nombre: 'Cliente A' } });
    expect(prisma.order.findUniqueOrThrow).toHaveBeenCalledOnce();
    expect(prisma.order.findUniqueOrThrow.mock.calls[0]![0]).toMatchObject({ where: { id: 'order-a' } });
  });

  it('never reaches another customer order with a guessed or altered token', async () => {
    const guessed = tokenA.slice(0, -1) + (tokenA.endsWith('0') ? '1' : '0');
    await expect(getPrivateCustomerOrder(guessed)).rejects.toMatchObject({ statusCode: 404 });
    await expect(getPrivateCustomerOrder('order-b')).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.order.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it('rejects an invitation token that has no submitted order', async () => {
    const invitation = randomBytes(32).toString('hex');
    links.set(hashOrderSecret(invitation), { orderId: null as never, expiresAt: new Date(Date.now() + 60000), revokedAt: null });
    await expect(getPrivateCustomerOrder(invitation)).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.order.findUniqueOrThrow).not.toHaveBeenCalled();
  });
});
