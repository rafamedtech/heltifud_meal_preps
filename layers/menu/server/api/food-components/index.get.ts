import { getFoodCatalogItems } from '../../utils/foodCatalog';

export default defineEventHandler(async () => {
  return getFoodCatalogItems();
});
