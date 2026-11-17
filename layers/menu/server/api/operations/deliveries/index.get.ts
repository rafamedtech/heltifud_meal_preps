import { getDeliveryBoard } from '~~/layers/menu/server/utils/operations';

export default defineEventHandler(async event => getDeliveryBoard(getQuery(event)));
