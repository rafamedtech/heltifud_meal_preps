import type { FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

import { createFoodCatalogItem } from '../../utils/foodCatalog';

export default defineEventHandler(async (event) => {
  const body = await readBody<FoodCatalogItemInput>(event);
  return createFoodCatalogItem(body);
});
