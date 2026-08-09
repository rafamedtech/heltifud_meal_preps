import { getQuery } from 'h3';

import { getExpenses } from '../../utils/expenses';

export default defineEventHandler((event) => getExpenses(getQuery(event)));
