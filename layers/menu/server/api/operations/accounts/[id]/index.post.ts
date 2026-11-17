import { registerPayment } from '~~/layers/menu/server/utils/payments';

export default defineEventHandler(async event => registerPayment(getRouterParam(event, 'id') ?? '', await readBody(event), event.context.orderActor));
