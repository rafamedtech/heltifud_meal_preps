import { createProductionRun } from '~~/layers/menu/server/utils/production';

export default defineEventHandler(async event => createProductionRun(getRouterParam(event, 'cycleId') ?? '', await readBody(event), event.context.orderActor));
