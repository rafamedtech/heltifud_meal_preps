import { deleteFoodCatalogItem } from '../../../utils/foodCatalog';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del platillo');

  return deleteFoodCatalogItem(id);
});
