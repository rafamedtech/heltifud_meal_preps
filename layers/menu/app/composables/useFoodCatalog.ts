import type { FoodCatalogItem, FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

export default function useFoodCatalog() {
  async function getFoodCatalog() {
    return $fetch<FoodCatalogItem[]>('/api/food-components');
  }

  async function createFoodCatalogItem(item: FoodCatalogItemInput) {
    return $fetch<FoodCatalogItem>('/api/food-components', {
      method: 'POST',
      body: item,
    });
  }

  async function updateFoodCatalogItem(id: string, item: FoodCatalogItemInput) {
    return $fetch<FoodCatalogItem>(`/api/food-components/${id}`, {
      method: 'PUT',
      body: item,
    });
  }

  async function deleteFoodCatalogItem(id: string) {
    return $fetch<{ id: string }>(`/api/food-components/${id}`, {
      method: 'DELETE',
    });
  }

  return {
    getFoodCatalog,
    createFoodCatalogItem,
    updateFoodCatalogItem,
    deleteFoodCatalogItem,
  };
}
