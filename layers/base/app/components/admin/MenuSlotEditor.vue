<script setup lang="ts">
import type { FoodCatalogItem, FoodItemDetail, MenuSlot } from "~~/layers/menu/shared/types/types"

type DetailModalView = "platillo-principal" | "guarnicion-1" | "guarnicion-2" | "adicionales" | null

interface Props {
  title: string
  showSides?: boolean
  catalogItems?: FoodCatalogItem[]
  showToggle?: boolean
}

const {
  title,
  showSides = true,
  catalogItems = [],
  showToggle = true
} = defineProps<Props>()

const contenedorOptions = [
  { label: "Charola", value: "Charola" },
  { label: "Bowl kraft", value: "Bowl kraft" },
  { label: "Contenedor desayuno", value: "Contenedor desayuno" },
  { label: "Contenedor comida", value: "Contenedor comida" },
  { label: "Contenedor cena", value: "Contenedor cena" },
  { label: "Contenedor colación 1", value: "Contenedor colacion 1" },
  { label: "Contenedor colación 2", value: "Contenedor colacion 2" },
  { label: "Vaso", value: "Vaso" },
  { label: "Caja", value: "Caja" }
]

const PLATILLO_PRINCIPAL_TYPES = new Set(["desayuno", "comida", "cena"])
const GUARNICION_TYPES = new Set(["guarnicion"])
const ADICIONAL_TYPES = new Set(["ramekin"])

const platilloPrincipalItems = computed(() =>
  catalogItems.filter((item) => PLATILLO_PRINCIPAL_TYPES.has(item.tipo))
)

const guarnicionItems = computed(() =>
  catalogItems.filter((item) => GUARNICION_TYPES.has(item.tipo))
)

const adicionalItems = computed(() =>
  catalogItems.filter((item) => ADICIONAL_TYPES.has(item.tipo))
)

function toCatalogOptions(items: FoodCatalogItem[]) {
  return items.map((item) => ({
    label: item.nombre,
    calorias: item.calorias,
    tipo: item.tipo,
    value: item.id
  }))
}

const platilloPrincipalOptions = computed(() => toCatalogOptions(platilloPrincipalItems.value))
const guarnicionOptions = computed(() => toCatalogOptions(guarnicionItems.value))

const model = defineModel<MenuSlot>({ required: true })
const isOpen = defineModel<boolean>("open", { default: true })
const modalView = ref<DetailModalView>(null)
const selectedPrimaryId = ref<string | undefined>()
const selectedGuarnicion1Id = ref<string | undefined>()
const selectedGuarnicion2Id = ref<string | undefined>()

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

const guarnicion1Model = computed<FoodItemDetail>({
  get() {
    return model.value.guarnicion1 ?? createEmptyFoodItem()
  },
  set(value) {
    model.value.guarnicion1 = value
  }
})

const guarnicion2Model = computed<FoodItemDetail>({
  get() {
    return model.value.guarnicion2 ?? createEmptyFoodItem()
  },
  set(value) {
    model.value.guarnicion2 = value
  }
})

watchEffect(() => {
  if (showSides) {
    if (!model.value.guarnicion1) {
      model.value.guarnicion1 = createEmptyFoodItem()
    }

    if (!model.value.guarnicion2) {
      model.value.guarnicion2 = createEmptyFoodItem()
    }
  } else {
    model.value.guarnicion1 = null
    model.value.guarnicion2 = null
  }

  if (!model.value.adicionales) {
    model.value.adicionales = []
  }
})

function addAdicional() {
  model.value.adicionales.push(createEmptyFoodItem())
}

function removeAdicional(index: number) {
  model.value.adicionales.splice(index, 1)
}

function getAdicional(index: number): FoodItemDetail {
  const item = model.value.adicionales[index]

  if (!item) {
    const emptyItem = createEmptyFoodItem()
    model.value.adicionales[index] = emptyItem
    return emptyItem
  }

  return item
}

function setAdicional(index: number, value: FoodItemDetail) {
  model.value.adicionales[index] = value
}

const isModalOpen = computed({
  get: () => modalView.value !== null,
  set: (value: boolean) => {
    if (!value) {
      modalView.value = null
    }
  }
})

const detailItem = computed<FoodItemDetail | null>(() => {
  switch (modalView.value) {
    case "platillo-principal":
      return model.value.platilloPrincipal
    case "guarnicion-1":
      return guarnicion1Model.value
    case "guarnicion-2":
      return guarnicion2Model.value
    default:
      return null
  }
})

const detailModalTitle = computed(() => {
  switch (modalView.value) {
    case "platillo-principal":
      return "Editar platillo principal"
    case "guarnicion-1":
      return "Editar guarnición 1"
    case "guarnicion-2":
      return "Editar guarnición 2"
    case "adicionales":
      return "Adicionales"
    default:
      return ""
  }
})

function openDetailModal(view: Exclude<DetailModalView, "adicionales" | null>) {
  modalView.value = view
}

const contenedorModel = computed<string | undefined>({
  get: () => model.value.contenedor ?? undefined,
  set: (value) => {
    model.value.contenedor = value ?? ""
  }
})

function itemSummary(item?: FoodItemDetail | null, fallback = "Sin capturar") {
  return item?.nombre?.trim() || fallback
}

function caloriesSummary(item?: FoodItemDetail | null) {
  if (!item?.nombre?.trim()) {
    return "0 cal"
  }

  return `${item.calorias ?? 0} cal`
}

function hasValue(item?: FoodItemDetail | null) {
  return Boolean(item?.nombre?.trim())
}

function clearFoodItem(target: FoodItemDetail) {
  target.catalogItemId = null
  target.nombre = ""
  target.descripcion = ""
  target.calorias = 0
  target.imagen = ""
  target.tipo = ""
}

function matchCatalogItem(item?: FoodItemDetail | null) {
  if (item?.catalogItemId) {
    return item.catalogItemId
  }

  if (!item?.nombre?.trim()) {
    return undefined
  }

  return catalogItems.find((catalogItem) =>
    catalogItem.nombre === item.nombre &&
    catalogItem.descripcion === (item.descripcion ?? "") &&
    catalogItem.calorias === (item.calorias ?? 0) &&
    catalogItem.imagen === (item.imagen ?? "") &&
    catalogItem.tipo === (item.tipo ?? "")
  )?.id
}

function applyCatalogItem(target: FoodItemDetail, itemId: string | undefined) {
  if (!itemId) {
    target.catalogItemId = null
    target.nombre = ""
    target.descripcion = ""
    target.calorias = 0
    target.imagen = ""
    target.tipo = ""
    return
  }

  const selected = catalogItems.find((item) => item.id === itemId)

  if (!selected) {
    return
  }

  target.catalogItemId = selected.id
  target.nombre = selected.nombre
  target.descripcion = selected.descripcion
  target.calorias = selected.calorias
  target.imagen = selected.imagen
  target.tipo = selected.tipo
}

watchEffect(() => {
  selectedPrimaryId.value = matchCatalogItem(model.value.platilloPrincipal)
  selectedGuarnicion1Id.value = matchCatalogItem(model.value.guarnicion1)
  selectedGuarnicion2Id.value = matchCatalogItem(model.value.guarnicion2)
})

const summary = computed(() => {
  const items = [model.value.platilloPrincipal?.nombre, model.value.contenedor].filter(Boolean)
  return items.length ? items.join(" · ") : "Sin capturar"
})

const cardUi = computed(() => ({
  root: "rounded-xl border-default/70 shadow-sm",
  header: "px-5 py-4 sm:px-5",
  body: isOpen.value ? "space-y-4 px-5 py-5 sm:px-5 sm:py-5" : "p-0 sm:p-0"
}))

const fieldClass =
  "relative rounded-xl border border-default/70 bg-default px-4 py-3 text-left shadow-xs transition-colors hover:bg-default"

const overlayFieldUi = {
  base: "h-full w-full min-h-0 border-0 bg-transparent p-0 shadow-none",
  trailingIcon: "opacity-0",
  leadingIcon: "opacity-0"
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

const detailFieldInputUi = {
  base: "rounded-xl border-default/70 bg-default px-3.5 py-2.5 shadow-xs hover:bg-default focus:bg-default",
  leading: "ps-0",
  trailing: "pe-0"
}

const detailFieldTextareaUi = {
  base: "rounded-xl border-default/70 bg-default px-3.5 py-2.5 shadow-xs hover:bg-default focus:bg-default"
}
</script>

<template>
  <UCard :ui="cardUi">
    <template #header>
      <section class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-primary">{{ title }}</h3>
          <p
            v-if="showToggle && !isOpen"
            class="text-xs text-muted mt-1"
          >
            {{ summary }}
          </p>
        </div>

        <UButton
          v-if="showToggle"
          size="sm"
          variant="ghost"
          color="neutral"
          :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="isOpen = !isOpen"
        >
          {{ isOpen ? "Ocultar" : "Mostrar" }}
        </UButton>
      </section>
    </template>

    <Transition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <section
        v-if="isOpen"
        class="space-y-4 overflow-hidden"
      >
        <section
          v-if="showSides"
          class="grid grid-cols-1 gap-3 lg:grid-cols-3"
        >
          <div
            :class="fieldClass"
          >
            <span class="min-w-0">
              <span class="block text-xs uppercase tracking-[0.18em] text-muted">Platillo principal</span>
              <span class="mt-1.5 block text-sm font-medium text-highlighted">{{ itemSummary(model.platilloPrincipal) }}</span>
            </span>
            <span class="relative z-10 flex shrink-0 flex-col items-end justify-center gap-2 self-stretch">
              <span class="text-sm font-semibold text-primary">{{ caloriesSummary(model.platilloPrincipal) }}</span>
              <span class="flex items-center gap-2">
                <UButton
                  type="button"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-square-pen"
                  @click.stop="openDetailModal('platillo-principal')"
                >
                  Detalles
                </UButton>
              <UButton
                v-if="hasValue(model.platilloPrincipal)"
                type="button"
                size="xs"
                variant="ghost"
                color="neutral"
                class="relative z-10"
                icon="i-lucide-x"
                @click.stop="clearFoodItem(model.platilloPrincipal)"
              >
                Limpiar
              </UButton>
              </span>
            </span>
            <USelectMenu
              v-model="selectedPrimaryId"
              :items="platilloPrincipalOptions"
              value-key="value"
              clearable
              search-input
              placeholder="Escribe para buscar un platillo"
              class="absolute inset-0 text-transparent [caret-color:transparent] [&_*]:text-transparent [&_*]:placeholder:text-transparent"
              :content="{ align: 'start', sideOffset: 8 }"
              :ui="overlayFieldUi"
              @update:model-value="applyCatalogItem(model.platilloPrincipal, $event)"
            >
              <template #item-label="{ item }">
                <span class="flex items-center justify-between gap-3">
                  <span>{{ item.label }}</span>
                  <span class="flex items-center gap-2">
                    <span class="text-primary">{{ item.calorias }} cal</span>
                    <UBadge color="neutral" variant="soft" size="sm">{{ item.tipo }}</UBadge>
                  </span>
                </span>
              </template>
            </USelectMenu>
          </div>

          <div
            :class="fieldClass"
          >
            <span class="min-w-0">
              <span class="block text-xs uppercase tracking-[0.18em] text-muted">Guarnición 1</span>
              <span class="mt-1.5 block text-sm font-medium text-highlighted">{{ itemSummary(model.guarnicion1) }}</span>
            </span>
            <span class="relative z-10 flex shrink-0 flex-col items-end justify-center gap-2 self-stretch">
              <span class="text-sm font-semibold text-primary">{{ caloriesSummary(model.guarnicion1) }}</span>
              <span class="flex items-center gap-2">
                <UButton
                  type="button"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-square-pen"
                  @click.stop="openDetailModal('guarnicion-1')"
                >
                  Detalles
                </UButton>
              <UButton
                v-if="hasValue(model.guarnicion1)"
                type="button"
                size="xs"
                variant="ghost"
                color="neutral"
                class="relative z-10"
                icon="i-lucide-x"
                @click.stop="clearFoodItem(guarnicion1Model)"
              >
                Limpiar
              </UButton>
              </span>
            </span>
            <USelectMenu
              v-model="selectedGuarnicion1Id"
              :items="guarnicionOptions"
              value-key="value"
              clearable
              search-input
              placeholder="Escribe para buscar una guarnición"
              class="absolute inset-0 text-transparent [caret-color:transparent] [&_*]:text-transparent [&_*]:placeholder:text-transparent"
              :content="{ align: 'start', sideOffset: 8 }"
              :ui="overlayFieldUi"
              @update:model-value="applyCatalogItem(guarnicion1Model, $event)"
            >
              <template #item-label="{ item }">
                <span class="flex items-center justify-between gap-3">
                  <span>{{ item.label }}</span>
                  <span class="flex items-center gap-2">
                    <span class="text-primary">{{ item.calorias }} cal</span>
                    <UBadge color="neutral" variant="soft" size="sm">{{ item.tipo }}</UBadge>
                  </span>
                </span>
              </template>
            </USelectMenu>
          </div>

          <div
            :class="fieldClass"
          >
            <span class="min-w-0">
              <span class="block text-xs uppercase tracking-[0.18em] text-muted">Guarnición 2</span>
              <span class="mt-1.5 block text-sm font-medium text-highlighted">{{ itemSummary(model.guarnicion2) }}</span>
            </span>
            <span class="relative z-10 flex shrink-0 flex-col items-end justify-center gap-2 self-stretch">
              <span class="text-sm font-semibold text-primary">{{ caloriesSummary(model.guarnicion2) }}</span>
              <span class="flex items-center gap-2">
                <UButton
                  type="button"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-square-pen"
                  @click.stop="openDetailModal('guarnicion-2')"
                >
                  Detalles
                </UButton>
              <UButton
                v-if="hasValue(model.guarnicion2)"
                type="button"
                size="xs"
                variant="ghost"
                color="neutral"
                class="relative z-10"
                icon="i-lucide-x"
                @click.stop="clearFoodItem(guarnicion2Model)"
              >
                Limpiar
              </UButton>
              </span>
            </span>
            <USelectMenu
              v-model="selectedGuarnicion2Id"
              :items="guarnicionOptions"
              value-key="value"
              clearable
              search-input
              placeholder="Escribe para buscar una guarnición"
              class="absolute inset-0 text-transparent [caret-color:transparent] [&_*]:text-transparent [&_*]:placeholder:text-transparent"
              :content="{ align: 'start', sideOffset: 8 }"
              :ui="overlayFieldUi"
              @update:model-value="applyCatalogItem(guarnicion2Model, $event)"
            >
              <template #item-label="{ item }">
                <span class="flex items-center justify-between gap-3">
                  <span>{{ item.label }}</span>
                  <span class="flex items-center gap-2">
                    <span class="text-primary">{{ item.calorias }} cal</span>
                    <UBadge color="neutral" variant="soft" size="sm">{{ item.tipo }}</UBadge>
                  </span>
                </span>
              </template>
            </USelectMenu>
          </div>
        </section>

        <section
          v-else
          class="grid grid-cols-1 gap-3"
        >
          <div
            :class="fieldClass"
          >
            <span class="min-w-0">
              <span class="block text-xs uppercase tracking-[0.18em] text-muted">Platillo principal</span>
              <span class="mt-1.5 block text-sm font-medium text-highlighted">{{ itemSummary(model.platilloPrincipal) }}</span>
            </span>
            <span class="relative z-10 flex shrink-0 flex-col items-end justify-center gap-2 self-stretch">
              <span class="text-sm font-semibold text-primary">{{ caloriesSummary(model.platilloPrincipal) }}</span>
              <span class="flex items-center gap-2">
                <UButton
                  type="button"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-square-pen"
                  @click.stop="openDetailModal('platillo-principal')"
                >
                  Detalles
                </UButton>
              <UButton
                v-if="hasValue(model.platilloPrincipal)"
                type="button"
                size="xs"
                variant="ghost"
                color="neutral"
                class="relative z-10"
                icon="i-lucide-x"
                @click.stop="clearFoodItem(model.platilloPrincipal)"
              >
                Limpiar
              </UButton>
              </span>
            </span>
            <USelectMenu
              v-model="selectedPrimaryId"
              :items="platilloPrincipalOptions"
              value-key="value"
              clearable
              search-input
              placeholder="Escribe para buscar un platillo"
              class="absolute inset-0 text-transparent [caret-color:transparent] [&_*]:text-transparent [&_*]:placeholder:text-transparent"
              :content="{ align: 'start', sideOffset: 8 }"
              :ui="overlayFieldUi"
              @update:model-value="applyCatalogItem(model.platilloPrincipal, $event)"
            >
              <template #item-label="{ item }">
                <span class="flex items-center justify-between gap-3">
                  <span>{{ item.label }}</span>
                  <span class="flex items-center gap-2">
                    <span class="text-primary">{{ item.calorias }} cal</span>
                    <UBadge color="neutral" variant="soft" size="sm">{{ item.tipo }}</UBadge>
                  </span>
                </span>
              </template>
            </USelectMenu>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <button
            type="button"
            class="flex items-center justify-between rounded-xl border border-dashed border-default/70 bg-default px-4 py-3 text-left shadow-xs transition-colors hover:bg-default"
            @click="modalView = 'adicionales'"
          >
            <span>
              <span class="block text-xs uppercase tracking-[0.18em] text-muted">Adicionales</span>
              <span class="mt-1.5 block text-sm font-medium text-highlighted">
                {{ model.adicionales.length ? `${model.adicionales.length} capturados` : "Sin adicionales" }}
              </span>
            </span>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
          </button>

          <div class="relative rounded-xl border border-default/70 bg-default px-4 py-3 shadow-xs transition-colors hover:bg-default">
            <div class="pointer-events-none flex items-center justify-between">
              <span>
                <span class="block text-xs uppercase tracking-[0.18em] text-muted">Contenedor</span>
                <span class="mt-1.5 block text-sm font-medium text-highlighted">{{ model.contenedor || 'Sin capturar' }}</span>
              </span>
              <span class="text-base">📦</span>
            </div>
            <USelect
              v-model="contenedorModel"
              :items="contenedorOptions"
              placeholder="Selecciona un contenedor"
              icon="i-lucide-package"
              variant="ghost"
              class="absolute inset-0 text-transparent [caret-color:transparent] [&_*]:text-transparent [&_*]:placeholder:text-transparent"
              :ui="overlayFieldUi"
            />
          </div>
        </section>

      </section>
    </Transition>
  </UCard>

  <UModal
    v-model:open="isModalOpen"
    :title="detailModalTitle"
    :description="title"
    :ui="{ content: 'max-w-3xl' }"
  >
    <template #body>
      <section
        v-if="modalView === 'adicionales'"
        class="space-y-4"
      >
        <section class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted">
            Agrega y organiza los adicionales de este tiempo.
          </p>
          <UButton
            size="sm"
            variant="outline"
            icon="i-lucide-plus"
            @click="addAdicional"
          >
            Agregar adicional
          </UButton>
        </section>

        <UAlert
          v-if="!model.adicionales.length"
          title="Sin adicionales"
          description="Agrega adicionales si este tiempo los necesita."
          color="neutral"
          variant="soft"
        />

        <section
          v-for="(adicional, index) in model.adicionales"
          :key="index"
          class="space-y-3 rounded-xl border border-default p-3"
        >
          <section class="flex items-center justify-between gap-3">
            <h4 class="font-medium text-highlighted">Adicional {{ index + 1 }}</h4>
            <UButton
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              @click="removeAdicional(index)"
            >
              Eliminar
            </UButton>
          </section>

          <AdminFoodItemFields
            :model-value="getAdicional(index)"
            :title="`Adicional ${index + 1}`"
            :catalog-items="adicionalItems"
            @update:model-value="setAdicional(index, $event)"
          />
        </section>
      </section>

      <section
        v-else-if="detailItem"
        class="space-y-4"
      >
        <p class="text-sm text-muted">
          Ajusta manualmente el detalle del platillo seleccionado para este tiempo.
        </p>

        <UFormField label="Nombre">
          <UInput
            v-model="detailItem.nombre"
            placeholder="Nombre del platillo"
            :ui="detailFieldInputUi"
          />
        </UFormField>

        <UFormField label="Descripción">
          <UTextarea
            v-model="detailItem.descripcion"
            :rows="3"
            placeholder="Descripción breve"
            :ui="detailFieldTextareaUi"
          />
        </UFormField>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="Calorías">
            <UInput
              v-model.number="detailItem.calorias"
              type="number"
              min="0"
              :ui="detailFieldInputUi"
            />
          </UFormField>

          <UFormField label="Tipo">
            <UInput
              v-model="detailItem.tipo"
              placeholder="Tipo"
              :ui="detailFieldInputUi"
            />
          </UFormField>
        </div>

        <UFormField label="Imagen (URL)">
          <UInput
            v-model="detailItem.imagen"
            placeholder="https://..."
            :ui="detailFieldInputUi"
          />
        </UFormField>
      </section>
    </template>
  </UModal>
</template>
