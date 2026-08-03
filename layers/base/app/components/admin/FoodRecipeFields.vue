<script setup lang="ts">
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

function openCreateIngredient(index: number) {
  createTargetIndex.value = index
  newIngredient.nombre = ""
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
        variant="soft"
        icon="i-lucide-plus"
        @click="addIngredientRow"
      >
        Agregar ingrediente
      </UButton>
    </div>

    <div class="space-y-6 p-4 sm:p-5">
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-highlighted">Lista de ingredientes</h3>
          </div>
          <UBadge color="neutral" variant="soft" class="self-center leading-none translate-y-px">
            {{ ingredientes.length }} {{ ingredientes.length === 1 ? "ingrediente" : "ingredientes" }}
          </UBadge>
        </div>

        <div
          v-if="ingredientes.length === 0"
          class="flex min-h-32 flex-col items-center justify-center rounded-(--app-control-radius) border border-dashed border-default bg-elevated/30 px-6 text-center"
        >
          <UIcon name="i-lucide-carrot" class="size-6 text-dimmed" />
          <p class="mt-2 text-sm font-medium text-highlighted">Aún no hay ingredientes</p>
          <p class="mt-1 text-xs text-muted">Agrega el primer ingrediente para comenzar la receta.</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(row, index) in ingredientes"
            :key="index"
            class="grid gap-3 rounded-(--app-control-radius) border border-default bg-default p-3 shadow-xs lg:grid-cols-[minmax(220px,1.7fr)_120px_160px_150px_40px] lg:items-end"
          >
            <UFormField label="Ingrediente" required>
              <div class="flex gap-2">
                <USelectMenu
                  v-model="row.ingredientId"
                  :items="ingredientOptions"
                  value-key="value"
                  searchable
                  :loading="ingredientStatus === 'pending'"
                  placeholder="Buscar ingrediente"
                  class="min-w-0 flex-1"
                >
                  <template #item-label="{ item: option }">
                    <span class="flex min-w-0 items-center justify-between gap-3">
                      <span class="truncate">{{ option.label }}</span>
                      <span class="shrink-0 text-xs text-muted">{{ option.categoria }}</span>
                    </span>
                  </template>
                </USelectMenu>
                <UTooltip text="Crear ingrediente">
                  <UButton
                    type="button"
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-plus"
                    aria-label="Crear ingrediente"
                    @click="openCreateIngredient(index)"
                  />
                </UTooltip>
              </div>
            </UFormField>

            <UFormField label="Cantidad" required>
              <UInputNumber
                v-model="row.cantidad"
                :min="1"
                :step="1"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Unidad" required>
              <USelect
                v-model="row.unidad"
                :items="unitOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Categoría">
              <div class="flex min-h-8 items-center">
                <UBadge
                  v-if="getIngredient(row.ingredientId)"
                  color="neutral"
                  variant="soft"
                  class="max-w-full"
                >
                  <span class="truncate">{{ getIngredient(row.ingredientId)?.categoria }}</span>
                </UBadge>
                <span v-else class="text-xs text-dimmed">Se completa al seleccionar</span>
              </div>
            </UFormField>

            <UTooltip text="Quitar ingrediente">
              <UButton
                type="button"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                aria-label="Quitar ingrediente"
                @click="removeIngredientRow(index)"
              />
            </UTooltip>
          </div>
        </div>
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
