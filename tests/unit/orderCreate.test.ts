import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createOrder, getOrderOptions, parseIdempotencyKey } from '../../layers/menu/server/utils/orders';

const tx = vi.hoisted(() => ({
  customer: { findUnique: vi.fn() },
  planVariant: { findUnique: vi.fn() },
  weeklyMenu: { findFirst: vi.fn() },
  order: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
}));
vi.mock('../../layers/menu/server/utils/prisma', () => ({
  prisma: { ...tx, $transaction: (run: (client: typeof tx) => unknown) => run(tx) },
}));

const CUSTOMER = '11111111-1111-4111-8111-111111111111';
const VARIANT = '22222222-2222-4222-8222-222222222222';

const dish = (componentRole: string, nombre: string) => ({
  catalogItemId: null, componentRole, nombre, descripcion: '', calorias: 400, imagen: '', tipo: 'comida',
});
const menuDay = (dayOfWeek: string, order: number, complete = true) => ({
  dayOfWeek,
  order,
  slots: [
    { slotType: 'COMIDA', contenedor: null, components: complete ? [dish('PLATILLO_PRINCIPAL', `Comida ${dayOfWeek}`), dish('GUARNICION_1', 'Arroz')] : [] },
    { slotType: 'CENA', contenedor: null, components: [dish('PLATILLO_PRINCIPAL', `Cena ${dayOfWeek}`)] },
  ],
});

function mockContext(overrides: { daysCount?: number; cutoff?: string; tipoCliente?: string } = {}) {
  tx.customer.findUnique.mockResolvedValue({
    id: CUSTOMER, tipoCliente: overrides.tipoCliente ?? 'menu', ubicacion1: 'Casa 123', ubicacion2: 'Oficina 456',
    firstDeliveryDay: 'LUNES', secondDeliveryDay: null,
  });
  tx.planVariant.findUnique.mockResolvedValue({
    id: VARIANT, title: '3 días', daysCount: overrides.daysCount ?? 3, price: 900, isActive: true,
    plan: { title: 'Plan comidas', slotTypes: ['COMIDA'], isActive: true },
  });
  tx.weeklyMenu.findFirst.mockResolvedValue({
    id: 'menu-1',
    name: 'Semana 47',
    cycle: {
      id: 'cycle-1',
      weekStart: new Date('2026-11-16T00:00:00.000Z'),
      orderCutoffAt: new Date(overrides.cutoff ?? '2999-01-01T00:00:00.000Z'),
      firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'],
      secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
      firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'],
      secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
    },
    days: [
      menuDay('LUNES', 1), menuDay('MARTES', 2), menuDay('MIERCOLES', 3), menuDay('JUEVES', 4), menuDay('VIERNES', 5),
      menuDay('SABADO', 6, false),
    ],
  });
  tx.order.create.mockImplementation(({ data }: { data: { deliveries: { create: Array<{ sequence: number }> } } }) =>
    Promise.resolve({ id: 'order-1', deliveries: data.deliveries.create.map((item) => ({ id: `delivery-${item.sequence}`, sequence: item.sequence })) }));
  tx.order.findUnique.mockResolvedValue(null);
}

const input = (days: string[], deliveries: unknown[] = []) =>
  ({ customerId: CUSTOMER, planVariantId: VARIANT, days, deliveries, notes: '' }) as Parameters<typeof createOrder>[0];

describe('createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext();
  });

  it('reads the menu of the customer type in the week taking orders', async () => {
    mockContext({ tipoCliente: 'vegetariano' });
    await createOrder(input(['LUNES', 'MARTES', 'JUEVES']));
    expect(tx.weeklyMenu.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { cycleScope: 'VEGETARIANO', cycle: { status: 'OPEN' } },
    }));
  });

  it('copies only the chosen days and plan times, each meal in its delivery', async () => {
    await createOrder(input(['LUNES', 'MARTES', 'JUEVES']));

    const order = tx.order.create.mock.calls[0]![0].data;
    expect(order).toMatchObject({ cycleId: 'cycle-1', sourceWeeklyMenuId: 'menu-1', capturedAfterCutoff: false });
    // Customer prefers Monday; no preference for the second one, so the first allowed day.
    expect(order.deliveries.create).toEqual([
      { sequence: 1, scheduledDate: new Date('2026-11-16T00:00:00.000Z'), locationNumber: 1, addressSnapshot: 'Casa 123' },
      { sequence: 2, scheduledDate: new Date('2026-11-18T00:00:00.000Z'), locationNumber: 1, addressSnapshot: 'Casa 123' },
    ]);

    const slots = tx.order.update.mock.calls[0]![0].data.menuSlots.create;
    expect(slots.map((slot: { dayOfWeek: string; slotType: string; deliveryId: string }) => [slot.dayOfWeek, slot.slotType, slot.deliveryId])).toEqual([
      ['LUNES', 'COMIDA', 'delivery-1'], ['MARTES', 'COMIDA', 'delivery-1'], ['JUEVES', 'COMIDA', 'delivery-2'],
    ]);
    expect(slots[0].components.create[0]).toMatchObject({ nombre: 'Comida LUNES', sourceDayOfWeek: 'LUNES', sourceSlotType: 'COMIDA' });
  });

  it('creates one delivery when the chosen days fall in a single half of the week', async () => {
    await createOrder(input(['LUNES', 'MARTES', 'MIERCOLES']));
    expect(tx.order.create.mock.calls[0]![0].data.deliveries.create.map((item: { sequence: number }) => item.sequence)).toEqual([1]);
  });

  it('applies the day and location chosen for this order', async () => {
    await createOrder(input(['LUNES', 'MARTES', 'JUEVES'], [
      { sequence: 1, deliveryDay: 'DOMINGO', locationNumber: 2 },
      { sequence: 2, deliveryDay: 'JUEVES', locationNumber: 1 },
    ]));
    expect(tx.order.create.mock.calls[0]![0].data.deliveries.create).toEqual([
      { sequence: 1, scheduledDate: new Date('2026-11-15T00:00:00.000Z'), locationNumber: 2, addressSnapshot: 'Oficina 456' },
      { sequence: 2, scheduledDate: new Date('2026-11-19T00:00:00.000Z'), locationNumber: 1, addressSnapshot: 'Casa 123' },
    ]);
  });

  it('rejects a delivery day the week does not allow', async () => {
    await expect(createOrder(input(['LUNES', 'MARTES', 'JUEVES'], [{ sequence: 1, deliveryDay: 'VIERNES', locationNumber: 1 }])))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rejects a day count different from the plan and days without a main dish', async () => {
    await expect(createOrder(input(['LUNES', 'MARTES']))).rejects.toMatchObject({ statusCode: 400 });
    await expect(createOrder(input(['LUNES', 'MARTES', 'SABADO']))).rejects.toMatchObject({ statusCode: 400 });
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rejects a plan that needs more complete days than the menu has', async () => {
    mockContext({ daysCount: 6 });
    await expect(createOrder(input(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']))).rejects.toMatchObject({ statusCode: 409 });
  });

  it('answers 409 when the open week has no menu for the customer type', async () => {
    tx.weeklyMenu.findFirst.mockResolvedValue(null);
    await expect(createOrder(input(['LUNES', 'MARTES', 'JUEVES']))).rejects.toMatchObject({ statusCode: 409 });
  });

  it('marks orders captured after the cutoff', async () => {
    mockContext({ cutoff: '2020-01-01T00:00:00.000Z' });
    await createOrder(input(['LUNES', 'MARTES', 'JUEVES']));
    expect(tx.order.create.mock.calls[0]![0].data.capturedAfterCutoff).toBe(true);
  });
});

describe('createOrder idempotency', () => {
  const KEY = '33333333-3333-4333-8333-333333333333';
  const days = ['LUNES', 'MARTES', 'JUEVES'];

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext();
  });

  async function storedFingerprint() {
    await createOrder(input(days), undefined, KEY);
    const data = tx.order.create.mock.calls[0]![0].data;
    vi.clearAllMocks();
    mockContext();
    return data.idempotencyFingerprint as string;
  }

  it('stores the key and a payload fingerprint with the new order', async () => {
    await createOrder(input(days), undefined, KEY.toUpperCase());
    const data = tx.order.create.mock.calls[0]![0].data;
    expect(data.idempotencyKey).toBe(KEY);
    expect(data.idempotencyFingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns the existing order for a repeated key without creating another', async () => {
    const fingerprint = await storedFingerprint();
    tx.order.findUnique.mockResolvedValueOnce({ id: 'order-1', idempotencyFingerprint: fingerprint });
    await createOrder(input(['JUEVES', 'LUNES', 'MARTES']), undefined, KEY);
    expect(tx.order.findUnique.mock.calls[0]![0].where).toEqual({ idempotencyKey: KEY });
    expect(tx.order.findUnique.mock.calls[1]![0].where).toEqual({ id: 'order-1' });
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rejects a repeated key that carries different data', async () => {
    const fingerprint = await storedFingerprint();
    tx.order.findUnique.mockResolvedValueOnce({ id: 'order-1', idempotencyFingerprint: fingerprint });
    await expect(createOrder({ ...input(days), notes: 'Otra nota' }, undefined, KEY)).rejects.toMatchObject({ statusCode: 422 });
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('answers with the winning order when a simultaneous request takes the key first', async () => {
    const fingerprint = await storedFingerprint();
    tx.order.create.mockRejectedValueOnce(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }));
    tx.order.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'order-winner', idempotencyFingerprint: fingerprint });
    await expect(createOrder(input(days), undefined, KEY)).resolves.toBeNull();
    expect(tx.order.findUnique.mock.calls[2]![0].where).toEqual({ id: 'order-winner' });
  });

  it('rethrows a unique violation that is not about the key', async () => {
    tx.order.create.mockRejectedValueOnce(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }));
    await expect(createOrder(input(days), undefined, KEY)).rejects.toMatchObject({ code: 'P2002' });
  });

  it('requires a UUID key', () => {
    expect(() => parseIdempotencyKey(undefined)).toThrow(expect.objectContaining({ statusCode: 400 }));
    expect(() => parseIdempotencyKey('pedido-1')).toThrow(expect.objectContaining({ statusCode: 400 }));
    expect(parseIdempotencyKey(` ${KEY.toUpperCase()} `)).toBe(KEY);
  });
});

describe('getOrderOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext();
  });

  it('returns the week, its menu and the days that can be ordered', async () => {
    const options = await getOrderOptions({ customerId: CUSTOMER, planVariantId: VARIANT });
    expect(options).toMatchObject({
      cycle: { id: 'cycle-1', weekStart: '2026-11-16', pastCutoff: false },
      menu: { id: 'menu-1', name: 'Semana 47' },
      daysCount: 3,
      availableDays: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
    });
  });

  it('rejects a query without customer or plan', async () => {
    await expect(getOrderOptions({ customerId: CUSTOMER })).rejects.toMatchObject({ statusCode: 400 });
  });
});
