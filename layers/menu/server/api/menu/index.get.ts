import { getQuery } from 'h3';

import { getActiveMenu, publicMenuType } from '../../utils/menu';

export default defineEventHandler(async (event) => {
  return await getActiveMenu(publicMenuType(getQuery(event).type));
});
