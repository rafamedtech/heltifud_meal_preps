import { createHash, randomBytes } from 'node:crypto';
import { createError } from 'h3';
import type { Prisma } from '../../generated/prisma/client';
import { orderSecretSchema } from '../../shared/types/customerOrder';
import { prisma } from './prisma';

export const hashOrderSecret = (token: string) => createHash('sha256').update(token).digest('hex');
export function parseOrderSecret(token: unknown) {
  const parsed = orderSecretSchema.safeParse(token);
  if (!parsed.success) throw createError({ statusCode: 404, statusMessage: 'El enlace no está disponible o venció.' });
  return parsed.data;
}
export async function resolveOrderAccess(client: Pick<Prisma.TransactionClient, 'orderAccessLink'>, token: string) {
  const link = await client.orderAccessLink.findUnique({ where: { tokenHash: hashOrderSecret(parseOrderSecret(token)) } });
  if (!link || link.revokedAt || link.expiresAt.getTime() <= Date.now()) {
    throw createError({ statusCode: 404, statusMessage: 'El enlace no está disponible o venció.' });
  }
  return link;
}
/** Admin-issued invitation. Grants configuration for one customer, never a customer search. */
export async function issueCustomerOrderInvitation(customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await prisma.$transaction(async tx => {
    await tx.orderAccessLink.updateMany({ where: { customerId, orderId: null, revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.orderAccessLink.create({ data: { customerId, tokenHash: hashOrderSecret(token), expiresAt } });
  });
  return { path: `/pedido#invitacion=${token}`, expiresAt: expiresAt.toISOString() };
}
export async function revokeOrderLinks(orderId: string) {
  await prisma.orderAccessLink.updateMany({ where: { orderId, revokedAt: null }, data: { revokedAt: new Date() } });
  return { revoked: true };
}
