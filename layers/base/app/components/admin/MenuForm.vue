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

type MenuSectionKey = "desayuno" | "comida" | "cena" | "snacks"

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
const selectedDayIndex = ref(0)
const loading = ref(false)
const activeSection = ref<MenuSectionKey | null>("desayuno")
const hiddenDays = new Set<DayOfWeek>(["SABADO", "DOMINGO"])
const markAsActive = ref(Boolean(menu.value?.isActive))

const selectedDay = computed<DayMenu>(() => state.days[selectedDayIndex.value] ?? createDay(DAY_OF_WEEK_VALUES[0]))
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
  state.days.map((day, index) => ({ day, index })).filter(({ day }) => !hiddenDays.has(day.dayOfWeek))
)
const cardSurfaceUi = {
  root: "rounded-xl border border-default/70 bg-default/95 shadow-sm",
  body: "p-0 sm:p-0",
  header: "px-6 py-5 sm:px-6",
  footer: "px-6 py-5 sm:px-6"
}
const snacksOpen = computed({
  get: () => activeSection.value === "snacks",
  set: (value: boolean) => {
    activeSection.value = value ? "snacks" : null
  }
})
const desayunoOpen = computed({
  get: () => activeSection.value === "desayuno",
  set: (value: boolean) => {
    setOpenSection("desayuno", value)
  }
})
const comidaOpen = computed({
  get: () => activeSection.value === "comida",
  set: (value: boolean) => {
    setOpenSection("comida", value)
  }
})
const cenaOpen = computed({
  get: () => activeSection.value === "cena",
  set: (value: boolean) => {
    setOpenSection("cena", value)
  }
})

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
    selectedDayIndex.value = 0
    activeSection.value = "desayuno"
    markAsActive.value = Boolean(menu?.isActive)
  }
)

watch(selectedDayIndex, (index) => {
  const dayOfWeek = state.days[index]?.dayOfWeek

  if (dayOfWeek && hiddenDays.has(dayOfWeek)) {
    selectedDayIndex.value = visibleDayEntries.value[0]?.index ?? 0
  }
})

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

function beforeEnter(el: Element) {
  const element = el as HTMLElement
  element.style.height = "0"
  element.style.opacity = "0"
  element.style.transform = "translateY(-8px)"
}

function enter(el: Element) {
  const element = el as HTMLElement
  element.style.transition = "height 220ms ease, opacity 180ms ease, transform 220ms ease"
  requestAnimationFrame(() => {
    element.style.height = `${element.scrollHeight}px`
    element.style.opacity = "1"
    element.style.transform = "translateY(0)"
  })
}

function afterEnter(el: Element) {
  const element = el as HTMLElement
  element.style.height = "auto"
  element.style.transition = ""
}

function beforeLeave(el: Element) {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.opacity = "1"
  element.style.transform = "translateY(0)"
}

function leave(el: Element) {
  const element = el as HTMLElement
  element.style.transition = "height 220ms ease, opacity 160ms ease, transform 220ms ease"
  requestAnimationFrame(() => {
    element.style.height = "0"
    element.style.opacity = "0"
    element.style.transform = "translateY(-8px)"
  })
}

function afterLeave(el: Element) {
  const element = el as HTMLElement
  element.style.transition = ""
}

function setOpenSection(section: MenuSectionKey, open: boolean) {
  activeSection.value = open ? section : null
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
            </div>
          </template>

          <div class="grid gap-6 px-6 py-6 lg:grid-cols-3">
            <UFormField
              label="Nombre del menú"
              name="name"
            >
              <UInput
                v-model="state.name"
                placeholder="Ej. Menú Semana 12"
                icon="i-lucide-notebook-pen"
                size="xl"
                variant="outline"
                class="w-full"
                :ui="{
                  base: 'rounded-xl border-default bg-default px-3.5 py-2.5 shadow-xs hover:bg-default focus:bg-default',
                  leadingIcon: 'text-muted'
                }"
              />
            </UFormField>

            <UFormField
              label="Fecha de inicio"
              name="startDate"
            >
              <DatePicker v-model="state.startDate" />
            </UFormField>

            <UFormField
              label="Fecha final"
              name="endDate"
            >
              <DatePicker v-model="state.endDate" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex items-center justify-end">
              <UButton
                :variant="markAsActive || menu?.isActive ? 'soft' : 'outline'"
                :color="markAsActive || menu?.isActive ? 'success' : 'primary'"
                icon="i-lucide-badge-check"
                @click="markAsActive = true"
              >
                {{ activeActionLabel }}
              </UButton>
            </div>
          </template>
        </UCard>

        <UCard :ui="cardSurfaceUi">
          <template #header>
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                Días de la semana
              </h2>
            </div>
          </template>

          <div class="space-y-6 border-t border-default/70 px-6 py-6">
            <div class="rounded-xl border border-default/70 bg-elevated/40 p-1">
              <div class="grid grid-cols-5 gap-1">
                <button
                  v-for="entry in visibleDayEntries"
                  :key="entry.day.dayOfWeek"
                  type="button"
                  class="rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                  :class="selectedDayIndex === entry.index
                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                    : 'text-muted hover:bg-default/80 hover:text-highlighted'"
                  @click="selectedDayIndex = entry.index"
                >
                  {{ DAY_LABELS[entry.day.dayOfWeek] }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
            <AdminMenuSlotEditor
              v-model="selectedDay.desayuno"
              v-model:open="desayunoOpen"
              title="Desayuno"
              :catalog-items="resolvedCatalogItems"
            />
            <AdminMenuSlotEditor
              v-model="selectedDay.comida"
              v-model:open="comidaOpen"
              title="Comida"
              :catalog-items="resolvedCatalogItems"
            />
            <AdminMenuSlotEditor
              v-model="selectedDay.cena"
              v-model:open="cenaOpen"
              title="Cena"
              :catalog-items="resolvedCatalogItems"
            />
            </div>

            <section class="space-y-4">
              <section class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    Snacks
                  </h2>
                </div>

                <UButton
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  :icon="snacksOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  @click="snacksOpen = !snacksOpen"
                >
                  {{ snacksOpen ? "Ocultar" : "Mostrar" }}
                </UButton>
              </section>

              <Transition
                @before-enter="beforeEnter"
                @enter="enter"
                @after-enter="afterEnter"
                @before-leave="beforeLeave"
                @leave="leave"
                @after-leave="afterLeave"
              >
                <section
                  v-if="snacksOpen"
                  class="grid grid-cols-1 gap-4 overflow-hidden xl:grid-cols-2"
                >
                  <AdminMenuSlotEditor
                    v-model="selectedDay.snack1"
                    title="Snack 1"
                    :show-sides="false"
                    :show-toggle="false"
                    :catalog-items="resolvedCatalogItems"
                  />
                  <AdminMenuSlotEditor
                    v-model="selectedDay.snack2"
                    title="Snack 2"
                    :show-sides="false"
                    :show-toggle="false"
                    :catalog-items="resolvedCatalogItems"
                  />
                </section>
              </Transition>
            </section>
          </div>

          <template #footer>
            <div class="flex items-center justify-end">
              <UButton
                type="submit"
                :loading="loading"
                icon="i-lucide-save"
                size="lg"
              >
                {{ actionLabel }}
              </UButton>
            </div>
          </template>
        </UCard>
    </UForm>
  </section>
</template>
