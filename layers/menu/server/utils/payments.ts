import { createHash } from 'node:crypto';
import { createError } from 'h3';
import { z } from 'zod';
import { Prisma } from '../../generated/prisma/client';
import type { Account, AccountsResponse, PaymentDetail, PaymentMethodValue } from '../../shared/types/operations';
import { paymentInputSchema } from '../../shared/types/operations';
import type { OrderActor } from '../../shared/types/types';
import { accountTotals } from '../../shared/utils/operations';
import { prisma } from './prisma';

export const operationId = z.uuid();
export function parseOperation<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Revisa los datos.', data: parsed.error.flatten() });
  return parsed.data;
}
export const localToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

// Every consumer (dashboard, collections and delivery) uses the same ledger.
export const accountsSql = Prisma.sql`WITH accounts AS (
  SELECT o.id, o.folio, o.status::text AS status,
    COALESCE(o.contact_snapshot->>'nombre', c.nombre) AS "customerName",
    o.cycle_id AS "cycleId", o.price_snapshot AS total,
    COALESCE(p.paid, 0) AS paid,
    GREATEST(0, CASE WHEN o.status IN ('DRAFT', 'CANCELLED') THEN 0 ELSE o.price_snapshot END - COALESCE(p.paid, 0)) AS balance,
    GREATEST(0, COALESCE(p.paid, 0) - CASE WHEN o.status IN ('DRAFT', 'CANCELLED') THEN 0 ELSE o.price_snapshot END) AS refundable
  FROM orders o JOIN customers c ON c.id = o.customer_id
  LEFT JOIN (SELECT order_id, SUM(CASE WHEN kind = 'REFUND' THEN -amount ELSE amount END) AS paid FROM order_payments GROUP BY order_id) p ON p.order_id = o.id
  WHERE o.status <> 'DRAFT' OR COALESCE(p.paid, 0) > 0
)`;
const querySchema = z.object({
  cycleId: z.uuid().optional(), page: z.coerce.number().int().min(1).max(100000).default(1),
  search: z.string().trim().max(120).default(''), view: z.enum(['all', 'balance', 'refund']).default('all'),
});
type RawAccount = Omit<Account, 'total' | 'paid' | 'balance' | 'refundable'> & { total: Prisma.Decimal; paid: Prisma.Decimal; balance: Prisma.Decimal; refundable: Prisma.Decimal };
export function mapAccount(row: RawAccount): Account {
  return { id: row.id, folio: row.folio, status: row.status, customerName: row.customerName, total: Number(row.total), paid: Number(row.paid), balance: Number(row.balance), refundable: Number(row.refundable) };
}
export async function getAccounts(query: unknown): Promise<AccountsResponse> {
  const q = parseOperation(querySchema, query);
  const where = Prisma.sql`WHERE (${q.cycleId ?? null}::uuid IS NULL OR "cycleId" = ${q.cycleId ?? null}::uuid)
    AND ("customerName" ILIKE ${'%' + q.search + '%'} OR folio::text = ${q.search.replace(/^#0*/, '')})
    AND (${q.view} = 'all' OR (${q.view} = 'balance' AND balance > 0) OR (${q.view} = 'refund' AND refundable > 0))`;
  return prisma.$transaction(async tx => {
    const rows = await tx.$queryRaw<RawAccount[]>`${accountsSql} SELECT * FROM accounts ${where} ORDER BY folio DESC LIMIT 50 OFFSET ${(q.page - 1) * 50}`;
    const [summary] = await tx.$queryRaw<Array<{ count: bigint; paid: Prisma.Decimal | null; balance: Prisma.Decimal | null; refundable: Prisma.Decimal | null }>>`${accountsSql} SELECT COUNT(*) AS count, SUM(paid) AS paid, SUM(balance) AS balance, SUM(refundable) AS refundable FROM accounts ${where}`;
    return { items: rows.map(mapAccount), total: Number(summary!.count), page: q.page, summary: { paid: Number(summary!.paid ?? 0), balance: Number(summary!.balance ?? 0), refundable: Number(summary!.refundable ?? 0) } };
  }, { isolationLevel: 'RepeatableRead' });
}
/**
 * Store credit ("saldo a favor") of a customer, derived from the immutable
 * ledger: refunds paid as CREDIT add to it, payments made with CREDIT spend it.
 */
export async function customerCredit(client: Pick<Prisma.TransactionClient, '$queryRaw'>, customerId: string) {
  const [row] = await client.$queryRaw<Array<{ credit: Prisma.Decimal | null }>>`
    SELECT SUM(CASE WHEN p.kind = 'REFUND' THEN p.amount ELSE -p.amount END) AS credit
    FROM order_payments p JOIN orders o ON o.id = p.order_id
    WHERE o.customer_id = ${customerId}::uuid AND p.method = 'CREDIT'`;
  return Math.round(Number(row?.credit ?? 0) * 100) / 100;
}
export async function getPayments(id: string): Promise<PaymentDetail> {
  parseOperation(operationId, id);
  const order = await prisma.order.findUnique({ where: { id }, include: { customer: true, payments: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] } } });
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
  const contact = order.contactSnapshot as { nombre?: string } | null;
  return {
    account: { id, folio: order.folio, customerName: contact?.nombre ?? order.customer.nombre, status: order.status, total: Number(order.priceSnapshot), ...accountTotals(Number(order.priceSnapshot), order.status, order.payments.map(item => ({ kind: item.kind, amount: Number(item.amount) }))) },
    entries: order.payments.map(item => ({ id: item.id, kind: item.kind as 'PAYMENT' | 'REFUND', amount: Number(item.amount), method: item.method as PaymentMethodValue, reference: item.reference, reason: item.reason, receivedAt: item.receivedAt.toISOString().slice(0, 10), actorLabel: item.actorLabel, createdAt: item.createdAt.toISOString() })),
    customerCredit: await customerCredit(prisma, order.customerId),
  };
}
export async function registerPayment(id: string, input: unknown, actor?: OrderActor) {
  parseOperation(operationId, id);
  const data = parseOperation(paymentInputSchema, input);
  if (data.receivedAt > localToday()) throw createError({ statusCode: 400, statusMessage: 'El cobro no puede tener una fecha futura.' });
  const fingerprint = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  await prisma.$transaction(async tx => {
    // Serializes ledger writes with order cancellations, editing and delivery transitions.
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id}::uuid FOR UPDATE`;
    const previous = await tx.orderPayment.findUnique({ where: { orderId_idempotencyKey: { orderId: id, idempotencyKey: data.idempotencyKey } } });
    if (previous) {
      if (previous.fingerprint !== fingerprint) throw createError({ statusCode: 409, statusMessage: 'La clave de reintento ya tiene otro movimiento. Recarga los cobros.' });
      return;
    }
    const order = await tx.order.findUnique({ where: { id }, include: { payments: true } });
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
    const totals = accountTotals(Number(order.priceSnapshot), order.status, order.payments.map(item => ({ kind: item.kind, amount: Number(item.amount) })));
    if (data.kind === 'PAYMENT' && (['DRAFT', 'CANCELLED'].includes(order.status) || data.amount > totals.balance)) {
      throw createError({ statusCode: 409, statusMessage: 'Confirma el pedido y registra un abono que no supere su saldo actual.' });
    }
    if (data.kind === 'REFUND' && data.amount > totals.paid) throw createError({ statusCode: 409, statusMessage: 'La devolución supera lo efectivamente cobrado.' });
    if (data.method === 'CREDIT') {
      // Serializes every movement of this customer's credit (lock order: order, then customer).
      await tx.$queryRaw`SELECT id FROM customers WHERE id = ${order.customerId}::uuid FOR UPDATE`;
      if (data.kind === 'PAYMENT' && data.amount > await customerCredit(tx, order.customerId)) {
        throw createError({ statusCode: 409, statusMessage: 'El abono supera el saldo a favor del cliente.' });
      }
    }
    const { idempotencyKey, ...movement } = data;
    await tx.orderPayment.create({ data: { ...movement, receivedAt: new Date(`${data.receivedAt}T00:00:00Z`), orderId: id, idempotencyKey, fingerprint, actorId: actor?.id, actorLabel: actor?.label } });
  });
  return getPayments(id);
}
