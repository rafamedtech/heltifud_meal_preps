import type { ExpenseInput } from '~~/layers/menu/shared/types/types';

import { updateExpense } from '../../../utils/expenses';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'El id del gasto es obligatorio.' });
  }

  return updateExpense(id, await readBody<ExpenseInput>(event));
});
