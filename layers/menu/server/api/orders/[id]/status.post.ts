import { transitionOrder } from '../../../utils/orders';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async event => {
  const id = requireUuidParam(event, 'id', 'del pedido');
  return transitionOrder(id, await readBody(event), event.context.orderActor);
});
