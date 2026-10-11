import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MenuForm from '../../layers/base/app/components/admin/MenuForm.vue';
import { DAY_OF_WEEK_VALUES, type WeeklyMenu } from '../../layers/menu/shared/types/types';

const { updateMenu, createMenu, activateMenu, toast } = vi.hoisted(() => ({
  updateMenu: vi.fn(), createMenu: vi.fn(), activateMenu: vi.fn(), toast: vi.fn(),
}));
mockNuxtImport('useMenu', () => () => ({ updateMenuOnDB: updateMenu, createMenuOnDB: createMenu, setActiveMenuOnDB: activateMenu }));
mockNuxtImport('useToast', () => () => ({ add: toast }));

const slot = () => ({
  platilloPrincipal: { nombre: 'Platillo', tipo: 'comida', calorias: 100, descripcion: '', imagen: '' },
  guarnicion1: null, guarnicion2: null, adicionales: [], contenedor: '',
});
const menu: WeeklyMenu = {
  id: 'menu-1', name: 'Semana 3', menuType: 'ESTANDAR', isActive: true,
  startDate: '2026-10-12', endDate: '2026-10-16', createdAt: '2026-10-01', updatedAt: '2026-10-01',
  days: DAY_OF_WEEK_VALUES.map(dayOfWeek => ({ dayOfWeek, desayuno: slot(), comida: slot(), cena: slot(), snack1: slot(), snack2: slot() })),
};

const modalStub = {
  props: ['open', 'title', 'close', 'dismissible'],
  emits: ['update:open'],
  template: `<div v-if="open" data-save-dialog>
    <h2>{{ title }}</h2>
    <button :disabled="close?.disabled" aria-label="Cerrar confirmación de guardado" @click="$emit('update:open', false)">X</button>
    <slot name="body" /><slot name="footer" />
  </div>`,
};

async function openConfirmation() {
  const wrapper = await mountSuspended(MenuForm, {
    props: { menu, mode: 'edit', catalogItems: [] },
    route: '/admin/menu/menu-1',
    global: { stubs: { UModal: modalStub } },
  });
  await wrapper.get('input').setValue('Semana editada');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  vi.resetAllMocks();
  updateMenu.mockResolvedValue({ ...menu, name: 'Semana editada' });
});

describe('menu save confirmation', () => {
  it('opens confirmation without writing and closing preserves pending changes', async () => {
    const wrapper = await openConfirmation();
    expect(wrapper.get('[data-save-dialog]').text()).toContain('Guardar cambios del menú');
    expect(updateMenu).not.toHaveBeenCalled();
    await wrapper.get('[aria-label="Cerrar confirmación de guardado"]').trigger('click');
    expect(wrapper.find('[data-save-dialog]').exists()).toBe(false);
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Semana editada');
    expect(wrapper.emitted('saved')).toBeUndefined();
    wrapper.unmount();
  });

  it.each([
    ['Guardar', false],
    ['Guardar y salir', true],
  ] as const)('%s emits its exit choice only after saving succeeds', async (label, exitEditor) => {
    const wrapper = await openConfirmation();
    const action = wrapper.get('[data-save-dialog]').findAll('button').find(button => button.text() === label)!;
    await action.trigger('click');
    await flushPromises();
    expect(updateMenu).toHaveBeenCalledOnce();
    expect(updateMenu).toHaveBeenCalledWith('menu-1', expect.objectContaining({ name: 'Semana editada' }));
    expect(wrapper.emitted('saved')).toEqual([['menu-1', exitEditor]]);
    expect(wrapper.find('[data-save-dialog]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('keeps confirmation and edits after a failed save without emitting navigation', async () => {
    updateMenu.mockRejectedValue(new Error('No se pudo guardar'));
    const wrapper = await openConfirmation();
    await wrapper.get('[data-save-dialog]').findAll('button').find(button => button.text() === 'Guardar y salir')!.trigger('click');
    await flushPromises();
    expect(wrapper.find('[data-save-dialog]').exists()).toBe(true);
    expect(wrapper.emitted('saved')).toBeUndefined();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error', color: 'error' }));
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Semana editada');
    wrapper.unmount();
  });

  it('disables both save actions and closing while a request is pending', async () => {
    let finishSave!: (value: WeeklyMenu) => void;
    updateMenu.mockReturnValue(new Promise<WeeklyMenu>(resolve => { finishSave = resolve; }));
    const wrapper = await openConfirmation();
    await wrapper.get('[data-save-dialog]').findAll('button').find(button => button.text() === 'Guardar')!.trigger('click');
    await flushPromises();
    expect(wrapper.get('[data-save-dialog]').findAll('button').every(button => (button.element as HTMLButtonElement).disabled)).toBe(true);
    expect(wrapper.emitted('saved')).toBeUndefined();
    finishSave({ ...menu, name: 'Semana editada' });
    await flushPromises();
    expect(wrapper.emitted('saved')).toEqual([['menu-1', false]]);
    wrapper.unmount();
  });
});
