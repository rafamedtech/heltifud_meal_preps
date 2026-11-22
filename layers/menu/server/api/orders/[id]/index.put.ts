import type { OrderUpdateInput } from '~~/layers/menu/shared/types/types';

import { updateOrder } from '../../../utils/orders';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del pedido');
  return updateOrder(id, await readBody<OrderUpdateInput>(event), event.context.orderActor);
});
