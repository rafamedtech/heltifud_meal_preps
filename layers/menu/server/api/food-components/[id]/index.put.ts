import { createError } from 'h3';

import type { FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

import { updateFoodCatalogItem } from '../../../utils/foodCatalog';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de FoodComponent inválido.' });
  }

  const body = await readBody<FoodCatalogItemInput>(event);
  return updateFoodCatalogItem(id, body);
});
