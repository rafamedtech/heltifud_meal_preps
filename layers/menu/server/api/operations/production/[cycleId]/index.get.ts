import { getProductionRuns } from '~~/layers/menu/server/utils/production';

export default defineEventHandler(async event => getProductionRuns(getRouterParam(event, 'cycleId') ?? ''));
