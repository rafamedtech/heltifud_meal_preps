import type { IngredientInput } from '~~/layers/menu/shared/types/types';

import { createIngredient } from '../../utils/ingredients';

export default defineEventHandler(async (event) => {
  const body = await readBody<IngredientInput>(event);

  return createIngredient(body);
});
