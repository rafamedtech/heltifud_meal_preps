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
  FAILED: ['PENDING', 'OUT_FOR_DELIVERY'],
  DELIVERED: [],
};

export function isClosedOrder(status: OrderStatusValue) {
  return status === 'DELIVERED' || status === 'CANCELLED';
}

export function derivedOrderStatus(base: OrderStatusValue, deliveries: readonly DeliveryStatusValue[]): OrderStatusValue {
  if (base === 'CANCELLED') return base;
  if (deliveries.length && deliveries.every(status => status === 'DELIVERED')) return 'DELIVERED';
  if (deliveries.some(status => status === 'DELIVERED')) return 'PARTIALLY_DELIVERED';
  return base;
}

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  DRAFT: 'Borrador', CONFIRMED: 'Confirmado', PREPARING: 'En preparación',
  PARTIALLY_DELIVERED: 'Entrega parcial', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
};
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatusValue, string> = {
  PENDING: 'Pendiente', OUT_FOR_DELIVERY: 'En reparto', DELIVERED: 'Entregada', FAILED: 'Fallida',
};

export const ORDER_ACTION_LABELS = {
  ...ORDER_STATUS_LABELS, CONFIRMED: 'Confirmar pedido', PREPARING: 'Iniciar preparación', CANCELLED: 'Cancelar pedido',
};
export const DELIVERY_ACTION_LABELS: Record<DeliveryStatusValue, string> = {
  PENDING: 'Volver a pendiente', OUT_FOR_DELIVERY: 'Iniciar reparto', DELIVERED: 'Marcar entregada', FAILED: 'Marcar fallida',
};
