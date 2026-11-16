import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateOrder } from '../../layers/menu/server/utils/orders';

const tx = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), update: vi.fn() },
  orderMenuSlot: { deleteMany: vi.fn() },
  orderDelivery: { deleteMany: vi.fn(), update: vi.fn(), create: vi.fn() },
}));
vi.mock('../../layers/menu/server/utils/prisma', () => ({
  prisma: {
    $transaction: (run: (client: typeof tx) => unknown) => run(tx),
    // `getOrderById` after the write; its result is not under test here.
    order: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));

const component = {
  catalogItemId: null, componentRole: 'PLATILLO_PRINCIPAL' as const, position: 0,
  nombre: 'Pechuga a la plancha', descripcion: '', calorias: 476, imagen: '', tipo: 'comida',
};
const slot = (dayOfWeek: 'LUNES' | 'JUEVES', dayOrder: number) => ({
  dayOfWeek, dayOrder, slotType: 'COMIDA' as const, contenedor: '', components: [component],
});

function existingOrder() {
  return {
    id: 'order-1',
    customer: { ubicacion1: 'Casa nueva 123', ubicacion2: 'Oficina 456' },
    deliveries: [
      { id: 'delivery-1', sequence: 1, locationNumber: 1, addressSnapshot: 'Casa anterior 99' },
      { id: 'delivery-2', sequence: 2, locationNumber: 1, addressSnapshot: 'Casa anterior 99' },
    ],
    cycle: { firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'] },
  };
}

describe('updateOrder deliveries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.order.findUnique.mockResolvedValue(existingOrder());
    tx.orderDelivery.update.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve({ id: where.id, sequence: where.id === 'delivery-1' ? 1 : 2 }));
    tx.orderDelivery.create.mockImplementation(({ data }: { data: { sequence: number } }) =>
      Promise.resolve({ id: `new-${data.sequence}`, sequence: data.sequence }));
  });

  it('keeps the frozen address unless another location is chosen, and assigns meals by day', async () => {
    await updateOrder('order-1', {
      status: 'CONFIRMED',
      notes: '',
      deliveries: [
        { sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 },
        { sequence: 2, scheduledDate: '2026-11-19', locationNumber: 2 },
      ],
      menuSlots: [slot('LUNES', 1), slot('JUEVES', 4)],
    });

    expect(tx.orderDelivery.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'delivery-1' },
      data: { scheduledDate: new Date('2026-11-16T00:00:00.000Z') },
    }));
    expect(tx.orderDelivery.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'delivery-2' },
      data: { scheduledDate: new Date('2026-11-19T00:00:00.000Z'), locationNumber: 2, addressSnapshot: 'Oficina 456' },
    }));
    expect(tx.orderDelivery.create).not.toHaveBeenCalled();

    const created = tx.order.update.mock.calls[0]![0].data.menuSlots.create;
    expect(created.map((item: { dayOfWeek: string; deliveryId: string }) => [item.dayOfWeek, item.deliveryId]))
      .toEqual([['LUNES', 'delivery-1'], ['JUEVES', 'delivery-2']]);
  });

  it('moves every meal to the remaining delivery when one is removed', async () => {
    await updateOrder('order-1', {
      status: 'CONFIRMED',
      notes: '',
      deliveries: [{ sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 }],
      menuSlots: [slot('LUNES', 1), slot('JUEVES', 4)],
    });

    expect(tx.orderDelivery.deleteMany).toHaveBeenCalledWith({ where: { orderId: 'order-1', sequence: { notIn: [1] } } });
    const created = tx.order.update.mock.calls[0]![0].data.menuSlots.create;
    expect(created.every((item: { deliveryId: string }) => item.deliveryId === 'delivery-1')).toBe(true);
  });
});
