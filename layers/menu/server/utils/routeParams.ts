import type { H3Event } from 'h3';
import { z } from 'zod';

const uuid = z.uuid();

/**
 * Reads a route parameter that must be a record id. Every id in the schema is a
 * UUID, including the text columns of the menu catalogue. Rejecting malformed
 * values here returns 400 instead of letting PostgreSQL fail the uuid cast
 * (Prisma P2007, surfaced as a 500) or a text lookup answer a misleading 404.
 *
 * `subject` completes the message «El identificador {subject} no es válido.»,
 * e.g. 'del pedido'.
 */
export function requireUuidParam(event: H3Event, name: string, subject: string): string {
  const parsed = uuid.safeParse(getRouterParam(event, name));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: `El identificador ${subject} no es válido.` });
  }
  return parsed.data;
}
