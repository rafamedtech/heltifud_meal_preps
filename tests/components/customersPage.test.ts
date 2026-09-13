import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';

import CustomersPage from '../../layers/admin/app/pages/admin/clientes/index.vue';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
mockNuxtImport('navigateTo', () => navigate);

describe('CustomersPage', () => {
  it('renders all filters without invalid empty SelectItem values', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ items: [], nextCursor: null }));

    const wrapper = await mountSuspended(CustomersPage);

    expect(wrapper.findAll('[role=combobox]')).toHaveLength(3);
    expect(wrapper.text()).toContain('Todos los estados');
    expect(wrapper.text()).toContain('Todos los tipos');
    expect(wrapper.text()).toContain('Todos los canales');
  });

  it('uses Google Maps location search fields in the customer form', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ items: [], nextCursor: null }));

    const wrapper = await mountSuspended(CustomersPage);
    const createButton = wrapper.findAll('button').find((button) => button.text().includes('Crear cliente'));
    expect(createButton).toBeDefined();
    await createButton!.trigger('click');
    await nextTick();

    expect(document.body.textContent).toContain('Ubicación principal');
    expect(document.body.textContent).toContain('Ubicación secundaria');
    expect(document.body.querySelector('input[name="ubicacion1"]')).not.toBeNull();
    expect(document.body.querySelector('input[name="ubicacion2"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Configura Google Maps para activar las sugerencias');
  });
  it('opens profiles from rows and mobile cards while preserving nested controls', async () => {
    const customer = {
      id: 'customer-1', nombre: 'Ana López', telefono: '6641234567',
      correoElectronico: 'ana@example.com', ubicacion1: 'Zona Río', ubicacion2: '',
      source: 'whatsapp', status: 'activo', tipoCliente: 'menu'
    };
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ items: [customer], nextCursor: null }));
    navigate.mockClear();
    const wrapper = await mountSuspended(CustomersPage);
    expect(wrapper.findAll('a[href="/admin/clientes/customer-1"]')).toHaveLength(2);
    await wrapper.get('tbody tr').trigger('click');
    expect(navigate).toHaveBeenLastCalledWith('/admin/clientes/customer-1');
    navigate.mockClear();
    await wrapper.get('article').trigger('click');
    expect(navigate).toHaveBeenCalledOnce();
    navigate.mockClear();
    await wrapper.get('tbody a[href^="tel:"]').trigger('click');
    await wrapper.get('tbody button').trigger('click');
    expect(navigate).not.toHaveBeenCalled();
    wrapper.unmount();
  });

});
