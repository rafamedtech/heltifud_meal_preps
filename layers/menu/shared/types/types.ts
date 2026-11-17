export const DAY_OF_WEEK_VALUES = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
] as const;

export const SLOT_KEYS = ['desayuno', 'comida', 'cena', 'snack1', 'snack2'] as const;

export type DayOfWeek = (typeof DAY_OF_WEEK_VALUES)[number];
export type SlotKey = (typeof SLOT_KEYS)[number];

export const SLOT_TYPE_VALUES = ['DESAYUNO', 'COMIDA', 'CENA', 'SNACK1', 'SNACK2'] as const;
export const COMPONENT_ROLE_VALUES = ['PLATILLO_PRINCIPAL', 'GUARNICION_1', 'GUARNICION_2', 'ADICIONAL'] as const;

export type SlotTypeValue = (typeof SLOT_TYPE_VALUES)[number];
export type ComponentRoleValue = (typeof COMPONENT_ROLE_VALUES)[number];

export interface WeeklyPlan {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  variants: {
    title: string;
    price: string;
  }[];
  button: {
    label: string;
    icon: string;
  };
}

export interface FoodItemDetail {
  catalogItemId?: string | null;
  nombre: string;
  descripcion: string;
  calorias: number;
  imagen: string;
  tipo: string;
}

export interface Ingredient {
  id: string;
  nombre: string;
  categoria: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientInput {
  nombre: string;
  categoria: string;
}

export interface RecipeIngredientInput {
  ingredientId: string;
  cantidad: number;
  unidad: string;
}

export interface RecipeIngredient extends RecipeIngredientInput {
  id: string;
  orden: number;
  ingredient: Ingredient;
}

export interface FoodCatalogItem extends Omit<FoodItemDetail, 'catalogItemId'> {
  id: string;
  recipeYield?: number | null;
  preparacion: string;
  ingredientes: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

export type FoodCatalogItemInput = Omit<FoodItemDetail, 'catalogItemId'> & {
  recipeYield?: number | null;
  preparacion: string;
  ingredientes: RecipeIngredientInput[];
};

export const CUSTOMER_SOURCE_VALUES = [
  'whatsapp',
  'instagram',
  'facebook',
  'sitio_web',
  'recomendacion',
  'otro',
] as const;

export const CUSTOMER_STATUS_VALUES = ['prospecto', 'activo', 'inactivo'] as const;
export const CUSTOMER_TYPE_VALUES = ['menu', 'vegetariano', 'dieta'] as const;

export type CustomerSource = (typeof CUSTOMER_SOURCE_VALUES)[number];
export type CustomerStatus = (typeof CUSTOMER_STATUS_VALUES)[number];
export type CustomerType = (typeof CUSTOMER_TYPE_VALUES)[number];

export interface CustomerInput {
  firstDeliveryDay?: DayOfWeek | null;
  secondDeliveryDay?: DayOfWeek | null;
  nombre: string;
  telefono: string;
  ubicacion1: string;
  ubicacion2: string;
  correoElectronico: string;
  source: CustomerSource;
  status: CustomerStatus;
  tipoCliente: CustomerType;
}

export interface Customer extends CustomerInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  items: Customer[];
  nextCursor: string | null;
}

export interface PlanVariantInput {
  id?: string;
  title: string;
  daysCount: number;
  price: number;
  isActive: boolean;
}

export interface PlanInput {
  title: string;
  description: string;
  image: string;
  slotTypes: SlotTypeValue[];
  isActive: boolean;
  variants: PlanVariantInput[];
}

export interface PlanVariant extends Omit<PlanVariantInput, 'id'> {
  id: string;
  /** Orders sold under this variant. Only the admin listing includes it. */
  orderCount?: number;
}

export interface Plan extends Omit<PlanInput, 'variants'> {
  id: string;
  variants: PlanVariant[];
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_VALUES = [
  'DRAFT',
  'CONFIRMED',
  'PREPARING',
  'PARTIALLY_DELIVERED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];
export type CustomerLocationNumber = 1 | 2;

export const DELIVERY_STATUS_VALUES = [
  'PENDING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED',
] as const;

export type DeliveryStatusValue = (typeof DELIVERY_STATUS_VALUES)[number];
export type DeliverySequence = 1 | 2;

export interface OrderDeliveryInput {
  sequence: DeliverySequence;
  /** Civil date, `YYYY-MM-DD`. */
  scheduledDate: string;
  locationNumber: CustomerLocationNumber;
}

export interface OrderDelivery extends OrderDeliveryInput {
  id: string;
  /** Address frozen when the delivery was created or its location last changed. */
  address: string;
  status: DeliveryStatusValue;
  deliveredAt: string | null;
  notes: string;
}

/** Choice for one delivery when creating an order; the date comes from the week. */
export interface OrderCreateDeliveryInput {
  sequence: DeliverySequence;
  deliveryDay: DayOfWeek;
  locationNumber: CustomerLocationNumber;
}

export interface OrderCreateInput {
  customerId: string;
  planVariantId: string;
  /** Days of the week ordered; as many as the plan variant sells. */
  days: DayOfWeek[];
  /** Optional per delivery: the customer's preference and main address apply otherwise. */
  deliveries: OrderCreateDeliveryInput[];
  notes: string;
  /** Menu version shown while configuring; a newer one is rejected with 409. */
  offerVersion: number;
}

/** What can be ordered for a customer and plan in the week taking orders. */
export interface OrderOptions {
  cycle: {
    id: string;
    weekStart: string;
    orderCutoffAt: string;
    pastCutoff: boolean;
    firstDeliveryAllowedDays: DayOfWeek[];
    secondDeliveryAllowedDays: DayOfWeek[];
    firstDeliveryMealDays: DayOfWeek[];
    secondDeliveryMealDays: DayOfWeek[];
  };
  /** `version` is the offer version the order must be sent with. */
  menu: { id: string; name: string; version: number };
  daysCount: number;
  /** Days with a main dish in every meal time of the plan. */
  availableDays: DayOfWeek[];
}

/** Saved dish of an order meal. */
export interface OrderMenuComponentData {
  catalogItemId: string | null;
  componentRole: ComponentRoleValue;
  position: number;
  nombre: string;
  descripcion: string;
  calorias: number;
  imagen: string;
  tipo: string;
  /** Place of the current dish in the week's menu; null when added by hand. */
  sourceDayOfWeek?: DayOfWeek | null;
  sourceSlotType?: SlotTypeValue | null;
  /** The dish differs from the one the menu puts in this place. */
  isSubstitution?: boolean;
}

/**
 * One place of a meal on update. The place (role and position) is fixed; the
 * dish is either the one already saved (`orderComponentId`) or an option of
 * the week's menu (`menuComponentId`). The server copies the dish data.
 */
export interface OrderMenuComponentInput {
  componentRole: ComponentRoleValue;
  position: number;
  orderComponentId?: string;
  menuComponentId?: string;
}

export interface OrderMenuSlotInput {
  dayOfWeek: DayOfWeek;
  dayOrder: number;
  slotType: SlotTypeValue;
  contenedor: string;
  components: OrderMenuComponentInput[];
}

export interface OrderUpdateInput {
  version: number;
  deliveries: OrderDeliveryInput[];
  notes: string;
  menuSlots: OrderMenuSlotInput[];
  /** Menu version of the options used; a newer one is rejected with 409. */
  offerVersion: number;
}

export interface OrderMenuComponent extends OrderMenuComponentData {
  id: string;
}

export interface OrderMenuSlot extends Omit<OrderMenuSlotInput, 'components'> {
  notes?: string;
  id: string;
  /** Delivery that carries this meal. */
  deliverySequence: DeliverySequence;
  components: OrderMenuComponent[];
}

export interface OrderListItem {
  id: string;
  folio: number;
  /** Monday (`YYYY-MM-DD`) of the week of service. */
  weekStart: string;
  status: OrderStatusValue;
  customerId: string;
  customerName: string;
  customerPhone: string;
  planTitle: string;
  planVariantTitle: string;
  price: number;
  /** Ordered by `sequence`. */
  deliveries: OrderDelivery[];
  createdAt: string;
}

export interface Order extends OrderListItem {
  version: number;
  cycleStatus: CycleStatusValue;
  deliveryDateOptions: Partial<Record<DeliverySequence, string[]>>;
  statusEvents: OrderStatusEvent[];
  cycleId: string;
  capturedAfterCutoff: boolean;
  planVariantId: string | null;
  sourceWeeklyMenuId: string | null;
  sourceWeeklyMenuName: string | null;
  notes: string;
  updatedAt: string;
  customer: Customer;
  menuSlots: OrderMenuSlot[];
  offerVersion: number;
  menuChanges: OrderMenuChange[];
}

export const MENU_CHANGE_KIND_VALUES = ['SUSTITUCION', 'RESTAURACION', 'AUTOMATICA'] as const;
export type MenuChangeKindValue = (typeof MENU_CHANGE_KIND_VALUES)[number];

/** A dish swap recorded on an order. */
export interface OrderMenuChange {
  id: string;
  orderVersion: number;
  kind: MenuChangeKindValue;
  dayOfWeek: DayOfWeek;
  slotType: SlotTypeValue;
  componentRole: ComponentRoleValue;
  position: number;
  fromNombre: string;
  toNombre: string;
  reason: string;
  actorLabel: string | null;
  createdAt: string;
}

export const EXCLUSION_KIND_VALUES = ['ALERGIA', 'INGREDIENTE', 'PLATILLO'] as const;
export type ExclusionKindValue = (typeof EXCLUSION_KIND_VALUES)[number];

/** Allergy or exclusion the system applies on its own to the customer's orders. */
export interface CustomerExclusion {
  id: string;
  kind: ExclusionKindValue;
  ingredientId: string | null;
  catalogItemId: string | null;
  /** Ingredient or dish name. */
  label: string;
}

export interface CustomerExclusionsInput {
  allergyIngredientIds: string[];
  ingredientIds: string[];
  catalogItemIds: string[];
}

/**
 * How a dish fits the customer's exclusions. `unverified`: the customer has
 * allergies and the dish has no recipe to check them against.
 */
export type DishConflict =
  | { status: 'ok' }
  | { status: 'excluded' | 'unverified'; reasons: string[] };

/** A dish of the week's menu that can take a place of the order. */
export interface OrderMenuOption {
  /** Menu component id; valid for `OrderPersonalization.menu.version`. */
  id: string;
  componentRole: ComponentRoleValue;
  dayOfWeek: DayOfWeek;
  slotType: SlotTypeValue;
  catalogItemId: string | null;
  nombre: string;
  descripcion: string;
  calorias: number;
  imagen: string;
  tipo: string;
  conflict: DishConflict;
}

/** What the order editor needs to swap and restore dishes. */
export interface OrderPersonalization {
  /** Null when the source menu no longer exists: dishes can only be kept. */
  menu: { id: string; name: string; version: number } | null;
  /** The menu changed since the order meals were last saved. */
  menuChanged: boolean;
  options: OrderMenuOption[];
  /** Place key (`orderPlaceKey`) → option the menu puts there. */
  originals: Record<string, string>;
  /** Saved order component id → fit with the exclusions. */
  componentConflicts: Record<string, DishConflict>;
  exclusions: CustomerExclusion[];
}

export interface OrderActor { id: string; label: string }
export interface OrderStatusInput { version: number; status: OrderStatusValue; reason: string }
export interface DeliveryStatusInput { version: number; status: DeliveryStatusValue; reason: string }
export interface OrderStatusEvent {
  id: string;
  version: number;
  fromStatus: OrderStatusValue | null;
  toStatus: OrderStatusValue;
  deliverySequence: number | null;
  fromDeliveryStatus: DeliveryStatusValue | null;
  toDeliveryStatus: DeliveryStatusValue | null;
  actorId: string | null;
  actorLabel: string | null;
  reason: string;
  createdAt: string;
}

export interface OrderSummary {
  total: number;
  draft: number;
  confirmed: number;
  inProgress: number;
  delivered: number;
}

export interface OrderListResponse {
  items: OrderListItem[];
  summary: OrderSummary;
}

export const EXPENSE_CATEGORY_VALUES = [
  'insumos',
  'empaque',
  'nomina',
  'renta_servicios',
  'transporte',
  'marketing',
  'equipo',
  'otros',
] as const;

export const EXPENSE_PAYMENT_METHOD_VALUES = [
  'efectivo',
  'transferencia',
  'tarjeta',
  'otro',
] as const;

export const EXPENSE_TYPE_VALUES = ['fijo', 'variable'] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORY_VALUES)[number];
export type ExpensePaymentMethod = (typeof EXPENSE_PAYMENT_METHOD_VALUES)[number];
export type ExpenseType = (typeof EXPENSE_TYPE_VALUES)[number];

export interface ExpenseInput {
  description: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: ExpensePaymentMethod;
  expenseDate: string;
  vendor: string;
  billingReference1: string;
  billingReference2: string;
  expenseType: ExpenseType;
  isInvoiced: boolean;
  notes: string;
}

export interface Expense extends ExpenseInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  average: number;
  currentMonthTotal: number;
  previousMonthTotal: number;
}

export interface ExpenseListResponse {
  items: Expense[];
  nextCursor: string | null;
  summary: ExpenseSummary;
}

export interface MenuSlot {
  platilloPrincipal: FoodItemDetail;
  guarnicion1?: FoodItemDetail | null;
  guarnicion2?: FoodItemDetail | null;
  contenedor?: string | null;
  adicionales: FoodItemDetail[];
}

export interface DayMenu {
  dayOfWeek: DayOfWeek;
  desayuno: MenuSlot;
  comida: MenuSlot;
  cena: MenuSlot;
  snack1: MenuSlot;
  snack2: MenuSlot;
}

export const MENU_TYPE_VALUES = ['ESTANDAR', 'VEGETARIANO', 'PERSONALIZADO'] as const;
export type MenuType = (typeof MENU_TYPE_VALUES)[number];
export const MENU_TYPE_OPTIONS: { label: string; value: MenuType }[] = [
  { label: 'Estándar', value: 'ESTANDAR' },
  { label: 'Vegetariano', value: 'VEGETARIANO' },
  { label: 'Personalizado', value: 'PERSONALIZADO' },
];

export const CYCLE_STATUS_VALUES = ['DRAFT', 'OPEN', 'CLOSED', 'IN_PRODUCTION', 'COMPLETED'] as const;
export type CycleStatusValue = (typeof CYCLE_STATUS_VALUES)[number];

export interface OperationSettingsInput {
  cutoffDay: DayOfWeek;
  cutoffTime: string;
  firstDeliveryAllowedDays: DayOfWeek[];
  secondDeliveryAllowedDays: DayOfWeek[];
  firstDeliveryMealDays: DayOfWeek[];
  secondDeliveryMealDays: DayOfWeek[];
}

export interface OperationSettings extends OperationSettingsInput {
  timeZone: string;
  updatedAt: string;
}

export interface WeeklyCycleMenuSummary {
  id: string;
  name: string;
  menuType: MenuType;
  customerId: string | null;
  customerName: string | null;
}

export interface WeeklyCycle {
  id: string;
  weekStart: string;
  status: CycleStatusValue;
  orderCutoffAt: string;
  firstDeliveryAllowedDays: DayOfWeek[];
  secondDeliveryAllowedDays: DayOfWeek[];
  firstDeliveryMealDays: DayOfWeek[];
  secondDeliveryMealDays: DayOfWeek[];
  menus: WeeklyCycleMenuSummary[];
}

export interface WeeklyCycleUpdateInput {
  status?: CycleStatusValue;
  orderCutoffAt?: string;
}

export interface WeeklyMenu {
  cycleId: string | null;
  cycleStatus: CycleStatusValue | null;
  weekStart: string | null;
  orderCutoffAt: string | null;
  customerId: string | null;
  customerName: string | null;
  menuType: MenuType;
  id: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  name: string;
  days: DayMenu[];
}

export interface WeeklyMenuInput {
  customerId?: string | null;
  menuType: MenuType;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  days: DayMenu[];
}
