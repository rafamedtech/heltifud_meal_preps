import { getProductionRuns } from '~~/layers/menu/server/utils/production';
import { requireUuidParam } from '../../../../utils/routeParams';

export default defineEventHandler(async event => getProductionRuns(requireUuidParam(event, 'cycleId', 'de la semana')));
