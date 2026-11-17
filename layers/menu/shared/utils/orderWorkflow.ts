import type { DeliveryStatusValue, OrderStatusValue } from '../types/types';

export const ORDER_TRANSITIONS: Record<OrderStatusValue, readonly OrderStatusValue[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['CANCELLED'],
  PARTIALLY_DELIVERED: ['CANCELLED'],
  DELIVERED: ['CONFIRMED'],
  CANCELLED: ['CONFIRMED'],
};

export const DELIVERY_TRANSITIONS: Record<DeliveryStatusValue, readonly DeliveryStatusValue[]> = {
  PENDING: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  // Retry the same day (OUT_FOR_DELIVERY), reschedule (PENDING with a new date)
  // or close it as LOST when the customer never answers.
  FAILED: ['PENDING', 'OUT_FOR_DELIVERY', 'LOST'],
  DELIVERED: [],
  // Undo a LOST closed by mistake.
  LOST: ['FAILED'],
};

/** Delivery states that end the delivery: no more work for kitchen or drivers. */
export function isClosedDelivery(status: DeliveryStatusValue) {
  return status === 'DELIVERED' || status === 'LOST';
}

export function isClosedOrder(status: OrderStatusValue) {
  return status === 'DELIVERED' || status === 'CANCELLED';
}

export function derivedOrderStatus(base: OrderStatusValue, deliveries: readonly DeliveryStatusValue[]): OrderStatusValue {
  if (base === 'CANCELLED') return base;
  // A LOST delivery is closed like a delivered one: the order is finished and
  // no refund is owed. The delivery itself keeps its own LOST label.
  if (deliveries.length && deliveries.every(isClosedDelivery)) return 'DELIVERED';
  if (deliveries.some(isClosedDelivery)) return 'PARTIALLY_DELIVERED';
  return base;
}

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  DRAFT: 'Borrador', CONFIRMED: 'Confirmado', PREPARING: 'En preparación',
  PARTIALLY_DELIVERED: 'Entrega parcial', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
};
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatusValue, string> = {
  PENDING: 'Pendiente', OUT_FOR_DELIVERY: 'En reparto', DELIVERED: 'Entregada', FAILED: 'Fallida', LOST: 'No entregada',
};

export const ORDER_ACTION_LABELS = {
  ...ORDER_STATUS_LABELS, CONFIRMED: 'Confirmar pedido', PREPARING: 'Iniciar preparación', CANCELLED: 'Cancelar pedido',
};
export const DELIVERY_ACTION_LABELS: Record<DeliveryStatusValue, string> = {
  PENDING: 'Volver a pendiente', OUT_FOR_DELIVERY: 'Iniciar reparto', DELIVERED: 'Marcar entregada', FAILED: 'Marcar fallida', LOST: 'Cerrar sin entregar',
};

/** Action label for a delivery transition; sending a failed delivery back to pending reschedules it. */
export function deliveryActionLabel(from: DeliveryStatusValue, to: DeliveryStatusValue) {
  return from === 'FAILED' && to === 'PENDING' ? 'Reprogramar' : DELIVERY_ACTION_LABELS[to];
}
/** Transitions that must carry a reason in the history. */
export function deliveryReasonRequired(to: DeliveryStatusValue) {
  return to === 'FAILED' || to === 'LOST';
}

export const ORDER_STATUS_COLORS = {
  DRAFT: 'warning', CONFIRMED: 'info', PREPARING: 'primary',
  PARTIALLY_DELIVERED: 'secondary', DELIVERED: 'success', CANCELLED: 'error',
} as const;
