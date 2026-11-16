import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import CustomerExclusions from '../../layers/admin/app/components/CustomerExclusions.vue';

const { fetchExclusions, updateCustomerExclusions } = vi.hoisted(() => ({ fetchExclusions: vi.fn(), updateCustomerExclusions: vi.fn() }));
mockNuxtImport('useFetch', () => fetchExclusions);
mockNuxtImport('useCustomers', () => () => ({ updateCustomerExclusions }));
registerEndpoint('/api/ingredients', () => [
  { id: 'ing-shrimp', nombre: 'Camarón', categoria: 'Mariscos', createdAt: '', updatedAt: '' },
  { id: 'ing-onion', nombre: 'Cebolla', categoria: 'Verduras', createdAt: '', updatedAt: '' },
]);
registerEndpoint('/api/food-components', () => [
  { id: 'item-mole', nombre: 'Mole', descripcion: '', calorias: 500, imagen: '', tipo: 'comida', preparacion: '', recipeIngredients: [], createdAt: '', updatedAt: '' },
]);

const saved = [
  { id: 'ex-1', kind: 'ALERGIA', ingredientId: 'ing-shrimp', catalogItemId: null, label: 'Camarón' },
  { id: 'ex-2', kind: 'PLATILLO', ingredientId: null, catalogItemId: 'item-mole', label: 'Mole' },
];

describe('CustomerExclusions', () => {
  beforeEach(() => {
    updateCustomerExclusions.mockReset().mockResolvedValue(saved);
    fetchExclusions.mockResolvedValue({ data: ref(saved), status: ref('success'), error: ref(null), refresh: vi.fn() });
  });

  it('lists allergies and exclusions and warns that dishes without recipe are not checked', async () => {
    const wrapper = await mountSuspended(CustomerExclusions, { props: { customerId: 'customer-1' } });
    expect(fetchExclusions.mock.calls.at(-1)![0]()).toBe('/api/customers/customer-1/exclusions');
    expect(wrapper.text()).toContain('Camarón');
    expect(wrapper.text()).toContain('Mole');
    expect(wrapper.text()).toContain('Ninguno');
    expect(wrapper.text()).toContain('Platillos sin receta');
    wrapper.unmount();
  });

  it('opens the editor with the saved choices and saves them by id', async () => {
    const wrapper = await mountSuspended(CustomerExclusions, { props: { customerId: 'customer-1' } });
    await wrapper.get('button').trigger('click');
    await flushPromises();
    const form = wrapper.findComponent({ name: 'UForm' });
    expect(form.props('state')).toEqual({ allergyIngredientIds: ['ing-shrimp'], ingredientIds: [], catalogItemIds: ['item-mole'] });
    form.vm.$emit('submit');
    await flushPromises();
    expect(updateCustomerExclusions).toHaveBeenCalledWith('customer-1', { allergyIngredientIds: ['ing-shrimp'], ingredientIds: [], catalogItemIds: ['item-mole'] });
    wrapper.unmount();
  });
});
