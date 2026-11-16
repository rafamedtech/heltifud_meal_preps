import type { DeliverySequence, DeliveryStatusInput, OrderStatusInput, Order, OrderCreateInput, OrderListResponse, OrderOptions, OrderUpdateInput } from '~~/layers/menu/shared/types/types';

export default function useOrders() {
  const getOrders = (query: Record<string, string | number | undefined>) =>
    $fetch<OrderListResponse>('/api/orders', { query });
  const getOrder = (id: string) => $fetch<Order>(`/api/orders/${id}`);
  const getOrderOptions = (query: { customerId: string; planVariantId: string }) =>
    $fetch<OrderOptions>('/api/orders/options', { query });
  const createOrder = (input: OrderCreateInput) => $fetch<Order>('/api/orders', { method: 'POST', body: input });
  const updateOrder = (id: string, input: OrderUpdateInput) =>
    $fetch<Order>(`/api/orders/${id}`, { method: 'PUT', body: input });

  const transitionOrder = (id: string, input: OrderStatusInput) =>
    $fetch<Order>(`/api/orders/${id}/status`, { method: 'POST', body: input });
  const transitionDelivery = (id: string, sequence: DeliverySequence, input: DeliveryStatusInput) =>
    $fetch<Order>(`/api/orders/${id}/deliveries/${sequence}/status`, { method: 'POST', body: input });

  return { getOrders, getOrder, getOrderOptions, createOrder, updateOrder, transitionOrder, transitionDelivery };
}
