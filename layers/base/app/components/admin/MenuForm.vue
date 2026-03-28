<script setup lang="ts">
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
const hiddenDays = new Set<DayOfWeek>(["SABADO", "DOMINGO"])
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

const title = computed(() => {
  if (mode.value === "edit") {
    return state.name.trim() ? `Editar ${state.name}` : "Editar menú semanal"
  }

  return "Nuevo menú semanal"
})
const actionLabel = computed(() => (mode.value === "edit" ? "Guardar" : "Crear menú"))
const activeActionLabel = computed(() => {
  if (menu.value?.isActive || markAsActive.value) {
    return "Activo"
  }

  return "Activar"
})
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

watch(
  () => menu.value,
  (menu) => {
    Object.assign(state, createStateFromMenu(menu))
    markAsActive.value = Boolean(menu?.isActive)
    clearValidationHighlights()
    for (const day of DAY_OF_WEEK_VALUES) {
      snacksExpanded[day] = false
    }
  }
)

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
      color: "error"
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

    toast.add({
      title: mode.value === "edit" ? "Menú actualizado" : "Menú creado",
      description: markAsActive.value
        ? "La información se guardó y este menú quedó como activo."
        : "La información se guardó correctamente.",
      color: "success"
    })

    emit("saved", savedMenu.id)
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el menú"
    toast.add({ title: "Error", description: message, color: "error" })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-primary">
          {{ title }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          Captura una semana completa, define el menú activo y administra cada día desde una sola vista.
        </p>
      </div>

      <UButton
        to="/admin/menu"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
      >
        Volver
      </UButton>
    </div>

    <UForm
      class="space-y-6"
      @submit="onSubmit"
    >
      <UCard :ui="cardSurfaceUi">
        <template #header>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-2xl">
              <h2 class="text-base font-semibold text-highlighted">Información general</h2>
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

              <UButton
                :variant="markAsActive || menu?.isActive ? 'soft' : 'outline'"
                :color="markAsActive || menu?.isActive ? 'success' : 'primary'"
                icon="i-lucide-badge-check"
                block
                class="justify-center"
                @click="markAsActive = true"
                size="lg"
              >
                {{ activeActionLabel }}
              </UButton>
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

      <section class="space-y-5">
        <UCard
          v-for="entry in visibleDayEntries"
          :key="entry.day.dayOfWeek"
          variant="subtle"
          :class="[
            'app-surface-soft overflow-hidden',
            isDayInvalid(entry.day.dayOfWeek) ? 'ring-1 ring-error/35 border-error/50' : ''
          ]"
          :ui="{ root: 'app-surface-soft overflow-hidden', header: 'px-5 py-4 sm:px-5', body: 'p-0 sm:p-0' }"
        >
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-base font-semibold text-primary">
                {{ DAY_LABELS[entry.day.dayOfWeek] }}
              </h3>
            </div>
          </template>

          <section class="grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-3">
            <AdminMenuSlotEditor
              v-model="entry.day.desayuno"
              title="Desayuno"
              :show-toggle="false"
              :catalog-items="resolvedCatalogItems"
              :class="[
                'lg:border-r lg:border-default/70',
                isSlotInvalid(entry.day.dayOfWeek, 'desayuno') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
              ]"
            />
            <AdminMenuSlotEditor
              v-model="entry.day.comida"
              title="Comida"
              :show-toggle="false"
              :catalog-items="resolvedCatalogItems"
              :class="[
                'lg:border-r lg:border-default/70',
                isSlotInvalid(entry.day.dayOfWeek, 'comida') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
              ]"
            />
            <AdminMenuSlotEditor
              v-model="entry.day.cena"
              title="Cena"
              :show-toggle="false"
              :catalog-items="resolvedCatalogItems"
              :class="isSlotInvalid(entry.day.dayOfWeek, 'cena') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''"
            />
          </section>

          <section class="border-t border-default/70">
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
              class="grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-2"
            >
              <AdminMenuSlotEditor
                v-model="entry.day.snack1"
                title="Snack 1"
                :show-sides="false"
                :show-toggle="false"
                :catalog-items="resolvedCatalogItems"
                :class="[
                  'lg:border-r lg:border-default/70',
                  isSlotInvalid(entry.day.dayOfWeek, 'snack1') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
                ]"
              />
              <AdminMenuSlotEditor
                v-model="entry.day.snack2"
                title="Snack 2"
                :show-sides="false"
                :show-toggle="false"
                :catalog-items="resolvedCatalogItems"
                :class="
                  isSlotInvalid(entry.day.dayOfWeek, 'snack2') ? 'bg-error/5 ring-1 ring-inset ring-error/30' : ''
                "
              />
            </section>
          </section>
        </UCard>
      </section>
    </UForm>
  </section>
</template>
