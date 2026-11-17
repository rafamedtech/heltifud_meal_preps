import type { PrivateCustomerOrder } from '../types/customerOrder';
import { dayOfWeekLabel, orderFolioLabel } from './orderDeliveries';
import { ORDER_STATUS_LABELS } from './orderWorkflow';
import type { OrderStatusValue } from '../types/types';

export function customerOrderSummary(order: PrivateCustomerOrder) {
  return [
    `Hola, Heltifud. Registré mi pedido ${orderFolioLabel(order.folio)}.`,
    `${order.planTitle} · ${order.variantTitle}`,
    `Total del plan: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.price)}`,
    `Contacto: ${order.contact.nombre} · ${order.contact.telefono}`,
    `Estado: ${ORDER_STATUS_LABELS[order.status as OrderStatusValue] ?? order.status}`,
    ...order.meals.map(meal => `${dayOfWeekLabel(meal.dayOfWeek)} · ${meal.slotType}: ${meal.dishes.join(', ')}${meal.notes ? ` (${meal.notes})` : ''}`),
    ...order.deliveries.map(d => `Entrega ${d.sequence}: ${d.date} · ${d.address}`),
    ...(order.notes ? [`Notas: ${order.notes}`] : []),
    'Quedo pendiente de su revisión y confirmación de entrega y pago.',
  ].join('\n');
}
