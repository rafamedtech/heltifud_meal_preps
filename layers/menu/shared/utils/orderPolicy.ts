import type { OrderStatusValue } from '../types/types';

/**
 * Customer-facing order policy (business decisions of 17 Nov 2026). The full
 * policy and its rationale live in docs/politicas-pedidos.md.
 */
export const ORDER_POLICY = [
  'Pagas el total antes de que preparemos tu pedido, por transferencia, tarjeta o efectivo.',
  'Puedes pedir cambios de platillos, días o dirección por WhatsApp hasta el corte del viernes.',
  'Si cancelas antes del corte, te devolvemos el total por el mismo medio de pago o como saldo a favor.',
  'Después del corte ya compramos y preparamos tus comidas: no hay devolución de lo preparado. Puedes cancelar la segunda entrega avisándonos por WhatsApp a más tardar el martes a las 9:00 p.m.',
  'Si no logramos entregarte, reintentamos el mismo día o al siguiente. Si no logramos contactarte, la entrega se cierra sin devolución.',
] as const;

/** What the customer reads at the top of the private order page, by order status. */
export function customerOrderStatusMessage(status: OrderStatusValue) {
  switch (status) {
    case 'DRAFT': return 'Tu solicitud quedó registrada. Heltifud revisará las comidas, entregas y forma de pago antes de confirmarla.';
    case 'CONFIRMED': return 'Heltifud confirmó tu pedido. Lo prepararemos para las fechas de entrega.';
    case 'PREPARING': return 'Estamos preparando tu pedido.';
    case 'PARTIALLY_DELIVERED': return 'Ya entregamos parte de tu pedido. Abajo ves el estado de cada entrega.';
    case 'DELIVERED': return 'Tu pedido está cerrado. Abajo ves el estado de cada entrega.';
    case 'CANCELLED': return 'Tu pedido fue cancelado. Escríbenos por WhatsApp si tienes dudas.';
  }
}
