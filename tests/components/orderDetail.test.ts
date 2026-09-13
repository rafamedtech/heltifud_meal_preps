import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import OrderDetail from '../../layers/admin/app/pages/admin/pedidos/[id].vue';

const { fetchData, retry } = vi.hoisted(() => ({ fetchData: vi.fn(), retry: vi.fn() }));
mockNuxtImport('useFetch', () => fetchData);
mockNuxtImport('useRoute', () => () => ({ params: { id: 'order-1' } }));
mockNuxtImport('useOrders', () => () => ({ updateOrder: vi.fn() }));

const order = {
  id: 'order-1', status: 'CONFIRMED', customerId: 'customer-1', customerName: 'Ana López', customerPhone: '6641234567',
  planTitle: 'Plan Balance', planVariantTitle: '5 días · 3 tiempos', price: 1450,
  firstDeliveryDate: '2026-09-14', firstDeliveryAddress: 'Zona Río, Tijuana', firstDeliveryLocation: 1,
  secondDeliveryDate: '2026-09-17', secondDeliveryAddress: 'Zona Río, Tijuana', secondDeliveryLocation: 1,
  createdAt: '2026-09-10T12:00:00Z', updatedAt: '2026-09-10T12:00:00Z',
  planVariantId: 'variant-1', sourceWeeklyMenuId: 'menu-1', sourceWeeklyMenuName: 'Semana 37', notes: '',
  customer: {
    id: 'customer-1', nombre: 'Ana López', telefono: '6641234567', correoElectronico: '',
    ubicacion1: 'Zona Río, Tijuana', ubicacion2: '', source: 'whatsapp', status: 'activo', tipoCliente: 'menu',
    firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES', createdAt: '2026-08-01T12:00:00Z', updatedAt: '2026-08-01T12:00:00Z'
  },
  menuSlots: [{
    id: 'slot-1', dayOfWeek: 'LUNES', dayOrder: 1, slotType: 'COMIDA', contenedor: '',
    components: [{
      id: 'component-1', catalogItemId: 'food-1', componentRole: 'PLATILLO_PRINCIPAL', position: 0,
      nombre: 'Pollo al limón', descripcion: '', calorias: 420, imagen: '', tipo: 'proteina'
    }]
  }]
};

function mockFetch(orderResult: Record<string, unknown>) {
  fetchData.mockImplementation((url: string) => Promise.resolve(
    url === '/api/food-components'
      ? { data: ref([]), status: ref('success'), error: ref(null), refresh: vi.fn() }
      : { refresh: retry, ...orderResult }
  ));
}

describe('OrderDetail', () => {
  beforeEach(() => {
    retry.mockClear();
    mockFetch({ data: ref(order), status: ref('success'), error: ref(null) });
  });

  it('renders the order summary, deliveries and menu', async () => {
    const wrapper = await mountSuspended(OrderDetail, { route: '/admin/pedidos/order-1' });
    expect(fetchData.mock.calls.some(([url]) => url === '/api/orders/order-1')).toBe(true);
    expect(wrapper.get('h1').text()).toBe(order.planTitle);
    expect(wrapper.text()).toContain('Confirmado');
    expect(wrapper.text()).toContain('Creado el');
    expect(wrapper.get('a[href="/admin/clientes/customer-1"]').text()).toBe(order.customerName);
    expect(wrapper.find('a[href="tel:6641234567"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Semana 37');
    expect(wrapper.text()).toContain('Zona Río, Tijuana');
    expect(wrapper.text()).toContain('Lunes');
    expect(wrapper.text()).toContain('Día 1 · 1 tiempo');
    expect(wrapper.text()).toContain('Pollo al limón');
    expect(wrapper.find('a[href="/admin/pedidos"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('shows a missing order with a return link', async () => {
    mockFetch({ data: ref(null), status: ref('error'), error: ref({ statusCode: 404 }) });
    const wrapper = await mountSuspended(OrderDetail);
    expect(wrapper.text()).toContain('Pedido no encontrado');
    expect(wrapper.find('a[href="/admin/pedidos"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('allows retrying a failed request', async () => {
    mockFetch({ data: ref(null), status: ref('error'), error: ref({ statusCode: 500 }) });
    const wrapper = await mountSuspended(OrderDetail);
    await wrapper.findAll('button').at(-1)!.trigger('click');
    expect(retry).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
