import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlansPage from '../../layers/admin/app/pages/admin/planes/index.vue';

const { load, refresh, createPlan, updatePlan, deletePlan } = vi.hoisted(() => ({
  load: vi.fn(), refresh: vi.fn(), createPlan: vi.fn(), updatePlan: vi.fn(), deletePlan: vi.fn(),
}));
mockNuxtImport('useLazyFetch', () => load);
mockNuxtImport('usePlans', () => () => ({ getPlans: vi.fn(), createPlan, updatePlan, deletePlan }));

const plan = {
  id: 'plan-1', title: 'Plan comidas', description: 'Comidas de la semana', image: 'plans/comidas',
  slotTypes: ['COMIDA'], isActive: true, createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
  variants: [
    { id: 'variant-5', title: '5 días', daysCount: 5, price: 900, isActive: true, orderCount: 3 },
    { id: 'variant-3', title: '3 días', daysCount: 3, price: 600, isActive: true, orderCount: 0 },
  ],
};

type PageVm = { openEdit: (value: typeof plan) => void, requestDelete: (value: typeof plan) => void, formState: { title: string }, formOpen: boolean };

function bodyButton(text: string) {
  return [...document.body.querySelectorAll('button')].find(node => node.textContent?.trim() === text) as HTMLButtonElement | undefined;
}

describe('PlansPage: plans with orders are archived, not deleted', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    load.mockReturnValue({ data: ref([plan]), status: ref('success'), error: ref(null), refresh });
    updatePlan.mockResolvedValue({ ...plan, isActive: false });
    deletePlan.mockRejectedValue({
      data: { statusMessage: 'El plan tiene 3 pedidos y no se puede eliminar. Pausa el plan para dejar de ofrecerlo.', data: { code: 'PLAN_HAS_ORDERS', orders: 3 } },
    });
  });

  it('explains the conflict and pauses the plan keeping its variants', async () => {
    const wrapper = await mountSuspended(PlansPage);
    (wrapper.vm as unknown as PageVm).requestDelete(plan);
    await vi.waitFor(() => expect(bodyButton('Eliminar')).toBeDefined());

    bodyButton('Eliminar')!.click();
    await vi.waitFor(() => expect(document.body.textContent).toContain('El plan tiene 3 pedidos y no se puede eliminar.'));
    expect(bodyButton('Eliminar')).toBeUndefined();

    bodyButton('Pausar plan')!.click();
    await vi.waitFor(() => expect(updatePlan).toHaveBeenCalledWith('plan-1', expect.objectContaining({
      isActive: false,
      variants: [
        { id: 'variant-5', title: '5 días', daysCount: 5, price: 900, isActive: true },
        { id: 'variant-3', title: '3 días', daysCount: 3, price: 600, isActive: true },
      ],
    })));
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
    wrapper.unmount();
  });

  it('does not let a variant with orders be removed', async () => {
    const wrapper = await mountSuspended(PlansPage);
    (wrapper.vm as unknown as PageVm).openEdit(plan);
    await vi.waitFor(() => expect(document.body.textContent).toContain('Tiene 3 pedidos.'));

    const used = document.body.querySelector('[aria-label="5 días tiene pedidos y no se puede quitar"]') as HTMLButtonElement;
    const free = [...document.body.querySelectorAll('[aria-label="Quitar variante"]')] as HTMLButtonElement[];
    expect(used.disabled).toBe(true);
    expect(free).toHaveLength(1);
    expect(free[0]!.disabled).toBe(false);
    wrapper.unmount();
  });

  it('asks before closing the form with unsaved changes', async () => {
    const wrapper = await mountSuspended(PlansPage);
    const vm = wrapper.vm as unknown as PageVm;
    vm.openEdit(plan);
    await vi.waitFor(() => expect(bodyButton('Guardar plan')).toBeDefined());

    vm.formState.title = 'Plan comidas plus';
    bodyButton('Cancelar')!.click();
    await vi.waitFor(() => expect(bodyButton('Salir sin guardar')).toBeDefined());
    expect(vm.formOpen).toBe(true);

    bodyButton('Salir sin guardar')!.click();
    await vi.waitFor(() => expect(vm.formOpen).toBe(false));
    wrapper.unmount();
  });

  it('closes an untouched form without asking', async () => {
    const wrapper = await mountSuspended(PlansPage);
    const vm = wrapper.vm as unknown as PageVm;
    vm.openEdit(plan);
    await vi.waitFor(() => expect(bodyButton('Guardar plan')).toBeDefined());

    bodyButton('Cancelar')!.click();
    await vi.waitFor(() => expect(vm.formOpen).toBe(false));
    expect(bodyButton('Salir sin guardar')).toBeUndefined();
    wrapper.unmount();
  });
});
