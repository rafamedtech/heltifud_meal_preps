import { describe, expect, it } from 'vitest';
import { operationSettingsInputSchema, weeklyCycleUpdateInputSchema } from '../../layers/menu/shared/types/menuSchema';
import {
  canTransitionCycle,
  computeOrderCutoff,
  isCutoffBeforeWeek,
  menuCycleScope,
  utcToZonedDateTime,
  weekStartOf,
  zonedDateTimeToUtc,
} from '../../layers/menu/shared/utils/weeklyCycle';

describe('weekStartOf', () => {
  it.each([
    ['2026-11-16', '2026-11-16'],
    ['2026-11-20', '2026-11-16'],
    ['2026-11-22', '2026-11-16'],
    ['2026-11-23', '2026-11-23'],
    ['2026-01-01', '2025-12-29'],
  ])('maps %s to the Monday %s', (date, monday) => {
    expect(weekStartOf(date)).toBe(monday);
  });

  it('uses the UTC calendar date of stored instants', () => {
    // Both shapes exist in the database for menus that start on a Monday.
    expect(weekStartOf(new Date('2026-10-05T00:00:00.000Z'))).toBe('2026-10-05');
    expect(weekStartOf(new Date('2026-11-16T08:00:00.000Z'))).toBe('2026-11-16');
  });
});

describe('computeOrderCutoff', () => {
  it('is the Friday before the week at the local time (standard time)', () => {
    expect(computeOrderCutoff('2026-11-16', 'VIERNES', '18:00', 'America/Tijuana').toISOString())
      .toBe('2026-11-14T02:00:00.000Z');
  });

  it('follows daylight saving time', () => {
    expect(computeOrderCutoff('2026-07-06', 'VIERNES', '18:00', 'America/Tijuana').toISOString())
      .toBe('2026-07-04T01:00:00.000Z');
  });

  it('supports a Saturday noon cutoff', () => {
    expect(computeOrderCutoff('2026-11-16', 'SABADO', '12:00', 'America/Tijuana').toISOString())
      .toBe('2026-11-14T20:00:00.000Z');
  });

  it('never lands inside the week it closes', () => {
    expect(computeOrderCutoff('2026-11-16', 'LUNES', '09:00', 'America/Tijuana').toISOString())
      .toBe('2026-11-09T17:00:00.000Z');
  });
});

describe('editing the cutoff of a week', () => {
  it('reads an instant as wall-clock date and time in the business zone', () => {
    expect(utcToZonedDateTime('2026-11-14T02:00:00.000Z', 'America/Tijuana')).toEqual({ date: '2026-11-13', time: '18:00' });
    expect(utcToZonedDateTime(new Date('2026-07-04T01:00:00.000Z'), 'America/Tijuana')).toEqual({ date: '2026-07-03', time: '18:00' });
  });

  it('round-trips through zonedDateTimeToUtc', () => {
    const { date, time } = utcToZonedDateTime('2026-11-14T20:00:00.000Z', 'America/Tijuana');
    expect(zonedDateTimeToUtc(date, time, 'America/Tijuana').toISOString()).toBe('2026-11-14T20:00:00.000Z');
  });

  it('accepts a cutoff up to the last minute of the Sunday before the week', () => {
    expect(isCutoffBeforeWeek('2026-11-16T07:59:00.000Z', '2026-11-16', 'America/Tijuana')).toBe(true);
    expect(isCutoffBeforeWeek('2026-11-16T08:00:00.000Z', '2026-11-16', 'America/Tijuana')).toBe(false);
    expect(isCutoffBeforeWeek('2026-11-18T02:00:00.000Z', '2026-11-16', 'America/Tijuana')).toBe(false);
  });
});

describe('menuCycleScope', () => {
  it('scopes shared menus by type and personalised ones by customer', () => {
    expect(menuCycleScope('ESTANDAR')).toBe('ESTANDAR');
    expect(menuCycleScope('VEGETARIANO', 'customer-1')).toBe('VEGETARIANO');
    expect(menuCycleScope('PERSONALIZADO', 'customer-1')).toBe('customer-1');
    expect(menuCycleScope('PERSONALIZADO')).toBeNull();
  });
});

describe('cycle transitions', () => {
  it('follows the weekly flow and allows stepping back one stage', () => {
    expect(canTransitionCycle('DRAFT', 'OPEN')).toBe(true);
    expect(canTransitionCycle('OPEN', 'CLOSED')).toBe(true);
    expect(canTransitionCycle('CLOSED', 'OPEN')).toBe(true);
    expect(canTransitionCycle('CLOSED', 'IN_PRODUCTION')).toBe(true);
    expect(canTransitionCycle('IN_PRODUCTION', 'COMPLETED')).toBe(true);
  });

  it('rejects skipping stages', () => {
    expect(canTransitionCycle('DRAFT', 'IN_PRODUCTION')).toBe(false);
    expect(canTransitionCycle('OPEN', 'COMPLETED')).toBe(false);
    expect(canTransitionCycle('COMPLETED', 'OPEN')).toBe(false);
  });
});

describe('operation settings schema', () => {
  const valid = {
    cutoffDay: 'VIERNES', cutoffTime: '18:00',
    firstDeliveryAllowedDays: ['DOMINGO', 'LUNES'], secondDeliveryAllowedDays: ['MIERCOLES', 'JUEVES'],
    firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'], secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
  };

  it('accepts the agreed defaults', () => {
    expect(operationSettingsInputSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['6pm', '24:00', '18:60', ''])('rejects cutoff time %s', cutoffTime => {
    expect(operationSettingsInputSchema.safeParse({ ...valid, cutoffTime }).success).toBe(false);
  });

  it('rejects a meal day assigned to both deliveries', () => {
    const result = operationSettingsInputSchema.safeParse({ ...valid, secondDeliveryMealDays: ['MIERCOLES', 'JUEVES'] });
    expect(result.success).toBe(false);
  });

  it('rejects a delivery without days', () => {
    expect(operationSettingsInputSchema.safeParse({ ...valid, firstDeliveryAllowedDays: [] }).success).toBe(false);
  });
});

describe('cycle update schema', () => {
  it('needs at least one change', () => {
    expect(weeklyCycleUpdateInputSchema.safeParse({}).success).toBe(false);
    expect(weeklyCycleUpdateInputSchema.safeParse({ status: 'OPEN' }).success).toBe(true);
    expect(weeklyCycleUpdateInputSchema.safeParse({ orderCutoffAt: '2026-11-14T02:00:00.000Z' }).success).toBe(true);
  });
});
