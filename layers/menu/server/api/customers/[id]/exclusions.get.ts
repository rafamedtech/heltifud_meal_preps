import { getCustomerExclusions } from '../../../utils/orderPersonalization';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler((event) => {
  const id = requireUuidParam(event, 'id', 'del cliente');
  return getCustomerExclusions(id);
});
