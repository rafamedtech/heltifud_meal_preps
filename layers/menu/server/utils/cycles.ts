import { createError } from 'h3';

import { CycleStatus, type Prisma } from '~~/layers/menu/generated/prisma/client';
import { operationSettingsInputSchema, weeklyCycleUpdateInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type {
  OperationSettings,
  OperationSettingsInput,
  WeeklyCycle,
  WeeklyCycleUpdateInput,
} from '~~/layers/menu/shared/types/types';
import { canTransitionCycle, computeOrderCutoff, isCutoffBeforeWeek } from '~~/layers/menu/shared/utils/weeklyCycle';

import { prisma } from './prisma';

const cycleInclude = {
  menus: {
    orderBy: [{ menuType: 'asc' as const }, { name: 'asc' as const }],
    select: {
      id: true,
      name: true,
      menuType: true,
      customerId: true,
      customer: { select: { nombre: true } },
    },
  },
};

type CycleRecord = Prisma.WeeklyCycleGetPayload<{ include: typeof cycleInclude }>;

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function mapCycle(cycle: CycleRecord): WeeklyCycle {
  return {
    id: cycle.id,
    weekStart: cycle.weekStart.toISOString().slice(0, 10),
    status: cycle.status,
    orderCutoffAt: cycle.orderCutoffAt.toISOString(),
    firstDeliveryAllowedDays: cycle.firstDeliveryAllowedDays,
    secondDeliveryAllowedDays: cycle.secondDeliveryAllowedDays,
    firstDeliveryMealDays: cycle.firstDeliveryMealDays,
    secondDeliveryMealDays: cycle.secondDeliveryMealDays,
    menus: cycle.menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      menuType: menu.menuType,
      customerId: menu.customerId,
      customerName: menu.customer?.nombre ?? null,
    })),
  };
}

async function readSettings() {
  return prisma.operationSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

export async function getOperationSettings(): Promise<OperationSettings> {
  const settings = await readSettings();
  return {
    cutoffDay: settings.cutoffDay,
    cutoffTime: settings.cutoffTime,
    firstDeliveryAllowedDays: settings.firstDeliveryAllowedDays,
    secondDeliveryAllowedDays: settings.secondDeliveryAllowedDays,
    firstDeliveryMealDays: settings.firstDeliveryMealDays,
    secondDeliveryMealDays: settings.secondDeliveryMealDays,
    timeZone: settings.timeZone,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

/** Defaults apply to weeks created from now on; existing cycles keep their copy. */
export async function updateOperationSettings(input: OperationSettingsInput) {
  const parsed = operationSettingsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Los ajustes de operación no son válidos.', data: parsed.error.flatten() });
  }
  await prisma.operationSettings.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } });
  return getOperationSettings();
}

/** Returns the cycle of a week, creating it from the current defaults when missing. */
export async function ensureCycleForWeek(weekStart: string) {
  const settings = await readSettings();
  return prisma.weeklyCycle.upsert({
    where: { weekStart: toDate(weekStart) },
    update: {},
    create: {
      weekStart: toDate(weekStart),
      orderCutoffAt: computeOrderCutoff(weekStart, settings.cutoffDay, settings.cutoffTime, settings.timeZone),
      firstDeliveryAllowedDays: settings.firstDeliveryAllowedDays,
      secondDeliveryAllowedDays: settings.secondDeliveryAllowedDays,
      firstDeliveryMealDays: settings.firstDeliveryMealDays,
      secondDeliveryMealDays: settings.secondDeliveryMealDays,
    },
    select: { id: true, status: true },
  });
}

export async function getCycles(): Promise<WeeklyCycle[]> {
  const cycles = await prisma.weeklyCycle.findMany({ orderBy: { weekStart: 'desc' }, include: cycleInclude });
  return cycles.map(mapCycle);
}

export async function updateCycle(id: string, input: WeeklyCycleUpdateInput) {
  const parsed = weeklyCycleUpdateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Los cambios de la semana no son válidos.', data: parsed.error.flatten() });
  }
  const { status, orderCutoffAt } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const cycle = await tx.weeklyCycle.findUnique({ where: { id }, include: { _count: { select: { menus: true } } } });
    if (!cycle) throw createError({ statusCode: 404, statusMessage: 'Semana no encontrada.' });

    if (orderCutoffAt) {
      const { timeZone } = await tx.operationSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 }, select: { timeZone: true } });
      if (!isCutoffBeforeWeek(orderCutoffAt, cycle.weekStart.toISOString().slice(0, 10), timeZone)) {
        throw createError({ statusCode: 400, statusMessage: 'El corte debe ser anterior al lunes en que inicia la semana.' });
      }
    }

    const statusChanges = status !== undefined && status !== cycle.status;
    if (statusChanges) {
      if (!canTransitionCycle(cycle.status, status)) {
        throw createError({ statusCode: 409, statusMessage: 'Ese cambio de estado no está permitido para esta semana.' });
      }
      if (status === CycleStatus.OPEN && cycle._count.menus === 0) {
        throw createError({ statusCode: 409, statusMessage: 'Agrega un menú a la semana antes de abrir pedidos.' });
      }
      if (status === CycleStatus.OPEN) {
        // Only one week takes orders at a time; the previous one stops selling.
        await tx.weeklyCycle.updateMany({
          where: { status: CycleStatus.OPEN, id: { not: id } },
          data: { status: CycleStatus.CLOSED },
        });
      }
    }

    return tx.weeklyCycle.update({
      where: { id },
      data: {
        ...(statusChanges ? { status } : {}),
        ...(orderCutoffAt ? { orderCutoffAt: new Date(orderCutoffAt) } : {}),
      },
      include: cycleInclude,
    });
  });

  return mapCycle(updated);
}
