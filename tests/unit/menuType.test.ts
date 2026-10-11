import { beforeEach, describe, expect, it, vi } from 'vitest';
import { weeklyMenuInputSchema } from '../../layers/menu/shared/types/menuSchema';
import { DAY_OF_WEEK_VALUES, MENU_TYPE_VALUES, SLOT_KEYS, type WeeklyMenuInput } from '../../layers/menu/shared/types/types';
import { createWeeklyMenu, updateWeeklyMenu } from '../../layers/menu/server/utils/menu';

const db = vi.hoisted(() => ({
  findUnique: vi.fn(), findFirst: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(),
  findDays: vi.fn(), transaction: vi.fn(),
}));
vi.mock('../../layers/menu/server/utils/prisma', () => ({ prisma: {
  weeklyMenu: { findUnique: db.findUnique, findFirst: db.findFirst, count: db.count, create: db.create, update: db.update },
  menuDay: { findMany: db.findDays },
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
});

describe('weekly menu type', () => {
  it('defaults legacy create payloads to standard', () => {
    expect(weeklyMenuInputSchema.parse(validMenu()).menuType).toBe('ESTANDAR');
  });
  it.each(MENU_TYPE_VALUES)('accepts %s', menuType => {
    expect(weeklyMenuInputSchema.parse({ ...validMenu(), menuType }).menuType).toBe(menuType);
  });
  it.each(['OTRO', '', null])('rejects invalid type %s', menuType => {
    expect(weeklyMenuInputSchema.safeParse({ ...validMenu(), menuType }).success).toBe(false);
  });
  it.each(MENU_TYPE_VALUES)('persists and returns %s when creating', async menuType => {
    db.create.mockResolvedValue(record(menuType));
    const result = await createWeeklyMenu(weeklyMenuInputSchema.parse({ ...validMenu(), menuType }));
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ menuType }) }));
    expect(result.menuType).toBe(menuType);
  });
  it('writes changes to the type when updating', async () => {
    db.findUnique.mockResolvedValue({ id: 'menu-1', menuType: 'ESTANDAR' });
    db.transaction.mockResolvedValue([{}, record('PERSONALIZADO')]);
    const result = await updateWeeklyMenu('menu-1', weeklyMenuInputSchema.parse({ ...validMenu(), menuType: 'PERSONALIZADO' }));
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ menuType: 'PERSONALIZADO' }) }));
    expect(result.menuType).toBe('PERSONALIZADO');
  });
  it('preserves existing type for an update from an older client', async () => {
    db.findUnique.mockResolvedValue({ id: 'menu-1', menuType: 'VEGETARIANO' });
    db.transaction.mockResolvedValue([{}, record('VEGETARIANO')]);
    const result = await updateWeeklyMenu('menu-1', validMenu() as WeeklyMenuInput);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ menuType: 'VEGETARIANO' }) }));
    expect(result.menuType).toBe('VEGETARIANO');
  });
});
