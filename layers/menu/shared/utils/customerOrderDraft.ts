import { z } from 'zod';
import { orderSecretSchema, customerOrderInputSchema } from '../types/customerOrder';
import { DAY_OF_WEEK_VALUES } from '../types/types';

export const CUSTOMER_DRAFT_KEY = 'heltifud:customer-order:v1';
// Draft fields are validated independently from the completed submission so an
// incomplete contact or address can still be recovered.
export const draftStateSchema = z.object({
  version: z.literal(1), savedAt: z.number(), variantId: z.string(),
  menuType: z.enum(['ESTANDAR', 'VEGETARIANO']), invitation: z.string().max(64),
  token: orderSecretSchema, key: z.uuid(), menuId: z.string(), offerVersion: z.number(), offerRevision: z.string().default(''), expectedPrice: z.number(),
  days: z.array(z.enum(DAY_OF_WEEK_VALUES)).max(7),
  meals: z.array(z.object({ dayOfWeek: z.enum(DAY_OF_WEEK_VALUES), slotType: z.string(), notes: z.string().max(500),
    components: z.array(z.object({ originalId: z.string(), selectedId: z.string() })).max(12) })).max(35),
  contact: z.object({ nombre: z.string().max(160), telefono: z.string().max(24), correoElectronico: z.string().max(254) }),
  addresses: z.object({ 1: z.string().max(1000), 2: z.string().max(1000) }),
  deliveryDays: z.object({ 1: z.enum(DAY_OF_WEEK_VALUES).nullable(), 2: z.enum(DAY_OF_WEEK_VALUES).nullable() }),
  notes: z.string().max(1000), pending: customerOrderInputSchema.nullable(),
});
export type CustomerDraft = z.infer<typeof draftStateSchema>;
export function readCustomerDraft(raw: string | null, now = Date.now()): CustomerDraft | null {
  try {
    const result = draftStateSchema.safeParse(JSON.parse(raw ?? 'null'));
    if (!result.success || result.data.savedAt > now || now - result.data.savedAt > 7 * 86400000) return null;
    return result.data;
  } catch { return null; }
}
