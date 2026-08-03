import type { CustomerInput } from '~~/layers/menu/shared/types/types';

import { updateCustomer } from '../../../utils/customers';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'El id del cliente es obligatorio.' });
  }

  return updateCustomer(id, await readBody<CustomerInput>(event));
});
