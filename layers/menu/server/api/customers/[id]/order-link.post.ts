import { z } from 'zod';
import { issueCustomerOrderInvitation } from '../../../utils/orderAccess';
export default defineEventHandler(event => {
  const id = z.uuid().safeParse(getRouterParam(event, 'id'));
  if (!id.success) throw createError({ statusCode: 400, statusMessage: 'Cliente no válido.' });
  return issueCustomerOrderInvitation(id.data);
});
