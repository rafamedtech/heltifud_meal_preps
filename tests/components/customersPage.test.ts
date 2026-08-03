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
});
