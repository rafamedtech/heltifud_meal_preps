import { revokeOrderLinks } from '../../../utils/orderAccess';
import { requireUuidParam } from '../../../utils/routeParams';
export default defineEventHandler(event => revokeOrderLinks(requireUuidParam(event, 'id', 'del pedido')));
