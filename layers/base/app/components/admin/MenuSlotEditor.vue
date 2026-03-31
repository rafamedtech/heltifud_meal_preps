<script setup lang="ts">
import type { FoodCatalogItem, FoodItemDetail, MenuSlot } from "~~/layers/menu/shared/types/types"

defineOptions({
  inheritAttrs: false
})

type DetailModalView =
  | "select-platillo-principal"
  | "select-guarnicion-1"
  | "select-guarnicion-2"
  | "extras"
  | null

type SelectionModalView = Exclude<DetailModalView, "extras" | null>

interface Props {
  title: string
  showSides?: boolean
  catalogItems?: FoodCatalogItem[]
  showToggle?: boolean
  restoreSelectionView?: SelectionModalView | null
  restoreSearch?: string
  restoreSelectedType?: string
}

interface CreateCatalogItemPayload {
  tipo?: string
  view?: SelectionModalView
  search?: string
  selectedType?: string
}

interface EditCatalogItemPayload {
  id: string
  view: SelectionModalView
}

const {
  title,
  showSides = true,
  catalogItems = [],
  showToggle = true,
  restoreSelectionView = null,
  restoreSearch = "",
  restoreSelectedType = "todos"
} = defineProps<Props>()

const emit = defineEmits<{
  createCatalogItem: [payload: CreateCatalogItemPayload]
  editCatalogItem: [payload: EditCatalogItemPayload]
  restoreSelectionApplied: []
}>()

const attrs = useAttrs()

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
const SNACK_TYPES = new Set(["snack"])
const GUARNICION_TYPES = new Set(["guarnicion"])
const ADICIONAL_TYPES = new Set(["ramekin"])

const platilloPrincipalItems = computed(() =>
  catalogItems.filter((item) => PLATILLO_PRINCIPAL_TYPES.has(item.tipo))
)

const snackItems = computed(() =>
  catalogItems.filter((item) => SNACK_TYPES.has(item.tipo))
)

const guarnicionItems = computed(() =>
  catalogItems.filter((item) => GUARNICION_TYPES.has(item.tipo))
)

const adicionalItems = computed(() =>
  catalogItems.filter((item) => ADICIONAL_TYPES.has(item.tipo))
)

const model = defineModel<MenuSlot>({ required: true })
const isOpen = defineModel<boolean>("open", { default: true })
const modalView = ref<DetailModalView>(null)
const selectionSearch = ref("")
const selectionSelectedType = ref("todos")

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

const detailModalTitle = computed(() => {
  switch (modalView.value) {
    case "select-platillo-principal":
      return "Seleccionar platillo principal"
    case "select-guarnicion-1":
      return "Seleccionar guarnición 1"
    case "select-guarnicion-2":
      return "Seleccionar guarnición 2"
    case "extras":
      return "Adicionales y contenedor"
    default:
      return ""
  }
})

function openSelectionModal(view: Extract<DetailModalView, "select-platillo-principal" | "select-guarnicion-1" | "select-guarnicion-2">) {
  modalView.value = view
}

function openSelectionModalFromKeyboard(
  event: KeyboardEvent,
  view: Extract<DetailModalView, "select-platillo-principal" | "select-guarnicion-1" | "select-guarnicion-2">
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    openSelectionModal(view)
  }
}

function openExtrasFromKeyboard(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    modalView.value = "extras"
  }
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

const extrasSummary = computed(() => {
  const parts = []

  if (model.value.adicionales.length) {
    parts.push(`${model.value.adicionales.length} adicional(es)`)
  }

  if (model.value.contenedor?.trim()) {
    parts.push(model.value.contenedor)
  }

  return parts.length ? parts.join(" · ") : "Sin capturar"
})

function hasValue(item?: FoodItemDetail | null) {
  return Boolean(item?.nombre?.trim())
}

function hasExtrasValue() {
  return Boolean(model.value.adicionales.length || model.value.contenedor?.trim())
}

function clearFoodItem(target: FoodItemDetail) {
  target.catalogItemId = null
  target.nombre = ""
  target.descripcion = ""
  target.calorias = 0
  target.imagen = ""
  target.tipo = ""
}

function editCatalogItem(target?: FoodItemDetail | null, view: SelectionModalView = "select-platillo-principal") {
  if (!target?.catalogItemId) {
    return
  }

  emit("editCatalogItem", {
    id: target.catalogItemId,
    view
  })
}

function actionItems(target: FoodItemDetail, view: SelectionModalView = "select-platillo-principal") {
  return [[
    {
      label: "Editar platillo",
      icon: "i-lucide-square-pen",
      disabled: !target.catalogItemId,
      onSelect: () => editCatalogItem(target, view)
    },
    {
      label: "Limpiar campo",
      icon: "i-lucide-eraser",
      disabled: !hasValue(target),
      onSelect: () => clearFoodItem(target)
    }
  ]]
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

const summary = computed(() => {
  const items = [model.value.platilloPrincipal?.nombre, model.value.contenedor].filter(Boolean)
  return items.length ? items.join(" · ") : "Sin capturar"
})

const cardUi = computed(() => ({
  root: showToggle
    ? "app-surface"
    : "h-full rounded-none border-0 bg-transparent shadow-none ring-0",
  header: showToggle
    ? "px-5 py-4 sm:px-5"
    : "border-b border-default/60 bg-elevated/30 px-4 py-3 sm:px-4",
  body: isOpen.value
    ? showToggle
      ? "space-y-4 px-5 py-5 sm:px-5 sm:py-5"
      : "space-y-3 px-4 py-4 sm:px-4 sm:py-4"
    : "p-0 sm:p-0"
}))

const selectFieldClass =
  "app-control-surface relative flex min-h-[96px] items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-[var(--app-surface-soft)]"

function summaryTextClass(isFilled: boolean) {
  return isFilled
    ? "text-highlighted"
    : "text-muted italic font-normal tracking-[0.01em]"
}

function caloriesTextClass(isFilled: boolean) {
  return isFilled
    ? "text-primary"
    : "text-muted/80 font-normal"
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
  base: "app-control-surface px-3.5 py-2.5 hover:bg-[var(--app-surface-soft)] focus:bg-[var(--app-surface-soft)]",
  leading: "ps-0",
  trailing: "pe-0"
}

const selectionOptions = computed(() => {
  switch (modalView.value) {
    case "select-platillo-principal":
      return showSides ? platilloPrincipalItems.value : snackItems.value
    case "select-guarnicion-1":
    case "select-guarnicion-2":
      return guarnicionItems.value
    default:
      return []
  }
})

const createCatalogItemType = computed(() => {
  switch (modalView.value) {
    case "select-platillo-principal":
      return showSides ? "comida" : "snack"
    case "select-guarnicion-1":
    case "select-guarnicion-2":
      return "guarnicion"
    default:
      return undefined
  }
})

function selectCatalogItemFromModal(itemId: string) {
  switch (modalView.value) {
    case "select-platillo-principal":
      applyCatalogItem(model.value.platilloPrincipal, itemId)
      break
    case "select-guarnicion-1":
      applyCatalogItem(guarnicion1Model.value, itemId)
      break
    case "select-guarnicion-2":
      applyCatalogItem(guarnicion2Model.value, itemId)
      break
  }

  modalView.value = null
}

function requestCreateCatalogItem() {
  emit("createCatalogItem", {
    tipo: createCatalogItemType.value,
    view: (modalView.value ?? undefined) as SelectionModalView | undefined,
    search: selectionSearch.value.trim() || undefined,
    selectedType: selectionSelectedType.value !== "todos" ? selectionSelectedType.value : undefined
  })

  modalView.value = null
}

watch(
  () => restoreSelectionView,
  (view) => {
    if (!view || modalView.value === view) {
      return
    }

    modalView.value = view
    emit("restoreSelectionApplied")
  },
  { immediate: true }
)

watch(
  () => restoreSearch,
  (value) => {
    if (typeof value === "string" && value.length > 0) {
      selectionSearch.value = value
    }
  },
  { immediate: true }
)

watch(
  () => restoreSelectedType,
  (value) => {
    if (typeof value === "string" && value.length > 0) {
      selectionSelectedType.value = value
    }
  },
  { immediate: true }
)
</script>

<template>
  <UCard v-bind="attrs" :ui="cardUi">
    <template #header>
      <section class="flex items-center justify-between gap-3">
        <div>
          <h3 :class="showToggle ? 'text-lg font-bold text-primary' : 'text-sm font-semibold uppercase tracking-[0.18em] text-toned'">{{ title }}</h3>
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
        class="space-y-3 overflow-hidden"
      >
        <section
          v-if="showSides"
          class="space-y-3"
        >
          <div
            role="button"
            tabindex="0"
            :class="`${selectFieldClass} w-full cursor-pointer`"
            @click="openSelectionModal('select-platillo-principal')"
            @keydown="openSelectionModalFromKeyboard($event, 'select-platillo-principal')"
          >
            <span class="min-w-0">
              <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">Platillo principal</span>
              <span :class="['mt-1.5 block line-clamp-2 text-sm font-medium', summaryTextClass(hasValue(model.platilloPrincipal))]">{{ itemSummary(model.platilloPrincipal) }}</span>
              <span :class="['mt-1 block text-xs font-semibold', caloriesTextClass(hasValue(model.platilloPrincipal))]">{{ caloriesSummary(model.platilloPrincipal) }}</span>
            </span>
            <span class="relative z-10 flex shrink-0 self-start">
              <UDropdownMenu :items="actionItems(model.platilloPrincipal, 'select-platillo-principal')">
                <UButton
                  type="button"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-ellipsis-vertical"
                  square
                  class="text-muted hover:text-highlighted"
                  @click.stop
                />
              </UDropdownMenu>
            </span>
          </div>

          <section class="grid grid-cols-1 gap-3">
            <div
              role="button"
              tabindex="0"
              :class="`${selectFieldClass} cursor-pointer`"
              @click="openSelectionModal('select-guarnicion-1')"
              @keydown="openSelectionModalFromKeyboard($event, 'select-guarnicion-1')"
            >
              <span class="min-w-0">
                <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">Guarnición 1</span>
                <span :class="['mt-1.5 block line-clamp-2 text-sm font-medium', summaryTextClass(hasValue(model.guarnicion1))]">{{ itemSummary(model.guarnicion1) }}</span>
                <span :class="['mt-1 block text-xs font-semibold', caloriesTextClass(hasValue(model.guarnicion1))]">{{ caloriesSummary(model.guarnicion1) }}</span>
              </span>
              <span class="relative z-10 flex shrink-0 self-start">
                <UDropdownMenu :items="actionItems(guarnicion1Model, 'select-guarnicion-1')">
                  <UButton
                    type="button"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-ellipsis-vertical"
                    square
                    class="text-muted hover:text-highlighted"
                    @click.stop
                  />
                </UDropdownMenu>
              </span>
            </div>

            <div
              role="button"
              tabindex="0"
              :class="`${selectFieldClass} cursor-pointer`"
              @click="openSelectionModal('select-guarnicion-2')"
              @keydown="openSelectionModalFromKeyboard($event, 'select-guarnicion-2')"
            >
              <span class="min-w-0">
                <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">Guarnición 2</span>
                <span :class="['mt-1.5 block line-clamp-2 text-sm font-medium', summaryTextClass(hasValue(model.guarnicion2))]">{{ itemSummary(model.guarnicion2) }}</span>
                <span :class="['mt-1 block text-xs font-semibold', caloriesTextClass(hasValue(model.guarnicion2))]">{{ caloriesSummary(model.guarnicion2) }}</span>
              </span>
              <span class="relative z-10 flex shrink-0 self-start">
                <UDropdownMenu :items="actionItems(guarnicion2Model, 'select-guarnicion-2')">
                  <UButton
                    type="button"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-ellipsis-vertical"
                    square
                    class="text-muted hover:text-highlighted"
                    @click.stop
                  />
                </UDropdownMenu>
              </span>
            </div>
          </section>
        </section>

        <section
          v-else
          class="grid grid-cols-1 gap-3"
        >
          <div
            role="button"
            tabindex="0"
            :class="`${selectFieldClass} w-full cursor-pointer`"
            @click="openSelectionModal('select-platillo-principal')"
            @keydown="openSelectionModalFromKeyboard($event, 'select-platillo-principal')"
          >
            <span class="min-w-0">
              <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">Principal</span>
              <span :class="['mt-1.5 block line-clamp-2 text-sm font-medium', summaryTextClass(hasValue(model.platilloPrincipal))]">{{ itemSummary(model.platilloPrincipal) }}</span>
              <span :class="['mt-1 block text-xs font-semibold', caloriesTextClass(hasValue(model.platilloPrincipal))]">{{ caloriesSummary(model.platilloPrincipal) }}</span>
            </span>
            <span class="relative z-10 flex shrink-0 self-start">
              <UDropdownMenu :items="actionItems(model.platilloPrincipal, 'select-platillo-principal')">
                <UButton
                  type="button"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-ellipsis-vertical"
                  square
                  class="text-muted hover:text-highlighted"
                  @click.stop
                />
              </UDropdownMenu>
            </span>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-3">
          <div
            role="button"
            tabindex="0"
            :class="`${selectFieldClass} w-full`"
            @click="modalView = 'extras'"
            @keydown="openExtrasFromKeyboard"
          >
            <span class="min-w-0">
              <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">Adicionales y contenedor</span>
              <span :class="['mt-1.5 block line-clamp-2 text-sm font-medium', summaryTextClass(hasExtrasValue())]">
                {{ extrasSummary }}
              </span>
            </span>
            <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-muted" />
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
        v-if="modalView === 'select-platillo-principal' || modalView === 'select-guarnicion-1' || modalView === 'select-guarnicion-2'"
        class="-mx-6 -my-5"
      >
        <div class="flex items-center justify-between gap-3 border-b border-default/70 bg-elevated/40 px-6 py-4">
          <p class="text-sm text-muted">
            Si no aparece en la lista, créalo y vuelve al menú.
          </p>

          <UButton
            size="sm"
            icon="i-lucide-plus"
            @click="requestCreateCatalogItem"
          >
            Agregar platillo
          </UButton>
        </div>

        <AdminFoodCatalogTable
          v-model:search="selectionSearch"
          v-model:selected-type="selectionSelectedType"
          :items="selectionOptions"
          mode="select"
          :selected-id="null"
          :autofocus-search="true"
          search-placeholder="Escribe para buscar un platillo"
          empty-title="No hay platillos disponibles"
          empty-description="Crea platillos en el catálogo para poder seleccionarlos aquí."
          no-results-title="Sin resultados"
          no-results-description="Prueba con otro término o cambia el tipo de platillo."
          select-label="Usar"
          @select="selectCatalogItemFromModal"
        />
      </section>

      <section
        v-else-if="modalView === 'extras'"
        class="space-y-4"
      >
        <UFormField label="Contenedor">
          <USelect
            v-model="contenedorModel"
            :items="contenedorOptions"
            placeholder="Selecciona un contenedor"
            icon="i-lucide-package"
            :ui="detailFieldInputUi"
          />
        </UFormField>

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

    </template>
  </UModal>
</template>
