<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"

import type { FoodCatalogItem } from "~~/layers/menu/shared/types/types"

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
  footerLabel?: string
  selectLabel?: string
  selectedId?: string | null
  autofocusSearch?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [id: string]
  select: [id: string]
}>()

const items = computed(() => props.items ?? [])
const loading = computed(() => props.loading ?? false)
const mode = computed(() => props.mode ?? "manage")
const deletingId = computed(() => props.deletingId ?? null)
const searchPlaceholder = computed(() => props.searchPlaceholder ?? "Buscar platillo")
const emptyTitle = computed(() => props.emptyTitle ?? "No hay platillos guardados")
const emptyDescription = computed(() => props.emptyDescription ?? "Empieza creando el primero para que aparezca disponible en los tiempos del menú semanal.")
const noResultsTitle = computed(() => props.noResultsTitle ?? "Sin resultados")
const noResultsDescription = computed(() => props.noResultsDescription ?? "Ajusta la búsqueda o cambia el filtro para volver a ver platillos.")
const footerLabel = computed(() => props.footerLabel ?? "Catálogo listo para menú semanal")
const selectLabel = computed(() => props.selectLabel ?? "Seleccionar")
const selectedId = computed(() => props.selectedId ?? null)
const autofocusSearch = computed(() => props.autofocusSearch ?? false)
const isSelectMode = computed(() => mode.value === "select")

const search = ref("")
const selectedType = ref<"todos" | string>("todos")

const typeOptions = computed(() => [
  { label: "Todos", value: "todos" },
  ...Array.from(new Set(items.value.map((item) => item.tipo).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((tipo) => ({
      label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      value: tipo
    }))
])

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesType = selectedType.value === "todos" || item.tipo === selectedType.value
    const matchesSearch =
      !query ||
      item.nombre.toLowerCase().includes(query) ||
      item.descripcion.toLowerCase().includes(query) ||
      item.tipo.toLowerCase().includes(query)

    return matchesType && matchesSearch
  })
})

function onDelete(id: string) {
  emit("delete", id)
}

function onSelect(id: string) {
  emit("select", id)
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
        :class="isSelectMode ? 'grid-cols-1' : 'xl:grid-cols-[minmax(0,1fr)_740px] xl:items-center'"
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
          />
        </div>
      </div>
    </section>

    <section
      v-if="loading"
      class="space-y-3 px-5 py-5 sm:px-6"
    >
      <USkeleton
        v-for="index in 8"
        :key="index"
        class="h-12 w-full rounded-xl"
      />
    </section>

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
      <div class="max-w-md space-y-3 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-xl border border-default bg-elevated">
          <UIcon
            name="i-lucide-search-x"
            class="size-5 text-muted"
          />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-highlighted">{{ noResultsTitle }}</h3>
          <p class="text-sm text-muted">{{ noResultsDescription }}</p>
        </div>
      </div>
    </section>

    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="min-w-full table-fixed text-sm">
        <colgroup>
          <col class="w-[72px]" />
          <col class="w-[46%]" />
          <col class="w-[20%]" />
          <col class="w-[14%]" />
          <col class="w-[20%]" />
        </colgroup>

        <thead class="bg-elevated/70">
          <tr class="border-b border-default/70">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">#</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">Nombre</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">Tipo</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">Calorías</th>
            <th class="px-5 py-3 text-right text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in filteredItems"
            :key="item.id"
            class="border-b border-default/60 transition-colors hover:bg-elevated/40 last:border-b-0"
          >
            <td class="px-5 py-4 text-sm text-muted sm:px-6">
              {{ index + 1 }}
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="min-w-0 space-y-1">
                <p class="truncate font-medium text-highlighted">{{ item.nombre }}</p>
              </div>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <UBadge
                color="neutral"
                variant="subtle"
                class="rounded-xl px-2.5 py-1"
              >
                {{ item.tipo || "Sin tipo" }}
              </UBadge>
            </td>
            <td class="px-5 py-4 font-medium text-highlighted sm:px-6">
              {{ item.calorias }}
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="flex justify-end gap-2">
                <template v-if="mode === 'manage'">
                  <UButton
                    v-if="editTo"
                    size="sm"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-pencil"
                    :to="editTo(item)"
                  >
                    Editar
                  </UButton>

                  <UButton
                    size="sm"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash"
                    :loading="deletingId === item.id"
                    @click="onDelete(item.id)"
                  />
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

      <UBadge
        color="primary"
        variant="soft"
        class="rounded-xl px-3 py-1.5"
      >
        {{ footerLabel }}
      </UBadge>
    </section>
  </section>
</template>
