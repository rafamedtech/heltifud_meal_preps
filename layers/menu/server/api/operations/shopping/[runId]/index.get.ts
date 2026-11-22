import { getShoppingList } from '~~/layers/menu/server/utils/production';
import { requireUuidParam } from '../../../../utils/routeParams';

export default defineEventHandler(async event => getShoppingList(requireUuidParam(event, 'runId', 'de la producción')));
