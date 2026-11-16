import { describe, expect, it } from 'vitest';

import { deliveryDateOf, deliverySequenceForDay } from '../../layers/menu/shared/utils/orderDeliveries';

import type { DeliveryMealRule } from '../../layers/menu/shared/utils/orderDeliveries';

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
