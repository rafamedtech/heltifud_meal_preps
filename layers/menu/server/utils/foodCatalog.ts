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
  calorias: number;
  imagen: string;
  tipo: string;
  createdAt: Date;
  updatedAt: Date;
}): FoodCatalogItem {
  return {
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion,
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
    nombre: trimString(parsed.data.nombre),
    descripcion: trimString(parsed.data.descripcion),
    calorias: parsed.data.calorias,
    imagen: trimString(parsed.data.imagen),
    tipo: trimString(parsed.data.tipo),
  };
}

export async function getFoodCatalogItems() {
  const items = await prisma.foodCatalogItem.findMany({
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
  });

  return items.map(mapCatalogItem);
}

export async function getFoodCatalogItemById(id: string) {
  const item = await prisma.foodCatalogItem.findUnique({
    where: { id },
  });

  return item ? mapCatalogItem(item) : null;
}

export async function createFoodCatalogItem(input: FoodCatalogItemInput) {
  const data = validateInput(input);

  const created = await prisma.foodCatalogItem.create({
    data,
  });

  return mapCatalogItem(created);
}

export async function updateFoodCatalogItem(id: string, input: FoodCatalogItemInput) {
  const existing = await prisma.foodCatalogItem.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'FoodComponent no encontrado.' });
  }

  const data = validateInput(input);

  const updated = await prisma.foodCatalogItem.update({
    where: { id },
    data,
  });

  return mapCatalogItem(updated);
}

export async function deleteFoodCatalogItem(id: string) {
  const existing = await prisma.foodCatalogItem.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'FoodComponent no encontrado.' });
  }

  await prisma.foodCatalogItem.delete({
    where: { id },
  });

  return { id };
}
