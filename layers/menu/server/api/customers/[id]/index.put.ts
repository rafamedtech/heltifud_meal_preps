import type { CustomerInput } from '~~/layers/menu/shared/types/types';

import { updateCustomer } from '../../../utils/customers';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del cliente');

  return updateCustomer(id, await readBody<CustomerInput>(event));
});
