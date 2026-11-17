import { updateShoppingItem } from '~~/layers/menu/server/utils/production';

export default defineEventHandler(async event => updateShoppingItem(getRouterParam(event, 'runId') ?? '', getRouterParam(event, 'itemId') ?? '', await readBody(event), event.context.orderActor));
