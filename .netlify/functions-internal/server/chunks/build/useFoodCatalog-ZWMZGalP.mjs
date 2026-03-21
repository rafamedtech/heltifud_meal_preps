function useFoodCatalog() {
  async function getFoodCatalog() {
    return $fetch("/api/food-components");
  }
  async function createFoodCatalogItem(item) {
    return $fetch("/api/food-components", {
      method: "POST",
      body: item
    });
  }
  async function updateFoodCatalogItem(id, item) {
    return $fetch(`/api/food-components/${id}`, {
      method: "PUT",
      body: item
    });
  }
  async function deleteFoodCatalogItem(id) {
    return $fetch(`/api/food-components/${id}`, {
      method: "DELETE"
    });
  }
  return {
    getFoodCatalog,
    createFoodCatalogItem,
    updateFoodCatalogItem,
    deleteFoodCatalogItem
  };
}

export { useFoodCatalog as u };
