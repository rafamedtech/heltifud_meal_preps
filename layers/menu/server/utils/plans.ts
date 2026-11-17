import { createError } from 'h3';
import { z } from 'zod';

import { planInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type { Plan, PlanInput } from '~~/layers/menu/shared/types/types';

import { prisma } from './prisma';

const variantOrder = [{ daysCount: 'asc' as const }, { price: 'asc' as const }];
const planInclude = { variants: { orderBy: variantOrder } };
// Admin listing: the order count tells the editor which variants keep history.
const adminPlanInclude = {
  variants: { orderBy: variantOrder, include: { _count: { select: { orders: true } } } },
};

const planIdSchema = z.uuid();

function parsePlanId(id: string | undefined) {
  const parsed = planIdSchema.safeParse(id);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'El id del plan no es válido.' });
  return parsed.data;
}

function prismaCode(error: unknown) {
  return typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
}

function pluralOrders(count: number) {
  return `${count} ${count === 1 ? 'pedido' : 'pedidos'}`;
}

function planHasOrders(orders: number) {
  return createError({
    statusCode: 409,
    statusMessage: orders
      ? `El plan tiene ${pluralOrders(orders)} y no se puede eliminar. Pausa el plan para dejar de ofrecerlo.`
      : 'El plan tiene pedidos asociados y no se puede eliminar. Pausa el plan para dejar de ofrecerlo.',
    data: { code: 'PLAN_HAS_ORDERS', orders },
  });
}

function variantHasOrders(variants: Array<{ title: string; orders: number }>) {
  const [first] = variants;
  const statusMessage = variants.length === 1 && first
    ? `La variante «${first.title}» tiene ${pluralOrders(first.orders)} y no se puede quitar. Desactívala para dejar de ofrecerla.`
    : 'Una variante que quitaste tiene pedidos y no se puede quitar. Desactívala para dejar de ofrecerla.';
  return createError({
    statusCode: 409,
    statusMessage,
    data: { code: 'VARIANT_HAS_ORDERS', variants },
  });
}

// Unique violations: the plan title, or two variants with the same days while
// reordering them (the schema already rejects duplicates in the payload).
function planUniqueConflict(error: unknown, title: string) {
  const target = JSON.stringify((error as { meta?: unknown }).meta ?? '');
  return createError({
    statusCode: 409,
    statusMessage: target.includes('title')
      ? `Ya existe un plan llamado «${title}». Usa otro nombre.`
      : 'Dos variantes no pueden tener la misma cantidad de días. Guarda primero un cambio y después el otro.',
    data: { code: 'PLAN_CONFLICT' },
  });
}

function mapPlan(plan: Awaited<ReturnType<typeof prisma.plan.findFirst>> & { variants?: Array<{
  id: string;
  title: string;
  daysCount: number;
  price: { toString(): string };
  isActive: boolean;
  _count?: { orders: number };
}> }): Plan {
  return {
    id: plan!.id,
    title: plan!.title,
    description: plan!.description,
    image: plan!.image,
    slotTypes: plan!.slotTypes,
    isActive: plan!.isActive,
    variants: (plan!.variants ?? []).map((variant) => ({
      id: variant.id,
      title: variant.title,
      daysCount: variant.daysCount,
      price: Number(variant.price.toString()),
      isActive: variant.isActive,
      ...(variant._count ? { orderCount: variant._count.orders } : {}),
    })),
    createdAt: plan!.createdAt.toISOString(),
    updatedAt: plan!.updatedAt.toISOString(),
  };
}

function validatePlan(input: PlanInput) {
  const parsed = planInputSchema.safeParse(input);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Los datos del plan no son válidos.',
      data: parsed.error.flatten(),
    });
  }
  return parsed.data;
}

export async function getPlans(activeOnly = false) {
  const plans = await prisma.plan.findMany({
    where: activeOnly ? { isActive: true, variants: { some: { isActive: true } } } : undefined,
    orderBy: [{ isActive: 'desc' }, { title: 'asc' }],
    include: activeOnly ? planInclude : adminPlanInclude,
  });

  return plans.map(mapPlan).map((plan) => activeOnly
    ? { ...plan, variants: plan.variants.filter((variant) => variant.isActive) }
    : plan);
}

export async function createPlan(input: PlanInput) {
  const data = validatePlan(input);
  const created = await prisma.plan.create({
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      slotTypes: data.slotTypes,
      isActive: data.isActive,
      variants: {
        create: data.variants.map(({ id: _id, price, ...variant }) => ({ ...variant, price: price.toFixed(2) })),
      },
    },
    include: adminPlanInclude,
  }).catch((error: unknown) => {
    if (prismaCode(error) === 'P2002') throw planUniqueConflict(error, data.title);
    throw error;
  });
  return mapPlan(created);
}

export async function updatePlan(rawId: string | undefined, input: PlanInput) {
  const id = parsePlanId(rawId);
  const data = validatePlan(input);
  const existing = await prisma.plan.findUnique({
    where: { id },
    include: { variants: { select: { id: true, title: true, _count: { select: { orders: true } } } } },
  });
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Plan no encontrado.' });
  }

  const suppliedIds = data.variants.flatMap((variant) => variant.id ? [variant.id] : []);
  const ownedIds = new Set(existing.variants.map((variant) => variant.id));
  if (suppliedIds.some((variantId) => !ownedIds.has(variantId))) {
    throw createError({ statusCode: 400, statusMessage: 'Una variante no pertenece a este plan.' });
  }

  // A variant sold in an order is history: it can be deactivated, not removed.
  const supplied = new Set(suppliedIds);
  const usedRemoved = existing.variants
    .filter((variant) => !supplied.has(variant.id) && variant._count.orders > 0)
    .map((variant) => ({ title: variant.title, orders: variant._count.orders }));
  if (usedRemoved.length) throw variantHasOrders(usedRemoved);

  return prisma.$transaction(async (tx) => {
    await tx.plan.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        slotTypes: data.slotTypes,
        isActive: data.isActive,
      },
    });

    await tx.planVariant.deleteMany({
      where: { planId: id, ...(suppliedIds.length ? { id: { notIn: suppliedIds } } : {}) },
    });

    for (const variant of data.variants) {
      if (variant.id) {
        await tx.planVariant.update({
          where: { id: variant.id },
          data: {
            title: variant.title,
            daysCount: variant.daysCount,
            price: variant.price.toFixed(2),
            isActive: variant.isActive,
          },
        });
      } else {
        await tx.planVariant.create({
          data: {
            planId: id,
            title: variant.title,
            daysCount: variant.daysCount,
            price: variant.price.toFixed(2),
            isActive: variant.isActive,
          },
        });
      }
    }

    const updated = await tx.plan.findUnique({ where: { id }, include: adminPlanInclude });
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Plan no encontrado.' });
    return mapPlan(updated);
  }).catch((error: unknown) => {
    const code = prismaCode(error);
    // An order created for a removed variant after the check above.
    if (code === 'P2003') throw variantHasOrders([]);
    if (code === 'P2002') throw planUniqueConflict(error, data.title);
    throw error;
  });
}

export async function deletePlan(rawId: string | undefined) {
  const id = parsePlanId(rawId);
  const existing = await prisma.plan.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Plan no encontrado.' });

  // Orders keep their variant; deleting would erase that history, so the
  // caller is offered to pause the plan instead.
  const orders = await prisma.order.count({ where: { planVariant: { planId: id } } });
  if (orders) throw planHasOrders(orders);

  try {
    await prisma.plan.delete({ where: { id } });
  } catch (error) {
    // An order created between the count and the delete still blocks it.
    if (prismaCode(error) === 'P2003') throw planHasOrders(0);
    throw error;
  }
  return { id };
}
