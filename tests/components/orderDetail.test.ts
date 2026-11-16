import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import OrderDetail from '../../layers/admin/app/pages/admin/pedidos/[id].vue';

const { fetchData, retry, save } = vi.hoisted(() => ({ fetchData: vi.fn(), retry: vi.fn(), save: vi.fn() }));
mockNuxtImport('useFetch', () => fetchData);
mockNuxtImport('useRoute', () => () => ({ params: { id: 'order-1' } }));
mockNuxtImport('useOrders', () => () => ({ updateOrder: save }));

const order = {
  id: 'order-1', version: 1, cycleStatus: 'OPEN', deliveryDateOptions: { 1: ['2026-09-13', '2026-09-14'], 2: ['2026-09-16', '2026-09-17'] }, statusEvents: [], folio: 12, weekStart: '2026-09-14', cycleId: 'cycle-1', capturedAfterCutoff: true, status: 'CONFIRMED', customerId: 'customer-1', customerName: 'Ana López', customerPhone: '6641234567',
  planTitle: 'Plan Balance', planVariantTitle: '5 días · 3 tiempos', price: 1450,
  deliveries: [
    { id: 'delivery-1', sequence: 1, scheduledDate: '2026-09-14', locationNumber: 1, address: 'Zona Río, Tijuana', status: 'PENDING', deliveredAt: null, notes: '' },
    { id: 'delivery-2', sequence: 2, scheduledDate: '2026-09-17', locationNumber: 1, address: 'Zona Río, Tijuana', status: 'PENDING', deliveredAt: null, notes: '' },
  ],
  createdAt: '2026-09-10T12:00:00Z', updatedAt: '2026-09-10T12:00:00Z',
  planVariantId: 'variant-1', sourceWeeklyMenuId: 'menu-1', sourceWeeklyMenuName: 'Semana 37', notes: '', offerVersion: 3,
  menuChanges: [{
    id: 'change-1', orderVersion: 1, kind: 'AUTOMATICA', dayOfWeek: 'LUNES', slotType: 'COMIDA', componentRole: 'PLATILLO_PRINCIPAL', position: 0,
    fromNombre: 'Camarones', toNombre: 'Pollo al limón', reason: 'Alergia: Camarón', actorLabel: 'admin@heltifud', createdAt: '2026-09-10T12:00:00Z'
  }],
  customer: {
    id: 'customer-1', nombre: 'Ana López', telefono: '6641234567', correoElectronico: '',
    ubicacion1: 'Zona Río, Tijuana', ubicacion2: '', source: 'whatsapp', status: 'activo', tipoCliente: 'menu',
    firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES', createdAt: '2026-08-01T12:00:00Z', updatedAt: '2026-08-01T12:00:00Z'
  },
  menuSlots: [{
    id: 'slot-1', deliverySequence: 1, dayOfWeek: 'LUNES', dayOrder: 1, slotType: 'COMIDA', contenedor: '',
    components: [{
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', catalogItemId: '11111111-1111-4111-8111-111111111111', componentRole: 'PLATILLO_PRINCIPAL', position: 0,
      nombre: 'Pollo al limón', descripcion: '', calorias: 420, imagen: '', tipo: 'proteina'
    }]
  }]
};

const option = (id: string, componentRole: string, dayOfWeek: string, nombre: string, conflict: Record<string, unknown> = { status: 'ok' }) => ({
  id, componentRole, dayOfWeek, slotType: 'COMIDA', catalogItemId: `item-${id}`, nombre, descripcion: '', calorias: 400, imagen: '', tipo: 'proteina', conflict
});
const personalization = {
  menu: { id: 'menu-1', name: 'Semana 37', version: 3 },
  menuChanged: false,
  options: [
    { ...option('10000000-0000-4000-8000-000000000001', 'PLATILLO_PRINCIPAL', 'LUNES', 'Pollo al limón'), catalogItemId: '11111111-1111-4111-8111-111111111111' },
    option('20000000-0000-4000-8000-000000000002', 'PLATILLO_PRINCIPAL', 'MARTES', 'Salmón'),
    option('30000000-0000-4000-8000-000000000003', 'PLATILLO_PRINCIPAL', 'MIERCOLES', 'Camarones', { status: 'excluded', reasons: ['Alergia: Camarón'] }),
    option('40000000-0000-4000-8000-000000000004', 'GUARNICION_1', 'LUNES', 'Arroz')
  ],
  originals: { 'LUNES:COMIDA:PLATILLO_PRINCIPAL:0': '10000000-0000-4000-8000-000000000001' },
  componentConflicts: { 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa': { status: 'ok' } },
  exclusions: [{ id: 'ex-1', kind: 'ALERGIA', ingredientId: 'shrimp', catalogItemId: null, label: 'Camarón' }]
};

function mockFetch(orderResult: Record<string, unknown>) {
  fetchData.mockImplementation((url: string) => Promise.resolve(
    url.endsWith('/personalization')
      ? { data: ref(personalization), status: ref('success'), error: ref(null), refresh: vi.fn() }
      : { refresh: retry, ...orderResult }
  ));
}

describe('OrderDetail', () => {
  beforeEach(() => {
    retry.mockClear();
    save.mockReset();
    mockFetch({ data: ref(order), status: ref('success'), error: ref(null) });
  });

  it('keeps local text and offers explicit reload after a version conflict', async () => {
    save.mockRejectedValue({ data: { statusMessage: 'Otro operador modificó el pedido', data: { code: 'ORDER_VERSION_CONFLICT' } } });
    const wrapper = await mountSuspended(OrderDetail);
    await wrapper.get('textarea').setValue('Cambio local pendiente');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
    await flushPromises();
    expect(wrapper.text()).toContain('Revisa la versión actual');
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('Cambio local pendiente');
    expect(wrapper.text()).toContain('Recargar pedido');
    wrapper.unmount();
  });

  it('locks a delivered order and offers a recorded reopening', async () => {
    mockFetch({ data: ref({ ...order, status: 'DELIVERED', deliveries: order.deliveries.map(d => ({ ...d, status: 'DELIVERED' })) }), status: ref('success'), error: ref(null) });
    const wrapper = await mountSuspended(OrderDetail);
    expect(wrapper.get('textarea').attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('Edición bloqueada');
    expect(wrapper.text()).toContain('Reabrir pedido');
    wrapper.unmount();
  });

  it('renders the order summary, deliveries and menu', async () => {
    const wrapper = await mountSuspended(OrderDetail, { route: '/admin/pedidos/order-1' });
    expect(fetchData.mock.calls.some(([url]) => url === '/api/orders/order-1')).toBe(true);
    expect(wrapper.get('h1').text()).toBe(order.planTitle);
    expect(wrapper.text()).toContain('Confirmado');
    expect(wrapper.text()).toContain('Pedido #0012');
    expect(wrapper.text()).toContain('Fuera de corte');
    expect(wrapper.text()).toContain('Creado el');
    expect(wrapper.get('a[href="/admin/clientes/customer-1"]').text()).toBe(order.customerName);
    expect(wrapper.find('a[href="tel:6641234567"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Semana 37');
    expect(wrapper.text()).toContain('Zona Río, Tijuana');
    expect(wrapper.text()).toContain('Primera entrega');
    expect(wrapper.text()).toContain('Segunda entrega');
    expect(wrapper.text()).toContain('Sin comidas asignadas');
    expect(wrapper.text()).toContain('14 de septiembre de 2026');
    expect(wrapper.text()).toContain('17 de septiembre de 2026');
    expect(wrapper.find('[name="status"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('Historial de estados');
    expect(wrapper.text()).toContain('Lunes');
    expect(wrapper.text()).toContain('Día 1 · 1 tiempo');
    expect(wrapper.text()).toContain('Pollo al limón');
    expect(wrapper.find('a[href="/admin/pedidos"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('swaps a dish only for menu options of its family, sends ids and can restore it', async () => {
    save.mockImplementation(() => new Promise(() => {}));
    const wrapper = await mountSuspended(OrderDetail, { global: { stubs: { UTooltip: { template: '<div><slot /></div>' } } } });
    expect(wrapper.text()).toContain('Alergia: Camarón');
    expect(wrapper.text()).toContain('Cambios en el menú');
    expect(wrapper.text()).toContain('Camarones → Pollo al limón');

    const select = wrapper.findAllComponents({ name: 'USelectMenu' }).at(-1)!;
    const items = select.props('items') as Array<{ label: string, value: string, disabled: boolean }>;
    expect(items.map(item => item.label)).toEqual(['Pollo al limón', 'Salmón', 'Camarones']);
    expect(items.find(item => item.value === '30000000-0000-4000-8000-000000000003')!.disabled).toBe(true);

    select.vm.$emit('update:modelValue', '20000000-0000-4000-8000-000000000002');
    await flushPromises();
    expect(wrapper.text()).toContain('Salmón');
    expect(wrapper.text()).toContain('Sustituido · del martes');
    expect(wrapper.find('button[aria-label="Restaurar platillo del menú"]').exists()).toBe(true);

    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0]![1]).toMatchObject({
      offerVersion: 3,
      menuSlots: [{ components: [{ componentRole: 'PLATILLO_PRINCIPAL', position: 0, menuComponentId: '20000000-0000-4000-8000-000000000002' }] }]
    });
    expect(save.mock.calls[0]![1].menuSlots[0].components[0]).not.toHaveProperty('nombre');

    await wrapper.get('button[aria-label="Restaurar platillo del menú"]').trigger('click');
    expect(wrapper.text()).not.toContain('Sustituido');
    wrapper.unmount();
  });

  it('shows a missing order with a return link', async () => {
    mockFetch({ data: ref(null), status: ref('error'), error: ref({ statusCode: 404 }) });
    const wrapper = await mountSuspended(OrderDetail);
    expect(wrapper.text()).toContain('Pedido no encontrado');
    expect(wrapper.find('a[href="/admin/pedidos"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('allows retrying a failed request', async () => {
    mockFetch({ data: ref(null), status: ref('error'), error: ref({ statusCode: 500 }) });
    const wrapper = await mountSuspended(OrderDetail);
    await wrapper.findAll('button').at(-1)!.trigger('click');
    expect(retry).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it('fills the form with the order loaded by a retry', async () => {
    const data = ref<typeof order | null>(null);
    const status = ref('error');
    const error = ref<{ statusCode: number } | null>({ statusCode: 500 });
    mockFetch({ data, status, error });
    retry.mockImplementation(() => {
      data.value = order;
      status.value = 'success';
      error.value = null;
    });

    const wrapper = await mountSuspended(OrderDetail);
    await wrapper.findAll('button').at(-1)!.trigger('click');
    await flushPromises();

    expect(wrapper.get('h1').text()).toBe(order.planTitle);
    expect(wrapper.text()).toContain('14 de septiembre de 2026');
    expect(wrapper.text()).toContain('Día 1 · 1 tiempo');
    expect(wrapper.text()).toContain('Pollo al limón');
    wrapper.unmount();
  });
});
