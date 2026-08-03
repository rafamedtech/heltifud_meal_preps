import { createError } from 'h3';

import { foodCatalogItemInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type { FoodCatalogItem, FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

import { prisma } from './prisma';

function trimString(value: string | undefined | null): string {
  return (value ?? '').trim();
}

function mapCatalogItem(item: {
  id: string;
  nombre: string;
  descripcion: string;
  preparacion: string;
  calorias: number;
  imagen: string;
  tipo: string;
  createdAt: Date;
  updatedAt: Date;
  recipeIngredients: Array<{
    id: string;
    ingredientId: string;
    cantidad: unknown;
    unidad: string;
    orden: number;
    ingredient: {
      id: string;
      nombre: string;
      categoria: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
}): FoodCatalogItem {
  return {
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion,
    preparacion: item.preparacion,
    ingredientes: item.recipeIngredients.map((recipeIngredient) => ({
      id: recipeIngredient.id,
      ingredientId: recipeIngredient.ingredientId,
      cantidad: Number(recipeIngredient.cantidad),
      unidad: recipeIngredient.unidad,
      orden: recipeIngredient.orden,
      ingredient: {
        id: recipeIngredient.ingredient.id,
        nombre: recipeIngredient.ingredient.nombre,
        categoria: recipeIngredient.ingredient.categoria,
        createdAt: recipeIngredient.ingredient.createdAt.toISOString(),
        updatedAt: recipeIngredient.ingredient.updatedAt.toISOString(),
      },
    })),
    calorias: item.calorias,
    imagen: item.imagen,
    tipo: item.tipo,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function validateInput(input: FoodCatalogItemInput) {
  const parsed = foodCatalogItemInputSchema.safeParse(input);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload inválido para FoodComponent.',
      data: parsed.error.flatten(),
    });
  }

  return {
    catalogData: {
      nombre: trimString(parsed.data.nombre),
      descripcion: trimString(parsed.data.descripcion),
      preparacion: trimString(parsed.data.preparacion),
      calorias: parsed.data.calorias,
      imagen: trimString(parsed.data.imagen),
      tipo: trimString(parsed.data.tipo),
    },
    recipeIngredients: parsed.data.ingredientes.map((item, orden) => ({
      ingredientId: item.ingredientId,
      cantidad: item.cantidad,
      unidad: trimString(item.unidad),
      orden,
    })),
  };
}

const recipeIngredientsQuery = {
  include: { ingredient: true },
  orderBy: { orden: 'asc' as const },
};

async function ensureIngredientsExist(ingredientIds: string[]) {
  if (ingredientIds.length === 0) {
    return;
  }

  const foundIngredients = await prisma.ingredient.count({
    where: { id: { in: ingredientIds } },
  });

  if (foundIngredients !== ingredientIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Uno o más ingredientes seleccionados ya no existen.',
    });
  }
}

export async function getFoodCatalogItems() {
  const items = await prisma.foodCatalogItem.findMany({
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    include: { recipeIngredients: recipeIngredientsQuery },
  });

  return items.map(mapCatalogItem);
}

export async function getFoodCatalogItemById(id: string) {
  const item = await prisma.foodCatalogItem.findUnique({
    where: { id },
    include: { recipeIngredients: recipeIngredientsQuery },
  });

  return item ? mapCatalogItem(item) : null;
}

export async function createFoodCatalogItem(input: FoodCatalogItemInput) {
  const { catalogData, recipeIngredients } = validateInput(input);

  await ensureIngredientsExist(recipeIngredients.map((item) => item.ingredientId));

  const created = await prisma.foodCatalogItem.create({
    data: {
      ...catalogData,
      recipeIngredients: { create: recipeIngredients },
    },
    include: { recipeIngredients: recipeIngredientsQuery },
  });

  return mapCatalogItem(created);
}

export async function updateFoodCatalogItem(id: string, input: FoodCatalogItemInput) {
  const existing = await prisma.foodCatalogItem.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      calorias: true,
      imagen: true,
      tipo: true,
    },
  });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'FoodComponent no encontrado.' });
  }

  const { catalogData, recipeIngredients } = validateInput(input);
  await ensureIngredientsExist(recipeIngredients.map((item) => item.ingredientId));

  const componentData = {
    nombre: catalogData.nombre,
    descripcion: catalogData.descripcion,
    calorias: catalogData.calorias,
    imagen: catalogData.imagen,
    tipo: catalogData.tipo,
  };

  const [updated] = await prisma.$transaction([
    prisma.foodCatalogItem.update({
      where: { id },
      data: {
        ...catalogData,
        recipeIngredients: {
          deleteMany: {},
          create: recipeIngredients,
        },
      },
      include: { recipeIngredients: recipeIngredientsQuery },
    }),
    prisma.foodComponent.updateMany({
      where: {
        OR: [
          { catalogItemId: id },
          {
            catalogItemId: null,
            nombre: existing.nombre,
            descripcion: existing.descripcion,
            calorias: existing.calorias,
            imagen: existing.imagen,
            tipo: existing.tipo,
          },
        ],
      },
      data: {
        ...componentData,
        catalogItemId: id,
      },
    }),
  ]);

  return mapCatalogItem(updated);
}

export async function deleteFoodCatalogItem(id: string) {
  const existing = await prisma.foodCatalogItem.findUnique({
    where: { id },
    select: { id: true, nombre: true },
  });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'FoodComponent no encontrado.' });
  }

  const linkedComponents = await prisma.foodComponent.findMany({
    where: { catalogItemId: id },
    select: {
      daySlot: {
        select: {
          menuDay: {
            select: {
              weeklyMenu: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (linkedComponents.length > 0) {
    const linkedMenus = Array.from(
      new Map(
        linkedComponents
          .map((component) => component.daySlot.menuDay.weeklyMenu)
          .map((menu) => [menu.id, menu])
      ).values()
    );

    throw createError({
      statusCode: 409,
      statusMessage: 'Este platillo no se puede borrar todavía porque aparece en uno o más menús.',
      data: {
        code: 'FOOD_CATALOG_ITEM_IN_USE',
        itemName: existing.nombre,
        linkedMenus: linkedMenus.map((menu) => ({
          id: menu.id,
          name: menu.name,
        })),
      },
    });
  }

  await prisma.foodCatalogItem.delete({
    where: { id },
  });

  return { id };
}
