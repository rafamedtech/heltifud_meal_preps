import type { OrderCreateInput } from '~~/layers/menu/shared/types/types';

import { createOrder, parseIdempotencyKey } from '../../utils/orders';

// Every creation carries a client key so a double submit or a retry yields one order.
export default defineEventHandler(async (event) => {
  const idempotencyKey = parseIdempotencyKey(getHeader(event, 'idempotency-key'));
  return createOrder(await readBody<OrderCreateInput>(event), event.context.orderActor, idempotencyKey);
});
