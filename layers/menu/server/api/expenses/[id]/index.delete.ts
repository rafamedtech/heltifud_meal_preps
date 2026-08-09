import { deleteExpense } from '../../../utils/expenses';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'El id del gasto es obligatorio.' });
  }

  return deleteExpense(id);
});
