import { createError } from 'h3';
import { z } from 'zod';
import type { OrderActor } from '../../shared/types/types';
import type { DeliveryBoardItem, OperationsDashboard } from '../../shared/types/operations';
import { deliveryOperationSchema } from '../../shared/types/operations';
import { accountTotals } from '../../shared/utils/operations';
import { prisma } from './prisma';
import { getAccounts, localToday, operationId, parseOperation } from './payments';

export async function getDeliveryBoard(query: unknown): Promise<DeliveryBoardItem[]> {
  const q = parseOperation(z.object({ date: z.iso.date().default(localToday()), cycleId: z.uuid().optional() }), query);
  const rows = await prisma.orderDelivery.findMany({ where: { scheduledDate: new Date(q.date), order: { status: { notIn: ['DRAFT', 'CANCELLED'] }, ...(q.cycleId ? { cycleId: q.cycleId } : {}) } }, orderBy: [{ scheduledDate: 'asc' }, { order: { folio: 'asc' } }, { sequence: 'asc' }],
    include: { _count: { select: { menuSlots: true } }, activities: { orderBy: { createdAt: 'desc' }, take: 20 }, order: { include: { customer: true, payments: true } } },
  });
  return rows.map(row => {
    const contact = row.order.contactSnapshot as { nombre?: string; telefono?: string } | null;
    return { id: row.id, orderId: row.orderId, version: row.order.version, folio: row.order.folio, customer: contact?.nombre ?? row.order.customer.nombre, phone: contact?.telefono ?? row.order.customer.telefono,
      sequence: row.sequence, date: row.scheduledDate.toISOString().slice(0, 10), address: row.addressSnapshot, status: row.status, orderStatus: row.order.status, meals: row._count.menuSlots,
      balance: accountTotals(Number(row.order.priceSnapshot), row.order.status, row.order.payments.map(p => ({ kind: p.kind, amount: Number(p.amount) }))).balance,
      assignedTo: row.assignedTo ?? '', incident: row.incident ?? '', deliveryNotes: row.notes ?? '', evidenceUrl: row.evidenceUrl ?? '', activities: row.activities.map(a => ({ id: a.id, createdAt: a.createdAt.toISOString(), actorLabel: a.actorLabel, details: a.details as Record<string, unknown> })),
    };
  });
}
export async function updateDeliveryOperation(id: string, input: unknown, actor?: OrderActor) {
  parseOperation(operationId, id);
  const data = parseOperation(deliveryOperationSchema, input);
  await prisma.$transaction(async tx => {
    const row = await tx.orderDelivery.findUnique({ where: { id }, include: { order: true } });
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Entrega no encontrada.' });
    const claimed = await tx.order.updateMany({ where: { id: row.orderId, version: data.version, status: { notIn: ['DRAFT', 'CANCELLED'] } }, data: { version: { increment: 1 } } });
    if (claimed.count !== 1) throw createError({ statusCode: 409, statusMessage: 'El pedido cambió o está cancelado. Recarga el tablero.' });
    const { version: _version, ...fields } = data;
    await tx.orderDelivery.update({ where: { id }, data: fields });
    await tx.deliveryActivity.create({ data: { deliveryId: id, actorLabel: actor?.label, details: { before: { assignedTo: row.assignedTo, incident: row.incident, evidenceUrl: row.evidenceUrl }, after: fields } } });
  });
  return { ok: true };
}
export async function getOperationsDashboard(): Promise<OperationsDashboard> {
  const today = localToday();
  const eligible = { status: { notIn: ['DRAFT', 'CANCELLED'] as Array<'DRAFT' | 'CANCELLED'> } };
  const [pendingConfirmation, deliveriesToday, overdue, failed, accounts] = await Promise.all([
    prisma.order.count({ where: { status: 'DRAFT' } }),
    prisma.orderDelivery.count({ where: { scheduledDate: new Date(today), status: { notIn: ['DELIVERED', 'LOST'] }, order: eligible } }),
    prisma.orderDelivery.count({ where: { scheduledDate: { lt: new Date(today) }, status: { notIn: ['DELIVERED', 'LOST'] }, order: eligible } }),
    prisma.orderDelivery.count({ where: { status: 'FAILED', order: eligible } }),
    getAccounts({}),
  ]);
  return { today, pendingConfirmation, deliveriesToday, overdue, failed, balance: accounts.summary.balance, refundable: accounts.summary.refundable };
}
