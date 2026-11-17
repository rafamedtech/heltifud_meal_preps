import { prisma } from '../../../utils/prisma';
export default defineEventHandler(async event => {
  await prisma.orderAccessLink.updateMany({ where: { customerId: getRouterParam(event, 'id'), orderId: null, revokedAt: null }, data: { revokedAt: new Date() } });
  return { revoked: true };
});
