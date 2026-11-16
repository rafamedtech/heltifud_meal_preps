import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CustomersPage from '../../layers/admin/app/pages/admin/clientes/index.vue';

const { getCustomers, deleteCustomer, updateCustomer } = vi.hoisted(() => ({
  getCustomers: vi.fn(), deleteCustomer: vi.fn(), updateCustomer: vi.fn(),
}));
mockNuxtImport('navigateTo', () => vi.fn());
mockNuxtImport('useCustomers', () => () => ({ getCustomers, createCustomer: vi.fn(), updateCustomer, deleteCustomer }));

const customer = {
  id: 'customer-1', nombre: 'Ana López', telefono: '6641234567', correoElectronico: 'ana@example.com',
  ubicacion1: 'Zona Río', ubicacion2: '', source: 'whatsapp', status: 'activo', tipoCliente: 'menu',
  firstDeliveryDay: 'LUNES', secondDeliveryDay: null,
};

function bodyButton(text: string) {
  return [...document.body.querySelectorAll('button')].find(node => node.textContent?.includes(text)) as HTMLButtonElement | undefined;
}

describe('CustomersPage: delete a customer with history', () => {
  beforeEach(() => {
    getCustomers.mockReset().mockResolvedValue({ items: [customer], nextCursor: null });
    updateCustomer.mockReset().mockResolvedValue({ ...customer, status: 'inactivo' });
    deleteCustomer.mockReset().mockRejectedValue({
      data: { statusMessage: 'El cliente tiene 2 pedidos y no se puede eliminar.', data: { code: 'CUSTOMER_HAS_HISTORY', orders: 2, menus: 0 } },
    });
  });

  it('explains the conflict and offers to mark the customer inactive', async () => {
    const wrapper = await mountSuspended(CustomersPage);
    await vi.waitFor(() => expect(wrapper.text()).toContain('Ana López'));
    (wrapper.vm as unknown as { pendingDelete: unknown }).pendingDelete = customer;
    await vi.waitFor(() => expect(bodyButton('Eliminar cliente')).toBeDefined());

    bodyButton('Eliminar cliente')!.click();
    await vi.waitFor(() => expect(document.body.textContent).toContain('El cliente tiene 2 pedidos y no se puede eliminar.'));
    expect(document.body.textContent).toContain('Márcalo como inactivo para conservar su historial.');
    expect(bodyButton('Eliminar cliente')).toBeUndefined();

    bodyButton('Marcar inactivo')!.click();
    await vi.waitFor(() => expect(updateCustomer).toHaveBeenCalledWith('customer-1', expect.objectContaining({
      nombre: 'Ana López', telefono: '6641234567', firstDeliveryDay: 'LUNES', status: 'inactivo',
    })));
    await vi.waitFor(() => expect(getCustomers).toHaveBeenCalledTimes(2));
    wrapper.unmount();
  });
});
