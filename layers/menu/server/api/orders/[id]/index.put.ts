import type { OrderUpdateInput } from '~~/layers/menu/shared/types/types';

import { updateOrder } from '../../../utils/orders';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del pedido es obligatorio.' });
  return updateOrder(id, await readBody<OrderUpdateInput>(event));
});
