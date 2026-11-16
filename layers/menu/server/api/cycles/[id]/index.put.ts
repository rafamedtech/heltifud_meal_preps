import type { WeeklyCycleUpdateInput } from '~~/layers/menu/shared/types/types';

import { updateCycle } from '../../../utils/cycles';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id de la semana es obligatorio.' });
  return updateCycle(id, await readBody<WeeklyCycleUpdateInput>(event));
});
