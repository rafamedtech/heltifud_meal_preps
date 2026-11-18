import type { FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

import { updateFoodCatalogItem } from '../../../utils/foodCatalog';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del platillo');

  const body = await readBody<FoodCatalogItemInput>(event);
  return updateFoodCatalogItem(id, body);
});
