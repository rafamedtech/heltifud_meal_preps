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
  preparacion: string;
  ingredientes: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

export type FoodCatalogItemInput = Omit<FoodItemDetail, 'catalogItemId'> & {
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

export interface OrderCreateInput {
  customerId: string;
  planVariantId: string;
  firstDeliveryDate: string;
  firstDeliveryLocation: CustomerLocationNumber;
  secondDeliveryDate: string;
  secondDeliveryLocation: CustomerLocationNumber;
  notes: string;
}

export interface OrderMenuComponentInput {
  catalogItemId: string | null;
  componentRole: ComponentRoleValue;
  position: number;
  nombre: string;
  descripcion: string;
  calorias: number;
  imagen: string;
  tipo: string;
}

export interface OrderMenuSlotInput {
  dayOfWeek: DayOfWeek;
  dayOrder: number;
  slotType: SlotTypeValue;
  contenedor: string;
  components: OrderMenuComponentInput[];
}

export interface OrderUpdateInput {
  status: OrderStatusValue;
  firstDeliveryDate: string;
  firstDeliveryLocation: CustomerLocationNumber;
  secondDeliveryDate: string;
  secondDeliveryLocation: CustomerLocationNumber;
  notes: string;
  menuSlots: OrderMenuSlotInput[];
}

export interface OrderMenuComponent extends OrderMenuComponentInput {
  id: string;
}

export interface OrderMenuSlot extends Omit<OrderMenuSlotInput, 'components'> {
  id: string;
  components: OrderMenuComponent[];
}

export interface OrderListItem {
  id: string;
  status: OrderStatusValue;
  customerId: string;
  customerName: string;
  customerPhone: string;
  planTitle: string;
  planVariantTitle: string;
  price: number;
  firstDeliveryDate: string;
  firstDeliveryAddress: string;
  secondDeliveryDate: string;
  secondDeliveryAddress: string;
  createdAt: string;
}

export interface Order extends OrderListItem {
  planVariantId: string | null;
  sourceWeeklyMenuId: string | null;
  sourceWeeklyMenuName: string | null;
  firstDeliveryLocation: CustomerLocationNumber;
  secondDeliveryLocation: CustomerLocationNumber;
  notes: string;
  updatedAt: string;
  customer: Customer;
  menuSlots: OrderMenuSlot[];
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

export interface WeeklyMenu {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  name: string;
  days: DayMenu[];
}

export interface WeeklyMenuInput {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  days: DayMenu[];
}
