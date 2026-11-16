import { transitionOrder } from '../../../utils/orders';

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del pedido es obligatorio.' });
  return transitionOrder(id, await readBody(event), event.context.orderActor);
});
