import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import OrdersPage from '../../layers/admin/app/pages/admin/pedidos/index.vue';

const { getOrders, getCycles } = vi.hoisted(() => ({ getOrders: vi.fn(), getCycles: vi.fn() }));
mockNuxtImport('useOrders', () => () => ({ getOrders }));
mockNuxtImport('useCycles', () => () => ({ getCycles }));

function order(index: number) {
  return {
    id: `order-${index}`, folio: index, status: 'CONFIRMED', customerId: 'customer-1', customerName: `Cliente ${index}`,
    customerPhone: '6641234567', planTitle: 'Plan Balance', planVariantTitle: '5 días', price: 1450, weekStart: '2026-11-16',
    deliveries: [], createdAt: '2026-11-10T12:00:00Z', updatedAt: '2026-11-10T12:00:00Z',
  };
}

function pageOf(total: number, offset: number) {
  const count = Math.min(50, total - offset);
  return {
    items: Array.from({ length: count }, (_, index) => order(offset + index + 1)),
    summary: { total, draft: 0, confirmed: total, inProgress: 0, delivered: 0 },
  };
}

describe('Orders list', () => {
  beforeEach(() => {
    getOrders.mockReset().mockImplementation((query: { offset: number }) => Promise.resolve(pageOf(120, query.offset)));
    getCycles.mockReset().mockResolvedValue([{ id: 'cycle-1', weekStart: '2026-11-16', status: 'OPEN', menus: [] }]);
  });

  it('pages through every order instead of stopping at the first request', async () => {
    const wrapper = await mountSuspended(OrdersPage);
    await vi.waitFor(() => expect(wrapper.text()).toContain('1–50 de 120'));
    expect(getOrders).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 50, offset: 0 }));

    await wrapper.get('button[aria-label="Page 3"]').trigger('click');
    await vi.waitFor(() => expect(getOrders).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 100 })));
    await vi.waitFor(() => expect(wrapper.text()).toContain('101–120 de 120'));
    wrapper.unmount();
  });

  it('hides pagination when everything fits in one page', async () => {
    getOrders.mockResolvedValue(pageOf(8, 0));
    const wrapper = await mountSuspended(OrdersPage);
    await vi.waitFor(() => expect(wrapper.text()).toContain('8 pedidos en el listado'));
    expect(wrapper.find('button[aria-label="Page 1"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('sends the chosen week and restarts at the first page', async () => {
    const wrapper = await mountSuspended(OrdersPage);
    await vi.waitFor(() => expect(wrapper.text()).toContain('1–50 de 120'));
    await wrapper.get('button[aria-label="Page 2"]').trigger('click');
    await vi.waitFor(() => expect(getOrders).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 50 })));

    const vm = wrapper.vm as unknown as { selectedCycle: string };
    vm.selectedCycle = 'cycle-1';
    await flushPromises();
    await vi.waitFor(() => expect(getOrders).toHaveBeenLastCalledWith(expect.objectContaining({ cycleId: 'cycle-1', offset: 0 })));
    wrapper.unmount();
  });
});
