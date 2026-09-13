import { mockComponent, mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import CustomerProfile from '../../layers/admin/app/pages/admin/clientes/[id].vue';

const { fetchProfile, retry } = vi.hoisted(() => ({ fetchProfile: vi.fn(), retry: vi.fn() }));
mockNuxtImport('useFetch', () => fetchProfile);
mockComponent('CustomerOrderHistory', () => ({ template: '<div />' }));
mockNuxtImport('useRoute', () => () => ({ params: { id: 'customer-1' } }));

const customer = {
  firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES',
  id: 'customer-1', nombre: 'Ana López', telefono: '6641234567',
  correoElectronico: 'ana@example.com', ubicacion1: 'Zona Río, Tijuana', ubicacion2: '',
  source: 'whatsapp', status: 'activo', tipoCliente: 'menu',
  createdAt: '2026-08-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z'
};

describe('CustomerProfile', () => {
  beforeEach(() => {
    retry.mockClear();
    fetchProfile.mockResolvedValue({ data: ref(customer), status: ref('success'), error: ref(null), refresh: retry });
  });

  it('loads the route ID and renders contact, classification and delivery details', async () => {
    const wrapper = await mountSuspended(CustomerProfile, { route: '/admin/clientes/customer-1' });
    expect(fetchProfile.mock.calls.at(-1)![0]()).toBe('/api/customers/customer-1');
    expect(wrapper.get('h1').text()).toBe(customer.nombre);
    expect(wrapper.get('a[href="mailto:ana@example.com"]').text()).toBe(customer.correoElectronico);
    expect(wrapper.text()).toContain(customer.ubicacion1);
    expect(wrapper.text()).toContain('Sin ubicación secundaria registrada');
    expect(wrapper.text()).toContain('WhatsApp');
    expect(wrapper.text()).toContain('Activo');
    expect(wrapper.text()).toContain('Cliente desde');
    expect(wrapper.text()).toContain('Lunes');
    expect(wrapper.text()).toContain('Jueves');
    expect(wrapper.find('a[href="/admin/clientes"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('shows a missing customer with a return link', async () => {
    fetchProfile.mockResolvedValue({ data: ref(null), status: ref('error'), error: ref({ statusCode: 404 }), refresh: retry });
    const wrapper = await mountSuspended(CustomerProfile);
    expect(wrapper.text()).toContain('Cliente no encontrado');
    expect(wrapper.find('a[href="/admin/clientes"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('allows retrying a failed request', async () => {
    fetchProfile.mockResolvedValue({ data: ref(null), status: ref('error'), error: ref({ statusCode: 500 }), refresh: retry });
    const wrapper = await mountSuspended(CustomerProfile);
    await wrapper.get('button').trigger('click');
    expect(retry).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
