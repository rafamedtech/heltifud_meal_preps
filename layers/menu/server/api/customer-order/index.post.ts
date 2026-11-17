import { submitCustomerOrder } from '../../utils/customerOrders';
export default defineEventHandler(async event => {
  const type = getQuery(event).type;
  if (type !== 'ESTANDAR' && type !== 'VEGETARIANO') throw createError({ statusCode: 400, statusMessage: 'Selecciona un tipo de menú.' });
  const body = await readBody(event);
  return submitCustomerOrder(body, getHeader(event, 'idempotency-key'), getHeader(event, 'x-order-token'), type, getHeader(event, 'x-customer-invitation'));
});
