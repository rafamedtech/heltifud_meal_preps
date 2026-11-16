import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateOrder } from '../../layers/menu/server/utils/orders';

const tx = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  weeklyMenu: { findUnique: vi.fn() },
  customerExclusion: { findMany: vi.fn().mockResolvedValue([]) },
  recipeIngredient: { findMany: vi.fn().mockResolvedValue([]) },
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

const componentId = (dayOfWeek: string) => (dayOfWeek === 'LUNES' ? 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' : 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
const savedComponent = (dayOfWeek: string) => ({
  id: componentId(dayOfWeek), orderMenuSlotId: `slot-${dayOfWeek}`,
  catalogItemId: null, componentRole: 'PLATILLO_PRINCIPAL' as const, position: 0,
  nombre: 'Pechuga a la plancha', descripcion: '', calorias: 476, imagen: '', tipo: 'comida',
  sourceDayOfWeek: dayOfWeek, sourceSlotType: 'COMIDA', isSubstitution: false,
});
// The saved dish stays in its place.
const slot = (dayOfWeek: 'LUNES' | 'JUEVES', dayOrder: number) => ({
  dayOfWeek, dayOrder, slotType: 'COMIDA' as const, contenedor: '',
  components: [{ componentRole: 'PLATILLO_PRINCIPAL' as const, position: 0, orderComponentId: componentId(dayOfWeek) }],
});

function existingOrder() {
  return {
    id: 'order-1', version: 1, status: 'CONFIRMED', customerId: 'customer-1', sourceWeeklyMenuId: null, offerVersion: 1,
    menuSlots: [
      { dayOfWeek: 'LUNES', slotType: 'COMIDA', dayOrder: 1, components: [savedComponent('LUNES')] },
      { dayOfWeek: 'JUEVES', slotType: 'COMIDA', dayOrder: 4, components: [savedComponent('JUEVES')] },
    ],
    customer: { ubicacion1: 'Casa nueva 123', ubicacion2: 'Oficina 456' },
    deliveries: [
      { id: 'delivery-1', sequence: 1, status: 'PENDING', locationNumber: 1, addressSnapshot: 'Casa anterior 99' },
      { id: 'delivery-2', sequence: 2, status: 'PENDING', locationNumber: 1, addressSnapshot: 'Casa anterior 99' },
    ],
    cycle: { status: 'OPEN', weekStart: new Date('2026-11-16'), firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'], firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'] },
  };
}

describe('updateOrder deliveries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.order.findUnique.mockResolvedValue(existingOrder());
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.orderDelivery.update.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve({ id: where.id, sequence: where.id === 'delivery-1' ? 1 : 2 }));
    tx.orderDelivery.create.mockImplementation(({ data }: { data: { sequence: number } }) =>
      Promise.resolve({ id: `new-${data.sequence}`, sequence: data.sequence }));
  });

  it('keeps the frozen address unless another location is chosen, and assigns meals by day', async () => {
    await updateOrder('order-1', {
      version: 1,
      offerVersion: 1,
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
    // Kept dishes are copied from the saved order, not from the request.
    expect(created[0].components.create).toEqual([expect.objectContaining({ nombre: 'Pechuga a la plancha', sourceDayOfWeek: 'LUNES', isSubstitution: false })]);
    expect(tx.order.update.mock.calls[0]![0].data.menuChanges.create).toEqual([]);
  });

  it('rejects removing a delivery that carries contracted meal days before writing', async () => {
    await expect(updateOrder('order-1', {
      version: 1, offerVersion: 1, notes: '',
      deliveries: [{ sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 }],
      menuSlots: [slot('LUNES', 1), slot('JUEVES', 4)],
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(tx.orderMenuSlot.deleteMany).not.toHaveBeenCalled();
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });

  it.each(['2026-11-20', '2026-11-26'])('rejects a forbidden delivery date %s before writing', async date => {
    await expect(updateOrder('order-1', {
      version: 1, offerVersion: 1, notes: '',
      deliveries: [{ sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 }, { sequence: 2, scheduledDate: date, locationNumber: 1 }],
      menuSlots: [slot('LUNES', 1), slot('JUEVES', 4)],
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(tx.orderMenuSlot.deleteMany).not.toHaveBeenCalled();
  });

  it('rejects a stale version before changing deliveries or menu slots', async () => {
    await expect(updateOrder('order-1', {
      version: 2, offerVersion: 1, notes: '',
      deliveries: [{ sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 }],
      menuSlots: [slot('LUNES', 1)],
    })).rejects.toMatchObject({ statusCode: 409 });
    expect(tx.orderMenuSlot.deleteMany).not.toHaveBeenCalled();
  });

  it('rejects editing a cycle after orders close, before claiming a version', async () => {
    const existing = existingOrder();
    existing.cycle.status = 'CLOSED';
    tx.order.findUnique.mockResolvedValue(existing);
    await expect(updateOrder('order-1', {
      version: 1, offerVersion: 1, notes: '',
      deliveries: [{ sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 }, { sequence: 2, scheduledDate: '2026-11-19', locationNumber: 1 }],
      menuSlots: [slot('LUNES', 1), slot('JUEVES', 4)],
    })).rejects.toMatchObject({ statusCode: 409 });
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });
});
