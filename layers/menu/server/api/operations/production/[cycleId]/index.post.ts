import { createProductionRun } from '~~/layers/menu/server/utils/production';
import { requireUuidParam } from '../../../../utils/routeParams';

export default defineEventHandler(async event => createProductionRun(requireUuidParam(event, 'cycleId', 'de la semana'), await readBody(event), event.context.orderActor));
