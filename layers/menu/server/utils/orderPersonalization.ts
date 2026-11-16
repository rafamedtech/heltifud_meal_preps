import { createError } from 'h3';

import type { Prisma } from '~~/layers/menu/generated/prisma/client';
import { customerExclusionsInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import {
  SLOT_TYPE_VALUES,
  type CustomerExclusion,
  type CustomerExclusionsInput,
  type DishConflict,
  type OrderMenuOption,
  type OrderPersonalization,
  type SlotTypeValue,
} from '~~/layers/menu/shared/types/types';
import { dishConflict, orderPlaceKey, withRolePositions } from '~~/layers/menu/shared/utils/orderPersonalization';

import { prisma } from './prisma';

type Reader = Pick<Prisma.TransactionClient, 'customerExclusion' | 'recipeIngredient'>;

/** Menu days, slots and components in the order every place lookup relies on. */
export const personalizationMenuInclude = {
  days: {
    orderBy: { order: 'asc' as const },
    include: {
      slots: {
        include: {
          components: { orderBy: [{ componentRole: 'asc' as const }, { id: 'asc' as const }] },
        },
      },
    },
  },
};

type PersonalizationMenu = Prisma.WeeklyMenuGetPayload<{ include: typeof personalizationMenuInclude }>;

const slotRank = (slotType: string) => SLOT_TYPE_VALUES.indexOf(slotType as SlotTypeValue);

export async function loadExclusionRules(client: Reader, customerId: string): Promise<CustomerExclusion[]> {
  const rows = await client.customerExclusion.findMany({
    where: { customerId },
    include: { ingredient: { select: { nombre: true } }, catalogItem: { select: { nombre: true } } },
    orderBy: [{ kind: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
  });
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    ingredientId: row.ingredientId,
    catalogItemId: row.catalogItemId,
    label: row.ingredient?.nombre ?? row.catalogItem?.nombre ?? '',
  }));
}

/** Recipe ingredient ids per catalogue dish; dishes without recipe map to []. */
export async function loadRecipeFacts(client: Reader, catalogItemIds: Iterable<string | null>) {
  const ids = [...new Set([...catalogItemIds].filter((id): id is string => Boolean(id)))];
  const facts = new Map<string, string[]>(ids.map((id) => [id, []]));
  if (!ids.length) return facts;
  const rows = await client.recipeIngredient.findMany({
    where: { foodCatalogItemId: { in: ids } },
    select: { foodCatalogItemId: true, ingredientId: true },
  });
  rows.forEach((row) => facts.get(row.foodCatalogItemId)?.push(row.ingredientId));
  return facts;
}

export function conflictOf(catalogItemId: string | null, facts: Map<string, string[]>, rules: CustomerExclusion[]): DishConflict {
  return dishConflict({ catalogItemId, ingredientIds: catalogItemId ? facts.get(catalogItemId) ?? [] : [] }, rules);
}

/** Every dish of the menu in a meal time the order sells, in menu order. */
export function buildMenuOptions(
  menu: PersonalizationMenu,
  soldSlotTypes: ReadonlySet<string>,
  rules: CustomerExclusion[],
  facts: Map<string, string[]>,
): OrderMenuOption[] {
  return menu.days.flatMap((day) => [...day.slots]
    .filter((slot) => soldSlotTypes.has(slot.slotType))
    .sort((a, b) => slotRank(a.slotType) - slotRank(b.slotType))
    .flatMap((slot) => slot.components.map((component) => ({
      id: component.id,
      componentRole: component.componentRole,
      dayOfWeek: day.dayOfWeek,
      slotType: slot.slotType,
      catalogItemId: component.catalogItemId,
      nombre: component.nombre,
      descripcion: component.descripcion,
      calorias: component.calorias,
      imagen: component.imagen,
      tipo: component.tipo,
      conflict: conflictOf(component.catalogItemId, facts, rules),
    }))));
}

/** Place of the order → menu component the menu puts there. */
export function menuOriginals(menu: PersonalizationMenu) {
  const originals = new Map<string, string>();
  menu.days.forEach((day) => day.slots.forEach((slot) => {
    withRolePositions(slot.components).forEach(({ component, position }) => {
      originals.set(orderPlaceKey({ dayOfWeek: day.dayOfWeek, slotType: slot.slotType, componentRole: component.componentRole, position }), component.id);
    });
  }));
  return originals;
}

export function menuCatalogItemIds(menu: PersonalizationMenu) {
  return menu.days.flatMap((day) => day.slots.flatMap((slot) => slot.components.map((component) => component.catalogItemId)));
}

export async function getOrderPersonalization(id: string): Promise<OrderPersonalization> {
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      customerId: true,
      offerVersion: true,
      sourceWeeklyMenuId: true,
      menuSlots: { select: { slotType: true, components: { select: { id: true, catalogItemId: true } } } },
    },
  });
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });

  const [rules, menu] = await Promise.all([
    loadExclusionRules(prisma, order.customerId),
    order.sourceWeeklyMenuId
      ? prisma.weeklyMenu.findUnique({ where: { id: order.sourceWeeklyMenuId }, include: personalizationMenuInclude })
      : null,
  ]);
  const saved = order.menuSlots.flatMap((slot) => slot.components);
  const facts = await loadRecipeFacts(prisma, [...(menu ? menuCatalogItemIds(menu) : []), ...saved.map((component) => component.catalogItemId)]);
  const sold = new Set<string>(order.menuSlots.map((slot) => slot.slotType));

  return {
    menu: menu ? { id: menu.id, name: menu.name, version: menu.version } : null,
    menuChanged: Boolean(menu && menu.version !== order.offerVersion),
    options: menu ? buildMenuOptions(menu, sold, rules, facts) : [],
    originals: menu ? Object.fromEntries(menuOriginals(menu)) : {},
    componentConflicts: Object.fromEntries(saved.map((component) => [component.id, conflictOf(component.catalogItemId, facts, rules)])),
    exclusions: rules,
  };
}

export async function getCustomerExclusions(customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });
  return loadExclusionRules(prisma, customerId);
}

/** Replaces the whole list; orders already saved are checked again on their next edit. */
export async function replaceCustomerExclusions(customerId: string, input: CustomerExclusionsInput) {
  const parsed = customerExclusionsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Las exclusiones no son válidas.', data: parsed.error.flatten() });
  }
  const { allergyIngredientIds, ingredientIds, catalogItemIds } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: customerId }, select: { id: true } });
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });

    // One query at a time: a transaction runs on a single connection.
    const allIngredients = [...allergyIngredientIds, ...ingredientIds];
    const ingredientCount = allIngredients.length ? await tx.ingredient.count({ where: { id: { in: allIngredients } } }) : 0;
    const itemCount = catalogItemIds.length ? await tx.foodCatalogItem.count({ where: { id: { in: catalogItemIds } } }) : 0;
    if (ingredientCount !== allIngredients.length || itemCount !== catalogItemIds.length) {
      throw createError({ statusCode: 400, statusMessage: 'Algún ingrediente o platillo ya no existe. Recarga la página.' });
    }

    await tx.customerExclusion.deleteMany({ where: { customerId } });
    await tx.customerExclusion.createMany({
      data: [
        ...allergyIngredientIds.map((ingredientId) => ({ customerId, kind: 'ALERGIA' as const, ingredientId })),
        ...ingredientIds.map((ingredientId) => ({ customerId, kind: 'INGREDIENTE' as const, ingredientId })),
        ...catalogItemIds.map((catalogItemId) => ({ customerId, kind: 'PLATILLO' as const, catalogItemId })),
      ],
    });
  });

  return loadExclusionRules(prisma, customerId);
}
