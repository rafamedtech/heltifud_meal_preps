import type { Order, OrderCreateInput, OrderListResponse, OrderOptions, OrderUpdateInput } from '~~/layers/menu/shared/types/types';

export default function useOrders() {
  const getOrders = (query: Record<string, string | number | undefined>) =>
    $fetch<OrderListResponse>('/api/orders', { query });
  const getOrder = (id: string) => $fetch<Order>(`/api/orders/${id}`);
  const getOrderOptions = (query: { customerId: string; planVariantId: string }) =>
    $fetch<OrderOptions>('/api/orders/options', { query });
  const createOrder = (input: OrderCreateInput) => $fetch<Order>('/api/orders', { method: 'POST', body: input });
  const updateOrder = (id: string, input: OrderUpdateInput) =>
    $fetch<Order>(`/api/orders/${id}`, { method: 'PUT', body: input });

  return { getOrders, getOrder, getOrderOptions, createOrder, updateOrder };
}
