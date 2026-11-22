import { prisma } from '../../../utils/prisma';
import { requireUuidParam } from '../../../utils/routeParams';
export default defineEventHandler(async event => {
  await prisma.orderAccessLink.updateMany({ where: { customerId: requireUuidParam(event, 'id', 'del cliente'), orderId: null, revokedAt: null }, data: { revokedAt: new Date() } });
  return { revoked: true };
});
