import { createError } from 'h3';

import { getActiveMenu } from '../../utils/menu';

export default defineEventHandler(async () => {
  const activeMenu = await getActiveMenu();

  if (!activeMenu) {
    throw createError({ statusCode: 404, statusMessage: 'No hay un menú activo seleccionado.' });
  }

  return activeMenu;
});
