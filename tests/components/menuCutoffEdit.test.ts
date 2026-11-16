import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import MenuIndex from '../../layers/admin/app/pages/admin/menu/index.vue';

const { updateCycle, refresh } = vi.hoisted(() => ({ updateCycle: vi.fn(), refresh: vi.fn() }));

const menu = {
  id: 'menu-1', name: 'Semana 47', menuType: 'ESTANDAR', customerId: null, customerName: null,
  startDate: '2026-11-16', endDate: '2026-11-20', days: [],
  cycleId: 'cycle-1', cycleStatus: 'OPEN', weekStart: '2026-11-16', orderCutoffAt: '2026-11-14T02:00:00.000Z',
};

mockNuxtImport('useLazyFetch', () => () => Promise.resolve({ data: ref([menu]), status: ref('success'), refresh }));
mockNuxtImport('useMenu', () => () => ({ deleteMenuOnDB: vi.fn() }));
mockNuxtImport('useCycles', () => () => ({ updateCycle, getOperationSettings: vi.fn(), updateOperationSettings: vi.fn() }));

async function openCutoffModal() {
  const wrapper = await mountSuspended(MenuIndex);
  await wrapper.get('button[aria-label="Acciones de Semana 47"]').trigger('click');
  await vi.waitFor(() => expect(document.body.textContent).toContain('Editar corte'));
  const item = [...document.body.querySelectorAll('[role=menuitem]')].find(node => node.textContent?.includes('Editar corte'));
  (item as HTMLElement).click();
  await vi.waitFor(() => expect(document.body.querySelector('input[type=time]')).not.toBeNull());
  return wrapper;
}

function timeInput() {
  return document.body.querySelector('input[type=time]') as HTMLInputElement;
}

async function setTime(value: string) {
  timeInput().value = value;
  timeInput().dispatchEvent(new Event('input', { bubbles: true }));
  await flushPromises();
}

describe('Menu index: edit week cutoff', () => {
  beforeEach(() => {
    updateCycle.mockReset();
    refresh.mockReset();
  });

  it('shows the stored cutoff in Tijuana time and saves the edited instant', async () => {
    updateCycle.mockResolvedValue({ orderCutoffAt: '2026-11-14T04:30:00.000Z' });
    const wrapper = await openCutoffModal();

    expect(timeInput().value).toBe('18:00');
    expect(document.body.textContent).toContain('13 nov 2026');

    await setTime('20:30');
    document.body.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => expect(updateCycle).toHaveBeenCalledWith('cycle-1', { orderCutoffAt: '2026-11-14T04:30:00.000Z' }));
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    wrapper.unmount();
  });

  it('does not save an unchanged cutoff', async () => {
    const wrapper = await openCutoffModal();
    const submit = [...document.body.querySelectorAll('button[type=submit]')].find(node => node.textContent?.includes('Guardar cambios')) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    wrapper.unmount();
  });
});
