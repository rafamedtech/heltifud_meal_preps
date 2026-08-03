import { getQuery } from 'h3';

import { getCustomers } from '../../utils/customers';

export default defineEventHandler((event) => getCustomers(getQuery(event)));
