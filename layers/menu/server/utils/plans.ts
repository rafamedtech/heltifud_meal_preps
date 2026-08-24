import { createError } from 'h3';

import { planInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type { Plan, PlanInput } from '~~/layers/menu/shared/types/types';

import { prisma } from './prisma';

const planInclude = {
  variants: { orderBy: [{ daysCount: 'asc' as const }, { price: 'asc' as const }] },
};

function mapPlan(plan: Awaited<ReturnType<typeof prisma.plan.findFirst>> & { variants?: Array<{
  id: string;
  title: string;
  daysCount: number;
  price: { toString(): string };
  isActive: boolean;
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
    include: planInclude,
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
    include: planInclude,
  });
  return mapPlan(created);
}

export async function updatePlan(id: string, input: PlanInput) {
  const data = validatePlan(input);
  const existing = await prisma.plan.findUnique({
    where: { id },
    include: { variants: { select: { id: true } } },
  });
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Plan no encontrado.' });
  }

  const suppliedIds = data.variants.flatMap((variant) => variant.id ? [variant.id] : []);
  const ownedIds = new Set(existing.variants.map((variant) => variant.id));
  if (suppliedIds.some((variantId) => !ownedIds.has(variantId))) {
    throw createError({ statusCode: 400, statusMessage: 'Una variante no pertenece a este plan.' });
  }

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

    const updated = await tx.plan.findUnique({ where: { id }, include: planInclude });
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Plan no encontrado.' });
    return mapPlan(updated);
  });
}

export async function deletePlan(id: string) {
  const existing = await prisma.plan.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Plan no encontrado.' });
  await prisma.plan.delete({ where: { id } });
  return { id };
}
