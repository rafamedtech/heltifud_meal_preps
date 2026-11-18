import { getCustomerById } from '../../../utils/customers';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler((event) => {
  const id = requireUuidParam(event, 'id', 'del cliente');

  return getCustomerById(id);
});
