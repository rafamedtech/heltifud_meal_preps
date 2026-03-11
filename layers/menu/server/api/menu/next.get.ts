import { createError } from 'h3';

import { getNextMenu } from '../../utils/menu';

export default defineEventHandler(async () => {
  const nextMenu = await getNextMenu();

  if (!nextMenu) {
    throw createError({ statusCode: 404, statusMessage: 'No hay un menú próximo disponible.' });
  }

  return nextMenu;
});
