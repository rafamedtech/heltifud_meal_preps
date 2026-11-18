import { transitionDelivery } from '../../../../../utils/orders';
import { requireUuidParam } from '../../../../../utils/routeParams';

export default defineEventHandler(async event => {
  const id = requireUuidParam(event, 'id', 'del pedido');
  const sequence = Number(getRouterParam(event, 'sequence'));
  if (sequence !== 1 && sequence !== 2) throw createError({ statusCode: 400, statusMessage: 'La entrega no es válida.' });
  return transitionDelivery(id, sequence, await readBody(event), event.context.orderActor);
});
