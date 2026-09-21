<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import { ConfigProvider } from "reka-ui"
import { ingredientInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type { Ingredient, IngredientInput, RecipeIngredientInput } from "~~/layers/menu/shared/types/types"

interface Props {
  invalid?: boolean
}

defineProps<Props>()

const ingredientes = defineModel<RecipeIngredientInput[]>("ingredientes", { required: true })
const preparacion = defineModel<string>("preparacion", { required: true })
const toast = useToast()
const { getIngredients, createIngredient } = useIngredientCatalog()

const { data: ingredientCatalog, status: ingredientStatus } = await useAsyncData<Ingredient[]>(
  "ingredient-catalog",
  getIngredients,
  { default: () => [] }
)

const unitOptions = [
  { label: "Gramo (g)", value: "g" },
  { label: "Kilogramo (kg)", value: "kg" },
  { label: "Mililitro (ml)", value: "ml" },
  { label: "Litro (l)", value: "l" },
  { label: "Pieza", value: "pieza" },
  { label: "Porción", value: "porcion" },
  { label: "Cucharadita", value: "cucharadita" },
  { label: "Cucharada", value: "cucharada" },
  { label: "Taza", value: "taza" }
]

const categoryOptions = [
  "Proteína",
  "Verdura",
  "Fruta",
  "Cereal y grano",
  "Leguminosa",
  "Lácteo",
  "Grasa",
  "Condimento",
  "Salsa",
  "Otro"
]

const ingredientTableColumns: TableColumn<RecipeIngredientInput>[] = [
  {
    id: "ingredient",
    header: "Ingrediente",
    meta: { class: { th: "min-w-72", td: "min-w-72" } }
  },
  {
    id: "quantity",
    header: "Cantidad",
    meta: { class: { th: "w-32", td: "w-32" } }
  },
  {
    id: "unit",
    header: "Unidad",
    meta: { class: { th: "min-w-40", td: "min-w-40" } }
  },
  {
    id: "category",
    header: "Categoría",
    meta: { class: { th: "min-w-36", td: "min-w-36" } }
  },
  {
    id: "actions",
    header: "",
    meta: { class: { th: "w-12", td: "w-12 text-right" } }
  }
]

const ingredientOptions = computed(() =>
  ingredientCatalog.value.map((ingredient) => ({
    label: ingredient.nombre,
    value: ingredient.id,
    categoria: ingredient.categoria
  }))
)

const createIngredientOpen = ref(false)
const createTargetIndex = ref<number | null>(null)
const creatingIngredient = ref(false)
const newIngredient = reactive<IngredientInput>({ nombre: "", categoria: "" })
const newIngredientError = ref("")

function addIngredientRow() {
  ingredientes.value.push({ ingredientId: "", cantidad: 1, unidad: "g" })
}

function removeIngredientRow(index: number) {
  ingredientes.value.splice(index, 1)
}

function getIngredient(ingredientId: string) {
  return ingredientCatalog.value.find((ingredient) => ingredient.id === ingredientId)
}

function openCreateIngredient(index: number | null, ingredientName: string) {
  createTargetIndex.value = index
  newIngredient.nombre = ingredientName.trim()
  newIngredient.categoria = ""
  newIngredientError.value = ""
  createIngredientOpen.value = true
}

async function saveNewIngredient() {
  const parsed = ingredientInputSchema.safeParse(newIngredient)

  if (!parsed.success) {
    newIngredientError.value = parsed.error.issues[0]?.message ?? "Revisa la información del ingrediente."
    return
  }

  creatingIngredient.value = true

  try {
    const savedIngredient = await createIngredient(parsed.data)
    const existingIndex = ingredientCatalog.value.findIndex((ingredient) => ingredient.id === savedIngredient.id)

    if (existingIndex === -1) {
      ingredientCatalog.value = [...ingredientCatalog.value, savedIngredient].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es")
      )
    }

    if (createTargetIndex.value !== null && ingredientes.value[createTargetIndex.value]) {
      ingredientes.value[createTargetIndex.value].ingredientId = savedIngredient.id
    }

    createIngredientOpen.value = false
    toast.add({
      title: existingIndex === -1 ? "Ingrediente agregado" : "Ingrediente seleccionado",
      description: `${savedIngredient.nombre} ya está disponible para esta receta y futuras compras.`,
      color: "success",
      icon: "i-lucide-check-circle"
    })
  } catch (error) {
    newIngredientError.value = error instanceof Error ? error.message : "No se pudo guardar el ingrediente."
  } finally {
    creatingIngredient.value = false
  }
}
</script>

<template>
  <section
    :class="[
      'overflow-hidden rounded-(--app-control-radius) border bg-default/50',
      invalid ? 'border-error ring-1 ring-error/30' : 'border-default'
    ]"
  >
    <div class="flex flex-col gap-3 border-b border-default bg-elevated/45 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UIcon name="i-lucide-notebook-tabs" class="size-4" />
          </span>
          <div>
            <h2 class="text-base font-semibold uppercase tracking-[0.12em] text-highlighted">Receta</h2>
          </div>
        </div>
      </div>

      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        icon="i-lucide-plus"
        @click="addIngredientRow"
      >
        Agregar ingrediente
      </UButton>
    </div>

    <div class="space-y-6 p-4 sm:p-5">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-4 border-b border-default/70 pb-2.5">
          <div>
            <h3 class="text-sm font-semibold text-highlighted">Lista de ingredientes</h3>
          </div>
          <UBadge color="neutral" variant="outline" size="sm" class="self-center tabular-nums leading-none translate-y-px">
            {{ ingredientes.length }} {{ ingredientes.length === 1 ? "ingrediente" : "ingredientes" }}
          </UBadge>
        </div>

        <div
          v-if="ingredientes.length === 0"
          class="flex min-h-24 flex-col items-center justify-center border-b border-dashed border-default/70 px-6 text-center"
        >
          <UIcon name="i-lucide-carrot" class="size-5 text-dimmed" />
          <p class="mt-2 text-sm text-muted">Agrega el primer ingrediente para comenzar la receta.</p>
        </div>

        <UTable
          v-else
          :data="ingredientes"
          :columns="ingredientTableColumns"
          :ui="{
            root: 'border-b border-default/70',
            base: 'min-w-[860px]',
            thead: 'bg-elevated/35',
            tr: 'hover:bg-elevated/20',
            th: 'px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted',
            td: 'px-3 py-2.5 align-middle'
          }"
        >
          <template #ingredient-cell="{ row }">
            <USelectMenu
              v-model="row.original.ingredientId"
              :items="ingredientOptions"
              value-key="value"
              searchable
              create-item
              :loading="ingredientStatus === 'pending'"
              placeholder="Buscar ingrediente"
              aria-label="Ingrediente"
              class="w-full"
              @create="openCreateIngredient(row.index, $event)"
            >
              <template #item-label="{ item: option }">
                <span class="flex min-w-0 items-center justify-between gap-3">
                  <span class="truncate">{{ option.label }}</span>
                  <span class="shrink-0 text-xs text-muted">{{ option.categoria }}</span>
                </span>
              </template>
              <template #create-item-label="{ item }">
                <span class="flex min-w-0 items-center gap-2">
                  <UIcon name="i-lucide-plus" class="size-4 shrink-0" />
                  <span class="truncate">Crear “{{ item }}”</span>
                </span>
              </template>
            </USelectMenu>
          </template>

          <template #quantity-cell="{ row }">
            <ConfigProvider locale="en-US">
              <UInputNumber
                v-model="row.original.cantidad"
                :min="0.01"
                :max="999999"
                :step="0.01"
                :format-options="{ maximumFractionDigits: 2 }"
                aria-label="Cantidad"
                class="w-full"
              />
            </ConfigProvider>
          </template>

          <template #unit-cell="{ row }">
            <USelect
              v-model="row.original.unidad"
              :items="unitOptions"
              value-key="value"
              aria-label="Unidad"
              class="w-full"
            />
          </template>

          <template #category-cell="{ row }">
            <div class="flex min-h-8 items-center">
              <span
                v-if="getIngredient(row.original.ingredientId)"
                class="inline-flex min-w-0 items-center gap-2 text-xs text-muted"
              >
                <span class="size-1.5 shrink-0 rounded-full bg-primary/60" />
                <span class="truncate">{{ getIngredient(row.original.ingredientId)?.categoria }}</span>
              </span>
              <span v-else class="text-xs text-dimmed">Pendiente</span>
            </div>
          </template>

          <template #actions-cell="{ row }">
            <UTooltip text="Quitar ingrediente">
              <UButton
                type="button"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                aria-label="Quitar ingrediente"
                @click="removeIngredientRow(row.index)"
              />
            </UTooltip>
          </template>
        </UTable>
      </div>

      <div class="border-t border-default pt-5">
        <UFormField
          label="Proceso de preparación"
          description="Describe los pasos en el orden en que deben realizarse."
          :ui="{ label: 'text-sm font-semibold text-highlighted' }"
        >
          <UTextarea
            v-model="preparacion"
            :rows="8"
            autoresize
            :maxrows="16"
            placeholder="1. Precalienta...&#10;2. Mezcla...&#10;3. Cocina..."
            class="mt-2 w-full"
          />
        </UFormField>
      </div>
    </div>
  </section>

  <UModal
    v-model:open="createIngredientOpen"
    title="Crear ingrediente"
    description="El ingrediente quedará disponible para todas las recetas y futuras listas de compras."
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="newIngredientError"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :description="newIngredientError"
        />

        <UFormField label="Nombre del ingrediente" required>
          <UInput
            v-model="newIngredient.nombre"
            autofocus
            autocomplete="off"
            placeholder="Ej. Pechuga de pollo"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Categoría" required>
          <USelect
            v-model="newIngredient.categoria"
            :items="categoryOptions"
            placeholder="Selecciona una categoría"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          :disabled="creatingIngredient"
          @click="createIngredientOpen = false"
        >
          Cancelar
        </UButton>
        <UButton
          type="button"
          icon="i-lucide-save"
          :loading="creatingIngredient"
          @click="saveNewIngredient"
        >
          Guardar ingrediente
        </UButton>
      </div>
    </template>
  </UModal>
</template>
