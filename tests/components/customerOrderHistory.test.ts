import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import CustomerOrderHistory from '../../layers/admin/app/components/CustomerOrderHistory.vue';

const { fetchOrders, retry } = vi.hoisted(() => ({ fetchOrders: vi.fn(), retry: vi.fn() }));
mockNuxtImport('useFetch', () => fetchOrders);

describe('CustomerOrderHistory', () => {
  beforeEach(() => {
    retry.mockClear();
    fetchOrders.mockResolvedValue({ data: ref({ items: [], summary: { total: 0 } }), status: ref('success'), error: ref(null), refresh: retry });
  });

  it('requests only the customer orders and displays the empty state', async () => {
    const wrapper = await mountSuspended(CustomerOrderHistory, { props: { customerId: 'customer-1' } });
    expect(fetchOrders.mock.calls.at(-1)![1].query.value).toEqual({ customerId: 'customer-1', limit: 10, offset: 0 });
    expect(wrapper.text()).toContain('Sin pedidos registrados');
    wrapper.unmount();
  });

  it('renders order details with a link and paginates older orders', async () => {
    fetchOrders.mockResolvedValue({
      data: ref({ items: [{ id: 'order-1', planTitle: 'Plan semanal', planVariantTitle: '5 días', status: 'DELIVERED', price: 1200, createdAt: '2026-09-01T12:00:00Z', firstDeliveryDate: '2026-09-07', secondDeliveryDate: '2026-09-10' }], summary: { total: 11 } }),
      status: ref('success'), error: ref(null), refresh: retry
    });
    const wrapper = await mountSuspended(CustomerOrderHistory, { props: { customerId: 'customer-1' } });
    expect(wrapper.get('a[href="/admin/pedidos/order-1"]').text()).toContain('Plan semanal');
    expect(wrapper.text()).toContain('Entregado');
    expect(wrapper.text()).toContain('Entregas:');
    await wrapper.findAll('button').find(button => button.text() === '2')!.trigger('click');
    expect(fetchOrders.mock.calls.at(-1)![1].query.value.offset).toBe(10);
    wrapper.unmount();
  });

  it('allows retrying order failures', async () => {
    fetchOrders.mockResolvedValue({ data: ref(null), status: ref('error'), error: ref({ statusCode: 500 }), refresh: retry });
    const wrapper = await mountSuspended(CustomerOrderHistory, { props: { customerId: 'customer-1' } });
    await wrapper.get('button').trigger('click');
    expect(retry).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
