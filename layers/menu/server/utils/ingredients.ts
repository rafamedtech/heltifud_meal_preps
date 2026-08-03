import { createError } from 'h3';

import { ingredientInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type { Ingredient, IngredientInput } from '~~/layers/menu/shared/types/types';

import { prisma } from './prisma';

function mapIngredient(item: {
  id: string;
  nombre: string;
  categoria: string;
  createdAt: Date;
  updatedAt: Date;
}): Ingredient {
  return {
    id: item.id,
    nombre: item.nombre,
    categoria: item.categoria,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function normalizeIngredientName(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es-MX');
}

export async function getIngredients() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
  });

  return ingredients.map(mapIngredient);
}

export async function createIngredient(input: IngredientInput) {
  const parsed = ingredientInputSchema.safeParse(input);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Revisa la información del ingrediente.',
      data: parsed.error.flatten(),
    });
  }

  const nombre = parsed.data.nombre.trim().replace(/\s+/g, ' ');
  const categoria = parsed.data.categoria.trim();
  const nombreNormalizado = normalizeIngredientName(nombre);
  const ingredient = await prisma.ingredient.upsert({
    where: { nombreNormalizado },
    update: {},
    create: { nombre, nombreNormalizado, categoria },
  });

  return mapIngredient(ingredient);
}
