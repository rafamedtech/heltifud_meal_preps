import type { CustomerExclusionsInput } from '~~/layers/menu/shared/types/types';

import { replaceCustomerExclusions } from '../../../utils/orderPersonalization';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'El id del cliente es obligatorio.' });
  return replaceCustomerExclusions(id, await readBody<CustomerExclusionsInput>(event));
});
