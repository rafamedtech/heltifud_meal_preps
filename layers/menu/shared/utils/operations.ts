import type { Account, ProductionMeal, ProductionSnapshot, ShoppingNeed } from '../types/operations';

export function accountTotals(total: number, status: string, payments: readonly { kind: string; amount: number }[]) {
  const cents = payments.reduce((sum, item) => sum + (item.kind === 'REFUND' ? -1 : 1) * Math.round(item.amount * 100), 0);
  const due = status === 'CANCELLED' || status === 'DRAFT' ? 0 : Math.round(total * 100);
  return { paid: cents / 100, balance: Math.max(0, due - cents) / 100, refundable: Math.max(0, cents - due) / 100 } satisfies Pick<Account, 'paid' | 'balance' | 'refundable'>;
}

export interface RecipeFact {
  id: string;
  yield: number | null;
  ingredients: Array<{ ingredientId: string; name: string; category: string; quantity: number; unit: string }>;
}

// Only exact mass/volume conversions. A cup or tablespoon is not converted into
// grams: the density of the ingredient and the local measure are not known.
const units: Record<string, { unit: string; factor: number }> = {
  g: { unit: 'g', factor: 1 }, kg: { unit: 'g', factor: 1000 },
  ml: { unit: 'ml', factor: 1 }, l: { unit: 'ml', factor: 1000 },
  pieza: { unit: 'pieza', factor: 1 }, porcion: { unit: 'porcion', factor: 1 },
  cucharadita: { unit: 'cucharadita', factor: 1 }, cucharada: { unit: 'cucharada', factor: 1 }, taza: { unit: 'taza', factor: 1 },
};

export function consolidateProduction(weekStart: string, meals: ProductionMeal[], recipes: RecipeFact[]): ProductionSnapshot {
  const groups = new Map<string, ProductionSnapshot['groups'][number]>();
  const containers = new Map<string, ProductionSnapshot['containers'][number]>();
  const needs = new Map<string, ShoppingNeed>();
  const missing = new Map<string, ProductionSnapshot['missingRecipes'][number]>();
  const facts = new Map(recipes.map(recipe => [recipe.id, recipe]));
  for (const meal of meals) {
    const key = JSON.stringify([meal.scheduledDate, meal.container]);
    const container = containers.get(key) ?? { date: meal.scheduledDate, container: meal.container || 'Sin contenedor', count: 0 };
    container.count++;
    containers.set(key, container);
    for (const component of meal.components) {
      const groupKey = JSON.stringify([meal.scheduledDate, meal.slotType, component.catalogItemId, component.name, component.role]);
      const group = groups.get(groupKey) ?? { date: meal.scheduledDate, slotType: meal.slotType, name: component.name, role: component.role, portions: 0 };
      group.portions++;
      groups.set(groupKey, group);
      const recipe = component.catalogItemId ? facts.get(component.catalogItemId) : undefined;
      const reason = !recipe ? 'Sin vínculo a receta' : !recipe.ingredients.length ? 'Sin ingredientes' : !recipe.yield ? 'Sin rendimiento' : recipe.ingredients.some(i => !Number.isFinite(i.quantity) || i.quantity <= 0 || !i.unit.trim()) ? 'Cantidades o unidades inválidas' : '';
      if (reason) {
        const missingKey = JSON.stringify([component.catalogItemId, component.name, reason]);
        const item = missing.get(missingKey) ?? { name: component.name, portions: 0, reason };
        item.portions++;
        missing.set(missingKey, item);
        continue;
      }
      for (const ingredient of recipe!.ingredients) {
        const normalized = ingredient.unit.trim().toLowerCase();
        const conversion = units[normalized] ?? { unit: normalized, factor: 1 };
        const needKey = JSON.stringify([ingredient.ingredientId, conversion.unit]);
        const need = needs.get(needKey) ?? { ingredientId: ingredient.ingredientId, name: ingredient.name, category: ingredient.category, unit: conversion.unit, quantity: 0 };
        need.quantity += ingredient.quantity * conversion.factor / recipe!.yield!;
        needs.set(needKey, need);
      }
    }
  }
  return {
    weekStart, meals,
    groups: [...groups.values()].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'es')),
    containers: [...containers.values()],
    // Round up only once after summing, to avoid short buying for tiny quantities.
    shopping: [...needs.values()].map(item => ({ ...item, quantity: Math.ceil(Number(item.quantity.toFixed(9)) * 1000) / 1000 })).sort((a, b) => a.category.localeCompare(b.category, 'es') || a.name.localeCompare(b.name, 'es') || a.unit.localeCompare(b.unit)),
    missingRecipes: [...missing.values()],
  };
}
