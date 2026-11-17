import { getAccounts } from '~~/layers/menu/server/utils/payments';

export default defineEventHandler(async event => getAccounts(getQuery(event)));
