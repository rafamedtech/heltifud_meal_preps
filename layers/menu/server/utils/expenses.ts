import { createError } from 'h3';

import { expenseInputSchema, expenseListQuerySchema } from '~~/layers/menu/shared/types/menuSchema';
import type { Expense, ExpenseInput, ExpenseListResponse } from '~~/layers/menu/shared/types/types';

import { prisma } from './prisma';

type ExpenseCursor = { expenseDate: string; id: string };

function toDatabaseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function mapExpense(expense: {
  id: string;
  description: string;
  amount: { toString(): string };
  category: string;
  paymentMethod: string;
  expenseDate: Date;
  vendor: string | null;
  billingReference1: string | null;
  billingReference2: string | null;
  expenseType: string;
  isInvoiced: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Expense {
  return {
    id: expense.id,
    description: expense.description,
    amount: Number(expense.amount.toString()),
    category: expense.category as Expense['category'],
    paymentMethod: expense.paymentMethod as Expense['paymentMethod'],
    expenseDate: expense.expenseDate.toISOString().slice(0, 10),
    vendor: expense.vendor ?? '',
    billingReference1: expense.billingReference1 ?? '',
    billingReference2: expense.billingReference2 ?? '',
    expenseType: expense.expenseType as Expense['expenseType'],
    isInvoiced: expense.isInvoiced,
    notes: expense.notes ?? '',
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}

function validateInput(input: ExpenseInput) {
  const parsed = expenseInputSchema.safeParse(input);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Los datos del gasto no son válidos.',
      data: parsed.error.flatten(),
    });
  }

  return {
    ...parsed.data,
    amount: parsed.data.amount.toFixed(2),
    expenseDate: toDatabaseDate(parsed.data.expenseDate),
    vendor: parsed.data.vendor || null,
    billingReference1: parsed.data.billingReference1 || null,
    billingReference2: parsed.data.billingReference2 || null,
    notes: parsed.data.notes || null,
  };
}

function encodeCursor(expense: { expenseDate: Date; id: string }) {
  return Buffer.from(JSON.stringify({
    expenseDate: expense.expenseDate.toISOString().slice(0, 10),
    id: expense.id,
  }), 'utf8').toString('base64url');
}

function decodeCursor(cursor: string): ExpenseCursor {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<ExpenseCursor>;

    if (typeof parsed.expenseDate !== 'string' || typeof parsed.id !== 'string') {
      throw new Error('Invalid cursor');
    }

    return { expenseDate: parsed.expenseDate, id: parsed.id };
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'El cursor de paginación no es válido.' });
  }
}

function getMonthBounds(now = new Date()) {
  const localDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Tijuana',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [year, month] = localDate.split('-').map(Number) as [number, number, number];

  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export async function getExpenses(query: unknown): Promise<ExpenseListResponse> {
  const parsed = expenseListQuerySchema.safeParse(query);

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Los filtros no son válidos.' });
  }

  const { q, category, paymentMethod, expenseType, invoiced, from, to, cursor, limit } = parsed.data;
  const after = cursor ? decodeCursor(cursor) : null;
  const baseWhere = {
    ...(category ? { category } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(expenseType ? { expenseType } : {}),
    ...(invoiced !== undefined ? { isInvoiced: invoiced } : {}),
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: 'insensitive' as const } },
            { vendor: { contains: q, mode: 'insensitive' as const } },
            { billingReference1: { contains: q, mode: 'insensitive' as const } },
            { billingReference2: { contains: q, mode: 'insensitive' as const } },
            { notes: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
  const dateWhere = {
    ...(from ? { gte: toDatabaseDate(from) } : {}),
    ...(to ? { lte: toDatabaseDate(to) } : {}),
  };
  const filteredWhere = {
    ...baseWhere,
    ...(from || to ? { expenseDate: dateWhere } : {}),
  };
  const cursorWhere = after
    ? {
        OR: [
          { expenseDate: { lt: toDatabaseDate(after.expenseDate) } },
          { expenseDate: toDatabaseDate(after.expenseDate), id: { lt: after.id } },
        ],
      }
    : {};
  const month = getMonthBounds();
  const listWhere = after ? { AND: [filteredWhere, cursorWhere] } : filteredWhere;

  const [rows, aggregate, currentMonthAggregate] = await prisma.$transaction([
    prisma.expense.findMany({
      where: listWhere,
      orderBy: [{ expenseDate: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    }),
    prisma.expense.aggregate({
      where: filteredWhere,
      _sum: { amount: true },
      _count: { _all: true },
      _avg: { amount: true },
    }),
    prisma.expense.aggregate({
      where: {
        ...baseWhere,
        expenseDate: { gte: month.start, lt: month.end },
      },
      _sum: { amount: true },
    }),
  ]);

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  return {
    items: items.map(mapExpense),
    nextCursor: hasMore && items.length ? encodeCursor(items[items.length - 1]!) : null,
    summary: {
      total: Number(aggregate._sum.amount?.toString() ?? 0),
      count: aggregate._count._all,
      average: Number(aggregate._avg.amount?.toString() ?? 0),
      currentMonthTotal: Number(currentMonthAggregate._sum.amount?.toString() ?? 0),
    },
  };
}

export async function getExpenseVendors(): Promise<string[]> {
  const rows = await prisma.expense.findMany({
    where: { vendor: { not: null } },
    select: { vendor: true },
    distinct: ['vendor'],
    orderBy: { vendor: 'asc' },
  });

  return rows.flatMap(({ vendor }) => vendor ? [vendor] : []);
}

export async function createExpense(input: ExpenseInput) {
  return mapExpense(await prisma.expense.create({ data: validateInput(input) }));
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const existing = await prisma.expense.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Gasto no encontrado.' });
  }

  return mapExpense(await prisma.expense.update({ where: { id }, data: validateInput(input) }));
}

export async function deleteExpense(id: string) {
  const existing = await prisma.expense.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Gasto no encontrado.' });
  }

  await prisma.expense.delete({ where: { id } });
  return { id };
}
