<script setup lang="ts">
import { addDays, format, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { weeklyMenuInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import {
  DAY_OF_WEEK_VALUES,
  type DayOfWeek,
  type DayMenu,
  type FoodCatalogItem,
  type FoodItemDetail,
  type MenuSlot,
  type SlotKey,
  type WeeklyMenu,
  type WeeklyMenuInput
} from "~~/layers/menu/shared/types/types"
import type { ZodIssue } from "zod"

interface Props {
  menu?: WeeklyMenu | null
  mode?: "create" | "edit"
  catalogItems?: FoodCatalogItem[]
}

const props = defineProps<Props>()
const menu = computed(() => props.menu ?? null)
const mode = computed(() => props.mode ?? "create")
const catalogItems = computed(() => props.catalogItems ?? [])

const emit = defineEmits<{
  saved: [menuId: string]
}>()

const route = useRoute()
const router = useRouter()

const DAY_LABELS: Record<(typeof DAY_OF_WEEK_VALUES)[number], string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo"
}

const SLOT_LABELS: Record<keyof Omit<DayMenu, "dayOfWeek">, string> = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack1: "Snack 1",
  snack2: "Snack 2"
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
    guarnicion1: createEmptyFoodItem(),
    guarnicion2: createEmptyFoodItem(),
    contenedor: "",
    adicionales: []
  }
}

function createDay(dayOfWeek: (typeof DAY_OF_WEEK_VALUES)[number]): DayMenu {
  return {
    dayOfWeek,
    desayuno: createEmptySlot(),
    comida: createEmptySlot(),
    cena: createEmptySlot(),
    snack1: createEmptySlot(),
    snack2: createEmptySlot()
  }
}

function cloneFoodItem(item?: FoodItemDetail | null): FoodItemDetail {
  if (!item) {
    return createEmptyFoodItem()
  }

  return {
    catalogItemId: item.catalogItemId ?? null,
    nombre: item.nombre ?? "",
    descripcion: item.descripcion ?? "",
    calorias: item.calorias ?? 0,
    imagen: item.imagen ?? "",
    tipo: item.tipo ?? ""
  }
}

function cloneSlot(slot?: MenuSlot | null): MenuSlot {
  return {
    platilloPrincipal: cloneFoodItem(slot?.platilloPrincipal),
    guarnicion1: cloneFoodItem(slot?.guarnicion1),
    guarnicion2: cloneFoodItem(slot?.guarnicion2),
    contenedor: slot?.contenedor ?? "",
    adicionales: (slot?.adicionales ?? []).map((item) => cloneFoodItem(item))
  }
}

function createStateFromMenu(menu?: WeeklyMenu | null): WeeklyMenuInput {
  if (!menu) {
    return {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      days: DAY_OF_WEEK_VALUES.map((day) => createDay(day))
    }
  }

  const byDay = new Map(menu.days.map((day) => [day.dayOfWeek, day]))

  return {
    name: menu.name,
    startDate: new Date(menu.startDate),
    endDate: new Date(menu.endDate),
    days: DAY_OF_WEEK_VALUES.map((dayOfWeek) => {
      const source = byDay.get(dayOfWeek)

      return {
        dayOfWeek,
        desayuno: cloneSlot(source?.desayuno),
        comida: cloneSlot(source?.comida),
        cena: cloneSlot(source?.cena),
        snack1: cloneSlot(source?.snack1),
        snack2: cloneSlot(source?.snack2)
      }
    })
  }
}

const state = reactive<WeeklyMenuInput>(createStateFromMenu(menu.value))
const loading = ref(false)
const hiddenDays = new Set<DayOfWeek>()
const markAsActive = ref(Boolean(menu.value?.isActive))
const snacksExpanded = reactive<Record<DayOfWeek, boolean>>(
  DAY_OF_WEEK_VALUES.reduce(
    (acc, day) => {
      acc[day] = false
      return acc
    },
    {} as Record<DayOfWeek, boolean>
  )
)
const activeDay = ref<DayOfWeek>(DAY_OF_WEEK_VALUES[0]!)
const activeSlot = ref<SlotKey>("comida")
const editorOpen = ref(false)
const primarySlots = ["desayuno", "comida", "cena"] as const
const snackSlots = ["snack1", "snack2"] as const
const showSnacks = ref(false)
const weekStart = computed(() => startOfWeek(new Date(state.startDate), { weekStartsOn: 1 }))
const weekRange = computed(() => `${format(weekStart.value, "d MMM", { locale: es })} – ${format(addDays(weekStart.value, 6), "d MMM, yyyy", { locale: es })}`)
const activeDayData = computed(() => state.days.find((day) => day.dayOfWeek === activeDay.value))
const activeMeal = computed(() => activeDayData.value?.[activeSlot.value])
const failedImages = ref(new Set<string>())

function hasUsableImage(image?: string | null) {
  return Boolean(image?.trim() && !failedImages.value.has(image))
}

function markImageAsFailed(image: string) {
  failedImages.value = new Set([...failedImages.value, image])
}

function dayDate(index: number) {
  return format(addDays(weekStart.value, index), "d", { locale: es })
}

function selectMeal(day: DayOfWeek, slot: SlotKey) {
  activeDay.value = day
  activeSlot.value = slot
  if (slot === "snack1" || slot === "snack2") {
    snacksExpanded[day] = true
  }
}

function openMealEditor(day: DayOfWeek, slot: SlotKey) {
  selectMeal(day, slot)
  editorOpen.value = true
}

function toggleSnacksVisibility() {
  showSnacks.value = !showSnacks.value
}

function toggleMealEditor() {
  editorOpen.value = !editorOpen.value
}

function closeMealEditor() {
  editorOpen.value = false
}

async function publishMenu() {
  markAsActive.value = true
  await onSubmit()
}

const title = computed(() => {
  if (mode.value === "edit") {
    return state.name.trim() ? `Editar ${state.name}` : "Editar menú semanal"
  }

  return "Nuevo menú semanal"
})
const actionLabel = computed(() => (mode.value === "edit" ? "Guardar" : "Crear"))
const visibleDayEntries = computed(() =>
  state.days.map((day) => ({ day })).filter(({ day }) => !hiddenDays.has(day.dayOfWeek))
)
const cardSurfaceUi = {
  root: "app-surface",
  body: "p-0 sm:p-0",
  header: "px-6 py-5 sm:px-6",
  footer: "px-6 py-5 sm:px-6"
}

const toast = useToast()
const { createMenuOnDB, updateMenuOnDB, setActiveMenuOnDB } = useMenu()
const resolvedCatalogItems = computed<FoodCatalogItem[]>(() => catalogItems.value ?? [])
const invalidFields = reactive({
  name: false,
  startDate: false,
  endDate: false
})
const invalidDays = ref<Set<DayOfWeek>>(new Set())
const invalidSlots = ref<Record<DayOfWeek, Set<SlotKey>>>(
  DAY_OF_WEEK_VALUES.reduce(
    (acc, day) => {
      acc[day] = new Set<SlotKey>()
      return acc
    },
    {} as Record<DayOfWeek, Set<SlotKey>>
  )
)

function toComparableDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

function comparableFoodItem(item?: FoodItemDetail | null) {
  return {
    catalogItemId: item?.catalogItemId ?? null,
    nombre: item?.nombre ?? "",
    descripcion: item?.descripcion ?? "",
    calorias: item?.calorias ?? 0,
    imagen: item?.imagen ?? "",
    tipo: item?.tipo ?? ""
  }
}

function comparableSlot(slot: MenuSlot) {
  return {
    platilloPrincipal: comparableFoodItem(slot.platilloPrincipal),
    guarnicion1: comparableFoodItem(slot.guarnicion1),
    guarnicion2: comparableFoodItem(slot.guarnicion2),
    contenedor: slot.contenedor ?? "",
    adicionales: slot.adicionales.map((item) => comparableFoodItem(item))
  }
}

function comparableMenuInput(input: WeeklyMenuInput) {
  return {
    name: input.name.trim(),
    startDate: toComparableDate(input.startDate),
    endDate: toComparableDate(input.endDate),
    days: input.days.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      desayuno: comparableSlot(day.desayuno),
      comida: comparableSlot(day.comida),
      cena: comparableSlot(day.cena),
      snack1: comparableSlot(day.snack1),
      snack2: comparableSlot(day.snack2)
    }))
  }
}

const canSubmitByValidation = computed(() => weeklyMenuInputSchema.safeParse(state).success)
const isDirty = computed(() => {
  if (mode.value !== "edit") {
    return true
  }

  const original = comparableMenuInput(createStateFromMenu(menu.value))
  const current = comparableMenuInput(state)
  const activeChanged = markAsActive.value !== Boolean(menu.value?.isActive)

  return JSON.stringify(original) !== JSON.stringify(current) || activeChanged
})
const canSubmit = computed(() => canSubmitByValidation.value && isDirty.value && !loading.value)
const draftStorageKey = computed(() => `admin-menu-draft:${mode.value}:${menu.value?.id ?? "create"}`)

interface MenuFormDraftPayload {
  state: WeeklyMenuInput
  markAsActive: boolean
  snacksExpanded: Record<DayOfWeek, boolean>
  activeDay?: DayOfWeek
  daySectionsExpanded?: Record<DayOfWeek, boolean>
}

type RestoreSelectionView = "select-platillo-principal" | "select-guarnicion-1" | "select-guarnicion-2" | "extras"

interface RestoreSelectionTarget {
  dayOfWeek: DayOfWeek
  slotKey: SlotKey
  view: RestoreSelectionView
  search?: string
  selectedType?: string
  additionalIndex?: number
}

const restoreSelectionTarget = ref<RestoreSelectionTarget | null>(null)
const pendingCreatedCatalogItemId = ref<string | null>(null)
const pendingCreatedSelectionTarget = ref<RestoreSelectionTarget | null>(null)

watch(
  () => menu.value,
  (menu) => {
    Object.assign(state, createStateFromMenu(menu))
    markAsActive.value = Boolean(menu?.isActive)
    clearValidationHighlights()
    activeDay.value = DAY_OF_WEEK_VALUES[0]!
    activeSlot.value = "comida"
    editorOpen.value = false
    for (const day of DAY_OF_WEEK_VALUES) {
      snacksExpanded[day] = false
    }
  }
)

function snapshotDraftState(): WeeklyMenuInput {
  return {
    name: state.name,
    startDate: toComparableDate(state.startDate),
    endDate: toComparableDate(state.endDate),
    days: state.days.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      desayuno: cloneSlot(day.desayuno),
      comida: cloneSlot(day.comida),
      cena: cloneSlot(day.cena),
      snack1: cloneSlot(day.snack1),
      snack2: cloneSlot(day.snack2)
    }))
  }
}

function snapshotSnacksExpanded(): Record<DayOfWeek, boolean> {
  return DAY_OF_WEEK_VALUES.reduce(
    (acc, day) => {
      acc[day] = snacksExpanded[day]
      return acc
    },
    {} as Record<DayOfWeek, boolean>
  )
}

function persistDraft() {
  if (!import.meta.client) {
    return
  }

  const payload: MenuFormDraftPayload = {
    state: snapshotDraftState(),
    markAsActive: markAsActive.value,
    snacksExpanded: snapshotSnacksExpanded(),
    activeDay: activeDay.value
  }

  sessionStorage.setItem(draftStorageKey.value, JSON.stringify(payload))
}

function clearPersistedDraft() {
  if (!import.meta.client) {
    return
  }

  sessionStorage.removeItem(draftStorageKey.value)
}

function restorePersistedDraft() {
  if (!import.meta.client || route.query.restoreMenuDraft !== "1") {
    return
  }

  const raw = sessionStorage.getItem(draftStorageKey.value)

  if (!raw) {
    return
  }

  try {
    const payload = JSON.parse(raw) as MenuFormDraftPayload

    Object.assign(state, {
      name: payload.state.name,
      startDate: new Date(payload.state.startDate),
      endDate: new Date(payload.state.endDate),
      days: payload.state.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        desayuno: cloneSlot(day.desayuno),
        comida: cloneSlot(day.comida),
        cena: cloneSlot(day.cena),
        snack1: cloneSlot(day.snack1),
        snack2: cloneSlot(day.snack2)
      }))
    })

    markAsActive.value = payload.markAsActive
    activeDay.value = payload.activeDay && DAY_OF_WEEK_VALUES.includes(payload.activeDay)
      ? payload.activeDay
      : DAY_OF_WEEK_VALUES.find((day) => payload.daySectionsExpanded?.[day]) ?? DAY_OF_WEEK_VALUES[0]!

    for (const day of DAY_OF_WEEK_VALUES) {
      snacksExpanded[day] = Boolean(payload.snacksExpanded?.[day])
    }

    clearValidationHighlights()
    sessionStorage.removeItem(draftStorageKey.value)

    toast.add({
      title: "Menú restaurado",
      description: "Volviste al menú con los cambios que llevabas.",
      color: "success",
      icon: "i-lucide-check-circle"
    })
  } catch {
    sessionStorage.removeItem(draftStorageKey.value)
  }
}

function cleanedReturnQuery() {
  const nextQuery = { ...route.query }
  delete nextQuery.restoreMenuDraft
  delete nextQuery.restoreDay
  delete nextQuery.restoreSlot
  delete nextQuery.restoreSelectionView
  delete nextQuery.restoreSearch
  delete nextQuery.restoreSelectedType
  delete nextQuery.restoreAdditionalIndex
  delete nextQuery.createdCatalogItemId
  return nextQuery
}

async function clearRestoreQueryIfNeeded() {
  if (route.query.restoreMenuDraft !== "1") {
    return
  }

  await navigateTo(
    {
      path: route.path,
      query: cleanedReturnQuery()
    },
    { replace: true }
  )
}

function buildReturnToPath() {
  const restoreQuery = restoreSelectionTarget.value
    ? {
        restoreDay: restoreSelectionTarget.value.dayOfWeek,
        restoreSlot: restoreSelectionTarget.value.slotKey,
        restoreSelectionView: restoreSelectionTarget.value.view,
        ...(restoreSelectionTarget.value.search ? { restoreSearch: restoreSelectionTarget.value.search } : {}),
        ...(restoreSelectionTarget.value.selectedType ? { restoreSelectedType: restoreSelectionTarget.value.selectedType } : {}),
        ...(restoreSelectionTarget.value.additionalIndex !== undefined
          ? { restoreAdditionalIndex: String(restoreSelectionTarget.value.additionalIndex) }
          : {})
      }
    : {}

  return router.resolve({
    path: route.path,
    query: {
      ...cleanedReturnQuery(),
      restoreMenuDraft: "1",
      ...restoreQuery
    }
  }).fullPath
}

function clearRestoreSelectionTarget() {
  restoreSelectionTarget.value = null
}

function restoreSelectionTargetFromQuery() {
  const day = route.query.restoreDay
  const slot = route.query.restoreSlot
  const view = route.query.restoreSelectionView
  const search = route.query.restoreSearch
  const selectedType = route.query.restoreSelectedType
  const additionalIndex = route.query.restoreAdditionalIndex
  const createdCatalogItemId = route.query.createdCatalogItemId

  if (
    typeof day === "string" &&
    DAY_OF_WEEK_VALUES.includes(day as DayOfWeek) &&
    typeof slot === "string" &&
    ["desayuno", "comida", "cena", "snack1", "snack2"].includes(slot) &&
    typeof view === "string" &&
    ["select-platillo-principal", "select-guarnicion-1", "select-guarnicion-2", "extras"].includes(view)
  ) {
    restoreSelectionTarget.value = {
      dayOfWeek: day as DayOfWeek,
      slotKey: slot as SlotKey,
      view: view as RestoreSelectionView,
      search: typeof search === "string" ? search : undefined,
      selectedType: typeof selectedType === "string" ? selectedType : undefined,
      additionalIndex:
        typeof additionalIndex === "string" && /^\d+$/.test(additionalIndex)
          ? Number(additionalIndex)
          : undefined
    }

    pendingCreatedCatalogItemId.value = typeof createdCatalogItemId === "string" ? createdCatalogItemId : null
    pendingCreatedSelectionTarget.value = pendingCreatedCatalogItemId.value
      ? { ...restoreSelectionTarget.value }
      : null
    activeDay.value = day as DayOfWeek
    activeSlot.value = slot as SlotKey
    editorOpen.value = true

    if (slot === "snack1" || slot === "snack2") {
      snacksExpanded[day as DayOfWeek] = true
    }
  }
}

function applyCreatedCatalogItemFromReturn() {
  const itemId = pendingCreatedCatalogItemId.value
  const target = pendingCreatedSelectionTarget.value

  if (!itemId || !target) {
    return
  }

  const catalogItem = resolvedCatalogItems.value.find((item) => item.id === itemId)

  if (!catalogItem) {
    return
  }

  const day = state.days.find((entry) => entry.dayOfWeek === target.dayOfWeek)

  if (!day) {
    return
  }

  const selectedItem = cloneFoodItem({
    catalogItemId: catalogItem.id,
    nombre: catalogItem.nombre,
    descripcion: catalogItem.descripcion,
    calorias: catalogItem.calorias,
    imagen: catalogItem.imagen,
    tipo: catalogItem.tipo
  })
  const slot = day[target.slotKey]

  switch (target.view) {
    case "select-platillo-principal":
      slot.platilloPrincipal = selectedItem
      break
    case "select-guarnicion-1":
      slot.guarnicion1 = selectedItem
      break
    case "select-guarnicion-2":
      slot.guarnicion2 = selectedItem
      break
    case "extras":
      if (target.additionalIndex === undefined) {
        return
      }
      slot.adicionales[target.additionalIndex] = selectedItem
      break
  }

  pendingCreatedCatalogItemId.value = null
  pendingCreatedSelectionTarget.value = null

  toast.add({
    title: "Platillo seleccionado",
    description: `${catalogItem.nombre} quedó asignado al menú.`,
    color: "success",
    icon: "i-lucide-check-circle"
  })
}

watch(resolvedCatalogItems, applyCreatedCatalogItemFromReturn, { deep: true })

async function openCreateCatalogItem(payload: { tipo?: string, view?: RestoreSelectionView, search?: string, selectedType?: string, additionalIndex?: number }, target?: Omit<RestoreSelectionTarget, "view"> | null) {
  const prefilledName = payload.search?.trim()
  const prefilledType = payload.tipo ?? payload.selectedType

  restoreSelectionTarget.value = target && payload.view
    ? {
        ...target,
        view: payload.view,
        search: payload.search,
        selectedType: payload.selectedType,
        additionalIndex: payload.additionalIndex
      }
    : null
  persistDraft()

  await navigateTo({
    path: "/admin/platillos/crear-nuevo",
    query: {
      ...(prefilledName ? { nombre: prefilledName } : {}),
      ...(prefilledType ? { tipo: prefilledType } : {}),
      returnTo: buildReturnToPath()
    }
  })
}

async function openEditCatalogItem(payload: { id: string, view: RestoreSelectionView, additionalIndex?: number }, target?: Omit<RestoreSelectionTarget, "view"> | null) {
  restoreSelectionTarget.value = target
    ? { ...target, view: payload.view, additionalIndex: payload.additionalIndex }
    : null
  persistDraft()

  await navigateTo({
    path: `/admin/platillos/${payload.id}`,
    query: {
      returnTo: buildReturnToPath()
    }
  })
}

onMounted(async () => {
  restorePersistedDraft()
  restoreSelectionTargetFromQuery()
  applyCreatedCatalogItemFromReturn()
  await clearRestoreQueryIfNeeded()
})

function toggleSnacks(dayOfWeek: DayOfWeek) {
  snacksExpanded[dayOfWeek] = !snacksExpanded[dayOfWeek]
}

function clearValidationHighlights() {
  invalidFields.name = false
  invalidFields.startDate = false
  invalidFields.endDate = false
  invalidDays.value = new Set()
  invalidSlots.value = DAY_OF_WEEK_VALUES.reduce(
    (acc, day) => {
      acc[day] = new Set<SlotKey>()
      return acc
    },
    {} as Record<DayOfWeek, Set<SlotKey>>
  )
}

function applyValidationHighlights(issues: ZodIssue[]) {
  clearValidationHighlights()

  for (const issue of issues) {
    const [root, dayIndex, slotKey] = issue.path

    if (root === "name") {
      invalidFields.name = true
      continue
    }

    if (root === "startDate") {
      invalidFields.startDate = true
      continue
    }

    if (root === "endDate") {
      invalidFields.endDate = true
      continue
    }

    if (root === "days" && typeof dayIndex === "number" && typeof slotKey === "string") {
      const day = state.days[dayIndex]
      const normalizedSlotKey = slotKey as SlotKey

      if (!day || !(normalizedSlotKey in SLOT_LABELS)) {
        continue
      }

      if (hiddenDays.has(day.dayOfWeek)) {
        continue
      }

      invalidDays.value.add(day.dayOfWeek)
      invalidSlots.value[day.dayOfWeek].add(normalizedSlotKey)
      if (invalidDays.value.size === 1) {
        activeDay.value = day.dayOfWeek
        activeSlot.value = normalizedSlotKey
      }

      if (normalizedSlotKey === "snack1" || normalizedSlotKey === "snack2") {
        snacksExpanded[day.dayOfWeek] = true
      }
    }
  }
}

function isDayInvalid(dayOfWeek: DayOfWeek) {
  return invalidDays.value.has(dayOfWeek)
}

function isSlotInvalid(dayOfWeek: DayOfWeek, slotKey: SlotKey) {
  return invalidSlots.value[dayOfWeek].has(slotKey)
}

function formatValidationIssue(issue?: ZodIssue) {
  if (!issue) {
    return "Verifica la información del menú."
  }

  const [root, dayIndex, slotKey, fieldKey, nestedField] = issue.path

  if (root === "name") {
    return "El nombre del menú es obligatorio."
  }

  if (root === "days" && typeof dayIndex === "number" && typeof slotKey === "string" && typeof fieldKey === "string") {
    const day = state.days[dayIndex]
    const dayLabel = day ? DAY_LABELS[day.dayOfWeek] : "el día seleccionado"
    const slotLabel = SLOT_LABELS[slotKey as keyof typeof SLOT_LABELS] ?? "este tiempo"

    if (day && hiddenDays.has(day.dayOfWeek)) {
      return "Verifica la información opcional capturada en fin de semana."
    }

    if (fieldKey === "platilloPrincipal" && nestedField === "nombre") {
      return `Falta el nombre del platillo principal en ${slotLabel} de ${dayLabel}.`
    }

    if ((fieldKey === "guarnicion1" || fieldKey === "guarnicion2") && nestedField === "nombre") {
      const guarnicionLabel = fieldKey === "guarnicion1" ? "guarnición 1" : "guarnición 2"
      return `Falta el nombre de ${guarnicionLabel} en ${slotLabel} de ${dayLabel}.`
    }

    if (fieldKey === "adicionales" && nestedField !== undefined) {
      return `Hay un adicional incompleto en ${slotLabel} de ${dayLabel}.`
    }

    if (fieldKey === "platilloPrincipal" && nestedField === "tipo") {
      return `Falta el tipo del platillo principal en ${slotLabel} de ${dayLabel}.`
    }
  }

  return issue.message || "Verifica la información del menú."
}

async function onSubmit() {
  const parsed = weeklyMenuInputSchema.safeParse(state)

  if (!parsed.success) {
    applyValidationHighlights(parsed.error.issues)
    const firstIssue = parsed.error.issues[0]

    toast.add({
      title: "Error de validación",
      description: formatValidationIssue(firstIssue),
      color: "error",
      icon: "i-lucide-circle-alert"
    })
    return
  }

  clearValidationHighlights()
  loading.value = true

  try {
    const savedMenu =
      mode.value === "edit" && menu.value?.id
        ? await updateMenuOnDB(menu.value.id, parsed.data)
        : await createMenuOnDB(parsed.data)

    if (markAsActive.value && !savedMenu.isActive) {
      await setActiveMenuOnDB(savedMenu.id)
    }

    clearPersistedDraft()

    toast.add({
      title: mode.value === "edit" ? "Menú actualizado" : "Menú creado",
      description: markAsActive.value
        ? "La información se guardó y este menú quedó como activo."
        : "La información se guardó correctamente.",
      color: "success",
      icon: "i-lucide-check-circle"
    })

    emit("saved", savedMenu.id)
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el menú"
    toast.add({ title: "Error", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <UForm
      class="space-y-6"
      @submit="onSubmit"
    >
      <UCard :ui="cardSurfaceUi">
        <template #header>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-2xl">
              <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
              <p class="mt-1 text-sm text-muted">
                Define el nombre del menú y el rango de fechas en el que estará disponible.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center lg:justify-end lg:gap-3">
              <UButton
                type="submit"
                :loading="loading"
                :disabled="!canSubmit"
                :color="canSubmit ? 'primary' : 'neutral'"
                icon="i-lucide-save"
                block
                class="justify-center"
                size="lg"
              >
                {{ actionLabel }}
              </UButton>
              <UBadge v-if="mode === 'edit' && !isDirty" color="success" variant="soft" icon="i-lucide-circle-check">Guardado</UBadge>

              <UButton
                v-if="!menu?.isActive"
                type="button"
                color="primary"
                icon="i-lucide-send"
                block
                size="lg"
                class="justify-center"
                :loading="loading"
                :disabled="!canSubmitByValidation || loading"
                @click="publishMenu"
              >Publicar menú</UButton>
              <UBadge v-else color="success" variant="soft" icon="i-lucide-circle-check" size="lg">Publicado</UBadge>
            </div>
          </div>
        </template>

        <div class="grid gap-4 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <UFormField
            name="name"
            class="md:col-span-2 lg:col-span-1"
          >
            <AdminMetaField
              label="Nombre del menú"
              :invalid="invalidFields.name"
            >
              <UInput
                v-model="state.name"
                placeholder="Ej. Menú Semana 12"
                icon="i-lucide-notebook-pen"
                variant="ghost"
                class="w-full"
                :ui="{
                  base: 'h-5 min-h-5 max-h-5 border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent',
                  leading: 'ps-0',
                  leadingIcon: 'size-4 text-muted'
                }"
              />
            </AdminMetaField>
          </UFormField>

          <UFormField name="startDate">
            <AdminMetaField
              label="Fecha de inicio"
              :invalid="invalidFields.startDate"
            >
              <DatePicker v-model="state.startDate" />
            </AdminMetaField>
          </UFormField>

          <UFormField name="endDate">
            <AdminMetaField
              label="Fecha final"
              :invalid="invalidFields.endDate"
            >
              <DatePicker v-model="state.endDate" />
            </AdminMetaField>
          </UFormField>
        </div>
      </UCard>

      <section class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-calendar-days" class="size-4 text-primary" />
            <span class="font-medium text-highlighted">{{ weekRange }}</span>
          </div>
          <UButton
            type="button"
            size="sm"
            color="neutral"
            variant="ghost"
            :icon="showSnacks ? 'i-lucide-minus' : 'i-lucide-plus'"
            @click="toggleSnacksVisibility"
          >{{ showSnacks ? 'Ocultar snacks' : 'Mostrar snacks' }}</UButton>
        </div>

        <div class="overflow-x-auto rounded-xl border border-default bg-default shadow-sm">
          <div class="grid min-w-[1100px] grid-cols-[104px_repeat(7,minmax(0,1fr))] gap-px bg-[var(--ui-border)]">
            <div class="bg-elevated/70" />
            <div
              v-for="(entry, index) in visibleDayEntries"
              :key="entry.day.dayOfWeek"
              class="bg-elevated/70 px-2 py-3 text-center text-sm font-semibold text-highlighted"
            >{{ DAY_LABELS[entry.day.dayOfWeek].slice(0, 3) }} {{ dayDate(index) }}</div>

            <template v-for="slotKey in (showSnacks ? [...primarySlots, ...snackSlots] : primarySlots)" :key="slotKey">
              <div class="flex items-center bg-elevated/70 px-3 text-sm font-semibold text-highlighted">{{ SLOT_LABELS[slotKey] }}</div>
              <div
                v-for="entry in visibleDayEntries"
                :key="`${entry.day.dayOfWeek}-${slotKey}`"
                class="bg-default p-1.5"
              >
                <button
                  type="button"
                  :aria-label="`${SLOT_LABELS[slotKey]} de ${DAY_LABELS[entry.day.dayOfWeek]}: ${entry.day[slotKey].platilloPrincipal.nombre || 'Añadir plato'}`"
                  :aria-pressed="activeDay === entry.day.dayOfWeek && activeSlot === slotKey"
                  :class="[
                    'group flex h-40 w-full flex-col rounded-lg border bg-default p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    activeDay === entry.day.dayOfWeek && activeSlot === slotKey ? 'border-primary ring-1 ring-primary/50 shadow-sm' : 'border-default',
                    isSlotInvalid(entry.day.dayOfWeek, slotKey) ? 'border-error ring-1 ring-error/40' : ''
                  ]"
                  @click="entry.day[slotKey].platilloPrincipal.nombre ? selectMeal(entry.day.dayOfWeek, slotKey) : openMealEditor(entry.day.dayOfWeek, slotKey)"
                  @dblclick="openMealEditor(entry.day.dayOfWeek, slotKey)"
                >
                  <template v-if="entry.day[slotKey].platilloPrincipal.nombre">
                    <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md bg-elevated/50">
                      <img
                        v-if="hasUsableImage(entry.day[slotKey].platilloPrincipal.imagen)"
                        :src="entry.day[slotKey].platilloPrincipal.imagen"
                        :alt="entry.day[slotKey].platilloPrincipal.nombre"
                        class="h-full w-full object-cover"
                        loading="lazy"
                        @error="markImageAsFailed(entry.day[slotKey].platilloPrincipal.imagen)"
                      >
                      <UIcon v-else name="i-lucide-utensils" class="size-9 text-muted/40" />
                    </div>
                    <span class="mt-2 line-clamp-2 w-full text-xs font-medium leading-snug text-highlighted">{{ entry.day[slotKey].platilloPrincipal.nombre }}</span>
                  </template>
                  <template v-else>
                    <span class="flex min-h-0 w-full flex-1 items-center justify-center rounded-md bg-elevated/50">
                      <UIcon name="i-lucide-utensils" class="size-9 text-muted/40" />
                    </span>
                    <span class="mt-2 w-full text-xs font-medium text-muted group-hover:text-primary">Añadir plato</span>
                  </template>
                </button>
              </div>
            </template>
          </div>
        </div>

        <UCard v-if="activeMeal" :ui="{ root: 'app-surface', body: 'p-4 sm:p-5' }">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-elevated sm:size-24">
              <img
                v-if="hasUsableImage(activeMeal.platilloPrincipal.imagen)"
                :src="activeMeal.platilloPrincipal.imagen"
                :alt="activeMeal.platilloPrincipal.nombre"
                class="size-full object-cover"
                @error="markImageAsFailed(activeMeal.platilloPrincipal.imagen)"
              >
              <UIcon v-else name="i-lucide-utensils" class="size-8 text-muted/50" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-muted">{{ DAY_LABELS[activeDay] }} · {{ SLOT_LABELS[activeSlot] }}</p>
              <h3 class="mt-1 text-lg font-semibold text-highlighted">{{ activeMeal.platilloPrincipal.nombre || 'Sin plato asignado' }}</h3>
              <p class="mt-1 text-sm text-muted">{{ [activeMeal.guarnicion1?.nombre, activeMeal.guarnicion2?.nombre].filter(Boolean).join(' · ') || 'Selecciona un plato para comenzar.' }}</p>
            </div>
            <UButton type="button" color="primary" variant="soft" icon="i-lucide-refresh-cw" @click="toggleMealEditor">
              {{ editorOpen ? 'Cerrar editor' : activeMeal.platilloPrincipal.nombre ? 'Cambiar plato' : 'Añadir plato' }}
            </UButton>
            <UButton
              v-if="activeMeal.platilloPrincipal.catalogItemId"
              type="button"
              color="neutral"
              variant="outline"
              icon="i-lucide-pencil"
              @click="openEditCatalogItem({ id: activeMeal.platilloPrincipal.catalogItemId, view: 'select-platillo-principal' }, { dayOfWeek: activeDay, slotKey: activeSlot })"
            >Editar receta</UButton>
          </div>
        </UCard>

        <UCard
          v-for="entry in visibleDayEntries"
          v-show="editorOpen && activeDay === entry.day.dayOfWeek"
          :key="entry.day.dayOfWeek"
          variant="subtle"
          :class="[
            'app-surface-soft overflow-hidden',
            isDayInvalid(entry.day.dayOfWeek) ? 'ring-1 ring-error/35 border-error/50' : ''
          ]"
          :ui="{ root: 'app-surface-soft overflow-hidden', header: 'px-5 py-4 sm:px-5', body: 'p-0 sm:p-0' }"
        >
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold text-primary">Editar {{ SLOT_LABELS[activeSlot].toLowerCase() }} · {{ DAY_LABELS[entry.day.dayOfWeek] }}</h3>
                <p class="mt-1 text-xs text-muted">Selecciona el platillo, guarniciones y adicionales de este día.</p>
              </div>
              <UButton type="button" icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Cerrar editor" @click="closeMealEditor" />
            </div>
          </template>

              <section class="grid grid-cols-1 gap-0 border-t border-default/70">
                <AdminMenuSlotEditor
                  v-show="activeSlot === 'desayuno'"
                  v-model="entry.day.desayuno"
                  title="Desayuno"
                  :day-label="DAY_LABELS[entry.day.dayOfWeek]"
                  :show-toggle="false"
                  :catalog-items="resolvedCatalogItems"
                  :restore-selection-view="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'desayuno'
                      ? restoreSelectionTarget.view
                      : null
                  "
                  :restore-search="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'desayuno'
                      ? restoreSelectionTarget.search ?? ''
                      : ''
                  "
                  :restore-selected-type="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'desayuno'
                      ? restoreSelectionTarget.selectedType ?? 'todos'
                      : 'todos'
                  "
                  :class="[
                    'lg:border-r lg:border-default/70',
                    isSlotInvalid(entry.day.dayOfWeek, 'desayuno') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
                  ]"
                  @restore-selection-applied="clearRestoreSelectionTarget"
                  @create-catalog-item="openCreateCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'desayuno' })"
                  @edit-catalog-item="openEditCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'desayuno' })"
                />
                <AdminMenuSlotEditor
                  v-show="activeSlot === 'comida'"
                  v-model="entry.day.comida"
                  title="Comida"
                  :day-label="DAY_LABELS[entry.day.dayOfWeek]"
                  :show-toggle="false"
                  :catalog-items="resolvedCatalogItems"
                  :restore-selection-view="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'comida'
                      ? restoreSelectionTarget.view
                      : null
                  "
                  :restore-search="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'comida'
                      ? restoreSelectionTarget.search ?? ''
                      : ''
                  "
                  :restore-selected-type="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'comida'
                      ? restoreSelectionTarget.selectedType ?? 'todos'
                      : 'todos'
                  "
                  :class="[
                    'lg:border-r lg:border-default/70',
                    isSlotInvalid(entry.day.dayOfWeek, 'comida') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
                  ]"
                  @restore-selection-applied="clearRestoreSelectionTarget"
                  @create-catalog-item="openCreateCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'comida' })"
                  @edit-catalog-item="openEditCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'comida' })"
                />
                <AdminMenuSlotEditor
                  v-show="activeSlot === 'cena'"
                  v-model="entry.day.cena"
                  title="Cena"
                  :day-label="DAY_LABELS[entry.day.dayOfWeek]"
                  :show-toggle="false"
                  :catalog-items="resolvedCatalogItems"
                  :restore-selection-view="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'cena'
                      ? restoreSelectionTarget.view
                      : null
                  "
                  :restore-search="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'cena'
                      ? restoreSelectionTarget.search ?? ''
                      : ''
                  "
                  :restore-selected-type="
                    restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'cena'
                      ? restoreSelectionTarget.selectedType ?? 'todos'
                      : 'todos'
                  "
                  :class="isSlotInvalid(entry.day.dayOfWeek, 'cena') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''"
                  @restore-selection-applied="clearRestoreSelectionTarget"
                  @create-catalog-item="openCreateCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'cena' })"
                  @edit-catalog-item="openEditCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'cena' })"
                />
              </section>

              <section v-if="activeSlot === 'snack1' || activeSlot === 'snack2'" class="border-t border-default/70">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-elevated/20"
                  @click="toggleSnacks(entry.day.dayOfWeek)"
                >
                  <span>
                    <span class="block text-sm font-semibold text-primary">Snacks</span>
                    <span class="mt-1 block text-xs text-muted">
                      {{
                        snacksExpanded[entry.day.dayOfWeek]
                          ? "Oculta colaciones y snacks de este día."
                          : "Muestra Snack 1 y Snack 2 de este día."
                      }}
                    </span>
                  </span>

                  <UIcon
                    :name="snacksExpanded[entry.day.dayOfWeek] ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                    class="size-4 text-muted"
                  />
                </button>

                <section
                  v-if="snacksExpanded[entry.day.dayOfWeek]"
                  class="grid grid-cols-1 gap-0 border-t border-default/70"
                >
                  <AdminMenuSlotEditor
                    v-show="activeSlot === 'snack1'"
                    v-model="entry.day.snack1"
                    title="Snack 1"
                    :day-label="DAY_LABELS[entry.day.dayOfWeek]"
                    :show-sides="false"
                    :show-toggle="false"
                    :catalog-items="resolvedCatalogItems"
                    :restore-selection-view="
                      restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'snack1'
                        ? restoreSelectionTarget.view
                        : null
                    "
                    :restore-search="
                      restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'snack1'
                        ? restoreSelectionTarget.search ?? ''
                        : ''
                    "
                    :restore-selected-type="
                      restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'snack1'
                        ? restoreSelectionTarget.selectedType ?? 'todos'
                        : 'todos'
                    "
                    :class="[
                      'lg:border-r lg:border-default/70',
                      isSlotInvalid(entry.day.dayOfWeek, 'snack1') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
                    ]"
                    @restore-selection-applied="clearRestoreSelectionTarget"
                    @create-catalog-item="openCreateCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'snack1' })"
                    @edit-catalog-item="openEditCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'snack1' })"
                  />
                  <AdminMenuSlotEditor
                    v-show="activeSlot === 'snack2'"
                    v-model="entry.day.snack2"
                    title="Snack 2"
                    :day-label="DAY_LABELS[entry.day.dayOfWeek]"
                    :show-sides="false"
                    :show-toggle="false"
                    :catalog-items="resolvedCatalogItems"
                    :restore-selection-view="
                      restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'snack2'
                        ? restoreSelectionTarget.view
                        : null
                    "
                    :restore-search="
                      restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'snack2'
                        ? restoreSelectionTarget.search ?? ''
                        : ''
                    "
                    :restore-selected-type="
                      restoreSelectionTarget?.dayOfWeek === entry.day.dayOfWeek && restoreSelectionTarget?.slotKey === 'snack2'
                        ? restoreSelectionTarget.selectedType ?? 'todos'
                        : 'todos'
                    "
                    :class="
                      isSlotInvalid(entry.day.dayOfWeek, 'snack2') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
                    "
                    @restore-selection-applied="clearRestoreSelectionTarget"
                    @create-catalog-item="openCreateCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'snack2' })"
                    @edit-catalog-item="openEditCatalogItem($event, { dayOfWeek: entry.day.dayOfWeek, slotKey: 'snack2' })"
                  />
                </section>
              </section>
        </UCard>
      </section>
    </UForm>
  </section>
</template>
