import { z } from 'zod';
import { DAY_OF_WEEK_VALUES, SLOT_TYPE_VALUES, type ComponentRoleValue, type DayOfWeek, type DishConflict, type SlotTypeValue } from './types';
import type { DeliveryPlanRule } from '../utils/orderDeliveries';

export const orderSecretSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const customerContactSchema = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre').max(160),
  telefono: z.string().trim().min(10, 'Escribe un teléfono válido').max(24).regex(/^\+?[\d\s()-]+$/, 'Escribe un teléfono válido')
    .refine(value => { const digits = value.replace(/\D/g, '').length; return digits >= 10 && digits <= 15 }, 'Escribe un teléfono de 10 a 15 dígitos'),
  correoElectronico: z.union([z.literal(''), z.email().max(254)]).default(''),
});
export const customerOrderInputSchema = z.object({
  menuId: z.string().min(1).max(100),
  planVariantId: z.uuid(),
  offerVersion: z.number().int().positive(),
  offerRevision: z.string().regex(/^[a-f0-9]{64}$/),
  expectedPrice: z.number().nonnegative(),
  contact: customerContactSchema,
  days: z.array(z.enum(DAY_OF_WEEK_VALUES)).min(1).max(7).refine(days => new Set(days).size === days.length),
  meals: z.array(z.object({
    dayOfWeek: z.enum(DAY_OF_WEEK_VALUES), slotType: z.enum(SLOT_TYPE_VALUES),
    notes: z.string().trim().max(500).default(''),
    components: z.array(z.object({ originalId: z.uuid(), selectedId: z.uuid() }).strict()).min(1).max(12),
  }).strict()).min(1).max(35),
  deliveries: z.array(z.object({
    sequence: z.union([z.literal(1), z.literal(2)]),
    deliveryDay: z.enum(DAY_OF_WEEK_VALUES),
    address: z.string().trim().min(8, 'Escribe la dirección completa').max(1000),
  }).strict()).min(1).max(2),
  notes: z.string().trim().max(1000).default(''),
}).strict();
export type CustomerOrderInput = z.infer<typeof customerOrderInputSchema>;
export interface PublicDish {
  id: string; nombre: string; descripcion: string; calorias: number; imagen: string;
  componentRole: ComponentRoleValue; dayOfWeek: DayOfWeek; slotType: SlotTypeValue;
  conflict: DishConflict;
}
export interface CustomerOffer {
  revision: string;
  menu: { id: string; name: string; version: number };
  cycle: DeliveryPlanRule & { id: string; weekStart: string; orderCutoffAt: string };
  variant: { id: string; title: string; planTitle: string; daysCount: number; price: number; slotTypes: SlotTypeValue[] };
  availableDays: DayOfWeek[];
  options: PublicDish[];
  slots: Array<{ dayOfWeek: DayOfWeek; slotType: SlotTypeValue; components: Array<{ originalId: string; selectedId: string; componentRole: ComponentRoleValue; position: number }> }>;
  contact: z.infer<typeof customerContactSchema> | null;
}
export interface PrivateCustomerOrder {
  folio: number; status: string; planTitle: string; variantTitle: string; price: number;
  contact: z.infer<typeof customerContactSchema>; notes: string; expiresAt: string;
  deliveries: Array<{ sequence: number; date: string; address: string; status: string }>;
  meals: Array<{ dayOfWeek: DayOfWeek; slotType: SlotTypeValue; notes: string; dishes: string[] }>;
}
