import { createHash } from 'node:crypto';

import { createError } from 'h3';

import { ComponentRole, OrderStatus, type Prisma } from '~~/layers/menu/generated/prisma/client';
import {
  orderCreateInputSchema,
  orderListQuerySchema,
  orderOptionsQuerySchema,
  orderUpdateInputSchema,
  orderStatusInputSchema,
  deliveryStatusInputSchema,
} from '~~/layers/menu/shared/types/menuSchema';
import type {
  OrderActor,
  OrderStatusInput,
  DeliveryStatusInput,
  Customer,
  CustomerLocationNumber,
  DeliverySequence,
  Order,
  OrderCreateInput,
  OrderDelivery,
  OrderListItem,
  OrderListResponse,
  OrderMenuSlotInput,
  OrderOptions,
  OrderUpdateInput,
} from '~~/layers/menu/shared/types/types';
import {
  orderPlaceKey,
  pickCompatibleOption,
  roleFamily,
  withRolePositions,
  type OrderPlace,
} from '~~/layers/menu/shared/utils/orderPersonalization';
import {
  deliveryDateOptions,
  allowedDeliveryDays,
  availableOrderDays,
  chosenDaysError,
  DELIVERY_SEQUENCE_LABELS,
  deliverySequenceForDay,
  planOrderDeliveries,
  type DeliveryMealRule,
} from '~~/layers/menu/shared/utils/orderDeliveries';

import {
  buildMenuOptions,
  conflictOf,
  loadExclusionRules,
  loadRecipeFacts,
  menuCatalogItemIds,
  menuOriginals,
  personalizationMenuInclude,
} from './orderPersonalization';
import { prisma } from './prisma';
import { ORDER_TRANSITIONS, DELIVERY_TRANSITIONS, derivedOrderStatus, isClosedOrder } from '../../shared/utils/orderWorkflow';

const deliveriesInclude = { orderBy: { sequence: 'asc' as const } };

const orderListInclude = {
  customer: { select: { nombre: true, telefono: true } },
  cycle: { select: { weekStart: true } },
  deliveries: deliveriesInclude,
};

const orderDetailInclude = {
  customer: true,
  cycle: true,
  statusEvents: { orderBy: [{ version: 'desc' as const }, { createdAt: 'desc' as const }, { id: 'desc' as const }] },
  deliveries: deliveriesInclude,
  sourceWeeklyMenu: { select: { id: true, name: true } },
  menuChanges: { orderBy: [{ createdAt: 'desc' as const }, { id: 'desc' as const }] },
  menuSlots: {
    orderBy: [{ dayOrder: 'asc' as const }, { slotType: 'asc' as const }],
    include: {
      delivery: { select: { sequence: true } },
      components: { orderBy: [{ componentRole: 'asc' as const }, { position: 'asc' as const }] },
    },
  },
};

const mealRuleSelect = { firstDeliveryMealDays: true, secondDeliveryMealDays: true };

const menuSourceInclude = {
  cycle: {
    select: {
      id: true,
      weekStart: true,
      orderCutoffAt: true,
      firstDeliveryAllowedDays: true,
      secondDeliveryAllowedDays: true,
      ...mealRuleSelect,
    },
  },
  ...personalizationMenuInclude,
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
    folio: order.folio,
    weekStart: toDateString(order.cycle.weekStart),
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

type SourceMenu = Prisma.WeeklyMenuGetPayload<{ include: typeof menuSourceInclude }>;

/** Dish data saved on an order place, copied from the menu on the server. */
interface PlaceDish {
  catalogItemId: string | null;
  nombre: string;
  descripcion: string;
  calorias: number;
  imagen: string;
  tipo: string;
}

function placeDish(source: PlaceDish, dayOfWeek: OrderPlace['dayOfWeek'], slotType: OrderPlace['slotType'], isSubstitution: boolean) {
  return {
    catalogItemId: source.catalogItemId,
    nombre: source.nombre,
    descripcion: source.descripcion,
    calorias: source.calorias,
    imagen: source.imagen,
    tipo: source.tipo,
    sourceDayOfWeek: dayOfWeek,
    sourceSlotType: slotType,
    isSubstitution,
  };
}

/**
 * Copies the chosen days of the menu, only the meal times the plan sells.
 * `dishFor` decides the dish of each place (the menu one, or a replacement).
 */
function buildMenuSlots(
  menu: SourceMenu,
  slotTypes: string[],
  days: ReadonlyArray<OrderMenuSlotInput['dayOfWeek']>,
  deliveryIdFor: (day: OrderMenuSlotInput['dayOfWeek']) => string,
  dishFor: (place: OrderPlace, component: PlaceDish) => ReturnType<typeof placeDish>,
) {
  return menu.days.filter((day) => days.includes(day.dayOfWeek)).flatMap((day) => day.slots
    .filter((slot) => slotTypes.includes(slot.slotType))
    .map((slot) => ({
      deliveryId: deliveryIdFor(day.dayOfWeek),
      dayOfWeek: day.dayOfWeek,
      dayOrder: day.order,
      slotType: slot.slotType,
      contenedor: slot.contenedor,
      components: {
        create: withRolePositions(slot.components).map(({ component, position }) => ({
          componentRole: component.componentRole,
          position,
          ...dishFor({ dayOfWeek: day.dayOfWeek, slotType: slot.slotType, componentRole: component.componentRole, position }, component),
        })),
      },
    })));
}

function offerConflict() {
  return createError({
    statusCode: 409,
    statusMessage: 'El menú de la semana cambió mientras se configuraba el pedido. Recarga las opciones y revisa los platillos.',
    data: { code: 'OFFER_VERSION_CONFLICT' },
  });
}

/**
 * Current offer version of a menu, holding it until the transaction ends so
 * the menu cannot change between this check and the order write.
 */
async function lockOfferVersion(tx: Prisma.TransactionClient, menuId: string) {
  const rows = await tx.$queryRaw<Array<{ version: number }>>`SELECT "version" FROM "WeeklyMenu" WHERE "id" = ${menuId} FOR SHARE`;
  return rows[0]?.version;
}

function excludedError(nombre: string, reasons: string[]) {
  return createError({
    statusCode: 409,
    statusMessage: `«${nombre}» no es compatible con las exclusiones del cliente (${reasons.join(', ')}). Elige otro platillo.`,
    data: { code: 'EXCLUDED_DISH' },
  });
}

export async function getOrders(query: unknown): Promise<OrderListResponse> {
  const parsed = orderListQuerySchema.safeParse(query);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Los filtros no son válidos.' });
  const { q, status, from, to, limit, customerId, cycleId, offset } = parsed.data;
  const where: Prisma.OrderWhereInput = {
    ...(customerId ? { customerId } : {}),
    ...(cycleId ? { cycleId } : {}),
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        ...(/^#?\d{1,9}$/.test(q) ? [{ folio: Number(q.replace('#', '')) }] : []),
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
    version: record.version,
    cycleStatus: record.cycle.status,
    deliveryDateOptions: {
      1: deliveryDateOptions(toDateString(record.cycle.weekStart), record.cycle, 1),
      2: deliveryDateOptions(toDateString(record.cycle.weekStart), record.cycle, 2),
    },
    statusEvents: record.statusEvents.map(event => ({ ...event, reason: event.reason ?? '', createdAt: event.createdAt.toISOString() })),
    cycleId: record.cycleId,
    capturedAfterCutoff: record.capturedAfterCutoff,
    planVariantId: record.planVariantId,
    sourceWeeklyMenuId: record.sourceWeeklyMenuId,
    sourceWeeklyMenuName: record.sourceWeeklyMenu?.name ?? null,
    offerVersion: record.offerVersion,
    menuChanges: record.menuChanges.map((change) => ({
      id: change.id,
      orderVersion: change.orderVersion,
      kind: change.kind,
      dayOfWeek: change.dayOfWeek,
      slotType: change.slotType,
      componentRole: change.componentRole,
      position: change.position,
      fromNombre: change.fromNombre,
      toNombre: change.toNombre,
      reason: change.reason ?? '',
      actorLabel: change.actorLabel,
      createdAt: change.createdAt.toISOString(),
    })),
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
        sourceDayOfWeek: component.sourceDayOfWeek,
        sourceSlotType: component.sourceSlotType,
        isSubstitution: component.isSubstitution,
      })),
    })),
  };
}

type OrderReader = Pick<Prisma.TransactionClient, 'customer' | 'planVariant' | 'weeklyMenu'>;

/**
 * Customer, plan variant and the menu that customer orders from in the week
 * taking orders, with the days that can be ordered for the plan.
 */
async function resolveOrderContext(client: OrderReader, customerId: string, planVariantId: string) {
  const [customer, variant] = await Promise.all([
    client.customer.findUnique({ where: { id: customerId } }),
    client.planVariant.findUnique({ where: { id: planVariantId }, include: { plan: true } }),
  ]);
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado.' });
  if (!variant || !variant.isActive || !variant.plan.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'La variante de plan no está disponible.' });
  }

  // Each customer type orders from its own menu of the week taking orders.
  const cycleScope = customer.tipoCliente === 'dieta'
    ? customer.id
    : customer.tipoCliente === 'vegetariano' ? 'VEGETARIANO' : 'ESTANDAR';
  const menu = await client.weeklyMenu.findFirst({
    where: { cycleScope, cycle: { status: 'OPEN' } },
    orderBy: { startDate: 'desc' },
    include: menuSourceInclude,
  });
  if (!menu?.cycle) {
    const missing = customer.tipoCliente === 'dieta'
      ? 'un menú personalizado para este cliente'
      : customer.tipoCliente === 'vegetariano' ? 'un menú vegetariano' : 'un menú estándar';
    throw createError({ statusCode: 409, statusMessage: `La semana con pedidos abiertos no tiene ${missing}.` });
  }

  const availableDays = availableOrderDays(menu.days, variant.plan.slotTypes);
  if (availableDays.length < variant.daysCount) {
    throw createError({
      statusCode: 409,
      statusMessage: `El menú «${menu.name}» solo tiene ${availableDays.length} ${availableDays.length === 1 ? 'día completo' : 'días completos'} para este plan y la variante necesita ${variant.daysCount}.`,
    });
  }

  return { customer, variant, menu, cycle: menu.cycle, availableDays };
}

export async function getOrderOptions(query: unknown): Promise<OrderOptions> {
  const parsed = orderOptionsQuerySchema.safeParse(query);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Selecciona un cliente y una variante de plan.' });

  const { variant, menu, cycle, availableDays } = await resolveOrderContext(prisma, parsed.data.customerId, parsed.data.planVariantId);
  return {
    cycle: {
      id: cycle.id,
      weekStart: toDateString(cycle.weekStart),
      orderCutoffAt: cycle.orderCutoffAt.toISOString(),
      pastCutoff: Date.now() > cycle.orderCutoffAt.getTime(),
      firstDeliveryAllowedDays: cycle.firstDeliveryAllowedDays,
      secondDeliveryAllowedDays: cycle.secondDeliveryAllowedDays,
      firstDeliveryMealDays: cycle.firstDeliveryMealDays,
      secondDeliveryMealDays: cycle.secondDeliveryMealDays,
    },
    menu: { id: menu.id, name: menu.name, version: menu.version },
    daysCount: variant.daysCount,
    availableDays,
  };
}

const IDEMPOTENCY_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validates the `Idempotency-Key` header the create endpoint requires. */
export function parseIdempotencyKey(value: string | null | undefined) {
  const key = value?.trim();
  if (!key) throw createError({ statusCode: 400, statusMessage: 'Falta la clave de idempotencia del pedido.' });
  if (!IDEMPOTENCY_KEY_PATTERN.test(key)) throw createError({ statusCode: 400, statusMessage: 'La clave de idempotencia del pedido no es válida.' });
  return key.toLowerCase();
}

// Same request, same hash: day and delivery order do not change the order created.
function createFingerprint(data: ReturnType<typeof orderCreateInputSchema.parse>) {
  const normalized = {
    customerId: data.customerId.toLowerCase(),
    planVariantId: data.planVariantId.toLowerCase(),
    days: [...data.days].sort(),
    deliveries: [...data.deliveries]
      .sort((a, b) => a.sequence - b.sequence)
      .map(({ sequence, deliveryDay, locationNumber }) => ({ sequence, deliveryDay, locationNumber })),
    notes: data.notes || null,
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

function isUniqueViolation(error: unknown) {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}

// Id of the order a used key created, or 422 when it came with another payload.
async function findIdempotentOrderId(key: string, fingerprint: string) {
  const existing = await prisma.order.findUnique({ where: { idempotencyKey: key }, select: { id: true, idempotencyFingerprint: true } });
  if (!existing) return null;
  if (existing.idempotencyFingerprint !== fingerprint) {
    throw createError({ statusCode: 422, statusMessage: 'Este formulario ya creó un pedido con otros datos. Revisa el listado de pedidos antes de capturarlo de nuevo.' });
  }
  return existing.id;
}

export async function createOrder(input: OrderCreateInput, actor?: OrderActor, idempotencyKey?: string) {
  const parsed = orderCreateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Los datos del pedido no son válidos.', data: parsed.error.flatten() });
  }
  const data = parsed.data;
  const key = idempotencyKey === undefined ? undefined : parseIdempotencyKey(idempotencyKey);
  const fingerprint = key ? createFingerprint(data) : undefined;

  if (key && fingerprint) {
    const existingId = await findIdempotentOrderId(key, fingerprint);
    if (existingId) return getOrderById(existingId);
  }

  const create = () => prisma.$transaction(async (tx) => {
    const { customer, variant, menu, cycle, availableDays } = await resolveOrderContext(tx, data.customerId, data.planVariantId);

    const lockedVersion = await lockOfferVersion(tx, menu.id);
    if (lockedVersion !== menu.version || data.offerVersion !== menu.version) throw offerConflict();

    const daysError = chosenDaysError(data.days, availableDays, variant.daysCount);
    if (daysError) throw createError({ statusCode: 400, statusMessage: daysError });

    // A day chosen for this order must be one the week allows; it never
    // changes the preference saved on the customer.
    const choices = new Map(data.deliveries.map((delivery) => [delivery.sequence, delivery]));
    for (const choice of data.deliveries) {
      if (!allowedDeliveryDays(cycle, choice.sequence).includes(choice.deliveryDay)) {
        throw createError({
          statusCode: 400,
          statusMessage: `El día elegido para la ${DELIVERY_SEQUENCE_LABELS[choice.sequence].toLowerCase()} no está permitido esta semana.`,
        });
      }
    }

    const planned = planOrderDeliveries({
      weekStart: toDateString(cycle.weekStart),
      days: data.days,
      rule: cycle,
      preferred: {
        1: choices.get(1)?.deliveryDay ?? customer.firstDeliveryDay,
        2: choices.get(2)?.deliveryDay ?? customer.secondDeliveryDay,
      },
    });
    const carried = new Set(planned.flatMap((delivery) => delivery.mealDays));
    if (!planned.length || data.days.some((day) => !carried.has(day))) {
      throw createError({ statusCode: 409, statusMessage: 'La semana no tiene días de entrega configurados para los días elegidos.' });
    }
    if (planned.length === 2 && planned[1]!.scheduledDate < planned[0]!.scheduledDate) {
      throw createError({ statusCode: 409, statusMessage: 'La segunda entrega quedaría antes que la primera. Revisa los días de entrega de la semana.' });
    }

    // Deliveries go first: each copied meal needs the id of the one that carries it.
    const order = await tx.order.create({
      data: {
        statusEvents: { create: { version: 1, toStatus: 'DRAFT', actorId: actor?.id, actorLabel: actor?.label, reason: 'Pedido creado' } },
        customerId: customer.id,
        planVariantId: variant.id,
        sourceWeeklyMenuId: menu.id,
        offerVersion: menu.version,
        cycleId: cycle.id,
        idempotencyKey: key ?? null,
        idempotencyFingerprint: fingerprint ?? null,
        capturedAfterCutoff: Date.now() > cycle.orderCutoffAt.getTime(),
        planTitleSnapshot: variant.plan.title,
        planVariantTitleSnapshot: variant.title,
        priceSnapshot: variant.price,
        notes: data.notes || null,
        deliveries: {
          create: planned.map((delivery) => {
            const locationNumber = choices.get(delivery.sequence)?.locationNumber ?? 1;
            return {
              sequence: delivery.sequence,
              scheduledDate: toDate(delivery.scheduledDate),
              locationNumber,
              addressSnapshot: resolveAddress(customer, locationNumber),
            };
          }),
        },
      },
      select: { id: true, deliveries: { select: { id: true, sequence: true } } },
    });

    // The customer's allergies and exclusions apply on their own: an excluded
    // dish is swapped for the closest compatible one of the week's menu.
    const rules = await loadExclusionRules(tx, customer.id);
    const facts = await loadRecipeFacts(tx, menuCatalogItemIds(menu));
    const options = buildMenuOptions(menu, new Set(variant.plan.slotTypes), rules, facts);
    const menuChanges: Prisma.OrderMenuChangeCreateWithoutOrderInput[] = [];
    const menuSlots = buildMenuSlots(menu, variant.plan.slotTypes, data.days, deliveryIdResolver(order.deliveries, cycle), (place, component) => {
      const conflict = conflictOf(component.catalogItemId, facts, rules);
      if (conflict.status !== 'excluded') return placeDish(component, place.dayOfWeek, place.slotType, false);
      const option = pickCompatibleOption(place, options);
      if (!option) {
        throw createError({
          statusCode: 409,
          statusMessage: `El menú no tiene una alternativa compatible para «${component.nombre}» (${conflict.reasons.join(', ')}). Revisa las exclusiones del cliente o el menú.`,
          data: { code: 'NO_COMPATIBLE_DISH' },
        });
      }
      menuChanges.push({
        orderVersion: 1, kind: 'AUTOMATICA', ...place,
        fromNombre: component.nombre, toNombre: option.nombre,
        fromCatalogItemId: component.catalogItemId, toCatalogItemId: option.catalogItemId,
        reason: conflict.reasons.join('; '), actorId: actor?.id, actorLabel: actor?.label,
      });
      return placeDish(option, option.dayOfWeek, option.slotType, true);
    });
    await tx.order.update({ where: { id: order.id }, data: { menuSlots: { create: menuSlots }, menuChanges: { create: menuChanges } } });

    return order;
  });

  try {
    const created = await create();
    return getOrderById(created.id);
  } catch (error) {
    // A simultaneous request with the same key won the unique index first;
    // this one rolled back and answers with the order the winner created.
    if (key && fingerprint && isUniqueViolation(error)) {
      const winnerId = await findIdempotentOrderId(key, fingerprint);
      if (winnerId) return getOrderById(winnerId);
    }
    throw error;
  }
}

type SavedComponent = Prisma.OrderMenuComponentGetPayload<object>;

const sameDish = (a: { catalogItemId: string | null; nombre: string; sourceDayOfWeek: string | null; sourceSlotType: string | null },
  b: { catalogItemId: string | null; nombre: string; sourceDayOfWeek?: string | null; sourceSlotType?: string | null }) =>
  a.catalogItemId === b.catalogItemId && a.nombre === b.nombre
  && a.sourceDayOfWeek === (b.sourceDayOfWeek ?? null) && a.sourceSlotType === (b.sourceSlotType ?? null);

export async function updateOrder(id: string, input: OrderUpdateInput, actor?: OrderActor) {
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
        cycle: true,
        menuSlots: { include: { components: true } },
      },
    });
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });

    if (existing.version !== data.version) throw versionConflict();
    if (existing.cycle.status !== 'OPEN') {
      throw createError({ statusCode: 409, statusMessage: 'La semana ya no acepta cambios de contenido.' });
    }
    if (isClosedOrder(existing.status) || existing.deliveries.some(delivery => delivery.status !== 'PENDING')) {
      throw createError({ statusCode: 409, statusMessage: 'El pedido está cerrado o tiene entregas en curso. Reabre o resuelve las entregas antes de editar.' });
    }

    // The plan fixes the places: same days, meal times and dishes per role.
    const savedByPlace = new Map<string, SavedComponent>();
    existing.menuSlots.forEach((slot) => slot.components.forEach((component) => {
      savedByPlace.set(orderPlaceKey({ dayOfWeek: slot.dayOfWeek, slotType: slot.slotType, componentRole: component.componentRole, position: component.position }), component);
    }));
    const slotKeys = new Set(existing.menuSlots.map(slot => `${slot.dayOfWeek}:${slot.slotType}:${slot.dayOrder}`));
    const placeKeys = data.menuSlots.flatMap((slot) => slot.components.map((component) => orderPlaceKey({ ...slot, ...component })));
    if (data.menuSlots.length !== slotKeys.size || data.menuSlots.some(slot => !slotKeys.has(`${slot.dayOfWeek}:${slot.slotType}:${slot.dayOrder}`))
      || placeKeys.length !== savedByPlace.size || placeKeys.some((key) => !savedByPlace.has(key))) {
      throw createError({ statusCode: 400, statusMessage: 'Conserva los días, tiempos y platillos contratados; solo se puede cambiar qué platillo ocupa cada lugar.' });
    }

    const expectedSequences = new Set(existing.menuSlots.map(slot => deliverySequenceForDay(slot.dayOfWeek, existing.cycle)));
    if (data.deliveries.length !== expectedSequences.size || data.deliveries.some(delivery => !expectedSequences.has(delivery.sequence))) {
      throw createError({ statusCode: 400, statusMessage: 'Las entregas deben corresponder al reparto de comidas de la semana.' });
    }
    for (const delivery of data.deliveries) {
      if (!deliveryDateOptions(toDateString(existing.cycle.weekStart), existing.cycle, delivery.sequence).includes(delivery.scheduledDate)) {
        throw createError({ statusCode: 400, statusMessage: 'La fecha de entrega debe ser una de las permitidas para esta semana.' });
      }
    }

    // Options come from the source menu at the version the editor was given.
    const menu = existing.sourceWeeklyMenuId
      ? await tx.weeklyMenu.findUnique({ where: { id: existing.sourceWeeklyMenuId }, include: personalizationMenuInclude })
      : null;
    if (menu) {
      const lockedVersion = await lockOfferVersion(tx, menu.id);
      if (lockedVersion !== menu.version || data.offerVersion !== menu.version) throw offerConflict();
    }
    const rules = await loadExclusionRules(tx, existing.customerId);
    const facts = await loadRecipeFacts(tx, [
      ...(menu ? menuCatalogItemIds(menu) : []),
      ...[...savedByPlace.values()].map((component) => component.catalogItemId),
    ]);
    const sold = new Set<string>(existing.menuSlots.map((slot) => slot.slotType));
    const options = new Map((menu ? buildMenuOptions(menu, sold, rules, facts) : []).map((option) => [option.id, option]));
    const originals = menu ? menuOriginals(menu) : new Map<string, string>();
    const nextVersion = data.version + 1;
    const menuChanges: Prisma.OrderMenuChangeCreateWithoutOrderInput[] = [];

    const resolvedSlots = data.menuSlots.map((slot) => ({
      ...slot,
      components: slot.components.map((component) => {
        const place: OrderPlace = { dayOfWeek: slot.dayOfWeek, slotType: slot.slotType, componentRole: component.componentRole, position: component.position };
        const key = orderPlaceKey(place);
        const saved = savedByPlace.get(key)!;

        if (component.orderComponentId) {
          if (component.orderComponentId !== saved.id) {
            throw createError({ statusCode: 400, statusMessage: 'Un platillo guardado no corresponde a su lugar en el pedido. Recarga el pedido.' });
          }
          const conflict = conflictOf(saved.catalogItemId, facts, rules);
          if (conflict.status === 'excluded') throw excludedError(saved.nombre, conflict.reasons);
          const { id: _id, orderMenuSlotId: _slot, ...dish } = saved;
          return dish;
        }

        if (!menu) {
          throw createError({ statusCode: 409, statusMessage: 'El menú de origen del pedido ya no existe; solo se pueden conservar los platillos guardados.' });
        }
        const option = options.get(component.menuComponentId!);
        if (!option) throw offerConflict();
        if (roleFamily(option.componentRole) !== roleFamily(place.componentRole)) {
          throw createError({ statusCode: 400, statusMessage: `«${option.nombre}» no puede ocupar ese lugar: un principal solo cambia por otro principal, y lo mismo con guarniciones y adicionales.` });
        }
        if (option.conflict.status === 'excluded') throw excludedError(option.nombre, option.conflict.reasons);

        const isSubstitution = originals.get(key) !== option.id;
        const dish = { componentRole: place.componentRole, position: place.position, ...placeDish(option, option.dayOfWeek, option.slotType, isSubstitution) };
        if (!sameDish(saved, dish)) {
          menuChanges.push({
            orderVersion: nextVersion, kind: isSubstitution ? 'SUSTITUCION' : 'RESTAURACION', ...place,
            fromNombre: saved.nombre, toNombre: option.nombre,
            fromCatalogItemId: saved.catalogItemId, toCatalogItemId: option.catalogItemId,
            actorId: actor?.id, actorLabel: actor?.label,
          });
        }
        return dish;
      }),
    }));

    await claimVersion(tx, id, data.version);

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

    const deliveryIdFor = deliveryIdResolver(deliveries, existing.cycle);
    await tx.order.update({
      where: { id },
      data: {
        notes: data.notes || null,
        offerVersion: menu?.version ?? existing.offerVersion,
        menuChanges: { create: menuChanges },
        menuSlots: {
          create: resolvedSlots.map((slot) => ({
            deliveryId: deliveryIdFor(slot.dayOfWeek),
            dayOfWeek: slot.dayOfWeek,
            dayOrder: slot.dayOrder,
            slotType: slot.slotType,
            contenedor: slot.contenedor || null,
            components: { create: slot.components },
          })),
        },
      },
    });
  });

  return getOrderById(id);
}

function versionConflict() {
  return createError({ statusCode: 409, statusMessage: 'Otro operador modificó el pedido. Recarga la versión actual antes de continuar.', data: { code: 'ORDER_VERSION_CONFLICT' } });
}

async function claimVersion(tx: Prisma.TransactionClient, id: string, version: number) {
  const result = await tx.order.updateMany({ where: { id, version }, data: { version: { increment: 1 } } });
  if (result.count !== 1) throw versionConflict();
}

export async function transitionOrder(id: string, input: OrderStatusInput, actor: OrderActor) {
  const parsed = orderStatusInputSchema.safeParse(input);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'El cambio de estado no es válido.' });
  const data = parsed.data;
  await prisma.$transaction(async tx => {
    const existing = await tx.order.findUnique({ where: { id }, include: { deliveries: true } });
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
    if (existing.version !== data.version) throw versionConflict();
    if (!ORDER_TRANSITIONS[existing.status].includes(data.status)) {
      throw createError({ statusCode: 409, statusMessage: 'Ese cambio de estado no está permitido.' });
    }
    const reopening = isClosedOrder(existing.status);
    if ((reopening || data.status === 'CANCELLED') && !data.reason) {
      throw createError({ statusCode: 400, statusMessage: 'Escribe el motivo de la cancelación o reapertura.' });
    }
    await claimVersion(tx, id, data.version);
    if (reopening) {
      for (const delivery of existing.deliveries.filter(item => item.status !== 'PENDING')) {
        await tx.orderStatusEvent.create({ data: {
          orderId: id, version: data.version + 1, fromStatus: existing.status, toStatus: data.status,
          deliverySequence: delivery.sequence, fromDeliveryStatus: delivery.status, toDeliveryStatus: 'PENDING',
          actorId: actor.id, actorLabel: actor.label, reason: data.reason,
        } });
      }
      await tx.orderDelivery.updateMany({ where: { orderId: id }, data: { status: 'PENDING', deliveredAt: null } });
    }
    await tx.order.update({ where: { id }, data: {
      status: data.status,
      statusEvents: { create: { version: data.version + 1, fromStatus: existing.status, toStatus: data.status,
        actorId: actor.id, actorLabel: actor.label, reason: data.reason || null } },
    } });
  });
  return getOrderById(id);
}

export async function transitionDelivery(id: string, sequence: DeliverySequence, input: DeliveryStatusInput, actor: OrderActor) {
  const parsed = deliveryStatusInputSchema.safeParse(input);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'El cambio de entrega no es válido.' });
  const data = parsed.data;
  await prisma.$transaction(async tx => {
    const existing = await tx.order.findUnique({ where: { id }, include: { deliveries: true } });
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
    if (existing.version !== data.version) throw versionConflict();
    const delivery = existing.deliveries.find(item => item.sequence === sequence);
    if (!delivery) throw createError({ statusCode: 404, statusMessage: 'Entrega no encontrada.' });
    if (!['PREPARING', 'PARTIALLY_DELIVERED'].includes(existing.status)
      || !DELIVERY_TRANSITIONS[delivery.status].includes(data.status)) {
      throw createError({ statusCode: 409, statusMessage: 'Ese cambio de entrega no está permitido para el estado actual del pedido.' });
    }
    if (data.status === 'FAILED' && !data.reason) {
      throw createError({ statusCode: 400, statusMessage: 'Escribe el motivo de la entrega fallida.' });
    }
    await claimVersion(tx, id, data.version);
    await tx.orderDelivery.update({ where: { id: delivery.id }, data: {
      status: data.status, deliveredAt: data.status === 'DELIVERED' ? new Date() : null,
      ...(data.reason ? { notes: data.reason } : {}),
    } });
    const status = derivedOrderStatus(existing.status, existing.deliveries.map(item => item.sequence === sequence ? data.status : item.status));
    await tx.order.update({ where: { id }, data: {
      status,
      statusEvents: { create: { version: data.version + 1, fromStatus: existing.status, toStatus: status,
        deliverySequence: sequence, fromDeliveryStatus: delivery.status, toDeliveryStatus: data.status,
        actorId: actor.id, actorLabel: actor.label, reason: data.reason || null } },
    } });
  });
  return getOrderById(id);
}

export { ComponentRole };
