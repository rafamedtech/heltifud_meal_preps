import { deleteWeeklyMenu } from '../../../utils/menu';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del menú');

  return deleteWeeklyMenu(id);
});
