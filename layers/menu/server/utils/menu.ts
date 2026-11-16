import { createError } from "h3"

import { ComponentRole, SlotType, type Prisma, type DayOfWeek } from "~~/layers/menu/generated/prisma/client"
import { weeklyMenuInputSchema, type WeeklyMenuInputParsed } from "~~/layers/menu/shared/types/menuSchema"
import type {
  DayMenu,
  FoodItemDetail,
  MenuSlot,
  MenuType,
  SlotKey,
  WeeklyMenu,
  WeeklyMenuInput
} from "~~/layers/menu/shared/types/types"
import { menuCycleScope, weekStartOf } from "~~/layers/menu/shared/utils/weeklyCycle"

import { ensureCycleForWeek, updateCycle } from "./cycles"
import { prisma } from "./prisma"

const DAY_ORDER: Record<DayOfWeek, number> = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  DOMINGO: 7
}

const SLOT_TO_ENUM: Record<SlotKey, SlotType> = {
  desayuno: SlotType.DESAYUNO,
  comida: SlotType.COMIDA,
  cena: SlotType.CENA,
  snack1: SlotType.SNACK1,
  snack2: SlotType.SNACK2
}

const ENUM_TO_SLOT: Record<SlotType, SlotKey> = {
  [SlotType.DESAYUNO]: "desayuno",
  [SlotType.COMIDA]: "comida",
  [SlotType.CENA]: "cena",
  [SlotType.SNACK1]: "snack1",
  [SlotType.SNACK2]: "snack2"
}

const menuInclude = {
  cycle: { select: { status: true, weekStart: true, orderCutoffAt: true } },
  customer: { select: { nombre: true } },
  days: {
    orderBy: { order: "asc" as const },
    include: {
      slots: {
        include: {
          components: true
        }
      }
    }
  }
}

type WeeklyMenuRecord = Prisma.WeeklyMenuGetPayload<{
  include: typeof menuInclude
}>

type OptionalFoodItemInput = {
  catalogItemId?: string | null
  nombre?: string
  descripcion?: string
  calorias?: number
  imagen?: string
  tipo?: string
} | null

const SLOT_KEYS: SlotKey[] = ["desayuno", "comida", "cena", "snack1", "snack2"]

function trimString(value: string | undefined | null): string {
  return (value ?? "").trim()
}

function normalizeFoodItem(item: FoodItemDetail): FoodItemDetail {
  return {
    catalogItemId: item.catalogItemId ?? null,
    nombre: trimString(item.nombre),
    descripcion: trimString(item.descripcion),
    calorias: item.calorias,
    imagen: trimString(item.imagen),
    tipo: trimString(item.tipo)
  }
}

function isFoodItemFilled(item?: FoodItemDetail | null) {
  if (!item) {
    return false
  }

  return Boolean(
    trimString(item.nombre) ||
    trimString(item.descripcion) ||
    trimString(item.imagen) ||
    trimString(item.tipo) ||
    item.calorias > 0
  )
}

function createEmptyFoodItem(): FoodItemDetail {
  return {
    catalogItemId: null,
    nombre: "",
    descripcion: "",
    calorias: 0,
    imagen: "",
    tipo: ""
  }
}

function createEmptySlot(): MenuSlot {
  return {
    platilloPrincipal: createEmptyFoodItem(),
    guarnicion1: null,
    guarnicion2: null,
    contenedor: "",
    adicionales: []
  }
}

function normalizeOptionalFoodItem(item: OptionalFoodItemInput): FoodItemDetail | null {
  if (!item) {
    return null
  }

  const normalized: FoodItemDetail = {
    catalogItemId: item.catalogItemId ?? null,
    nombre: trimString(item.nombre),
    descripcion: trimString(item.descripcion),
    calorias: item.calorias ?? 0,
    imagen: trimString(item.imagen),
    tipo: trimString(item.tipo)
  }

  const hasAnyValue =
    normalized.nombre.length > 0 ||
    normalized.descripcion.length > 0 ||
    normalized.imagen.length > 0 ||
    normalized.tipo.length > 0 ||
    normalized.calorias > 0

  if (!hasAnyValue) {
    return null
  }

  if (!normalized.nombre || !normalized.tipo) {
    throw createError({
      statusCode: 400,
      statusMessage: "Guarniciones opcionales requieren nombre y tipo cuando se capturan."
    })
  }

  return normalized
}

function normalizePayload(payload: WeeklyMenuInputParsed): WeeklyMenuInputParsed {
  const days = payload.days.map((day) => {
    const normalizedDay: DayMenu = {
      dayOfWeek: day.dayOfWeek,
      desayuno: normalizeSlot(day.desayuno),
      comida: normalizeSlot(day.comida),
      cena: normalizeSlot(day.cena),
      snack1: normalizeSlot(day.snack1),
      snack2: normalizeSlot(day.snack2)
    }

    return normalizedDay
  })

  return {
    ...payload,
    name: trimString(payload.name),
    days
  }
}

function normalizeSlot(slot: MenuSlot): MenuSlot {
  const platilloPrincipal = isFoodItemFilled(slot.platilloPrincipal)
    ? normalizeFoodItem(slot.platilloPrincipal)
    : createEmptyFoodItem()

  return {
    platilloPrincipal,
    guarnicion1: normalizeOptionalFoodItem(slot.guarnicion1 as OptionalFoodItemInput),
    guarnicion2: normalizeOptionalFoodItem(slot.guarnicion2 as OptionalFoodItemInput),
    contenedor: trimString(slot.contenedor ?? ""),
    adicionales: slot.adicionales.map((item) => normalizeFoodItem(item))
  }
}

function buildComponents(slot: MenuSlot): Prisma.FoodComponentCreateWithoutDaySlotInput[] {
  const components: Prisma.FoodComponentCreateWithoutDaySlotInput[] = []

  if (isFoodItemFilled(slot.platilloPrincipal)) {
    components.push({
      componentRole: ComponentRole.PLATILLO_PRINCIPAL,
      ...slot.platilloPrincipal
    })
  }

  if (slot.guarnicion1) {
    components.push({
      componentRole: ComponentRole.GUARNICION_1,
      ...slot.guarnicion1
    })
  }

  if (slot.guarnicion2) {
    components.push({
      componentRole: ComponentRole.GUARNICION_2,
      ...slot.guarnicion2
    })
  }

  slot.adicionales.forEach((adicional) => {
    components.push({
      componentRole: ComponentRole.ADICIONAL,
      ...adicional
    })
  })

  return components
}

function buildDays(days: WeeklyMenuInputParsed["days"]): Prisma.MenuDayCreateWithoutWeeklyMenuInput[] {
  return days.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    order: DAY_ORDER[day.dayOfWeek],
    slots: {
      create: SLOT_KEYS.map((slotKey) => ({
        slotType: SLOT_TO_ENUM[slotKey],
        contenedor: day[slotKey].contenedor || null,
        components: {
          create: buildComponents(day[slotKey])
        }
      }))
    }
  }))
}

function mapFood(item: {
  catalogItemId: string | null
  nombre: string
  descripcion: string
  calorias: number
  imagen: string
  tipo: string
}): FoodItemDetail {
  return {
    catalogItemId: item.catalogItemId,
    nombre: item.nombre,
    descripcion: item.descripcion,
    calorias: item.calorias,
    imagen: item.imagen,
    tipo: item.tipo
  }
}

function mapSlot(record: WeeklyMenuRecord["days"][number]["slots"][number]): MenuSlot {
  const platilloPrincipal = record.components.find((item) => item.componentRole === ComponentRole.PLATILLO_PRINCIPAL)

  const guarnicion1 = record.components.find((item) => item.componentRole === ComponentRole.GUARNICION_1)
  const guarnicion2 = record.components.find((item) => item.componentRole === ComponentRole.GUARNICION_2)
  const adicionales = record.components.filter((item) => item.componentRole === ComponentRole.ADICIONAL)

  return {
    platilloPrincipal: platilloPrincipal ? mapFood(platilloPrincipal) : createEmptyFoodItem(),
    guarnicion1: guarnicion1 ? mapFood(guarnicion1) : null,
    guarnicion2: guarnicion2 ? mapFood(guarnicion2) : null,
    contenedor: record.contenedor,
    adicionales: adicionales.map(mapFood)
  }
}

function mapMenu(record: WeeklyMenuRecord): WeeklyMenu {
  return {
    id: record.id,
    name: record.name,
    cycleId: record.cycleId,
    cycleStatus: record.cycle?.status ?? null,
    weekStart: record.cycle?.weekStart.toISOString().slice(0, 10) ?? null,
    orderCutoffAt: record.cycle?.orderCutoffAt.toISOString() ?? null,
    customerId: record.customerId,
    customerName: record.customer?.nombre ?? null,
    menuType: record.menuType,
    isActive: record.isActive,
    startDate: record.startDate.toISOString(),
    endDate: record.endDate.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    days: record.days.map((day) => {
      const byType = Object.fromEntries(
        day.slots.map((slot) => [ENUM_TO_SLOT[slot.slotType], mapSlot(slot)])
      ) as Record<SlotKey, MenuSlot>

      return {
        dayOfWeek: day.dayOfWeek,
        desayuno: byType.desayuno ?? createEmptySlot(),
        comida: byType.comida ?? createEmptySlot(),
        cena: byType.cena ?? createEmptySlot(),
        snack1: byType.snack1 ?? createEmptySlot(),
        snack2: byType.snack2 ?? createEmptySlot()
      }
    })
  }
}

function validatePayload(input: WeeklyMenuInput) {
  const parsed = weeklyMenuInputSchema.safeParse(input)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Payload inválido para menú semanal.",
      data: parsed.error.flatten()
    })
  }

  return normalizePayload(parsed.data)
}

const DAY_MS = 86_400_000

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002"
}

/**
 * Resolves the week a menu belongs to and the key that keeps it unique there:
 * one standard and one vegetarian menu per week, one personalised per customer.
 */
async function resolveCyclePlacement(payload: WeeklyMenuInputParsed) {
  const weekStart = weekStartOf(payload.startDate)
  const weekEnd = new Date(new Date(`${weekStart}T00:00:00.000Z`).getTime() + 7 * DAY_MS)

  if (payload.endDate >= weekEnd) {
    throw createError({
      statusCode: 400,
      statusMessage: "El menú debe empezar y terminar dentro de la misma semana."
    })
  }

  const customerId = payload.menuType === "PERSONALIZADO" ? payload.customerId ?? null : null

  if (customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } })
    if (!customer) {
      throw createError({ statusCode: 400, statusMessage: "El cliente del menú personalizado no existe." })
    }
  }

  const cycle = await ensureCycleForWeek(weekStart)

  return {
    cycleId: cycle.id,
    customerId,
    cycleScope: menuCycleScope(payload.menuType, customerId),
    isActive: cycle.status === "OPEN"
  }
}

function scopeConflict() {
  return createError({
    statusCode: 409,
    statusMessage: "Ya existe un menú de ese tipo (o para ese cliente) en esa semana."
  })
}

/** Personalised menus are private to their customer and never served publicly. */
export function publicMenuType(value: unknown): Exclude<MenuType, "PERSONALIZADO"> {
  return value === "VEGETARIANO" ? "VEGETARIANO" : "ESTANDAR"
}

/** Menu of the week that is currently taking orders. */
export async function getActiveMenu(menuType: Exclude<MenuType, "PERSONALIZADO"> = "ESTANDAR") {
  const menu = await prisma.weeklyMenu.findFirst({
    where: { menuType, cycle: { status: "OPEN" } },
    orderBy: { startDate: "desc" },
    include: menuInclude
  })

  return menu ? mapMenu(menu) : null
}

export async function getNextMenu(menuType: Exclude<MenuType, "PERSONALIZADO"> = "ESTANDAR") {
  const now = new Date()

  const menu = await prisma.weeklyMenu.findFirst({
    where: {
      menuType,
      startDate: { gt: now }
    },
    orderBy: { startDate: "asc" },
    include: menuInclude
  })

  return menu ? mapMenu(menu) : null
}

export async function getAllMenus() {
  const menus = await prisma.weeklyMenu.findMany({
    orderBy: { startDate: "desc" },
    include: menuInclude
  })

  return menus.map(mapMenu)
}

export async function getMenuById(id: string) {
  const menu = await prisma.weeklyMenu.findUnique({
    where: { id },
    include: menuInclude
  })

  if (!menu) {
    return null
  }

  return mapMenu(menu)
}

export async function createWeeklyMenu(input: WeeklyMenuInput) {
  const payload = validatePayload(input)

  const placement = await resolveCyclePlacement(payload)

  try {
    const created = await prisma.weeklyMenu.create({
      data: {
        name: payload.name,
        menuType: payload.menuType,
        ...placement,
        startDate: payload.startDate,
        endDate: payload.endDate,
        days: {
          create: buildDays(payload.days)
        }
      },
      include: menuInclude
    })

    return mapMenu(created)
  } catch (error) {
    if (isUniqueViolation(error)) throw scopeConflict()
    throw error
  }
}

export async function updateWeeklyMenu(id: string, input: WeeklyMenuInput) {
  const existing = await prisma.weeklyMenu.findUnique({
    where: { id },
    select: { id: true, menuType: true, customerId: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Menú no encontrado." })
  }

  // Older clients omit these fields; keep what the menu already has.
  const payload = validatePayload({
    ...input,
    menuType: input.menuType === undefined ? existing.menuType : input.menuType,
    customerId: input.customerId === undefined ? existing.customerId : input.customerId
  })
  const placement = await resolveCyclePlacement(payload)

  const existingDays = await prisma.menuDay.findMany({
    where: { weeklyMenuId: id },
    select: { id: true }
  })

  const menuDayIds = existingDays.map((day) => day.id)

  const existingSlots = menuDayIds.length
    ? await prisma.daySlot.findMany({
        where: { menuDayId: { in: menuDayIds } },
        select: { id: true }
      })
    : []

  const daySlotIds = existingSlots.map((slot) => slot.id)

  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.weeklyMenu.update({
      where: { id },
      data: {
        name: payload.name,
        menuType: payload.menuType,
        ...placement,
        startDate: payload.startDate,
        endDate: payload.endDate
      }
    })
  ]

  if (daySlotIds.length) {
    operations.push(
      prisma.foodComponent.deleteMany({
        where: { daySlotId: { in: daySlotIds } }
      }),
      prisma.daySlot.deleteMany({
        where: { id: { in: daySlotIds } }
      })
    )
  }

  if (menuDayIds.length) {
    operations.push(
      prisma.menuDay.deleteMany({
        where: { id: { in: menuDayIds } }
      })
    )
  }

  operations.push(
    prisma.weeklyMenu.update({
      where: { id },
      data: {
        days: {
          create: buildDays(payload.days)
        }
      },
      include: menuInclude
    })
  )

  try {
    const results = await prisma.$transaction(operations)
    const updated = results[results.length - 1] as WeeklyMenuRecord

    return mapMenu(updated)
  } catch (error) {
    if (isUniqueViolation(error)) throw scopeConflict()
    throw error
  }
}

export async function deleteWeeklyMenu(id: string) {
  const existing = await prisma.weeklyMenu.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Menú no encontrado." })
  }

  // The week keeps its status; no other menu is promoted in its place.
  await prisma.weeklyMenu.delete({ where: { id } })

  return { id }
}

/** Opens orders for the week of this menu. Kept for the existing activate route. */
export async function setActiveMenu(id: string) {
  const existing = await prisma.weeklyMenu.findUnique({
    where: { id },
    select: { id: true, cycleId: true, cycle: { select: { status: true } } }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Menú no encontrado." })
  }

  if (!existing.cycleId) {
    throw createError({ statusCode: 409, statusMessage: "Asigna el menú a una semana antes de abrir pedidos." })
  }

  if (existing.cycle?.status !== "OPEN") {
    await updateCycle(existing.cycleId, { status: "OPEN" })
  }

  const activeMenu = await prisma.weeklyMenu.findUnique({
    where: { id },
    include: menuInclude
  })

  if (!activeMenu) {
    throw createError({ statusCode: 404, statusMessage: "Menú no encontrado." })
  }

  return mapMenu(activeMenu)
}
