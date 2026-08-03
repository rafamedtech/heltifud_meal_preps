import type { Ingredient, IngredientInput } from '~~/layers/menu/shared/types/types';

export default function useIngredientCatalog() {
  async function getIngredients() {
    return $fetch<Ingredient[]>('/api/ingredients');
  }

  async function createIngredient(input: IngredientInput) {
    return $fetch<Ingredient>('/api/ingredients', {
      method: 'POST',
      body: input,
    });
  }

  return { getIngredients, createIngredient };
}
