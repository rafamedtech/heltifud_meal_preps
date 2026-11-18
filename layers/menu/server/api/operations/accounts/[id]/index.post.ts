import { registerPayment } from '~~/layers/menu/server/utils/payments';
import { requireUuidParam } from '../../../../utils/routeParams';

export default defineEventHandler(async event => registerPayment(requireUuidParam(event, 'id', 'del pedido'), await readBody(event), event.context.orderActor));
