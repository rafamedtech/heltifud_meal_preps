import { getQuery } from 'h3';

import { getOrderOptions } from '../../utils/orders';

export default defineEventHandler((event) => getOrderOptions(getQuery(event)));
