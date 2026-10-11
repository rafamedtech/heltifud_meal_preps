import { mockComponent, mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditMenuPage from '../../layers/admin/app/pages/admin/menu/[id].vue';

const { load, refresh, navigate } = vi.hoisted(() => ({ load: vi.fn(), refresh: vi.fn(), navigate: vi.fn() }));
mockNuxtImport('useLazyFetch', () => load);
mockNuxtImport('navigateTo', () => navigate);
mockComponent('AdminMenuForm', () => ({
  props: ['menu', 'mode', 'catalogItems'],
  emits: ['saved'],
  template: `<div>
    <button data-stay @click="$emit('saved', 'menu-1', false)">Guardar</button>
    <button data-exit @click="$emit('saved', 'menu-1', true)">Guardar y salir</button>
  </div>`,
}));

beforeEach(() => {
  vi.resetAllMocks();
  load.mockImplementation((url: string) => ({
    data: ref(url.includes('/api/menu/') ? { id: 'menu-1' } : []),
    status: ref('success'), error: ref(null), refresh,
  }));
});

describe('menu editor navigation after save', () => {
  it('refreshes the saved menu and stays in the editor for Guardar', async () => {
    const wrapper = await mountSuspended(EditMenuPage, { route: '/admin/menu/menu-1' });
    await flushPromises();
    navigate.mockClear();
    refresh.mockClear();
    await wrapper.get('[data-stay]').trigger('click');
    await flushPromises();
    expect(refresh).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('returns to the list for Guardar y salir', async () => {
    const wrapper = await mountSuspended(EditMenuPage, { route: '/admin/menu/menu-1' });
    await flushPromises();
    navigate.mockClear();
    refresh.mockClear();
    await wrapper.get('[data-exit]').trigger('click');
    await flushPromises();
    expect(navigate).toHaveBeenCalledWith('/admin/menu');
    expect(refresh).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
