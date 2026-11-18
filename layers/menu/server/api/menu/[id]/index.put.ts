import type { WeeklyMenuInput } from '~~/layers/menu/shared/types/types';

import { updateWeeklyMenu } from '../../../utils/menu';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del menú');

  const body = await readBody<WeeklyMenuInput>(event);
  return updateWeeklyMenu(id, body);
});
