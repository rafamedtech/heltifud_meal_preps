import type { PlanInput } from '~~/layers/menu/shared/types/types';

import { updatePlan } from '../../../utils/plans';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del plan es obligatorio.' });
  return updatePlan(id, await readBody<PlanInput>(event));
});
