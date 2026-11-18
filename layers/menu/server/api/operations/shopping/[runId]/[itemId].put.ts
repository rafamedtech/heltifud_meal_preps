import { updateShoppingItem } from '~~/layers/menu/server/utils/production';
import { requireUuidParam } from '../../../../utils/routeParams';

export default defineEventHandler(async event => {
  const body = await readBody(event);
  // Linking expenses is financial data: operations staff can only mark purchases.
  if (event.context.staffRole !== 'admin' && body && typeof body === 'object' && 'expenseId' in body) {
    throw createError({ statusCode: 403, statusMessage: 'Solo administración puede vincular gastos.' });
  }
  return updateShoppingItem(requireUuidParam(event, 'runId', 'de la producción'), requireUuidParam(event, 'itemId', 'del artículo'), body, event.context.orderActor);
});
