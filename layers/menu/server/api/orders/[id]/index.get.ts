import { getOrderById } from '../../../utils/orders';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del pedido es obligatorio.' });
  const order = await getOrderById(id);
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
  return order;
});
