import { updateDeliveryOperation } from '~~/layers/menu/server/utils/operations';

export default defineEventHandler(async event => updateDeliveryOperation(getRouterParam(event, 'id') ?? '', await readBody(event), event.context.orderActor));
