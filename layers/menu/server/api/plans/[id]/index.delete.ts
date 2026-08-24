import { deletePlan } from '../../../utils/plans';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del plan es obligatorio.' });
  return deletePlan(id);
});
