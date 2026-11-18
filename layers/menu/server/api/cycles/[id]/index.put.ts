import type { WeeklyCycleUpdateInput } from '~~/layers/menu/shared/types/types';

import { updateCycle } from '../../../utils/cycles';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'de la semana');
  return updateCycle(id, await readBody<WeeklyCycleUpdateInput>(event));
});
