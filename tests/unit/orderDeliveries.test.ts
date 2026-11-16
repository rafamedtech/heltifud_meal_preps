import { describe, expect, it } from 'vitest';

import {
  availableOrderDays,
  chosenDaysError,
  deliveryDateFor,
  deliveryDateOf,
  deliverySequenceForDay,
  orderFolioLabel,
  planOrderDeliveries,
} from '../../layers/menu/shared/utils/orderDeliveries';

import type { DeliveryMealRule, DeliveryPlanRule } from '../../layers/menu/shared/utils/orderDeliveries';

const mealRule: DeliveryMealRule = {
  firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'],
  secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
};

describe('deliverySequenceForDay', () => {
  it('follows the split of the week', () => {
    expect((['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const).map((day) => deliverySequenceForDay(day, mealRule)))
      .toEqual([1, 1, 1, 2, 2]);
  });

  it('follows a custom split', () => {
    const custom: DeliveryMealRule = { firstDeliveryMealDays: ['LUNES', 'MARTES'], secondDeliveryMealDays: ['MIERCOLES', 'JUEVES', 'VIERNES'] };
    expect(deliverySequenceForDay('MIERCOLES', custom)).toBe(2);
  });

  it('sends days outside the rule with the nearest delivery', () => {
    expect(deliverySequenceForDay('SABADO', mealRule)).toBe(2);
    expect(deliverySequenceForDay('LUNES', { firstDeliveryMealDays: ['MARTES'], secondDeliveryMealDays: ['JUEVES'] })).toBe(1);
  });

  it('puts every meal in the only delivery of the order', () => {
    expect(deliverySequenceForDay('JUEVES', mealRule, [1])).toBe(1);
    expect(deliverySequenceForDay('LUNES', mealRule, [2])).toBe(2);
  });
});

describe('deliveryDateOf', () => {
  const deliveries = [{ sequence: 1, scheduledDate: '2026-11-16' }];

  it('returns the civil date of a delivery, or null when missing', () => {
    expect(deliveryDateOf(deliveries, 1)).toBe('2026-11-16');
    expect(deliveryDateOf(deliveries, 2)).toBeNull();
  });
});

const planRule: DeliveryPlanRule = {
  ...mealRule,
  firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'],
  secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
};
// Monday 16 November 2026.
const weekStart = '2026-11-16';

describe('deliveryDateFor', () => {
  it('places a Sunday delivery the day before the week starts', () => {
    expect(deliveryDateFor(weekStart, 'DOMINGO', mealRule.firstDeliveryMealDays)).toBe('2026-11-15');
    expect(deliveryDateFor(weekStart, 'LUNES', mealRule.firstDeliveryMealDays)).toBe('2026-11-16');
  });

  it('places the second delivery on or before its first meal day', () => {
    expect(deliveryDateFor(weekStart, 'MIERCOLES', mealRule.secondDeliveryMealDays)).toBe('2026-11-18');
    expect(deliveryDateFor(weekStart, 'JUEVES', mealRule.secondDeliveryMealDays)).toBe('2026-11-19');
  });
});

describe('planOrderDeliveries', () => {
  it('creates both deliveries from the customer preference', () => {
    const planned = planOrderDeliveries({
      weekStart,
      days: ['VIERNES', 'LUNES', 'MARTES', 'JUEVES', 'MIERCOLES'],
      rule: planRule,
      preferred: { 1: 'LUNES', 2: 'JUEVES' },
    });
    expect(planned).toEqual([
      { sequence: 1, deliveryDay: 'LUNES', scheduledDate: '2026-11-16', mealDays: ['LUNES', 'MARTES', 'MIERCOLES'], allowedDays: ['DOMINGO', 'LUNES'] },
      { sequence: 2, deliveryDay: 'JUEVES', scheduledDate: '2026-11-19', mealDays: ['JUEVES', 'VIERNES'], allowedDays: ['MIERCOLES', 'JUEVES'] },
    ]);
  });

  it('creates a single delivery when every chosen day falls in one half', () => {
    expect(planOrderDeliveries({ weekStart, days: ['LUNES', 'MARTES', 'MIERCOLES'], rule: planRule }).map((item) => item.sequence)).toEqual([1]);
    expect(planOrderDeliveries({ weekStart, days: ['JUEVES', 'VIERNES'], rule: planRule }).map((item) => item.sequence)).toEqual([2]);
  });

  it('falls back to the first allowed day when the preference is missing or not allowed', () => {
    const planned = planOrderDeliveries({ weekStart, days: ['LUNES', 'JUEVES'], rule: planRule, preferred: { 1: 'VIERNES', 2: null } });
    expect(planned.map((item) => [item.deliveryDay, item.scheduledDate])).toEqual([['DOMINGO', '2026-11-15'], ['MIERCOLES', '2026-11-18']]);
  });

  it('keeps the delivery date when only later days of its half are chosen', () => {
    const [first] = planOrderDeliveries({ weekStart, days: ['MIERCOLES'], rule: planRule, preferred: { 1: 'LUNES' } });
    expect(first?.scheduledDate).toBe('2026-11-16');
  });
});

describe('availableOrderDays', () => {
  const main = { componentRole: 'PLATILLO_PRINCIPAL' as const };
  const side = { componentRole: 'GUARNICION_1' as const };
  const menuDays = [
    { dayOfWeek: 'MARTES' as const, slots: [{ slotType: 'COMIDA' as const, components: [main] }, { slotType: 'CENA' as const, components: [main, side] }] },
    { dayOfWeek: 'LUNES' as const, slots: [{ slotType: 'COMIDA' as const, components: [main] }, { slotType: 'CENA' as const, components: [side] }] },
    { dayOfWeek: 'SABADO' as const, slots: [{ slotType: 'COMIDA' as const, components: [] }, { slotType: 'CENA' as const, components: [] }] },
  ];

  it('offers only days with a main dish in every meal time of the plan', () => {
    expect(availableOrderDays(menuDays, ['COMIDA'])).toEqual(['LUNES', 'MARTES']);
    expect(availableOrderDays(menuDays, ['COMIDA', 'CENA'])).toEqual(['MARTES']);
    expect(availableOrderDays(menuDays, ['DESAYUNO'])).toEqual([]);
  });
});

describe('chosenDaysError', () => {
  const available = ['LUNES', 'MARTES', 'MIERCOLES'] as const;

  it('accepts as many available days as the plan sells', () => {
    expect(chosenDaysError(['LUNES', 'MIERCOLES'], available, 2)).toBeNull();
  });

  it('rejects a wrong count, repeated days and days without a full menu', () => {
    expect(chosenDaysError(['LUNES'], available, 2)).toContain('2 días');
    expect(chosenDaysError(['LUNES', 'LUNES'], available, 2)).toContain('No repitas');
    expect(chosenDaysError(['LUNES', 'SABADO'], available, 2)).toContain('Sábado');
  });
});

describe('orderFolioLabel', () => {
  it('pads the consecutive number', () => {
    expect(orderFolioLabel(12)).toBe('#0012');
    expect(orderFolioLabel(123456)).toBe('#123456');
  });
});
