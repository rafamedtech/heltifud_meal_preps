import { createError } from 'h3';

import { ComponentRole, OrderStatus, type Prisma } from '~~/layers/menu/generated/prisma/client';
import {
  orderCreateInputSchema,
  orderListQuerySchema,
  orderUpdateInputSchema,
} from '~~/layers/menu/shared/types/menuSchema';
import type {
  Customer,
  Order,
  OrderCreateInput,
  OrderListItem,
  OrderListResponse,
  OrderMenuSlotInput,
  OrderUpdateInput,
} from '~~/layers/menu/shared/types/types';

import { prisma } from './prisma';

const orderDetailInclude = {
  customer: true,
  sourceWeeklyMenu: { select: { id: true, name: true } },
  menuSlots: {
    orderBy: [{ dayOrder: 'asc' as const }, { slotType: 'asc' as const }],
    include: { components: { orderBy: [{ componentRole: 'asc' as const }, { position: 'asc' as const }] } },
  },
};

const menuSourceInclude = {
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
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

function mapListItem(order: {
  id: string;
  status: OrderStatus;
  customerId: string;
  planTitleSnapshot: string;
  planVariantTitleSnapshot: string;
  priceSnapshot: { toString(): string };
  firstDeliveryDate: Date;
  firstDeliveryAddress: string;
  secondDeliveryDate: Date;
  secondDeliveryAddress: string;
  createdAt: Date;
  customer: { nombre: string; telefono: string };
}): OrderListItem {
  return {
    id: order.id,
    status: order.status,
    customerId: order.customerId,
    customerName: order.customer.nombre,
    customerPhone: order.customer.telefono,
    planTitle: order.planTitleSnapshot,
    planVariantTitle: order.planVariantTitleSnapshot,
    price: Number(order.priceSnapshot.toString()),
    firstDeliveryDate: toDateString(order.firstDeliveryDate),
    firstDeliveryAddress: order.firstDeliveryAddress,
    secondDeliveryDate: toDateString(order.secondDeliveryDate),
    secondDeliveryAddress: order.secondDeliveryAddress,
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

function buildMenuSlots(menu: Prisma.WeeklyMenuGetPayload<{ include: typeof menuSourceInclude }>, slotTypes: string[], daysCount: number) {
  return menu.days.slice(0, daysCount).flatMap((day) => day.slots
    .filter((slot) => slotTypes.includes(slot.slotType))
    .map((slot) => {
      const rolePositions = new Map<string, number>();
      return {
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

function buildEditableMenu(slots: OrderMenuSlotInput[]) {
  return slots.map((slot) => ({
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
  const { q, status, from, to, limit } = parsed.data;
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        { customer: { nombre: { contains: q, mode: 'insensitive' } } },
        { customer: { telefono: { contains: q, mode: 'insensitive' } } },
        { planTitleSnapshot: { contains: q, mode: 'insensitive' } },
      ],
    } : {}),
    ...(from || to ? {
      firstDeliveryDate: {
        ...(from ? { gte: toDate(from) } : {}),
        ...(to ? { lte: toDate(to) } : {}),
      },
    } : {}),
  };

  const [rows, grouped] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      take: limit,
      orderBy: [{ firstDeliveryDate: 'desc' }, { createdAt: 'desc' }],
      include: { customer: { select: { nombre: true, telefono: true } } },
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
    firstDeliveryLocation: record.firstDeliveryLocation as 1 | 2,
    secondDeliveryLocation: record.secondDeliveryLocation as 1 | 2,
    notes: record.notes ?? '',
    updatedAt: record.updatedAt.toISOString(),
    customer: mapCustomer(record.customer),
    menuSlots: record.menuSlots.map((slot) => ({
      id: slot.id,
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
    const [customer, variant, activeMenu] = await Promise.all([
      tx.customer.findUnique({ where: { id: data.customerId } }),
      tx.planVariant.findUnique({ where: { id: data.planVariantId }, include: { plan: true } }),
      tx.weeklyMenu.findFirst({ where: { isActive: true }, orderBy: { updatedAt: 'desc' }, include: menuSourceInclude }),
    ]);
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });
    if (!variant || !variant.isActive || !variant.plan.isActive) {
      throw createError({ statusCode: 404, statusMessage: 'La variante de plan no está disponible.' });
    }
    if (!activeMenu) throw createError({ statusCode: 409, statusMessage: 'No existe un menú activo para crear el pedido.' });

    const menuSlots = buildMenuSlots(activeMenu, variant.plan.slotTypes, variant.daysCount);
    if (!menuSlots.length) {
      throw createError({ statusCode: 409, statusMessage: 'El menú activo no contiene tiempos compatibles con el plan.' });
    }

    return tx.order.create({
      data: {
        customerId: customer.id,
        planVariantId: variant.id,
        sourceWeeklyMenuId: activeMenu.id,
        planTitleSnapshot: variant.plan.title,
        planVariantTitleSnapshot: variant.title,
        priceSnapshot: variant.price,
        firstDeliveryDate: toDate(data.firstDeliveryDate),
        firstDeliveryLocation: data.firstDeliveryLocation,
        firstDeliveryAddress: resolveAddress(customer, data.firstDeliveryLocation),
        secondDeliveryDate: toDate(data.secondDeliveryDate),
        secondDeliveryLocation: data.secondDeliveryLocation,
        secondDeliveryAddress: resolveAddress(customer, data.secondDeliveryLocation),
        notes: data.notes || null,
        menuSlots: { create: menuSlots },
      },
      select: { id: true },
    });
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
    const existing = await tx.order.findUnique({ where: { id }, include: { customer: true } });
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });

    await tx.orderMenuSlot.deleteMany({ where: { orderId: id } });
    await tx.order.update({
      where: { id },
      data: {
        status: data.status,
        firstDeliveryDate: toDate(data.firstDeliveryDate),
        firstDeliveryLocation: data.firstDeliveryLocation,
        firstDeliveryAddress: resolveAddress(existing.customer, data.firstDeliveryLocation),
        secondDeliveryDate: toDate(data.secondDeliveryDate),
        secondDeliveryLocation: data.secondDeliveryLocation,
        secondDeliveryAddress: resolveAddress(existing.customer, data.secondDeliveryLocation),
        notes: data.notes || null,
        menuSlots: { create: buildEditableMenu(data.menuSlots) },
      },
    });
  });

  return getOrderById(id);
}

export { ComponentRole };
