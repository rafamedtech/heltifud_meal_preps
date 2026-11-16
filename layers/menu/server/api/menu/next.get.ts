import { getQuery } from 'h3';

import { getNextMenu, publicMenuType } from '../../utils/menu';

export default defineEventHandler(async (event) => {
  return await getNextMenu(publicMenuType(getQuery(event).type));
});
