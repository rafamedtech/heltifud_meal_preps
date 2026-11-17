import { z } from 'zod';
import { getCustomerOffer } from '../../utils/customerOrders';
export default defineEventHandler(async event => {
  const query = z.object({ variantId: z.uuid(), type: z.enum(['ESTANDAR', 'VEGETARIANO']).default('ESTANDAR') }).safeParse(getQuery(event));
  if (!query.success) throw createError({ statusCode: 400, statusMessage: 'Selecciona una variante de plan.' });
  return getCustomerOffer(query.data.variantId, query.data.type, getHeader(event, 'x-customer-invitation'));
});
