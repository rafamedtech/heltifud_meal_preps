import type { ExpenseInput } from '~~/layers/menu/shared/types/types';

import { updateExpense } from '../../../utils/expenses';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del gasto');

  return updateExpense(id, await readBody<ExpenseInput>(event));
});
