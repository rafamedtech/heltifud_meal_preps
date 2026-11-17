import { z } from 'zod';
import type { DeliveryStatusValue } from './types';

export const PAYMENT_METHOD_VALUES = ['CASH', 'TRANSFER', 'CARD', 'CREDIT'] as const;
export type PaymentMethodValue = (typeof PAYMENT_METHOD_VALUES)[number];
// CREDIT is the customer's store credit ("saldo a favor"): a refund with it adds
// to the credit and a payment with it spends the credit.
export const paymentMethods = [
  { label: 'Efectivo', value: 'CASH' },
  { label: 'Transferencia', value: 'TRANSFER' },
  { label: 'Tarjeta (cobro externo)', value: 'CARD' },
  { label: 'Saldo a favor', value: 'CREDIT' },
] as const;
export const paymentInputSchema = z.object({
  kind: z.enum(['PAYMENT', 'REFUND']),
  amount: z.number().positive().max(99999999.99).refine(value => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001, 'Usa como máximo dos decimales.'),
  method: z.enum(PAYMENT_METHOD_VALUES),
  reference: z.string().trim().max(200).default(''),
  reason: z.string().trim().min(1, 'Indica el motivo del movimiento.').max(500),
  receivedAt: z.iso.date(),
  idempotencyKey: z.uuid(),
});
export type PaymentInput = z.infer<typeof paymentInputSchema>;
export interface PaymentEntry extends Omit<PaymentInput, 'idempotencyKey'> {
  id: string;
  actorLabel: string | null;
  createdAt: string;
}
export interface Account {
  id: string;
  folio: number;
  customerName: string;
  status: string;
  total: number;
  paid: number;
  balance: number;
  refundable: number;
}
export interface AccountsResponse {
  items: Account[];
  total: number;
  page: number;
  summary: { balance: number; paid: number; refundable: number };
}
export interface PaymentDetail {
  account: Account;
  entries: PaymentEntry[];
  /** Store credit the customer can spend on this or other orders. */
  customerCredit: number;
}
export interface ProductionMeal {
  orderId: string;
  folio: number;
  customer: string;
  deliveryId: string;
  deliverySequence: number;
  scheduledDate: string;
  address: string;
  dayOfWeek: string;
  slotType: string;
  container: string;
  notes: string;
  orderNotes: string;
  // Current exclusions are retained as warnings at the time of consolidation.
  exclusions: string[];
  components: Array<{ catalogItemId: string | null; name: string; role: string; position: number; substitution: boolean }>;
}
export interface ProductionGroup {
  date: string;
  slotType: string;
  name: string;
  role: string;
  portions: number;
}
export interface ShoppingNeed {
  ingredientId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
}
export interface ProductionSnapshot {
  weekStart: string;
  meals: ProductionMeal[];
  groups: ProductionGroup[];
  containers: Array<{ date: string; container: string; count: number }>;
  shopping: ShoppingNeed[];
  missingRecipes: Array<{ name: string; portions: number; reason: string }>;
}
export interface ProductionRunDto {
  id: string;
  cycleId: string;
  createdAt: string;
  actorLabel: string | null;
  stale: boolean;
  snapshot: ProductionSnapshot;
}
export interface ShoppingListDto {
  id: string;
  version: number;
  items: Array<ShoppingNeed & { id: string; purchased: boolean; expenseId: string | null; updatedBy: string | null }>;
}
export interface DeliveryBoardItem {
  id: string;
  orderId: string;
  version: number;
  folio: number;
  customer: string;
  phone: string;
  sequence: number;
  date: string;
  address: string;
  status: DeliveryStatusValue;
  orderStatus: string;
  meals: number;
  balance: number;
  assignedTo: string;
  incident: string;
  deliveryNotes: string;
  evidenceUrl: string;
  activities: Array<{ id: string; actorLabel: string | null; createdAt: string; details: Record<string, unknown> }>;
}
export const deliveryOperationSchema = z.object({
  version: z.number().int().positive(),
  assignedTo: z.string().trim().max(120),
  incident: z.string().trim().max(1000),
  evidenceUrl: z.union([z.literal(''), z.url().max(2000).refine(value => value.startsWith('https://'), 'Usa un enlace HTTPS.')]),
});
export interface OperationsDashboard {
  today: string;
  pendingConfirmation: number;
  deliveriesToday: number;
  overdue: number;
  failed: number;
  balance: number;
  refundable: number;
}
