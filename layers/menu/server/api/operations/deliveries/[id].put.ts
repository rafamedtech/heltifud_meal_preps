import { updateDeliveryOperation } from '~~/layers/menu/server/utils/operations';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async event => updateDeliveryOperation(requireUuidParam(event, 'id', 'de la entrega'), await readBody(event), event.context.orderActor));
