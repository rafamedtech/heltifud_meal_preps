import { createMenu } from '../../repository/menuRepository';

export default defineEventHandler(async (_event) => {
  const { menu } = await readBody(_event);

  if (!menu) {
    return {
      error: 'No hay ningun menú activo.',
    };
  }

  return createMenu(menu);
});
