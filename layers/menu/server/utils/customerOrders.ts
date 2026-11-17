import { createHash } from 'node:crypto';
import { createError } from 'h3';
import type { Prisma } from '../../generated/prisma/client';
import { customerOrderInputSchema, type CustomerOffer, type CustomerOrderInput, type PrivateCustomerOrder } from '../../shared/types/customerOrder';
import { availableOrderDays, chosenDaysError, planOrderDeliveries, deliverySequenceForDay } from '../../shared/utils/orderDeliveries';
import { pickCompatibleOption, roleFamily, withRolePositions } from '../../shared/utils/orderPersonalization';
import { utcToZonedDateTime } from '../../shared/utils/weeklyCycle';
import { personalizationMenuInclude, loadExclusionRules, loadRecipeFacts, buildMenuOptions, menuCatalogItemIds } from './orderPersonalization';
import { hashOrderSecret, parseOrderSecret, resolveOrderAccess } from './orderAccess';
import { parseIdempotencyKey } from './orders';
import { prisma } from './prisma';

const unavailable = () => createError({ statusCode: 409, statusMessage: 'No hay un menú disponible para recibir este pedido. Revisa la semana y el corte.', data: { code: 'OFFER_UNAVAILABLE' } });
const offerChanged = () => createError({ statusCode: 409, statusMessage: 'La oferta cambió. Actualiza el menú y revisa tu selección antes de enviar.', data: { code: 'OFFER_VERSION_CONFLICT' } });
const invalidSelection = () => createError({ statusCode: 400, statusMessage: 'Revisa los días, comidas y entregas del pedido.' });

async function context(tx: Prisma.TransactionClient, variantId: string, menuType: string, invitation?: string) {
  const access = invitation ? await resolveOrderAccess(tx, invitation) : null;
  // An order consultation link cannot act as an invitation or read customer data.
  if (access?.orderId) throw createError({ statusCode: 404, statusMessage: 'Solicita un enlace de pedido nuevo.' });
  const customer = access ? await tx.customer.findUnique({ where: { id: access.customerId } }) : null;
  const scope = customer ? (customer.tipoCliente === 'dieta' ? customer.id : customer.tipoCliente === 'vegetariano' ? 'VEGETARIANO' : 'ESTANDAR') : menuType;
  const variant = await tx.planVariant.findUnique({ where: { id: variantId }, include: { plan: true } });
  if (!variant?.isActive || !variant.plan.isActive) throw unavailable();
  const menu = await tx.weeklyMenu.findFirst({
    where: { cycleScope: scope, cycle: { status: 'OPEN', orderCutoffAt: { gt: new Date() } } },
    include: { ...personalizationMenuInclude, cycle: true },
  });
  if (!menu?.cycle || menu.cycle.weekStart.toISOString().slice(0, 10) <= utcToZonedDateTime(new Date(), 'America/Tijuana').date) throw unavailable();
  // Historical seed menus use a named placeholder instead of an empty slot.
  // It is not a dish and must not become a sellable day or substitution.
  for (const day of menu.days) for (const slot of day.slots) {
    slot.components = slot.components.filter(component => {
      const name = component.nombre.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return name.length > 0 && name !== 'sin menu asignado';
    });
  }
  const availableDays = availableOrderDays(menu.days, variant.plan.slotTypes);
  if (availableDays.length < variant.daysCount) throw unavailable();
  const rules = customer ? await loadExclusionRules(tx, customer.id) : [];
  const facts = await loadRecipeFacts(tx, menuCatalogItemIds(menu));
  const options = buildMenuOptions(menu, new Set(variant.plan.slotTypes), rules, facts);
  return { access, customer, variant, menu, cycle: menu.cycle, availableDays, options };
}

function toOffer(ctx: Awaited<ReturnType<typeof context>>): CustomerOffer {
  const { customer, variant, menu, cycle, availableDays, options } = ctx;
  return {
    revision: createHash('sha256').update(JSON.stringify({ menuId: menu.id, menuVersion: menu.version,
      planUpdatedAt: variant.plan.updatedAt, variantUpdatedAt: variant.updatedAt, cycleUpdatedAt: cycle.updatedAt,
      options: options.map(option => ({ id: option.id, conflict: option.conflict })) })).digest('hex'),
    menu: { id: menu.id, name: menu.name, version: menu.version },
    cycle: { id: cycle.id, weekStart: cycle.weekStart.toISOString().slice(0, 10), orderCutoffAt: cycle.orderCutoffAt.toISOString(),
      firstDeliveryAllowedDays: cycle.firstDeliveryAllowedDays, secondDeliveryAllowedDays: cycle.secondDeliveryAllowedDays,
      firstDeliveryMealDays: cycle.firstDeliveryMealDays, secondDeliveryMealDays: cycle.secondDeliveryMealDays },
    variant: { id: variant.id, title: variant.title, planTitle: variant.plan.title, daysCount: variant.daysCount,
      price: Number(variant.price), slotTypes: variant.plan.slotTypes },
    availableDays,
    options: options.map(({ id, nombre, descripcion, calorias, imagen, componentRole, dayOfWeek, slotType, conflict }) =>
      ({ id, nombre, descripcion, calorias, imagen, componentRole, dayOfWeek, slotType, conflict })),
    slots: menu.days.filter(day => availableDays.includes(day.dayOfWeek)).flatMap(day => day.slots
      .filter(slot => variant.plan.slotTypes.includes(slot.slotType)).map(slot => ({
        dayOfWeek: day.dayOfWeek, slotType: slot.slotType,
        components: withRolePositions(slot.components).map(({ component, position }) => {
          const original = options.find(option => option.id === component.id)!;
          const place = { dayOfWeek: day.dayOfWeek, slotType: slot.slotType, componentRole: component.componentRole, position };
          const selected = original.conflict.status === 'excluded' ? pickCompatibleOption(place, options) : original;
          if (!selected) throw createError({ statusCode: 409, statusMessage: 'No hay alternativas compatibles con las exclusiones de este pedido.' });
          return { originalId: component.id, selectedId: selected.id, componentRole: component.componentRole, position };
        }),
      }))),
    contact: customer ? { nombre: customer.nombre, telefono: customer.telefono, correoElectronico: customer.correoElectronico ?? '' } : null,
  };
}
export async function getCustomerOffer(variantId: string, menuType: string, invitation?: string) {
  return prisma.$transaction(async tx => toOffer(await context(tx, variantId, menuType, invitation)));
}

/** All customer, order, delivery, selected dish and capability writes commit together. */
export async function submitCustomerOrder(input: unknown, keyInput: string | undefined, tokenInput: string | undefined, menuType: string, invitation?: string) {
  const parsed = customerOrderInputSchema.safeParse(input);
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Revisa los datos del pedido.', data: parsed.error.flatten() });
  const data = parsed.data;
  const key = parseIdempotencyKey(keyInput);
  const token = parseOrderSecret(tokenInput);
  const tokenHash = hashOrderSecret(token);
  const fingerprint = createHash('sha256').update(JSON.stringify({ data, tokenHash, menuType, invitationHash: invitation ? hashOrderSecret(invitation) : null })).digest('hex');
  const replay = async () => {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey: key }, select: { id: true, idempotencyFingerprint: true, accessLinks: { where: { tokenHash }, select: { id: true } } } });
    if (!existing) return false;
    if (existing.idempotencyFingerprint !== fingerprint || !existing.accessLinks.length) {
      throw createError({ statusCode: 409, statusMessage: 'Esta solicitud ya se usó con otros datos.' });
    }
    await resolveOrderAccess(prisma, token);
    return true;
  };
  if (await replay()) return { path: '/pedido/confirmacion', replayed: true };
  try {
    await prisma.$transaction(async tx => {
      // Same lock order as publication: cycle first, then menu, then pricing.
      const ctx = await context(tx, data.planVariantId, menuType, invitation);
      await tx.$queryRaw`SELECT "id" FROM "weekly_cycles" WHERE "id" = ${ctx.cycle.id}::uuid FOR SHARE`;
      await tx.$queryRaw`SELECT "id" FROM "WeeklyMenu" WHERE "id" = ${ctx.menu.id} FOR SHARE`;
      await tx.$queryRaw`SELECT "id" FROM "plans" WHERE "id" = ${ctx.variant.plan.id}::uuid FOR SHARE`;
      await tx.$queryRaw`SELECT "id" FROM "plan_variants" WHERE "id" = ${data.planVariantId}::uuid FOR SHARE`;
      if (ctx.access) {
        await tx.$queryRaw`SELECT "id" FROM "order_access_links" WHERE "id" = ${ctx.access.id}::uuid FOR SHARE`;
      }
      // Re-read after locks: a concurrent close, price edit or revocation wins first.
      const fresh = await context(tx, data.planVariantId, menuType, invitation);
      if (fresh.menu.id !== data.menuId || fresh.menu.version !== data.offerVersion || Number(fresh.variant.price) !== data.expectedPrice) throw offerChanged();
      const offer = toOffer(fresh);
      if (data.offerRevision !== offer.revision) throw offerChanged();
      const daysError = chosenDaysError(data.days, offer.availableDays, offer.variant.daysCount);
      if (daysError) throw createError({ statusCode: 400, statusMessage: daysError });
      const slots = validateCustomerMeals(data, offer);
      const deliveries = planOrderDeliveries({ weekStart: offer.cycle.weekStart, days: data.days, rule: offer.cycle,
        preferred: Object.fromEntries(data.deliveries.map(delivery => [delivery.sequence, delivery.deliveryDay])) });
      if (new Set(data.deliveries.map(d => d.sequence)).size !== data.deliveries.length || deliveries.length !== data.deliveries.length
        || data.days.some(day => !deliveries.some(d => d.mealDays.includes(day)))
        || deliveries.some(d => data.deliveries.find(x => x.sequence === d.sequence)?.deliveryDay !== d.deliveryDay)
        || (deliveries.length === 2 && deliveries[1]!.scheduledDate < deliveries[0]!.scheduledDate)) throw invalidSelection();
      const customer = fresh.customer ?? await tx.customer.create({ data: {
        ...data.contact, ubicacion1: data.deliveries[0]!.address, source: 'sitio_web', status: 'prospecto',
        tipoCliente: menuType === 'VEGETARIANO' ? 'vegetariano' : 'menu',
      } });
      const order = await tx.order.create({ data: {
        customerId: customer.id, planVariantId: fresh.variant.id, cycleId: fresh.cycle.id, sourceWeeklyMenuId: fresh.menu.id,
        offerVersion: fresh.menu.version, idempotencyKey: key, idempotencyFingerprint: fingerprint,
        planTitleSnapshot: fresh.variant.plan.title, planVariantTitleSnapshot: fresh.variant.title, priceSnapshot: fresh.variant.price,
        contactSnapshot: data.contact, notes: data.notes || null,
        statusEvents: { create: { version: 1, toStatus: 'DRAFT', actorLabel: 'Cliente · web', reason: 'Pedido recibido; pendiente de confirmación por Heltifud' } },
        deliveries: { create: deliveries.map(d => ({ sequence: d.sequence, scheduledDate: new Date(`${d.scheduledDate}T00:00:00Z`),
          locationNumber: 1, addressSnapshot: data.deliveries.find(x => x.sequence === d.sequence)!.address })) },
        accessLinks: { create: { tokenHash, customerId: customer.id, expiresAt: new Date(Date.now() + 90 * 86400000) } },
      }, select: { id: true, deliveries: { select: { id: true, sequence: true } } } });
      for (const slot of slots) {
        const submitted = data.meals.find(meal => meal.dayOfWeek === slot.dayOfWeek && meal.slotType === slot.slotType)!;
        const sequence = deliverySequenceForDay(slot.dayOfWeek, fresh.cycle);
        const sourceSlot = fresh.menu.days.find(day => day.dayOfWeek === slot.dayOfWeek)!.slots.find(s => s.slotType === slot.slotType)!;
        await tx.orderMenuSlot.create({ data: {
          orderId: order.id, deliveryId: order.deliveries.find(d => d.sequence === sequence)!.id,
          dayOfWeek: slot.dayOfWeek, dayOrder: fresh.menu.days.find(d => d.dayOfWeek === slot.dayOfWeek)!.order,
          slotType: slot.slotType, contenedor: sourceSlot.contenedor, notes: submitted.notes || null,
          components: { create: slot.components.map(place => {
            const selectedId = submitted.components.find(c => c.originalId === place.originalId)!.selectedId;
            const selected = fresh.options.find(option => option.id === selectedId)!;
            return { componentRole: place.componentRole, position: place.position, catalogItemId: selected.catalogItemId,
              nombre: selected.nombre, descripcion: selected.descripcion, calorias: selected.calorias, imagen: selected.imagen, tipo: selected.tipo,
              sourceDayOfWeek: selected.dayOfWeek, sourceSlotType: selected.slotType, isSubstitution: selectedId !== place.originalId };
          }) },
        } });
        const changes = slot.components.flatMap(place => {
          const selectedId = submitted.components.find(c => c.originalId === place.originalId)!.selectedId;
          if (selectedId === place.originalId) return [];
          const original = fresh.options.find(x => x.id === place.originalId)!;
          const selected = fresh.options.find(x => x.id === selectedId)!;
          return [{ orderId: order.id, orderVersion: 1, kind: 'SUSTITUCION' as const, dayOfWeek: slot.dayOfWeek, slotType: slot.slotType,
            componentRole: place.componentRole, position: place.position, fromNombre: original.nombre, toNombre: selected.nombre,
            fromCatalogItemId: original.catalogItemId, toCatalogItemId: selected.catalogItemId, actorLabel: 'Cliente · web' }];
        });
        if (changes.length) await tx.orderMenuChange.createMany({ data: changes });
      }
      // Use the database clock at the final write boundary, not a browser clock.
      const window = await tx.$queryRaw<Array<{ allowed: boolean }>>`SELECT ("status" = 'OPEN' AND "order_cutoff_at" > clock_timestamp()) AS allowed FROM "weekly_cycles" WHERE "id" = ${fresh.cycle.id}::uuid`;
      if (!window[0]?.allowed) throw unavailable();
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002' && await replay()) return { path: '/pedido/confirmacion', replayed: true };
    throw error;
  }
  return { path: '/pedido/confirmacion', replayed: false };
}

/** Validate the full fixed structure; extra/omitted places and foreign options are rejected. */
export function validateCustomerMeals(data: Pick<CustomerOrderInput, 'days' | 'meals'>, offer: CustomerOffer) {
  const slots = offer.slots.filter(slot => data.days.includes(slot.dayOfWeek));
  const keys = data.meals.map(meal => `${meal.dayOfWeek}:${meal.slotType}`);
  if (new Set(keys).size !== keys.length || slots.length !== data.meals.length) throw invalidSelection();
  for (const slot of slots) {
    const meal = data.meals.find(m => m.dayOfWeek === slot.dayOfWeek && m.slotType === slot.slotType);
    if (!meal || meal.components.length !== slot.components.length || new Set(meal.components.map(c => c.originalId)).size !== meal.components.length) throw invalidSelection();
    for (const place of slot.components) {
      const submitted = meal.components.find(c => c.originalId === place.originalId);
      const selected = offer.options.find(o => o.id === submitted?.selectedId);
      if (!selected || roleFamily(selected.componentRole) !== roleFamily(place.componentRole)) throw invalidSelection();
      if (selected.conflict.status === 'excluded') throw createError({ statusCode: 409, statusMessage: 'Un platillo no es compatible con las exclusiones del cliente.' });
    }
  }
  return slots;
}

export async function getPrivateCustomerOrder(token: string): Promise<PrivateCustomerOrder> {
  const link = await resolveOrderAccess(prisma, token);
  if (!link.orderId) throw createError({ statusCode: 404, statusMessage: 'El enlace no corresponde a un pedido enviado.' });
  const order = await prisma.order.findUniqueOrThrow({ where: { id: link.orderId }, include: {
    customer: true, deliveries: { orderBy: { sequence: 'asc' } },
    menuSlots: { orderBy: [{ dayOrder: 'asc' }, { slotType: 'asc' }], include: { components: { orderBy: [{ componentRole: 'asc' }, { position: 'asc' }] } } },
  } });
  const snapshot = order.contactSnapshot as PrivateCustomerOrder['contact'] | null;
  return { folio: order.folio, status: order.status, planTitle: order.planTitleSnapshot, variantTitle: order.planVariantTitleSnapshot,
    price: Number(order.priceSnapshot), contact: snapshot ?? { nombre: order.customer.nombre, telefono: order.customer.telefono, correoElectronico: order.customer.correoElectronico ?? '' },
    notes: order.notes ?? '', expiresAt: link.expiresAt.toISOString(),
    deliveries: order.deliveries.map(d => ({ sequence: d.sequence, date: d.scheduledDate.toISOString().slice(0, 10), address: d.addressSnapshot, status: d.status })),
    meals: order.menuSlots.map(m => ({ dayOfWeek: m.dayOfWeek, slotType: m.slotType, notes: m.notes ?? '', dishes: m.components.map(c => c.nombre) })),
  };
}
