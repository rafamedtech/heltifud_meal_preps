import { deleteExpense } from '../../../utils/expenses';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler((event) => {
  const id = requireUuidParam(event, 'id', 'del gasto');

  return deleteExpense(id);
});
