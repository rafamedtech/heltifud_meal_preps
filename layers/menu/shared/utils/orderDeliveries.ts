import type { ComponentRoleValue, DayOfWeek, DeliverySequence, SlotTypeValue } from '../types/types';

/** Which meal days travel in each delivery; copied from the week's cycle. */
export interface DeliveryMealRule {
  firstDeliveryMealDays: DayOfWeek[];
  secondDeliveryMealDays: DayOfWeek[];
}

const WEEK_ORDER: DayOfWeek[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

/**
 * Delivery that carries the meals of `day`.
 *
 * A day outside both lists goes with the second delivery when it falls after
 * the last day of the first one, otherwise with the first. When the order has
 * a single delivery (`available`), every meal goes in it.
 */
export function deliverySequenceForDay(
  day: DayOfWeek,
  rule: DeliveryMealRule,
  available: readonly DeliverySequence[] = [1, 2],
): DeliverySequence {
  let preferred: DeliverySequence;
  if (rule.secondDeliveryMealDays.includes(day)) {
    preferred = 2;
  } else if (rule.firstDeliveryMealDays.includes(day)) {
    preferred = 1;
  } else {
    const lastFirstDay = Math.max(-1, ...rule.firstDeliveryMealDays.map((item) => WEEK_ORDER.indexOf(item)));
    preferred = WEEK_ORDER.indexOf(day) > lastFirstDay ? 2 : 1;
  }

  if (available.includes(preferred)) return preferred;
  return available[0] ?? preferred;
}

export const DELIVERY_SEQUENCE_LABELS: Record<DeliverySequence, string> = {
  1: 'Primera entrega',
  2: 'Segunda entrega',
};

/** Scheduled date (`YYYY-MM-DD`) of a delivery, or `null` when the order has no such delivery. */
export function deliveryDateOf(
  deliveries: ReadonlyArray<{ sequence: number; scheduledDate: string }>,
  sequence: DeliverySequence,
) {
  return deliveries.find((delivery) => delivery.sequence === sequence)?.scheduledDate ?? null;
}

/** Meal split plus the days each delivery may happen on; copied from the week's cycle. */
export interface DeliveryPlanRule extends DeliveryMealRule {
  firstDeliveryAllowedDays: DayOfWeek[];
  secondDeliveryAllowedDays: DayOfWeek[];
}

export interface PlannedDelivery {
  sequence: DeliverySequence;
  deliveryDay: DayOfWeek;
  /** Civil date, `YYYY-MM-DD`. */
  scheduledDate: string;
  /** Chosen days whose meals travel in this delivery, in week order. */
  mealDays: DayOfWeek[];
  allowedDays: DayOfWeek[];
}

const DAY_MS = 86_400_000;

export function sortDays(days: readonly DayOfWeek[]) {
  return [...days].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
}

export function allowedDeliveryDays(rule: DeliveryPlanRule, sequence: DeliverySequence) {
  return sequence === 1 ? rule.firstDeliveryAllowedDays : rule.secondDeliveryAllowedDays;
}

/**
 * Civil date of a delivery: the last `deliveryDay` on or before the first day
 * whose meals it carries. With meals from Monday, a Sunday delivery is the
 * day before the week starts.
 */
export function deliveryDateFor(weekStart: string, deliveryDay: DayOfWeek, mealDays: readonly DayOfWeek[]) {
  const firstMeal = Math.min(...mealDays.map((day) => WEEK_ORDER.indexOf(day)));
  const index = WEEK_ORDER.indexOf(deliveryDay);
  const offset = index <= firstMeal ? index : index - 7;
  return new Date(Date.parse(`${weekStart}T00:00:00.000Z`) + offset * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Deliveries an order needs for the chosen days. A delivery only exists when
 * it carries meals, so days that all fall in one half of the week give one.
 * Each delivery day comes from `preferred` when the week allows it, otherwise
 * from the first allowed day.
 */
export function planOrderDeliveries(input: {
  weekStart: string;
  days: readonly DayOfWeek[];
  rule: DeliveryPlanRule;
  preferred?: Partial<Record<DeliverySequence, DayOfWeek | null | undefined>>;
}): PlannedDelivery[] {
  const { weekStart, rule, preferred = {} } = input;
  const groups = new Map<DeliverySequence, DayOfWeek[]>();
  sortDays([...new Set(input.days)]).forEach((day) => {
    const sequence = deliverySequenceForDay(day, rule);
    groups.set(sequence, [...(groups.get(sequence) ?? []), day]);
  });

  return ([1, 2] as const).flatMap((sequence) => {
    const mealDays = groups.get(sequence);
    const allowedDays = allowedDeliveryDays(rule, sequence);
    if (!mealDays || !allowedDays.length) return [];

    const wanted = preferred[sequence];
    const deliveryDay = wanted && allowedDays.includes(wanted) ? wanted : allowedDays[0]!;
    const ruleMealDays = sequence === 1 ? rule.firstDeliveryMealDays : rule.secondDeliveryMealDays;
    return [{
      sequence,
      deliveryDay,
      // Anchored to the split of the week, so the date does not move with the days chosen.
      scheduledDate: deliveryDateFor(weekStart, deliveryDay, ruleMealDays.length ? ruleMealDays : mealDays),
      mealDays,
      allowedDays,
    }];
  });
}

interface MenuDayLike {
  dayOfWeek: DayOfWeek;
  slots: Array<{ slotType: SlotTypeValue; components: Array<{ componentRole: ComponentRoleValue }> }>;
}

/** Days that have a main dish in every meal time of the plan, in week order. */
export function availableOrderDays(days: readonly MenuDayLike[], slotTypes: readonly SlotTypeValue[]) {
  return sortDays(days
    .filter((day) => slotTypes.length > 0 && slotTypes.every((slotType) => day.slots.some((slot) =>
      slot.slotType === slotType && slot.components.some((component) => component.componentRole === 'PLATILLO_PRINCIPAL'))))
    .map((day) => day.dayOfWeek));
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export function dayOfWeekLabel(day: DayOfWeek) {
  return DAY_LABELS[day];
}

/** Why the chosen days cannot be ordered, or `null` when they can. */
export function chosenDaysError(days: readonly DayOfWeek[], available: readonly DayOfWeek[], daysCount: number) {
  if (new Set(days).size !== days.length) return 'No repitas días en el pedido.';
  if (days.length !== daysCount) {
    return `El plan incluye ${daysCount} ${daysCount === 1 ? 'día' : 'días'}; elegiste ${days.length}.`;
  }
  const missing = days.filter((day) => !available.includes(day));
  if (missing.length) {
    return `El menú no tiene platillo principal en todos los tiempos del plan para: ${missing.map(dayOfWeekLabel).join(', ')}.`;
  }
  return null;
}

export function orderFolioLabel(folio: number) {
  return `#${String(folio).padStart(4, '0')}`;
}
