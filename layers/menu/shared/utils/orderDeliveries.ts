import type { DayOfWeek, DeliverySequence } from '../types/types';

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
