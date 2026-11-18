import { getOrderById } from '../../../utils/orders';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del pedido');
  const order = await getOrderById(id);
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
  return order;
});
