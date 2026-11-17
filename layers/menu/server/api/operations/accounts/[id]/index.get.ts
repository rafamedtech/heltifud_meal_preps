import { getPayments } from '~~/layers/menu/server/utils/payments';

export default defineEventHandler(async event => getPayments(getRouterParam(event, 'id') ?? ''));
