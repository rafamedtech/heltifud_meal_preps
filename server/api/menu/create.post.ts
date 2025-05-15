import { createMenu } from '../../functions/createMenu';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export default defineEventHandler(async (_event) => {
  const { menu } = await readBody(_event);
  //   console.log(menu);

  if (!menu) {
    return {
      error: 'No hay ningun menú activo.',
    };
  }

  return createMenu(menu);
});
