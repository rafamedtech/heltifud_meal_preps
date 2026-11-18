import { getOrderPersonalization } from '../../../utils/orderPersonalization';
import { requireUuidParam } from '../../../utils/routeParams';

// Dishes of the week's menu each place of the order can take, and how they fit the customer's exclusions.
export default defineEventHandler((event) => {
  const id = requireUuidParam(event, 'id', 'del pedido');
  return getOrderPersonalization(id);
});
