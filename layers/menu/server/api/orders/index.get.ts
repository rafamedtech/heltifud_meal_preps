import { getQuery } from 'h3';

import { getOrders } from '../../utils/orders';

export default defineEventHandler((event) => getOrders(getQuery(event)));
