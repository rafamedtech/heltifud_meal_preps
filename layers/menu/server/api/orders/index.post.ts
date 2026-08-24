import type { OrderCreateInput } from '~~/layers/menu/shared/types/types';

import { createOrder } from '../../utils/orders';

export default defineEventHandler(async (event) => createOrder(await readBody<OrderCreateInput>(event)));
