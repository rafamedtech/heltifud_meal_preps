import { getShoppingList } from '~~/layers/menu/server/utils/production';

export default defineEventHandler(async event => getShoppingList(getRouterParam(event, 'runId') ?? ''));
