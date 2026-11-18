import type { CustomerExclusionsInput } from '~~/layers/menu/shared/types/types';

import { replaceCustomerExclusions } from '../../../utils/orderPersonalization';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id', 'del cliente');
  return replaceCustomerExclusions(id, await readBody<CustomerExclusionsInput>(event));
});
