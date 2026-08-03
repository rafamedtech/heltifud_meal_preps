import { createError } from 'h3';

import { customerInputSchema, customerListQuerySchema } from '~~/layers/menu/shared/types/menuSchema';
import type { Customer, CustomerInput, CustomerListResponse } from '~~/layers/menu/shared/types/types';

import { prisma } from './prisma';

type CustomerCursor = { nombre: string; id: string };

function mapCustomer(customer: {
  id: string;
  nombre: string;
  telefono: string;
  ubicacion1: string;
  ubicacion2: string | null;
  correoElectronico: string | null;
  source: string;
  status: string;
  tipoCliente: string;
  createdAt: Date;
  updatedAt: Date;
}): Customer {
  return {
    ...customer,
    ubicacion2: customer.ubicacion2 ?? '',
    correoElectronico: customer.correoElectronico ?? '',
    source: customer.source as Customer['source'],
    status: customer.status as Customer['status'],
    tipoCliente: customer.tipoCliente as Customer['tipoCliente'],
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

function validateInput(input: CustomerInput) {
  const parsed = customerInputSchema.safeParse(input);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Los datos del cliente no son válidos.',
      data: parsed.error.flatten(),
    });
  }

  return {
    ...parsed.data,
    ubicacion2: parsed.data.ubicacion2 || null,
    correoElectronico: parsed.data.correoElectronico.toLowerCase() || null,
  };
}

function encodeCursor(customer: { nombre: string; id: string }) {
  return Buffer.from(JSON.stringify({ nombre: customer.nombre, id: customer.id }), 'utf8').toString('base64url');
}

function decodeCursor(cursor: string): CustomerCursor {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<CustomerCursor>;

    if (typeof parsed.nombre !== 'string' || typeof parsed.id !== 'string') {
      throw new Error('Invalid cursor');
    }

    return { nombre: parsed.nombre, id: parsed.id };
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'El cursor de paginación no es válido.' });
  }
}

export async function getCustomers(query: unknown): Promise<CustomerListResponse> {
  const parsed = customerListQuerySchema.safeParse(query);

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Los filtros no son válidos.' });
  }

  const { q, source, status, tipoCliente, cursor, limit } = parsed.data;
  const after = cursor ? decodeCursor(cursor) : null;
  const rows = await prisma.customer.findMany({
    where: {
      ...(source ? { source } : {}),
      ...(status ? { status } : {}),
      ...(tipoCliente ? { tipoCliente } : {}),
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: 'insensitive' } },
              { telefono: { contains: q } },
              { correoElectronico: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(after
        ? {
            AND: [{ OR: [{ nombre: { gt: after.nombre } }, { nombre: after.nombre, id: { gt: after.id } }] }],
          }
        : {}),
    },
    orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  return {
    items: items.map(mapCustomer),
    nextCursor: hasMore && items.length ? encodeCursor(items[items.length - 1]!) : null,
  };
}

export async function createCustomer(input: CustomerInput) {
  return mapCustomer(await prisma.customer.create({ data: validateInput(input) }));
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const existing = await prisma.customer.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });
  }

  return mapCustomer(await prisma.customer.update({ where: { id }, data: validateInput(input) }));
}

export async function deleteCustomer(id: string) {
  const existing = await prisma.customer.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });
  }

  await prisma.customer.delete({ where: { id } });
  return { id };
}
