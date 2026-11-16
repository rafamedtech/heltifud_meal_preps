import { transitionDelivery } from '../../../../../utils/orders';

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id');
  const sequence = Number(getRouterParam(event, 'sequence'));
  if (!id || (sequence !== 1 && sequence !== 2)) throw createError({ statusCode: 400, statusMessage: 'La entrega no es válida.' });
  return transitionDelivery(id, sequence, await readBody(event), event.context.orderActor);
});
