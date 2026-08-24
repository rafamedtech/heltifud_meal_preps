import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';

import CustomersPage from '../../layers/admin/app/pages/admin/clientes/index.vue';

describe('CustomersPage', () => {
  it('renders all filters without invalid empty SelectItem values', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ items: [], nextCursor: null }));

    const wrapper = await mountSuspended(CustomersPage);

    expect(wrapper.get('h1').text()).toBe('Clientes');
    expect(wrapper.text()).toContain('Todos los estados');
    expect(wrapper.text()).toContain('Todos los tipos');
    expect(wrapper.text()).toContain('Todos los canales');
  });

  it('uses Google Maps location search fields in the customer form', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ items: [], nextCursor: null }));

    const wrapper = await mountSuspended(CustomersPage);
    const createButton = wrapper.findAll('button').find((button) => button.text().includes('Nuevo cliente'));
    expect(createButton).toBeDefined();
    await createButton!.trigger('click');
    await nextTick();

    expect(document.body.textContent).toContain('Ubicación principal');
    expect(document.body.textContent).toContain('Ubicación secundaria');
    expect(document.body.querySelector('input[name="ubicacion1"]')).not.toBeNull();
    expect(document.body.querySelector('input[name="ubicacion2"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Configura Google Maps para activar las sugerencias');
  });
});
