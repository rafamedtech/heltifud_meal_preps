import type {
  ComponentRoleValue,
  CustomerExclusion,
  DayOfWeek,
  DishConflict,
  SlotTypeValue,
} from '../types/types';

/**
 * Personalisation rules shared by server and admin UI.
 *
 * - A place of an order (day, meal time, role, position) is fixed: the plan
 *   sells that many dishes and the price does not change.
 * - Its dish can be swapped for any dish of the week's menu with the same
 *   role family, from any day and any meal time the plan sells. The same
 *   dish may fill every place (decision of 16 Nov 2026).
 * - Allergies and exclusions of the customer are applied by the system.
 */

export type RoleFamily = 'principal' | 'guarnicion' | 'adicional';

export function roleFamily(role: ComponentRoleValue): RoleFamily {
  if (role === 'PLATILLO_PRINCIPAL') return 'principal';
  if (role === 'ADICIONAL') return 'adicional';
  return 'guarnicion';
}

export interface OrderPlace {
  dayOfWeek: DayOfWeek;
  slotType: SlotTypeValue;
  componentRole: ComponentRoleValue;
  position: number;
}

export function orderPlaceKey(place: OrderPlace) {
  return `${place.dayOfWeek}:${place.slotType}:${place.componentRole}:${place.position}`;
}

/**
 * Position of each component within its role, in the order given. Menu
 * components must come sorted the same way (role, then id) everywhere so a
 * place of the order always points to the same menu component.
 */
export function withRolePositions<T extends { componentRole: ComponentRoleValue }>(components: readonly T[]) {
  const positions = new Map<ComponentRoleValue, number>();
  return components.map((component) => {
    const position = positions.get(component.componentRole) ?? 0;
    positions.set(component.componentRole, position + 1);
    return { component, position };
  });
}

/** What is known about a dish to check exclusions; no ingredients = no recipe. */
export interface DishFacts {
  catalogItemId: string | null;
  ingredientIds: readonly string[];
}

type ExclusionRule = Pick<CustomerExclusion, 'kind' | 'ingredientId' | 'catalogItemId' | 'label'>;

export function dishConflict(dish: DishFacts, rules: readonly ExclusionRule[]): DishConflict {
  const reasons: string[] = [];
  for (const rule of rules) {
    if (rule.kind === 'PLATILLO') {
      if (dish.catalogItemId && rule.catalogItemId === dish.catalogItemId) reasons.push('Platillo excluido');
    } else if (rule.ingredientId && dish.ingredientIds.includes(rule.ingredientId)) {
      reasons.push(rule.kind === 'ALERGIA' ? `Alergia: ${rule.label}` : `Contiene ${rule.label}`);
    }
  }
  if (reasons.length) return { status: 'excluded', reasons };

  const allergies = rules.filter((rule) => rule.kind === 'ALERGIA');
  if (allergies.length && !dish.ingredientIds.length) {
    return { status: 'unverified', reasons: [`Sin receta para revisar: ${allergies.map((rule) => rule.label).join(', ')}`] };
  }
  return { status: 'ok' };
}

interface PickableOption {
  dayOfWeek: DayOfWeek;
  slotType: SlotTypeValue;
  componentRole: ComponentRoleValue;
  conflict: DishConflict;
}

/**
 * Dish the system puts in place of an excluded one: a fully compatible option
 * of the same role family, closest first (same meal time and day, same meal
 * time, same day, any). Options keep menu order within each rank.
 */
export function pickCompatibleOption<T extends PickableOption>(place: Omit<OrderPlace, 'position'>, options: readonly T[]) {
  const family = roleFamily(place.componentRole);
  const rank = (option: T) => (option.slotType === place.slotType ? 0 : 2) + (option.dayOfWeek === place.dayOfWeek ? 0 : 1);
  return options
    .filter((option) => option.conflict.status === 'ok' && roleFamily(option.componentRole) === family)
    .map((option, index) => ({ option, index }))
    .sort((a, b) => rank(a.option) - rank(b.option) || a.index - b.index)[0]?.option;
}
