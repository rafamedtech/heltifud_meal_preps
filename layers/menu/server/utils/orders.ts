import { createError } from 'h3';

import { ComponentRole, OrderStatus, type Prisma } from '~~/layers/menu/generated/prisma/client';
import {
  orderCreateInputSchema,
  orderListQuerySchema,
  orderUpdateInputSchema,
} from '~~/layers/menu/shared/types/menuSchema';
import type {
  Customer,
  CustomerLocationNumber,
  DeliverySequence,
  Order,
  OrderCreateInput,
  OrderDelivery,
  OrderListItem,
  OrderListResponse,
  OrderMenuSlotInput,
  OrderUpdateInput,
} from '~~/layers/menu/shared/types/types';
import { deliverySequenceForDay, type DeliveryMealRule } from '~~/layers/menu/shared/utils/orderDeliveries';

import { prisma } from './prisma';

const deliveriesInclude = { orderBy: { sequence: 'asc' as const } };

const orderListInclude = {
  customer: { select: { nombre: true, telefono: true } },
  deliveries: deliveriesInclude,
};

const orderDetailInclude = {
  customer: true,
  deliveries: deliveriesInclude,
  sourceWeeklyMenu: { select: { id: true, name: true } },
  menuSlots: {
    orderBy: [{ dayOrder: 'asc' as const }, { slotType: 'asc' as const }],
    include: {
      delivery: { select: { sequence: true } },
      components: { orderBy: [{ componentRole: 'asc' as const }, { position: 'asc' as const }] },
    },
  },
};

const mealRuleSelect = { firstDeliveryMealDays: true, secondDeliveryMealDays: true };

// Mirrors the defaults of `OperationSettings`, for orders whose week is gone.
const DEFAULT_MEAL_RULE: DeliveryMealRule = {
  firstDeliveryMealDays: ['LUNES', 'MARTES', 'MIERCOLES'],
  secondDeliveryMealDays: ['JUEVES', 'VIERNES'],
};

const menuSourceInclude = {
  cycle: { select: mealRuleSelect },
  days: {
    orderBy: { order: 'asc' as const },
    include: {
      slots: {
        include: { components: true },
      },
    },
  },
};

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function mapCustomer(customer: {
  firstDeliveryDay: Customer['firstDeliveryDay'];
  secondDeliveryDay: Customer['secondDeliveryDay'];
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
    id: customer.id,
    nombre: customer.nombre,
    telefono: customer.telefono,
    ubicacion1: customer.ubicacion1,
    ubicacion2: customer.ubicacion2 ?? '',
    correoElectronico: customer.correoElectronico ?? '',
    source: customer.source as Customer['source'],
    status: customer.status as Customer['status'],
    tipoCliente: customer.tipoCliente as Customer['tipoCliente'],
    firstDeliveryDay: customer.firstDeliveryDay ?? null,
    secondDeliveryDay: customer.secondDeliveryDay ?? null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

function mapDelivery(delivery: Prisma.OrderDeliveryGetPayload<object>): OrderDelivery {
  return {
    id: delivery.id,
    sequence: delivery.sequence as DeliverySequence,
    scheduledDate: toDateString(delivery.scheduledDate),
    locationNumber: delivery.locationNumber as CustomerLocationNumber,
    address: delivery.addressSnapshot,
    status: delivery.status,
    deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
    notes: delivery.notes ?? '',
  };
}

function mapListItem(order: Prisma.OrderGetPayload<{ include: typeof orderListInclude }>): OrderListItem {
  return {
    id: order.id,
    status: order.status,
    customerId: order.customerId,
    customerName: order.customer.nombre,
    customerPhone: order.customer.telefono,
    planTitle: order.planTitleSnapshot,
    planVariantTitle: order.planVariantTitleSnapshot,
    price: Number(order.priceSnapshot.toString()),
    deliveries: order.deliveries.map(mapDelivery),
    createdAt: order.createdAt.toISOString(),
  };
}

function resolveAddress(customer: { ubicacion1: string; ubicacion2: string | null }, location: 1 | 2) {
  const address = location === 1 ? customer.ubicacion1 : customer.ubicacion2;
  if (!address) {
    throw createError({
      statusCode: 400,
      statusMessage: location === 2
        ? 'El cliente no tiene una ubicación secundaria registrada.'
        : 'El cliente no tiene una ubicación principal registrada.',
    });
  }
  return address;
}

/** Resolves the delivery row that carries the meals of a day. */
function deliveryIdResolver(deliveries: Array<{ id: string; sequence: number }>, rule: DeliveryMealRule) {
  const ids = new Map(deliveries.map((delivery) => [delivery.sequence as DeliverySequence, delivery.id]));
  const available = [...ids.keys()].sort();
  return (day: OrderMenuSlotInput['dayOfWeek']) => ids.get(deliverySequenceForDay(day, rule, available))!;
}

function buildMenuSlots(
  menu: Prisma.WeeklyMenuGetPayload<{ include: typeof menuSourceInclude }>,
  slotTypes: string[],
  daysCount: number,
  deliveryIdFor: (day: OrderMenuSlotInput['dayOfWeek']) => string,
) {
  return menu.days.slice(0, daysCount).flatMap((day) => day.slots
    .filter((slot) => slotTypes.includes(slot.slotType))
    .map((slot) => {
      const rolePositions = new Map<string, number>();
      return {
        deliveryId: deliveryIdFor(day.dayOfWeek),
        dayOfWeek: day.dayOfWeek,
        dayOrder: day.order,
        slotType: slot.slotType,
        contenedor: slot.contenedor,
        components: {
          create: slot.components.map((component) => {
            const position = rolePositions.get(component.componentRole) ?? 0;
            rolePositions.set(component.componentRole, position + 1);
            return {
              catalogItemId: component.catalogItemId,
              componentRole: component.componentRole,
              position,
              nombre: component.nombre,
              descripcion: component.descripcion,
              calorias: component.calorias,
              imagen: component.imagen,
              tipo: component.tipo,
            };
          }),
        },
      };
    }));
}

function buildEditableMenu(slots: OrderMenuSlotInput[], deliveryIdFor: (day: OrderMenuSlotInput['dayOfWeek']) => string) {
  return slots.map((slot) => ({
    deliveryId: deliveryIdFor(slot.dayOfWeek),
    dayOfWeek: slot.dayOfWeek,
    dayOrder: slot.dayOrder,
    slotType: slot.slotType,
    contenedor: slot.contenedor || null,
    components: {
      create: slot.components.map((component) => ({
        ...component,
        catalogItemId: component.catalogItemId || null,
      })),
    },
  }));
}

export async function getOrders(query: unknown): Promise<OrderListResponse> {
  const parsed = orderListQuerySchema.safeParse(query);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Los filtros no son válidos.' });
  const { q, status, from, to, limit, customerId, offset } = parsed.data;
  const where: Prisma.OrderWhereInput = {
    ...(customerId ? { customerId } : {}),
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        { customer: { nombre: { contains: q, mode: 'insensitive' } } },
        { customer: { telefono: { contains: q, mode: 'insensitive' } } },
        { planTitleSnapshot: { contains: q, mode: 'insensitive' } },
      ],
    } : {}),
    // An order matches when any of its deliveries falls in the range.
    ...(from || to ? {
      deliveries: {
        some: {
          scheduledDate: {
            ...(from ? { gte: toDate(from) } : {}),
            ...(to ? { lte: toDate(to) } : {}),
          },
        },
      },
    } : {}),
  };

  const [rows, grouped] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: orderListInclude,
    }),
    prisma.order.groupBy({ by: ['status'], where, _count: { _all: true } }),
  ]);
  const counts = new Map(grouped.map((item) => [item.status, item._count._all]));

  return {
    items: rows.map(mapListItem),
    summary: {
      total: grouped.reduce((sum, item) => sum + item._count._all, 0),
      draft: counts.get(OrderStatus.DRAFT) ?? 0,
      confirmed: counts.get(OrderStatus.CONFIRMED) ?? 0,
      inProgress: (counts.get(OrderStatus.PREPARING) ?? 0) + (counts.get(OrderStatus.PARTIALLY_DELIVERED) ?? 0),
      delivered: counts.get(OrderStatus.DELIVERED) ?? 0,
    },
  };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const record = await prisma.order.findUnique({ where: { id }, include: orderDetailInclude });
  if (!record) return null;
  return {
    ...mapListItem(record),
    planVariantId: record.planVariantId,
    sourceWeeklyMenuId: record.sourceWeeklyMenuId,
    sourceWeeklyMenuName: record.sourceWeeklyMenu?.name ?? null,
    notes: record.notes ?? '',
    updatedAt: record.updatedAt.toISOString(),
    customer: mapCustomer(record.customer),
    menuSlots: record.menuSlots.map((slot) => ({
      id: slot.id,
      deliverySequence: slot.delivery.sequence as DeliverySequence,
      dayOfWeek: slot.dayOfWeek,
      dayOrder: slot.dayOrder,
      slotType: slot.slotType,
      contenedor: slot.contenedor ?? '',
      components: slot.components.map((component) => ({
        id: component.id,
        catalogItemId: component.catalogItemId,
        componentRole: component.componentRole,
        position: component.position,
        nombre: component.nombre,
        descripcion: component.descripcion,
        calorias: component.calorias,
        imagen: component.imagen,
        tipo: component.tipo,
      })),
    })),
  };
}

export async function createOrder(input: OrderCreateInput) {
  const parsed = orderCreateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Los datos del pedido no son válidos.', data: parsed.error.flatten() });
  }
  const data = parsed.data;

  const created = await prisma.$transaction(async (tx) => {
    const [customer, variant] = await Promise.all([
      tx.customer.findUnique({ where: { id: data.customerId } }),
      tx.planVariant.findUnique({ where: { id: data.planVariantId }, include: { plan: true } }),
    ]);
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });
    // Each customer type orders from its own menu of the week taking orders.
    const cycleScope = customer.tipoCliente === 'dieta'
      ? customer.id
      : customer.tipoCliente === 'vegetariano' ? 'VEGETARIANO' : 'ESTANDAR';
    const activeMenu = await tx.weeklyMenu.findFirst({
      where: { cycleScope, cycle: { status: 'OPEN' } },
      orderBy: { startDate: 'desc' },
      include: menuSourceInclude,
    });
    if (!variant || !variant.isActive || !variant.plan.isActive) {
      throw createError({ statusCode: 404, statusMessage: 'La variante de plan no está disponible.' });
    }
    if (!activeMenu) {
      const missing = customer.tipoCliente === 'dieta'
        ? 'un menú personalizado para este cliente'
        : customer.tipoCliente === 'vegetariano' ? 'un menú vegetariano' : 'un menú estándar';
      throw createError({ statusCode: 409, statusMessage: `La semana con pedidos abiertos no tiene ${missing}.` });
    }

    // Deliveries go first: each copied meal needs the id of the one that carries it.
    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        planVariantId: variant.id,
        sourceWeeklyMenuId: activeMenu.id,
        planTitleSnapshot: variant.plan.title,
        planVariantTitleSnapshot: variant.title,
        priceSnapshot: variant.price,
        notes: data.notes || null,
        deliveries: {
          create: data.deliveries.map((delivery) => ({
            sequence: delivery.sequence,
            scheduledDate: toDate(delivery.scheduledDate),
            locationNumber: delivery.locationNumber,
            addressSnapshot: resolveAddress(customer, delivery.locationNumber),
          })),
        },
      },
      select: { id: true, deliveries: { select: { id: true, sequence: true } } },
    });

    const menuSlots = buildMenuSlots(
      activeMenu,
      variant.plan.slotTypes,
      variant.daysCount,
      deliveryIdResolver(order.deliveries, activeMenu.cycle ?? DEFAULT_MEAL_RULE),
    );
    if (!menuSlots.length) {
      throw createError({ statusCode: 409, statusMessage: 'El menú activo no contiene tiempos compatibles con el plan.' });
    }
    await tx.order.update({ where: { id: order.id }, data: { menuSlots: { create: menuSlots } } });

    return order;
  });

  return getOrderById(created.id);
}

export async function updateOrder(id: string, input: OrderUpdateInput) {
  const parsed = orderUpdateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Los cambios del pedido no son válidos.', data: parsed.error.flatten() });
  }
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      include: {
        customer: true,
        deliveries: true,
        sourceWeeklyMenu: { select: { cycle: { select: mealRuleSelect } } },
      },
    });
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });

    // Meals are rebuilt below, so deliveries dropped from the order are free to go.
    await tx.orderMenuSlot.deleteMany({ where: { orderId: id } });
    await tx.orderDelivery.deleteMany({
      where: { orderId: id, sequence: { notIn: data.deliveries.map((delivery) => delivery.sequence) } },
    });

    const deliveries: Array<{ id: string; sequence: number }> = [];
    for (const delivery of data.deliveries) {
      const current = existing.deliveries.find((item) => item.sequence === delivery.sequence);
      // The address stays frozen unless another location is chosen on purpose.
      const location = !current || current.locationNumber !== delivery.locationNumber
        ? { locationNumber: delivery.locationNumber, addressSnapshot: resolveAddress(existing.customer, delivery.locationNumber) }
        : {};
      const scheduledDate = toDate(delivery.scheduledDate);
      deliveries.push(current
        ? await tx.orderDelivery.update({
            where: { id: current.id },
            data: { scheduledDate, ...location },
            select: { id: true, sequence: true },
          })
        : await tx.orderDelivery.create({
            data: {
              orderId: id,
              sequence: delivery.sequence,
              scheduledDate,
              locationNumber: delivery.locationNumber,
              addressSnapshot: resolveAddress(existing.customer, delivery.locationNumber),
            },
            select: { id: true, sequence: true },
          }));
    }

    const rule = existing.sourceWeeklyMenu?.cycle ?? DEFAULT_MEAL_RULE;
    await tx.order.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes || null,
        menuSlots: { create: buildEditableMenu(data.menuSlots, deliveryIdResolver(deliveries, rule)) },
      },
    });
  });

  return getOrderById(id);
}

export { ComponentRole };
