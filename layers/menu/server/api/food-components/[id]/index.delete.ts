import { createError } from 'h3';

import { deleteFoodCatalogItem } from '../../../utils/foodCatalog';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de FoodComponent inválido.' });
  }

  return deleteFoodCatalogItem(id);
});
