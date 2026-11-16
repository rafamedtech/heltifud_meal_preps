import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateOrder } from '../../layers/menu/server/utils/orders';
import { dishConflict, pickCompatibleOption, roleFamily } from '../../layers/menu/shared/utils/orderPersonalization';

const tx = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  weeklyMenu: { findUnique: vi.fn() },
  customerExclusion: { findMany: vi.fn() },
  recipeIngredient: { findMany: vi.fn() },
  orderMenuSlot: { deleteMany: vi.fn() },
  orderDelivery: { deleteMany: vi.fn(), update: vi.fn(), create: vi.fn() },
  $queryRaw: vi.fn(),
}));
vi.mock('../../layers/menu/server/utils/prisma', () => ({
  prisma: {
    $transaction: (run: (client: typeof tx) => unknown) => run(tx),
    order: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));

const ACTOR = { id: '44444444-4444-4444-8444-444444444444', label: 'admin@heltifud' };
const SAVED_MAIN = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SAVED_SIDE = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
// Menu component ids, sorted by role and id as the server reads them.
const MON_MAIN = '10000000-0000-4000-8000-000000000001';
const MON_SIDE = '10000000-0000-4000-8000-000000000002';
const TUE_MAIN = '20000000-0000-4000-8000-000000000001';
const TUE_SHRIMP = '20000000-0000-4000-8000-000000000003';
const MON_DINNER = '30000000-0000-4000-8000-000000000001';

const menuDish = (id: string, componentRole: string, nombre: string) => ({
  id, catalogItemId: `item-${nombre}`, componentRole, nombre, descripcion: '', calorias: 450, imagen: '', tipo: 'comida',
});
const menu = {
  id: 'menu-1', name: 'Semana 47', version: 3,
  days: [
    { dayOfWeek: 'LUNES', order: 1, slots: [
      { slotType: 'COMIDA', components: [menuDish(MON_MAIN, 'PLATILLO_PRINCIPAL', 'Pollo'), menuDish(MON_SIDE, 'GUARNICION_1', 'Arroz')] },
      { slotType: 'CENA', components: [menuDish(MON_DINNER, 'PLATILLO_PRINCIPAL', 'Crema')] },
    ] },
    { dayOfWeek: 'MARTES', order: 2, slots: [
      { slotType: 'COMIDA', components: [menuDish(TUE_MAIN, 'PLATILLO_PRINCIPAL', 'Salmón'), menuDish(TUE_SHRIMP, 'PLATILLO_PRINCIPAL', 'Camarones')] },
    ] },
  ],
};

const saved = (id: string, componentRole: string, nombre: string) => ({
  id, orderMenuSlotId: 'slot-1', catalogItemId: `item-${nombre}`, componentRole, position: 0,
  nombre, descripcion: '', calorias: 450, imagen: '', tipo: 'comida', sourceDayOfWeek: 'LUNES', sourceSlotType: 'COMIDA', isSubstitution: false,
});
function existingOrder() {
  return {
    id: 'order-1', version: 4, status: 'CONFIRMED', customerId: 'customer-1', sourceWeeklyMenuId: 'menu-1', offerVersion: 3,
    menuSlots: [{ dayOfWeek: 'LUNES', slotType: 'COMIDA', dayOrder: 1, components: [saved(SAVED_MAIN, 'PLATILLO_PRINCIPAL', 'Pollo'), saved(SAVED_SIDE, 'GUARNICION_1', 'Arroz')] }],
    customer: { ubicacion1: 'Casa 123', ubicacion2: null },
    deliveries: [{ id: 'delivery-1', sequence: 1, status: 'PENDING', locationNumber: 1, addressSnapshot: 'Casa 123' }],
    cycle: { status: 'OPEN', weekStart: new Date('2026-11-16'), firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'], firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'] },
  };
}

type Main = { orderComponentId?: string; menuComponentId?: string };
const update = (main: Main, extra: { offerVersion?: number; side?: Main } = {}) => updateOrder('order-1', {
  version: 4, offerVersion: extra.offerVersion ?? 3, notes: '',
  deliveries: [{ sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 }],
  menuSlots: [{
    dayOfWeek: 'LUNES', dayOrder: 1, slotType: 'COMIDA', contenedor: '',
    components: [
      { componentRole: 'PLATILLO_PRINCIPAL', position: 0, ...main },
      { componentRole: 'GUARNICION_1', position: 0, ...(extra.side ?? { orderComponentId: SAVED_SIDE }) },
    ],
  }],
}, ACTOR);
const writtenSlot = () => tx.order.update.mock.calls[0]![0].data;

describe('updateOrder dish swaps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.order.findUnique.mockResolvedValue(existingOrder());
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.weeklyMenu.findUnique.mockResolvedValue(menu);
    tx.$queryRaw.mockResolvedValue([{ version: 3 }]);
    tx.customerExclusion.findMany.mockResolvedValue([
      { id: 'ex-1', kind: 'ALERGIA', ingredientId: 'camaron', catalogItemId: null, ingredient: { nombre: 'Camarón' }, catalogItem: null },
    ]);
    tx.recipeIngredient.findMany.mockImplementation(({ where }: { where: { foodCatalogItemId: { in: string[] } } }) =>
      Promise.resolve(where.foodCatalogItemId.in.map((id) => ({ foodCatalogItemId: id, ingredientId: id === 'item-Camarones' ? 'camaron' : 'otro' }))));
    tx.orderDelivery.update.mockResolvedValue({ id: 'delivery-1', sequence: 1 });
  });

  it('copies a menu option from the server and records the swap', async () => {
    await update({ menuComponentId: TUE_MAIN });
    const data = writtenSlot();
    expect(data.offerVersion).toBe(3);
    expect(data.menuSlots.create[0].components.create[0]).toEqual({
      componentRole: 'PLATILLO_PRINCIPAL', position: 0, catalogItemId: 'item-Salmón', nombre: 'Salmón', descripcion: '', calorias: 450,
      imagen: '', tipo: 'comida', sourceDayOfWeek: 'MARTES', sourceSlotType: 'COMIDA', isSubstitution: true,
    });
    expect(data.menuChanges.create).toEqual([expect.objectContaining({
      orderVersion: 5, kind: 'SUSTITUCION', dayOfWeek: 'LUNES', slotType: 'COMIDA', componentRole: 'PLATILLO_PRINCIPAL', position: 0,
      fromNombre: 'Pollo', toNombre: 'Salmón', actorId: ACTOR.id, actorLabel: ACTOR.label,
    })]);
  });

  it('takes a dish from another meal time the plan sells only if the order has it', async () => {
    // The order only sells lunch: dinner dishes are not options.
    await expect(update({ menuComponentId: MON_DINNER })).rejects.toMatchObject({ statusCode: 409, data: { code: 'OFFER_VERSION_CONFLICT' } });
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });

  it('restores the dish the menu puts in the place', async () => {
    const order = existingOrder();
    order.menuSlots[0]!.components[0] = { ...saved(SAVED_MAIN, 'PLATILLO_PRINCIPAL', 'Salmón'), sourceDayOfWeek: 'MARTES', isSubstitution: true };
    tx.order.findUnique.mockResolvedValue(order);
    await update({ menuComponentId: MON_MAIN });
    const data = writtenSlot();
    expect(data.menuSlots.create[0].components.create[0]).toMatchObject({ nombre: 'Pollo', sourceDayOfWeek: 'LUNES', isSubstitution: false });
    expect(data.menuChanges.create).toEqual([expect.objectContaining({ kind: 'RESTAURACION', fromNombre: 'Salmón', toNombre: 'Pollo' })]);
  });

  it('records no change when the place keeps the same dish', async () => {
    await update({ menuComponentId: MON_MAIN });
    expect(writtenSlot().menuChanges.create).toEqual([]);
  });

  it('rejects a dish the customer must not receive', async () => {
    await expect(update({ menuComponentId: TUE_SHRIMP })).rejects.toMatchObject({ statusCode: 409, data: { code: 'EXCLUDED_DISH' } });
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a kept dish that an exclusion added later no longer allows', async () => {
    tx.customerExclusion.findMany.mockResolvedValue([
      { id: 'ex-2', kind: 'PLATILLO', ingredientId: null, catalogItemId: 'item-Pollo', ingredient: null, catalogItem: { nombre: 'Pollo' } },
    ]);
    await expect(update({ orderComponentId: SAVED_MAIN })).rejects.toMatchObject({ statusCode: 409, data: { code: 'EXCLUDED_DISH' } });
  });

  it('keeps role families apart', async () => {
    await expect(update({ menuComponentId: MON_SIDE })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects options read from an older menu version', async () => {
    await expect(update({ menuComponentId: TUE_MAIN }, { offerVersion: 2 })).rejects.toMatchObject({ statusCode: 409, data: { code: 'OFFER_VERSION_CONFLICT' } });
    tx.$queryRaw.mockResolvedValue([{ version: 4 }]);
    await expect(update({ menuComponentId: TUE_MAIN })).rejects.toMatchObject({ statusCode: 409, data: { code: 'OFFER_VERSION_CONFLICT' } });
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });

  it('rejects adding, dropping or moving a place', async () => {
    await expect(updateOrder('order-1', {
      version: 4, offerVersion: 3, notes: '',
      deliveries: [{ sequence: 1, scheduledDate: '2026-11-16', locationNumber: 1 }],
      menuSlots: [{ dayOfWeek: 'LUNES', dayOrder: 1, slotType: 'COMIDA', contenedor: '', components: [{ componentRole: 'PLATILLO_PRINCIPAL', position: 0, orderComponentId: SAVED_MAIN }] }],
    }, ACTOR)).rejects.toMatchObject({ statusCode: 400 });
    await expect(update({ orderComponentId: SAVED_SIDE }, { side: { orderComponentId: SAVED_MAIN } })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('keeps saved dishes when the source menu no longer exists, and refuses new ones', async () => {
    const order = { ...existingOrder(), sourceWeeklyMenuId: null };
    tx.order.findUnique.mockResolvedValue(order);
    await update({ orderComponentId: SAVED_MAIN });
    expect(writtenSlot().menuSlots.create[0].components.create[0]).toMatchObject({ nombre: 'Pollo' });

    vi.clearAllMocks();
    tx.order.findUnique.mockResolvedValue(order);
    tx.customerExclusion.findMany.mockResolvedValue([]);
    tx.recipeIngredient.findMany.mockResolvedValue([]);
    await expect(update({ menuComponentId: TUE_MAIN })).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('personalisation rules', () => {
  const allergy = { kind: 'ALERGIA' as const, ingredientId: 'cacahuate', catalogItemId: null, label: 'Cacahuate' };

  it('groups roles in families', () => {
    expect(roleFamily('GUARNICION_1')).toBe(roleFamily('GUARNICION_2'));
    expect(roleFamily('PLATILLO_PRINCIPAL')).not.toBe(roleFamily('ADICIONAL'));
  });

  it('excludes by ingredient or dish and flags dishes without recipe only for allergies', () => {
    expect(dishConflict({ catalogItemId: 'a', ingredientIds: ['cacahuate'] }, [allergy])).toEqual({ status: 'excluded', reasons: ['Alergia: Cacahuate'] });
    expect(dishConflict({ catalogItemId: 'a', ingredientIds: ['pollo'] }, [{ kind: 'PLATILLO', ingredientId: null, catalogItemId: 'a', label: 'Mole' }]))
      .toEqual({ status: 'excluded', reasons: ['Platillo excluido'] });
    expect(dishConflict({ catalogItemId: 'a', ingredientIds: [] }, [allergy]).status).toBe('unverified');
    expect(dishConflict({ catalogItemId: null, ingredientIds: [] }, [{ ...allergy, kind: 'INGREDIENTE' }]).status).toBe('ok');
    expect(dishConflict({ catalogItemId: 'a', ingredientIds: ['pollo'] }, [allergy]).status).toBe('ok');
  });

  it('picks the closest compatible dish of the same family', () => {
    const ok = { status: 'ok' as const };
    const options = [
      { id: 'tue-lunch', dayOfWeek: 'MARTES' as const, slotType: 'COMIDA' as const, componentRole: 'PLATILLO_PRINCIPAL' as const, conflict: ok },
      { id: 'mon-dinner', dayOfWeek: 'LUNES' as const, slotType: 'CENA' as const, componentRole: 'PLATILLO_PRINCIPAL' as const, conflict: ok },
      { id: 'mon-side', dayOfWeek: 'LUNES' as const, slotType: 'COMIDA' as const, componentRole: 'GUARNICION_1' as const, conflict: ok },
      { id: 'mon-lunch-2', dayOfWeek: 'LUNES' as const, slotType: 'COMIDA' as const, componentRole: 'PLATILLO_PRINCIPAL' as const, conflict: { status: 'unverified' as const, reasons: [] } },
    ];
    expect(pickCompatibleOption({ dayOfWeek: 'LUNES', slotType: 'COMIDA', componentRole: 'PLATILLO_PRINCIPAL' }, options)?.id).toBe('tue-lunch');
    expect(pickCompatibleOption({ dayOfWeek: 'LUNES', slotType: 'CENA', componentRole: 'PLATILLO_PRINCIPAL' }, options)?.id).toBe('mon-dinner');
    expect(pickCompatibleOption({ dayOfWeek: 'LUNES', slotType: 'COMIDA', componentRole: 'ADICIONAL' }, options)).toBeUndefined();
  });
});
