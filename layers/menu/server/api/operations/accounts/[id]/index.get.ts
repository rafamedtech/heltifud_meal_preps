import { getPayments } from '~~/layers/menu/server/utils/payments';
import { requireUuidParam } from '../../../../utils/routeParams';

export default defineEventHandler(async event => getPayments(requireUuidParam(event, 'id', 'del pedido')));
