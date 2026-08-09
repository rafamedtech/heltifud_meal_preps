import type { ExpenseInput } from '~~/layers/menu/shared/types/types';

import { createExpense } from '../../utils/expenses';

export default defineEventHandler(async (event) => createExpense(await readBody<ExpenseInput>(event)));
