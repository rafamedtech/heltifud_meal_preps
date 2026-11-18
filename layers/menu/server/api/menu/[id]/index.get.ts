import { createError } from 'h3';

import { getMenuById } from '../../../utils/menu';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del menú');

  const menu = await getMenuById(id);

  if (!menu) {
    throw createError({ statusCode: 404, statusMessage: 'Menú no encontrado.' });
  }

  return menu;
});
