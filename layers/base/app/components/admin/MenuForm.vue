<script setup lang="ts">
import { weeklyMenuInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import {
  DAY_OF_WEEK_VALUES,
  type DayOfWeek,
  type DayMenu,
  type FoodCatalogItem,
  type FoodItemDetail,
  type MenuSlot,
  type WeeklyMenu,
  type WeeklyMenuInput
} from "~~/layers/menu/shared/types/types"

interface Props {
  menu?: WeeklyMenu | null
  mode?: "create" | "edit"
}

const props = defineProps<Props>()
const menu = computed(() => props.menu ?? null)
const mode = computed(() => props.mode ?? "create")

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
  DAY_OF_WEEK_VALUES.reduce((acc, day) => {
    acc[day] = false
    return acc
  }, {} as Record<DayOfWeek, boolean>)
)

const title = computed(() => {
  if (mode.value === "edit") {
    return state.name.trim() ? `Editar ${state.name}` : "Editar menú semanal"
  }

  return "Nuevo menú semanal"
})
const actionLabel = computed(() => (mode.value === "edit" ? "Guardar cambios" : "Crear menú"))
const activeActionLabel = computed(() => {
  if (menu.value?.isActive || markAsActive.value) {
    return "Menú activo"
  }

  return "Hacer menú activo"
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
const { data: catalogItems } = await useFetch<FoodCatalogItem[]>("/api/food-components", {
  default: () => []
})
const resolvedCatalogItems = computed<FoodCatalogItem[]>(() => catalogItems.value ?? [])

watch(
  () => menu.value,
  (menu) => {
    Object.assign(state, createStateFromMenu(menu))
    markAsActive.value = Boolean(menu?.isActive)
    for (const day of DAY_OF_WEEK_VALUES) {
      snacksExpanded[day] = false
    }
  }
)

function toggleSnacks(dayOfWeek: DayOfWeek) {
  snacksExpanded[dayOfWeek] = !snacksExpanded[dayOfWeek]
}

async function onSubmit() {
  const parsed = weeklyMenuInputSchema.safeParse(state)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]

    toast.add({
      title: "Error de validación",
      description: firstIssue?.message ?? "Verifica la información del menú.",
      color: "error"
    })
    return
  }

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
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-base font-semibold text-highlighted">
                  Información general
                </h2>
                <p class="mt-1 text-sm text-muted">
                  Define el nombre del menú y el rango de fechas en el que estará disponible.
                </p>
              </div>

              <div class="flex items-center gap-3">
                <UButton
                  :variant="markAsActive || menu?.isActive ? 'soft' : 'outline'"
                  :color="markAsActive || menu?.isActive ? 'success' : 'primary'"
                  icon="i-lucide-badge-check"
                  @click="markAsActive = true"
                >
                  {{ activeActionLabel }}
                </UButton>

                <UButton
                  type="submit"
                  :loading="loading"
                  icon="i-lucide-save"
                >
                  {{ actionLabel }}
                </UButton>
              </div>
            </div>
          </template>

          <div class="grid gap-6 px-6 py-6 lg:grid-cols-3">
            <UFormField name="name">
              <section class="app-control-surface px-4 py-3">
                <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">
                  Nombre del menú
                </span>

                <UInput
                  v-model="state.name"
                  placeholder="Ej. Menú Semana 12"
                  icon="i-lucide-notebook-pen"
                  variant="ghost"
                  class="mt-1.5 w-full"
                  :ui="{
                    base: 'border-0 bg-transparent px-0 py-0 text-sm font-medium text-highlighted shadow-none hover:bg-transparent focus:bg-transparent',
                    leadingIcon: 'size-4 text-muted'
                  }"
                />
              </section>
            </UFormField>

            <UFormField name="startDate">
              <section class="app-control-surface px-4 py-3">
                <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">
                  Fecha de inicio
                </span>

                <DatePicker
                  v-model="state.startDate"
                  class="mt-1.5"
                />
              </section>
            </UFormField>

            <UFormField name="endDate">
              <section class="app-control-surface px-4 py-3">
                <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">
                  Fecha final
                </span>

                <DatePicker
                  v-model="state.endDate"
                  class="mt-1.5"
                />
              </section>
            </UFormField>
          </div>

        </UCard>

        <section class="space-y-5">
          <UCard
            v-for="entry in visibleDayEntries"
            :key="entry.day.dayOfWeek"
            variant="subtle"
            class="app-surface-soft overflow-hidden"
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
                class="lg:border-r lg:border-default/70"
              />
              <AdminMenuSlotEditor
                v-model="entry.day.comida"
                title="Comida"
                :show-toggle="false"
                :catalog-items="resolvedCatalogItems"
                class="lg:border-r lg:border-default/70"
              />
              <AdminMenuSlotEditor
                v-model="entry.day.cena"
                title="Cena"
                :show-toggle="false"
                :catalog-items="resolvedCatalogItems"
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
                    {{ snacksExpanded[entry.day.dayOfWeek] ? 'Oculta colaciones y snacks de este día.' : 'Muestra Snack 1 y Snack 2 de este día.' }}
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
                  class="lg:border-r lg:border-default/70"
                />
                <AdminMenuSlotEditor
                  v-model="entry.day.snack2"
                  title="Snack 2"
                  :show-sides="false"
                  :show-toggle="false"
                  :catalog-items="resolvedCatalogItems"
                />
              </section>
            </section>
          </UCard>
        </section>
    </UForm>
  </section>
</template>
