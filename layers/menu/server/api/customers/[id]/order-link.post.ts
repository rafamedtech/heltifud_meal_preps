import { issueCustomerOrderInvitation } from '../../../utils/orderAccess';
import { requireUuidParam } from '../../../utils/routeParams';
export default defineEventHandler(event => {
  const id = requireUuidParam(event, 'id', 'del cliente');
  return issueCustomerOrderInvitation(id);
});
