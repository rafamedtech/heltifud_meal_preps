<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
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

const columns: TableColumn<FoodCatalogItem>[] = [
  { accessorKey: "nombre", header: "Platillo" },
  { accessorKey: "calorias", header: "Calorías" },
  { id: "actions", header: "Acciones", meta: { class: { th: "text-right", td: "text-right" } } }
]

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [item: FoodCatalogItem]
  select: [id: string]
  createCatalogItem: [payload: { search?: string; selectedType?: string }]
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
const selectedTypeLabel = computed(() => getFilterTypeAppearance(normalizedSelectedType.value).label)

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
const canCreateFromSearch = computed(() => normalizedSearch.value.length > 0)
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

function onCreateCatalogItem() {
  if (isSelectMode.value) {
    emit("createCatalogItem", {
      search: normalizedSearch.value || undefined,
      selectedType: normalizedSelectedType.value !== "todos" ? normalizedSelectedType.value : undefined
    })
    return
  }

  navigateTo(createFromSearchTo.value)
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
    <UDashboardToolbar class="border-0 px-0 py-4">
      <UInput v-model="search" icon="i-lucide-search" :autofocus="autofocusSearch" :placeholder="searchPlaceholder" class="w-full sm:max-w-sm" />
      <USelect v-if="!isSelectMode" v-model="selectedType" :items="typeOptions" value-key="value" placeholder="Filtrar por tipo" :icon="getFilterTypeAppearance(normalizedSelectedType).icon" class="w-full sm:max-w-52" />
    </UDashboardToolbar>

    <AdminFoodCatalogTableSkeleton
      v-if="loading"
      :mode="mode"
    />

    <UEmpty v-else-if="!items.length" icon="i-lucide-package-open" :title="emptyTitle" :description="emptyDescription" />
    <UEmpty v-else-if="!filteredItems.length" icon="i-lucide-search-x" :title="noResultsTitle" :description="noResultsDescription">
      <template v-if="canCreateFromSearch || canCreateFromFilter" #actions><UButton icon="i-lucide-plus" :label="createButtonLabel" @click="onCreateCatalogItem" /></template>
    </UEmpty>

    <UTable v-else :data="sortedItems" :columns="columns" aria-label="Catálogo de platillos">
      <template #nombre-header>
        <UButton color="neutral" variant="ghost" size="sm" label="Platillo" :icon="sortIcon('nombre')" @click="toggleSort('nombre')" />
      </template>
      <template #calorias-header>
        <UButton color="neutral" variant="ghost" size="sm" label="Calorías" :icon="sortIcon('calorias')" @click="toggleSort('calorias')" />
      </template>
      <template #nombre-cell="{ row }">
        <UUser :name="row.original.nombre" :description="getFoodTypeAppearance(row.original.tipo).label" />
      </template>
      <template #calorias-cell="{ row }">{{ row.original.calorias }} cal</template>
      <template #actions-cell="{ row }">
        <UDropdownMenu v-if="mode === 'manage'" :items="actionItems(row.original)" :content="{ align: 'end' }">
          <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-ellipsis-vertical" :loading="deletingId === row.original.id" :aria-label="`Acciones de ${row.original.nombre}`" />
        </UDropdownMenu>
        <UButton v-else size="sm" color="primary" variant="soft" icon="i-lucide-check" :disabled="selectedId === row.original.id" @click="onSelect(row.original.id)">
          {{ selectedId === row.original.id ? "Seleccionado" : selectLabel }}
        </UButton>
      </template>
    </UTable>

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
