import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import NewOrder from '../../layers/admin/app/pages/admin/pedidos/crear-nuevo.vue';

const { getCustomers, getOrderOptions } = vi.hoisted(() => ({ getCustomers: vi.fn(), getOrderOptions: vi.fn() }));

function customer(id: string, nombre: string) {
  return {
    id, nombre, telefono: '6641234567', correoElectronico: '', ubicacion1: 'Zona Río', ubicacion2: '',
    source: 'whatsapp', status: 'activo', tipoCliente: 'menu', firstDeliveryDay: null, secondDeliveryDay: null,
  };
}

const plan = { id: 'plan-1', title: 'Plan Balance', isActive: true, slotTypes: ['COMIDA'], variants: [{ id: 'variant-1', title: '5 días', daysCount: 5, price: 1450, isActive: true }] };

// Set by a test to make the plans request fail; `refreshPlans` stands in for the retry.
const { failPlans, refreshPlans } = vi.hoisted(() => ({ failPlans: { value: false }, refreshPlans: vi.fn() }));

mockNuxtImport('useFetch', () => (url: string) => Promise.resolve(url === '/api/customers'
  ? { data: ref({ items: [customer('customer-1', 'Ana López')], nextCursor: null }), status: ref('success'), error: ref(null), refresh: vi.fn() }
  : failPlans.value
    ? { data: ref([]), status: ref('error'), error: ref({ data: { statusMessage: 'Servicio no disponible' } }), refresh: refreshPlans }
    : { data: ref([plan]), status: ref('success'), error: ref(null), refresh: refreshPlans }));
mockNuxtImport('useOrders', () => () => ({ createOrder: vi.fn(), getOrderOptions }));
mockNuxtImport('useCustomers', () => () => ({ getCustomers }));

describe('New order: remote customer search', () => {
  beforeEach(() => {
    failPlans.value = false;
    refreshPlans.mockReset();
    getCustomers.mockReset().mockResolvedValue({ items: [customer('customer-250', 'Zoe Ramírez')], nextCursor: null });
    getOrderOptions.mockReset().mockRejectedValue({ data: { statusMessage: 'Sin semana abierta' } });
  });

  it('finds on the server a customer that is not in the first page and keeps it selected', async () => {
    const wrapper = await mountSuspended(NewOrder);
    const vm = wrapper.vm as unknown as {
      customerSearch: string
      customerOptions: { label: string, value: string }[]
      selectedCustomerOption: unknown
      selectedCustomer: { nombre: string } | null
      state: { customerId: string }
    };
    expect(vm.customerOptions.map(option => option.label)).toEqual(['Ana López']);

    vm.customerSearch = 'zoe';
    await vi.waitFor(() => expect(getCustomers).toHaveBeenCalledWith({ q: 'zoe', limit: 20 }));
    await vi.waitFor(() => expect(vm.customerOptions.map(option => option.label)).toEqual(['Zoe Ramírez']));

    vm.selectedCustomerOption = vm.customerOptions[0];
    await vi.waitFor(() => expect(vm.state.customerId).toBe('customer-250'));

    // Clearing the search brings back the first page; the choice stays.
    vm.customerSearch = '';
    await vi.waitFor(() => expect(vm.customerOptions.map(option => option.label)).toEqual(['Ana López']));
    expect(vm.selectedCustomer?.nombre).toBe('Zoe Ramírez');
    expect(wrapper.text()).toContain('Zoe Ramírez');
    wrapper.unmount();
  });

  it('shows a failed load with a retry instead of "no plans yet"', async () => {
    failPlans.value = true;
    const wrapper = await mountSuspended(NewOrder);
    expect(wrapper.text()).toContain('No fue posible preparar el pedido');
    expect(wrapper.text()).toContain('Servicio no disponible');
    expect(wrapper.text()).not.toContain('Falta información para crear un pedido');

    const retry = wrapper.findAll('button').find(button => button.text().includes('Reintentar'));
    await retry!.trigger('click');
    expect(refreshPlans).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
