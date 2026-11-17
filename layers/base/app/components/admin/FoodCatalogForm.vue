<script setup lang="ts">
import { foodCatalogItemInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type { FoodCatalogItem, FoodCatalogItemInput } from "~~/layers/menu/shared/types/types"
import { getFoodTypeAppearance } from "~~/layers/base/app/utils/foodTypeAppearance"
import type { ZodIssue } from "zod"

interface Props {
  item?: FoodCatalogItem | null
  mode?: "create" | "edit"
}

const props = defineProps<Props>()
const item = computed(() => props.item ?? null)
const mode = computed(() => props.mode ?? "create")

const emit = defineEmits<{
  saved: [itemId: string]
  dirtyChange: [isDirty: boolean]
}>()

const route = useRoute()
const toast = useToast()
const cancelTo = computed(() => (typeof route.query.returnTo === "string" ? route.query.returnTo : "/admin/platillos"))
const cancelConfirmOpen = ref(false)
function getSingleQueryValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim()
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim()
  }

  return ""
}

const prefilledName = computed(() => getSingleQueryValue(route.query.nombre))
const prefilledType = computed(() => getSingleQueryValue(route.query.tipo))

const emptyState = (nombre = "", tipo = ""): FoodCatalogItemInput => ({
  nombre,
  descripcion: "",
  recipeYield: null,
  preparacion: "",
  ingredientes: [],
  calorias: 0,
  imagen: "",
  tipo
})

const typeOptions = [
  { label: "Desayuno", value: "desayuno" },
  { label: "Comida", value: "comida" },
  { label: "Cena", value: "cena" },
  { label: "Snack", value: "snack" },
  { label: "Guarnición", value: "guarnicion" },
  { label: "Ramekin", value: "ramekin" }
]

const state = reactive<FoodCatalogItemInput>(emptyState())
const saving = ref(false)
const imageLoadFailed = ref(false)
const invalidFields = reactive<Record<keyof FoodCatalogItemInput, boolean>>({
  nombre: false,
  descripcion: false,
  recipeYield: false,
  preparacion: false,
  ingredientes: false,
  calorias: false,
  imagen: false,
  tipo: false
})

const actionLabel = computed(() => (mode.value === "edit" ? "Guardar cambios" : "Crear platillo"))

const { createFoodCatalogItem, updateFoodCatalogItem } = useFoodCatalog()
const normalizedImageUrl = computed(() => state.imagen.trim())
const initialStateSnapshot = ref("")
const isImageUrlValid = computed(() => {
  if (!normalizedImageUrl.value) {
    return false
  }

  try {
    const parsedUrl = new URL(normalizedImageUrl.value)

    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
  } catch {
    return false
  }
})

const canRenderImagePreview = computed(() => isImageUrlValid.value && !imageLoadFailed.value)
const imagePlaceholderText = computed(() => {
  if (!normalizedImageUrl.value) {
    return "Aquí se verá la imagen del platillo"
  }

  if (!isImageUrlValid.value) {
    return "La URL de la imagen no tiene un formato válido"
  }

  if (imageLoadFailed.value) {
    return "No se pudo cargar la imagen con esa URL"
  }

  return ""
})
const stateSnapshot = computed(() => JSON.stringify(state))
const isDirty = computed(() => stateSnapshot.value !== initialStateSnapshot.value)

function clearValidationHighlights() {
  invalidFields.nombre = false
  invalidFields.descripcion = false
  invalidFields.recipeYield = false
  invalidFields.preparacion = false
  invalidFields.ingredientes = false
  invalidFields.calorias = false
  invalidFields.imagen = false
  invalidFields.tipo = false
}

function applyValidationHighlights(issues: ZodIssue[]) {
  clearValidationHighlights()

  for (const issue of issues) {
    const [field] = issue.path

    if (typeof field === "string" && field in invalidFields) {
      invalidFields[field as keyof FoodCatalogItemInput] = true
    }
  }
}

watch(
  [() => item.value, () => prefilledName.value, () => prefilledType.value],
  ([item, nombre, tipo]) => {
    Object.assign(
      state,
      item
        ? {
            nombre: item.nombre,
            descripcion: item.descripcion,
            recipeYield: item.recipeYield ?? null,
            preparacion: item.preparacion,
            ingredientes: item.ingredientes.map((recipeIngredient) => ({
              ingredientId: recipeIngredient.ingredientId,
              cantidad: recipeIngredient.cantidad,
              unidad: recipeIngredient.unidad
            })),
            calorias: item.calorias,
            imagen: item.imagen,
            tipo: item.tipo
          }
        : emptyState(mode.value === "create" ? nombre : "", mode.value === "create" ? tipo : "")
    )

    clearValidationHighlights()
    initialStateSnapshot.value = JSON.stringify(state)
  },
  { immediate: true }
)

watch(
  isDirty,
  (value) => {
    emit("dirtyChange", value)
  },
  { immediate: true }
)

watch(
  () => state.nombre,
  () => {
    invalidFields.nombre = false
  }
)

watch(
  () => state.descripcion,
  () => {
    invalidFields.descripcion = false
  }
)

watch(
  () => state.preparacion,
  () => {
    invalidFields.preparacion = false
  }
)

watch(
  () => state.ingredientes,
  () => {
    invalidFields.ingredientes = false
  },
  { deep: true }
)

watch(
  () => state.calorias,
  () => {
    invalidFields.calorias = false
  }
)

watch(
  () => state.imagen,
  () => {
    invalidFields.imagen = false
    imageLoadFailed.value = false
  }
)

watch(
  () => state.tipo,
  () => {
    invalidFields.tipo = false
  }
)

async function onSubmit() {
  const parsed = foodCatalogItemInputSchema.safeParse(state)

  if (!parsed.success) {
    const issues = parsed.error.issues

    applyValidationHighlights(issues)
    toast.add({
      title: "Error de validación",
      description: issues[0]?.message ?? "Revisa la información del platillo.",
      color: "error",
      icon: "i-lucide-circle-alert"
    })
    return
  }

  saving.value = true

  try {
    const savedItem =
      mode.value === "edit" && item.value?.id
        ? await updateFoodCatalogItem(item.value.id, parsed.data)
        : await createFoodCatalogItem(parsed.data)

    clearValidationHighlights()
    toast.add({
      title: mode.value === "edit" ? "Platillo actualizado" : "Platillo creado",
      color: "success",
      icon: "i-lucide-check-circle"
    })

    emit("saved", savedItem.id)
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el platillo"
    toast.add({ title: "Error", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    saving.value = false
  }
}

async function leaveForm() {
  cancelConfirmOpen.value = false
  await navigateTo(cancelTo.value)
}

function onCancel() {
  if (isDirty.value) {
    cancelConfirmOpen.value = true
    return
  }

  navigateTo(cancelTo.value)
}
</script>

<template>
  <main class="space-y-4">
    <UCard>
      <UForm
        :state="state"
        autocomplete="off"
        class="space-y-5"
        @submit="onSubmit"
      >
        <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="space-y-5">
            <UFormField label="Nombre" name="nombre" :error="invalidFields.nombre" required>
              <UInput v-model="state.nombre" placeholder="Ej. Pechuga a la plancha" class="w-full" />
            </UFormField>
            <UFormField label="Descripción" name="descripcion" :error="invalidFields.descripcion" required>
              <UTextarea v-model="state.descripcion" placeholder="Describe el platillo" :rows="4" class="w-full" />
            </UFormField>
            <div class="grid gap-5 sm:grid-cols-2">
              <UFormField label="Calorías" name="calorias" :error="invalidFields.calorias" required>
                <UInputNumber v-model="state.calorias" :min="0" class="w-full" />
              </UFormField>
              <UFormField label="Tipo" name="tipo" :error="invalidFields.tipo" required>
                <USelect v-model="state.tipo" :items="typeOptions" value-key="value" placeholder="Selecciona un tipo" :icon="state.tipo ? getFoodTypeAppearance(state.tipo).icon : undefined" class="w-full" />
              </UFormField>
            </div>
            <UFormField label="Imagen (URL)" name="imagen" :error="invalidFields.imagen" required>
              <UInput v-model="state.imagen" icon="i-lucide-image" placeholder="https://..." class="w-full" />
            </UFormField>
          </div>
          <UCard title="Vista previa" variant="subtle">
            <img v-if="canRenderImagePreview" :src="normalizedImageUrl" :alt="state.nombre || 'Vista previa del platillo'" class="aspect-square w-full object-cover" @error="imageLoadFailed = true">
            <UEmpty v-else icon="i-lucide-image" :title="imagePlaceholderText" description="Usa una URL completa que empiece con http:// o https://" />
          </UCard>
        </div>

        <UFormField label="Rendimiento de la receta (porciones)" name="recipeYield" description="Cantidad de porciones que producen los ingredientes registrados. Necesario para calcular la lista de súper." :error="invalidFields.recipeYield">
          <UInputNumber v-model="state.recipeYield" :min="0.001" :max="9999999" :step="0.001" placeholder="Sin rendimiento" />
        </UFormField>

        <AdminFoodRecipeFields
          v-model:ingredientes="state.ingredientes"
          v-model:preparacion="state.preparacion"
          :invalid="invalidFields.ingredientes || invalidFields.preparacion"
        />

        <section class="border-t border-default/70 pt-5">
          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <UButton
              color="neutral"
              icon="i-lucide-x"
              block
              class="sm:w-auto"
              @click="onCancel"
            >
              Cancelar
            </UButton>
            <UButton
              type="submit"
              :loading="saving"
              icon="i-lucide-save"
              block
              class="min-w-44 justify-center shadow-sm sm:w-auto"
            >
              {{ actionLabel }}
            </UButton>
          </div>
        </section>
      </UForm>
    </UCard>

    <UModal
      v-model:open="cancelConfirmOpen"
      title="Salir sin guardar"
      description="Tienes cambios sin guardar. Si sales ahora, se perderán."
    >
      <template #body>
        <p class="text-sm text-muted">¿Quieres continuar de todos modos?</p>
      </template>

      <template #footer>
        <div class="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <UButton
            color="neutral"
            variant="ghost"
            block
            class="sm:w-auto"
            @click="cancelConfirmOpen = false"
          >
            Seguir editando
          </UButton>
          <UButton
            color="warning"
            icon="i-lucide-arrow-left"
            block
            class="sm:w-auto"
            @click="leaveForm"
          >
            Salir sin guardar
          </UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>
