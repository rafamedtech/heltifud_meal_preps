import { createError } from 'h3';

import { getFoodCatalogItemById } from '../../../utils/foodCatalog';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del platillo');

  const item = await getFoodCatalogItemById(id);

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'FoodComponent no encontrado.' });
  }

  return item;
});
