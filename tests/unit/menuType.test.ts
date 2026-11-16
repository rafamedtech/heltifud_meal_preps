import { beforeEach, describe, expect, it, vi } from 'vitest';
import { weeklyMenuInputSchema } from '../../layers/menu/shared/types/menuSchema';
import { DAY_OF_WEEK_VALUES, MENU_TYPE_VALUES, SLOT_KEYS, type WeeklyMenuInput } from '../../layers/menu/shared/types/types';
import { createWeeklyMenu, updateWeeklyMenu } from '../../layers/menu/server/utils/menu';

const db = vi.hoisted(() => ({
  findUnique: vi.fn(), findFirst: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(),
  findDays: vi.fn(), transaction: vi.fn(), settings: vi.fn(), cycle: vi.fn(), customer: vi.fn(),
}));
vi.mock('../../layers/menu/server/utils/prisma', () => ({ prisma: {
  weeklyMenu: { findUnique: db.findUnique, findFirst: db.findFirst, count: db.count, create: db.create, update: db.update },
  menuDay: { findMany: db.findDays },
  operationSettings: { upsert: db.settings },
  weeklyCycle: { upsert: db.cycle },
  customer: { findUnique: db.customer },
  $transaction: db.transaction,
} }));

function validMenu() {
  return {
    name: 'Semana de prueba', startDate: '2026-10-12', endDate: '2026-10-16',
    days: DAY_OF_WEEK_VALUES.map(dayOfWeek => ({
      dayOfWeek,
      ...Object.fromEntries(SLOT_KEYS.map(key => [key, {
        platilloPrincipal: { nombre: 'Platillo', tipo: key, descripcion: '', imagen: '', calorias: 100 },
        guarnicion1: null, guarnicion2: null, adicionales: [], contenedor: '',
      }])),
    })),
  };
}

function record(menuType: string) {
  return { id: 'menu-1', name: 'Semana de prueba', menuType, isActive: false,
    startDate: new Date('2026-10-12'), endDate: new Date('2026-10-16'),
    createdAt: new Date(), updatedAt: new Date(), days: [],
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  db.findFirst.mockResolvedValue(null);
  db.count.mockResolvedValue(1);
  db.findDays.mockResolvedValue([]);
  db.settings.mockResolvedValue({
    cutoffDay: 'VIERNES', cutoffTime: '18:00', timeZone: 'America/Tijuana',
    firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
    firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
  });
  db.cycle.mockResolvedValue({ id: 'cycle-1', status: 'DRAFT' });
  db.customer.mockResolvedValue({ id: CUSTOMER_ID });
});

const CUSTOMER_ID = '7b0f4c0e-6f5d-4f0a-9d53-2f1f6f2f8a11';
const withCustomer = (menuType: string) => (menuType === 'PERSONALIZADO' ? { customerId: CUSTOMER_ID } : {});

describe('weekly menu type', () => {
  it('defaults legacy create payloads to standard', () => {
    expect(weeklyMenuInputSchema.parse(validMenu()).menuType).toBe('ESTANDAR');
  });
  it.each(MENU_TYPE_VALUES)('accepts %s', menuType => {
    expect(weeklyMenuInputSchema.parse({ ...validMenu(), menuType, ...withCustomer(menuType) }).menuType).toBe(menuType);
  });
  it('requires a customer for a personalised menu', () => {
    const result = weeklyMenuInputSchema.safeParse({ ...validMenu(), menuType: 'PERSONALIZADO' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['customerId']);
  });
  it.each(['OTRO', '', null])('rejects invalid type %s', menuType => {
    expect(weeklyMenuInputSchema.safeParse({ ...validMenu(), menuType }).success).toBe(false);
  });
  it.each(MENU_TYPE_VALUES)('persists and returns %s when creating', async menuType => {
    db.create.mockResolvedValue(record(menuType));
    const result = await createWeeklyMenu(weeklyMenuInputSchema.parse({ ...validMenu(), menuType, ...withCustomer(menuType) }));
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ menuType }) }));
    expect(result.menuType).toBe(menuType);
  });
  it('places a shared menu in the cycle of its week, scoped by type', async () => {
    db.create.mockResolvedValue(record('VEGETARIANO'));
    await createWeeklyMenu(weeklyMenuInputSchema.parse({ ...validMenu(), menuType: 'VEGETARIANO' }));
    expect(db.cycle).toHaveBeenCalledWith(expect.objectContaining({ where: { weekStart: new Date('2026-10-12T00:00:00.000Z') } }));
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      cycleId: 'cycle-1', cycleScope: 'VEGETARIANO', customerId: null, isActive: false,
    }) }));
  });
  it('scopes a personalised menu by its customer', async () => {
    db.create.mockResolvedValue(record('PERSONALIZADO'));
    await createWeeklyMenu(weeklyMenuInputSchema.parse({ ...validMenu(), menuType: 'PERSONALIZADO', customerId: CUSTOMER_ID }));
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      cycleScope: CUSTOMER_ID, customerId: CUSTOMER_ID,
    }) }));
  });
  it('joins the week already taking orders as active', async () => {
    db.cycle.mockResolvedValue({ id: 'cycle-1', status: 'OPEN' });
    db.create.mockResolvedValue(record('ESTANDAR'));
    await createWeeklyMenu(weeklyMenuInputSchema.parse(validMenu()));
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ isActive: true }) }));
  });
  it('reports a second menu of the same scope in a week as a conflict', async () => {
    db.create.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }));
    await expect(createWeeklyMenu(weeklyMenuInputSchema.parse(validMenu()))).rejects.toMatchObject({ statusCode: 409 });
  });
  it('rejects a menu that spans more than one week', async () => {
    await expect(createWeeklyMenu(weeklyMenuInputSchema.parse({ ...validMenu(), endDate: '2026-10-19' }))).rejects.toMatchObject({ statusCode: 400 });
  });
  it('writes changes to the type when updating', async () => {
    db.findUnique.mockResolvedValue({ id: 'menu-1', menuType: 'ESTANDAR', customerId: null });
    db.transaction.mockResolvedValue([{}, record('PERSONALIZADO')]);
    const result = await updateWeeklyMenu('menu-1', weeklyMenuInputSchema.parse({ ...validMenu(), menuType: 'PERSONALIZADO', customerId: CUSTOMER_ID }));
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ menuType: 'PERSONALIZADO' }) }));
    expect(result.menuType).toBe('PERSONALIZADO');
  });
  it('preserves existing type for an update from an older client', async () => {
    db.findUnique.mockResolvedValue({ id: 'menu-1', menuType: 'VEGETARIANO', customerId: null });
    db.transaction.mockResolvedValue([{}, record('VEGETARIANO')]);
    const result = await updateWeeklyMenu('menu-1', validMenu() as WeeklyMenuInput);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ menuType: 'VEGETARIANO' }) }));
    expect(result.menuType).toBe('VEGETARIANO');
  });
});
