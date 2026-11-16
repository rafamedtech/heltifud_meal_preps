import { getCustomerExclusions } from '../../../utils/orderPersonalization';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del cliente es obligatorio.' });
  return getCustomerExclusions(id);
});
