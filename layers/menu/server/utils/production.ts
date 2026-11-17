import { createHash } from 'node:crypto';
import { createError } from 'h3';
import { z } from 'zod';
import { Prisma } from '../../generated/prisma/client';
import type { OrderActor } from '../../shared/types/types';
import type { ProductionMeal, ProductionSnapshot, ProductionRunDto, ShoppingListDto } from '../../shared/types/operations';
import { consolidateProduction } from '../../shared/utils/operations';
import { prisma } from './prisma';
import { operationId, parseOperation } from './payments';

const date = (value: Date) => value.toISOString().slice(0, 10);
async function source(tx: Prisma.TransactionClient, cycleId: string) {
  const cycle = await tx.weeklyCycle.findUnique({ where: { id: cycleId }, include: { orders: {
    where: { status: { notIn: ['DRAFT', 'CANCELLED'] } }, orderBy: { folio: 'asc' },
    include: { customer: { include: { exclusions: { include: { ingredient: true, catalogItem: true }, orderBy: { id: 'asc' } } } },
      menuSlots: { orderBy: [{ dayOrder: 'asc' }, { slotType: 'asc' }], include: { delivery: true, components: { orderBy: [{ componentRole: 'asc' }, { position: 'asc' }] } } } },
  } } });
  if (!cycle) throw createError({ statusCode: 404, statusMessage: 'Ciclo no encontrado.' });
  const meals: ProductionMeal[] = cycle.orders.flatMap(order => order.menuSlots.map(slot => ({
    orderId: order.id, folio: order.folio, customer: (order.contactSnapshot as { nombre?: string } | null)?.nombre ?? order.customer.nombre,
    deliveryId: slot.deliveryId, deliverySequence: slot.delivery.sequence, scheduledDate: date(slot.delivery.scheduledDate), address: slot.delivery.addressSnapshot,
    dayOfWeek: slot.dayOfWeek, slotType: slot.slotType, container: slot.contenedor ?? '', notes: slot.notes ?? '', orderNotes: order.notes ?? '',
    exclusions: order.customer.exclusions.map(item => `${item.kind}: ${item.ingredient?.nombre ?? item.catalogItem?.nombre ?? 'Revisar exclusión'}`),
    components: slot.components.map(item => ({ catalogItemId: item.catalogItemId, name: item.nombre, role: item.componentRole, position: item.position, substitution: item.isSubstitution })),
  })));
  const ids = [...new Set(meals.flatMap(meal => meal.components.flatMap(item => item.catalogItemId ? [item.catalogItemId] : [])))];
  const catalog = await tx.foodCatalogItem.findMany({ where: { id: { in: ids } }, orderBy: { id: 'asc' }, include: { recipeIngredients: { include: { ingredient: true }, orderBy: { orden: 'asc' } } } });
  const recipes = catalog.map(item => ({ id: item.id, yield: item.recipeYield === null ? null : Number(item.recipeYield), ingredients: item.recipeIngredients.map(ingredient => ({ ingredientId: ingredient.ingredientId, name: ingredient.ingredient.nombre, category: ingredient.ingredient.categoria, quantity: Number(ingredient.cantidad), unit: ingredient.unidad })) }));
  const fingerprint = createHash('sha256').update(JSON.stringify({ meals, recipes })).digest('hex');
  return { cycle, meals, recipes, fingerprint };
}
const runDto = (run: { id: string; cycleId: string; createdAt: Date; actorLabel: string | null; sourceFingerprint: string; snapshot: Prisma.JsonValue }, fingerprint: string): ProductionRunDto => ({
  id: run.id, cycleId: run.cycleId, createdAt: run.createdAt.toISOString(), actorLabel: run.actorLabel, stale: run.sourceFingerprint !== fingerprint, snapshot: run.snapshot as unknown as ProductionSnapshot,
});
export async function getProductionRuns(cycleId: string) {
  parseOperation(operationId, cycleId);
  return prisma.$transaction(async tx => {
    const current = await source(tx, cycleId);
    const runs = await tx.productionRun.findMany({ where: { cycleId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 20 });
    return runs.map(run => runDto(run, current.fingerprint));
  }, { isolationLevel: 'RepeatableRead' });
}
export async function createProductionRun(cycleId: string, input: unknown, actor?: OrderActor) {
  parseOperation(operationId, cycleId);
  const { requestKey } = parseOperation(z.object({ requestKey: z.uuid() }), input);
  try {
    await prisma.$transaction(async tx => {
      const previous = await tx.productionRun.findUnique({ where: { requestKey } });
      if (previous) {
        if (previous.cycleId !== cycleId) throw createError({ statusCode: 409, statusMessage: 'La clave de reintento pertenece a otro ciclo.' });
        return;
      }
      const { cycle, meals, recipes, fingerprint } = await source(tx, cycleId);
      if (!['CLOSED', 'IN_PRODUCTION', 'COMPLETED'].includes(cycle.status)) throw createError({ statusCode: 409, statusMessage: 'Cierra la recepción del ciclo antes de consolidar producción.' });
      if (!meals.length) throw createError({ statusCode: 409, statusMessage: 'No hay comidas confirmadas en este ciclo.' });
      const snapshot = consolidateProduction(date(cycle.weekStart), meals, recipes);
      await tx.productionRun.create({ data: { cycleId, requestKey, sourceFingerprint: fingerprint, snapshot: snapshot as unknown as Prisma.InputJsonValue, actorLabel: actor?.label,
        shoppingList: { create: { items: { create: snapshot.shopping } } },
      } });
    }, { isolationLevel: 'RepeatableRead' });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
    const previous = await prisma.productionRun.findUnique({ where: { requestKey } });
    if (!previous || previous.cycleId !== cycleId) throw createError({ statusCode: 409, statusMessage: 'La clave de consolidación pertenece a otro ciclo.' });
  }
  const saved = await prisma.productionRun.findUniqueOrThrow({ where: { requestKey } });
  return saved.id;
}
export async function getShoppingList(runId: string): Promise<ShoppingListDto> {
  parseOperation(operationId, runId);
  const list = await prisma.shoppingList.findUnique({ where: { productionRunId: runId }, include: { items: { orderBy: [{ category: 'asc' }, { name: 'asc' }, { unit: 'asc' }] } } });
  if (!list) throw createError({ statusCode: 404, statusMessage: 'Lista no encontrada.' });
  return { id: list.id, version: list.version, items: list.items.map(item => ({ id: item.id, ingredientId: item.ingredientId, name: item.name, category: item.category, unit: item.unit, quantity: Number(item.quantity), purchased: item.purchased, expenseId: item.expenseId, updatedBy: item.updatedBy })) };
}
export async function updateShoppingItem(runId: string, itemId: string, input: unknown, actor?: OrderActor) {
  parseOperation(operationId, runId); parseOperation(operationId, itemId);
  const data = parseOperation(z.object({ version: z.number().int().positive(), purchased: z.boolean(), expenseId: z.uuid().nullable() }), input);
  await prisma.$transaction(async tx => {
    const claim = await tx.shoppingList.updateMany({ where: { productionRunId: runId, version: data.version }, data: { version: { increment: 1 } } });
    if (claim.count !== 1) throw createError({ statusCode: 409, statusMessage: 'La lista cambió. Recarga antes de guardar.' });
    const list = await tx.shoppingList.findUniqueOrThrow({ where: { productionRunId: runId } });
    if (data.expenseId && !await tx.expense.findUnique({ where: { id: data.expenseId }, select: { id: true } })) throw createError({ statusCode: 400, statusMessage: 'El gasto ya no existe.' });
    const updated = await tx.shoppingItem.updateMany({ where: { id: itemId, shoppingListId: list.id }, data: { purchased: data.purchased, expenseId: data.expenseId, updatedBy: actor?.label } });
    if (updated.count !== 1) throw createError({ statusCode: 404, statusMessage: 'Ingrediente no encontrado en esta lista.' });
  });
  return getShoppingList(runId);
}
