import type { CycleStatusValue, DayOfWeek, MenuType } from '../types/types';

const DAY_INDEX: Record<DayOfWeek, number> = {
  LUNES: 0,
  MARTES: 1,
  MIERCOLES: 2,
  JUEVES: 3,
  VIERNES: 4,
  SABADO: 5,
  DOMINGO: 6,
};

const DAY_MS = 86_400_000;

function utcDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value) : value;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Monday (YYYY-MM-DD) of the week that contains the UTC calendar date of `value`. */
export function weekStartOf(value: string | Date) {
  const date = utcDate(value);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return new Date(date.getTime() - daysSinceMonday * DAY_MS).toISOString().slice(0, 10);
}

/** Offset in minutes between `timeZone` and UTC at the given instant. */
function zoneOffsetMinutes(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const part = (type: string) => Number(parts.find(item => item.type === type)?.value);
  const asUtc = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'));
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/** Instant for a wall-clock date and time in `timeZone`. */
export function zonedDateTimeToUtc(date: string, time: string, timeZone: string) {
  const guess = new Date(`${date}T${time}:00.000Z`);
  const first = new Date(guess.getTime() - zoneOffsetMinutes(guess, timeZone) * 60_000);
  // Second pass settles dates next to a daylight-saving change.
  return new Date(guess.getTime() - zoneOffsetMinutes(first, timeZone) * 60_000);
}

/** Business time zone; mirrors the default of `OperationSettings.timeZone`. */
export const BUSINESS_TIME_ZONE = 'America/Tijuana';

/** Wall-clock date (YYYY-MM-DD) and time (HH:MM) of an instant in `timeZone`. */
export function utcToZonedDateTime(instant: string | Date, timeZone: string) {
  const value = typeof instant === 'string' ? new Date(instant) : instant;
  const local = new Date(value.getTime() + zoneOffsetMinutes(value, timeZone) * 60_000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}

/** A cutoff must fall before the Monday the week starts, in the business time zone. */
export function isCutoffBeforeWeek(orderCutoffAt: string | Date, weekStart: string, timeZone: string) {
  return new Date(orderCutoffAt).getTime() < zonedDateTimeToUtc(weekStart.slice(0, 10), '00:00', timeZone).getTime();
}

/**
 * Order cutoff for a week: the last `cutoffDay` strictly before the Monday the
 * week starts, at `cutoffTime` in the business time zone.
 */
export function computeOrderCutoff(weekStart: string, cutoffDay: DayOfWeek, cutoffTime: string, timeZone: string) {
  const daysBefore = 7 - DAY_INDEX[cutoffDay];
  const cutoffDate = new Date(utcDate(weekStart).getTime() - daysBefore * DAY_MS).toISOString().slice(0, 10);
  return zonedDateTimeToUtc(cutoffDate, cutoffTime, timeZone);
}

/** Key that makes a menu unique inside its week: the shared type, or the customer. */
export function menuCycleScope(menuType: MenuType, customerId?: string | null) {
  return menuType === 'PERSONALIZADO' ? customerId ?? null : menuType;
}

export const CYCLE_TRANSITIONS: Record<CycleStatusValue, CycleStatusValue[]> = {
  DRAFT: ['OPEN'],
  OPEN: ['CLOSED', 'DRAFT'],
  CLOSED: ['OPEN', 'IN_PRODUCTION'],
  IN_PRODUCTION: ['CLOSED', 'COMPLETED'],
  COMPLETED: ['IN_PRODUCTION'],
};

export function canTransitionCycle(from: CycleStatusValue, to: CycleStatusValue) {
  return CYCLE_TRANSITIONS[from].includes(to);
}

export const CYCLE_STATUS_LABELS: Record<CycleStatusValue, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Pedidos abiertos',
  CLOSED: 'Pedidos cerrados',
  IN_PRODUCTION: 'En producción',
  COMPLETED: 'Completada',
};

/** Badge colour per week status, as defined in DESIGN.md. */
export const CYCLE_STATUS_COLORS = {
  DRAFT: 'neutral',
  OPEN: 'success',
  CLOSED: 'warning',
  IN_PRODUCTION: 'primary',
  COMPLETED: 'info',
} as const satisfies Record<CycleStatusValue, string>;
