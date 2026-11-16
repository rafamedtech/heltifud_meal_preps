import { getOrderPersonalization } from '../../../utils/orderPersonalization';

// Dishes of the week's menu each place of the order can take, and how they fit the customer's exclusions.
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del pedido es obligatorio.' });
  return getOrderPersonalization(id);
});
