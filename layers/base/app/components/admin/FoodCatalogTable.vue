<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"

import type { FoodCatalogItem } from "~~/layers/menu/shared/types/types"
import { getFoodTypeAppearance } from "~~/layers/base/app/utils/foodTypeAppearance"

interface Props {
  items?: FoodCatalogItem[]
  loading?: boolean
  mode?: "manage" | "select"
  deletingId?: string | null
  editTo?: (item: FoodCatalogItem) => RouteLocationRaw
  searchPlaceholder?: string
  emptyTitle?: string
  emptyDescription?: string
  noResultsTitle?: string
  noResultsDescription?: string
  selectLabel?: string
  selectedId?: string | null
  autofocusSearch?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [item: FoodCatalogItem]
  select: [id: string]
}>()

const items = computed(() => props.items ?? [])
const route = useRoute()
const loading = computed(() => props.loading ?? false)
const mode = computed(() => props.mode ?? "manage")
const deletingId = computed(() => props.deletingId ?? null)
const searchPlaceholder = computed(() => props.searchPlaceholder ?? "Buscar platillo")
const emptyTitle = computed(() => props.emptyTitle ?? "No hay platillos guardados")
const emptyDescription = computed(() => props.emptyDescription ?? "Empieza creando el primero para que aparezca disponible en los tiempos del menú semanal.")
const noResultsTitle = computed(() => props.noResultsTitle ?? "Sin resultados")
const noResultsDescription = computed(() => props.noResultsDescription ?? "Ajusta la búsqueda o cambia el filtro para volver a ver platillos.")
const selectLabel = computed(() => props.selectLabel ?? "Seleccionar")
const selectedId = computed(() => props.selectedId ?? null)
const autofocusSearch = computed(() => props.autofocusSearch ?? false)
const isSelectMode = computed(() => mode.value === "select")
type SortKey = "createdAt" | "nombre" | "calorias"
type SortDirection = "asc" | "desc"

const search = defineModel<string>("search", { default: "" })
const selectedType = defineModel<string>("selectedType", { default: "todos" })
const sortKey = ref<SortKey>(mode.value === "manage" ? "createdAt" : "nombre")
const sortDirection = ref<SortDirection>(mode.value === "manage" ? "desc" : "asc")
const preferredTypeOptions = [
  { label: "Desayuno", value: "desayuno" },
  { label: "Comida", value: "comida" },
  { label: "Cena", value: "cena" },
  { label: "Snack", value: "snack" },
  { label: "Guarnición", value: "guarnicion" },
  { label: "Ramekin", value: "ramekin" }
] as const

const preferredTypeOrder = preferredTypeOptions.map((option) => option.value)

function getFilterTypeAppearance(tipo: string) {
  if (tipo === "todos") {
    return {
      color: "neutral" as const,
      className: "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300 dark:ring-zinc-400/20",
      icon: "i-lucide-layout-grid",
      label: "Todos"
    }
  }

  return getFoodTypeAppearance(tipo)
}

const typeOptions = computed(() => {
  const dynamicTypes = Array.from(new Set(items.value.map((item) => item.tipo).filter(Boolean)))
    .filter((tipo) => !preferredTypeOrder.includes(tipo as (typeof preferredTypeOrder)[number]))
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((tipo) => ({
      label: getFoodTypeAppearance(tipo).label,
      value: tipo
    }))

  return [
    { label: "Todos", value: "todos" },
    ...preferredTypeOptions,
    ...dynamicTypes
  ]
})

function normalizeTypeValue(value: unknown) {
  if (typeof value === "string") {
    return value
  }

  return "todos"
}

const normalizedSelectedType = computed(() => normalizeTypeValue(selectedType.value))
const selectedTypeLabel = computed(() => {
  if (normalizedSelectedType.value === "todos") {
    return "Todos"
  }

  return getFoodTypeAppearance(normalizedSelectedType.value).label
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesType = normalizedSelectedType.value === "todos" || item.tipo === normalizedSelectedType.value
    const matchesSearch =
      !query ||
      item.nombre.toLowerCase().includes(query) ||
      item.descripcion.toLowerCase().includes(query) ||
      item.tipo.toLowerCase().includes(query)

    return matchesType && matchesSearch
  })
})

const sortedItems = computed(() => {
  return [...filteredItems.value].sort((a, b) => {
    let comparison = 0

    switch (sortKey.value) {
      case "nombre":
        comparison = a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
        break
      case "calorias":
        comparison = a.calorias - b.calorias
        break
      case "createdAt":
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }

    return sortDirection.value === "asc" ? comparison : -comparison
  })
})

const normalizedSearch = computed(() => search.value.trim())
const canCreateFromSearch = computed(() => mode.value === "manage" && normalizedSearch.value.length > 0)
const canCreateFromFilter = computed(() =>
  mode.value === "manage" &&
  normalizedSearch.value.length === 0 &&
  normalizedSelectedType.value !== "todos"
)
const createFilterLabel = computed(() => {
  switch (normalizedSelectedType.value) {
    case "snack":
      return "Crear un snack"
    case "ramekin":
      return "Crear un ramekin"
    case "desayuno":
      return "Crear un desayuno"
    case "comida":
      return "Crear una comida"
    case "cena":
      return "Crear una cena"
    case "guarnicion":
      return "Crear una guarnición"
    default:
      return `Crear ${selectedTypeLabel.value}`
  }
})
const createButtonLabel = computed(() => {
  if (canCreateFromSearch.value) {
    return `Crear "${normalizedSearch.value}"`
  }

  if (canCreateFromFilter.value) {
    return createFilterLabel.value
  }

  return "Crear platillo"
})
const createFromSearchTo = computed<RouteLocationRaw>(() => ({
  path: "/admin/platillos/crear-nuevo",
  query: {
    ...(normalizedSearch.value ? { nombre: normalizedSearch.value } : {}),
    ...(normalizedSelectedType.value !== "todos" ? { tipo: normalizedSelectedType.value } : {}),
    returnTo: route.fullPath
  }
}))

function onDelete(item: FoodCatalogItem) {
  emit("delete", item)
}

function onSelect(id: string) {
  emit("select", id)
}

function toggleSort(nextKey: SortKey) {
  if (sortKey.value === nextKey) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
    return
  }

  sortKey.value = nextKey
  sortDirection.value = nextKey === "createdAt" ? "desc" : "asc"
}

function sortIcon(key: SortKey) {
  if (sortKey.value !== key) {
    return "i-lucide-arrow-up-down"
  }

  return sortDirection.value === "asc" ? "i-lucide-arrow-up" : "i-lucide-arrow-down"
}

function actionItems(item: FoodCatalogItem) {
  if (mode.value !== "manage") {
    return []
  }

  return [[
    {
      label: "Editar",
      icon: "i-lucide-square-pen",
      onSelect: () => {
        if (props.editTo) {
          navigateTo(props.editTo(item))
        }
      }
    },
    {
      label: "Eliminar",
      icon: "i-lucide-trash",
      color: "error" as const,
      onSelect: () => onDelete(item)
    }
  ]]
}
</script>

<template>
  <section class="space-y-0">
    <section
      class="border-b border-default/70"
      :class="isSelectMode ? 'px-4 py-4 sm:px-4' : 'px-5 py-4 sm:px-6'"
    >
      <div
        class="grid gap-4"
        :class="isSelectMode ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_740px] lg:items-center'"
      >
        <div
          v-if="!isSelectMode"
          class="flex flex-col gap-1"
        >
          <h2 class="text-sm font-semibold text-highlighted">Buscar y filtrar</h2>
          <p class="text-sm text-muted">Busca por nombre o tipo.</p>
        </div>

        <div
          class="grid grid-cols-1 gap-3"
          :class="isSelectMode ? 'sm:grid-cols-[minmax(0,1fr)_220px]' : 'md:grid-cols-[360px_220px] md:justify-end'"
        >
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :autofocus="autofocusSearch"
            :placeholder="searchPlaceholder"
            size="lg"
            class="w-full"
          />

          <USelect
            v-model="selectedType"
            :items="typeOptions"
            value-key="value"
            placeholder="Filtrar por tipo"
            size="lg"
            :content="{ position: 'popper', side: 'bottom', align: 'end', sideOffset: 8 }"
            class="w-full"
            :ui="{
              value: 'min-w-0',
              base: 'w-full',
              content: 'max-h-[28rem]',
              viewport: 'overflow-y-visible'
            }"
          >
            <template #default="{ modelValue }">
              <span class="inline-flex min-w-0 items-center gap-2">
                <UIcon
                  :name="getFilterTypeAppearance(normalizeTypeValue(modelValue)).icon"
                  :class="[
                    'size-4 shrink-0',
                    normalizeTypeValue(modelValue) === 'todos' ? 'text-dimmed' : 'text-muted'
                  ]"
                />
                <span class="truncate text-sm text-highlighted">
                  {{ getFilterTypeAppearance(normalizeTypeValue(modelValue)).label }}
                </span>
              </span>
            </template>

            <template #item-label="{ item }">
              <UBadge
                :color="getFilterTypeAppearance(item.value).color"
                variant="soft"
                :class="[
                  'inline-flex max-w-fit rounded-xl px-2.5 py-1 ring-1 ring-inset',
                  getFilterTypeAppearance(item.value).className
                ]"
              >
                <UIcon
                  :name="getFilterTypeAppearance(item.value).icon"
                  class="size-3.5 shrink-0"
                />
                {{ getFilterTypeAppearance(item.value).label }}
              </UBadge>
            </template>
          </USelect>
        </div>
      </div>
    </section>

    <AdminFoodCatalogTableSkeleton
      v-if="loading"
      :mode="mode"
    />

    <section
      v-else-if="!items.length"
      class="flex min-h-[360px] items-center justify-center px-5 py-10 sm:px-6"
    >
      <div class="max-w-md space-y-3 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-xl border border-default bg-elevated">
          <UIcon
            name="i-lucide-package-open"
            class="size-5 text-muted"
          />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-highlighted">{{ emptyTitle }}</h3>
          <p class="text-sm text-muted">
            {{ emptyDescription }}
          </p>
        </div>
      </div>
    </section>

    <section
      v-else-if="!filteredItems.length"
      class="flex min-h-[360px] items-center justify-center px-5 py-10 sm:px-6"
    >
      <div class="max-w-md space-y-4 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-xl border border-default bg-elevated">
          <UIcon
            name="i-lucide-search-x"
            class="size-5 text-muted"
          />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-highlighted">{{ noResultsTitle }}</h3>
          <p class="text-sm text-muted">
            {{ noResultsDescription }}
            <template v-if="canCreateFromSearch">
              También puedes crear un nuevo platillo usando <span class="font-medium text-highlighted">"{{ normalizedSearch }}"</span>.
            </template>
            <template v-else-if="canCreateFromFilter">
              Todavía no hay platillos de tipo <span class="font-medium text-highlighted">{{ selectedTypeLabel }}</span>, pero puedes crear el primero desde aquí.
            </template>
          </p>
        </div>
        <UButton
          v-if="canCreateFromSearch || canCreateFromFilter"
          :to="createFromSearchTo"
          icon="i-lucide-plus"
        >
          {{ createButtonLabel }}
        </UButton>
      </div>
    </section>

    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="min-w-full table-fixed text-sm">
        <colgroup>
          <col class="w-[72%] sm:w-[58%]">
          <col class="hidden sm:table-column sm:w-[18%]">
          <col class="w-[28%] sm:w-[24%]">
        </colgroup>

        <thead class="bg-elevated/50">
          <tr class="border-b border-default/70">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">
              <button
                type="button"
                class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted"
                @click="toggleSort('nombre')"
              >
                <span>Platillo</span>
                <UIcon :name="sortIcon('nombre')" class="size-3.5" />
              </button>
            </th>
            <th class="hidden px-5 py-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted sm:table-cell sm:px-6">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted"
                @click="toggleSort('calorias')"
              >
                <span>Calorías</span>
                <UIcon :name="sortIcon('calorias')" class="size-3.5" />
              </button>
            </th>
            <th class="px-5 py-3 text-right text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in sortedItems"
            :key="item.id"
            class="border-b border-default/60 transition-colors hover:bg-elevated/30 last:border-b-0"
          >
            <td class="px-5 py-4 sm:px-6">
              <div class="min-w-0 space-y-1">
                <p class="truncate font-medium text-highlighted">{{ item.nombre }}</p>
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge
                    :color="getFoodTypeAppearance(item.tipo).color"
                    variant="soft"
                    :class="['inline-flex max-w-fit rounded-xl px-2.5 py-1 ring-1 ring-inset', getFoodTypeAppearance(item.tipo).className]"
                  >
                    <UIcon :name="getFoodTypeAppearance(item.tipo).icon" class="size-3.5 shrink-0" />
                    {{ getFoodTypeAppearance(item.tipo).label }}
                  </UBadge>

                  <span class="text-sm font-medium text-muted sm:hidden">
                    {{ item.calorias }} cal
                  </span>
                </div>
              </div>
            </td>
            <td class="hidden px-5 py-4 text-center font-medium text-highlighted sm:table-cell sm:px-6">
              {{ item.calorias }} cal
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="flex justify-end">
                <template v-if="mode === 'manage'">
                  <div class="hidden items-center justify-end gap-2 lg:flex">
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-square-pen"
                      :to="editTo?.(item)"
                      :ui="{
                        base: 'justify-center px-0 lg:flex-col lg:gap-1 lg:py-1.5',
                        leadingIcon: 'size-4.5 lg:size-5'
                      }"
                    >
                      <span class="inline-block w-[8ch] text-center text-[11px] leading-none xl:text-xs">Editar</span>
                    </UButton>

                    <UButton
                      variant="ghost"
                      color="error"
                      icon="i-lucide-trash"
                      :loading="deletingId === item.id"
                      :ui="{
                        base: 'justify-center px-0 lg:flex-col lg:gap-1 lg:py-1.5',
                        leadingIcon: 'size-4.5 lg:size-5'
                      }"
                      @click="onDelete(item)"
                    >
                      <span class="inline-block w-[8ch] text-center text-[11px] leading-none xl:text-xs">Eliminar</span>
                    </UButton>
                  </div>

                  <UDropdownMenu
                    :items="actionItems(item)"
                    class="lg:hidden"
                  >
                    <UButton
                      size="sm"
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-ellipsis-vertical"
                      square
                      :loading="deletingId === item.id"
                    />
                  </UDropdownMenu>
                </template>

                <UButton
                  v-else
                  size="sm"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-check"
                  :disabled="selectedId === item.id"
                  @click="onSelect(item.id)"
                >
                  {{ selectedId === item.id ? "Seleccionado" : selectLabel }}
                </UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section
      v-if="mode === 'manage'"
      class="flex flex-col gap-3 border-t border-default/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p class="text-sm text-muted">
        Mostrando <span class="font-medium text-highlighted">{{ filteredItems.length }}</span> de
        <span class="font-medium text-highlighted">{{ items.length }}</span> platillos registrados.
      </p>
    </section>
  </section>
</template>
