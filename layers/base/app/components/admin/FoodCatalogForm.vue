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

function normalizeTypeValue(value: unknown) {
  if (typeof value === "string") {
    return value
  }

  return ""
}

const state = reactive<FoodCatalogItemInput>(emptyState())
const saving = ref(false)
const imageLoadFailed = ref(false)
const invalidFields = reactive<Record<keyof FoodCatalogItemInput, boolean>>({
  nombre: false,
  descripcion: false,
  calorias: false,
  imagen: false,
  tipo: false
})

const actionLabel = computed(() => (mode.value === "edit" ? "Guardar cambios" : "Crear platillo"))

const { createFoodCatalogItem, updateFoodCatalogItem } = useFoodCatalog()
const normalizedImageUrl = computed(() => state.imagen.trim())
const initialStateSnapshot = ref("")
const fieldSurfaceClass = "app-control-surface px-4 py-3.5"
const textFieldUi = {
  base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent placeholder:italic",
  leading: "ps-0",
  trailing: "pe-0"
}
const typeSelectUi = {
  ...textFieldUi,
  value: "min-w-0",
  content: "max-h-[28rem]",
  viewport: "overflow-y-visible"
}

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
    <UCard class="app-surface">
      <UForm
        :state="state"
        class="space-y-5"
        @submit="onSubmit"
      >
        <div class="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="space-y-5">
            <section :class="[fieldSurfaceClass, invalidFields.nombre ? 'app-control-surface-error' : '']">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Nombre</p>
              <UInput
                v-model="state.nombre"
                class="mt-2 w-full"
                variant="ghost"
                placeholder="Ej. Pechuga a la plancha"
                :ui="textFieldUi"
              />
            </section>

            <section :class="[fieldSurfaceClass, invalidFields.descripcion ? 'app-control-surface-error' : '']">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Descripción</p>
              <UInput
                v-model="state.descripcion"
                class="mt-2 w-full"
                variant="ghost"
                placeholder="Escribe aquí"
                :rows="4"
                :ui="{
                  base: ' resize-none placeholder:italic px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent',
                  leading: 'ps-0',
                  trailing: 'pe-0'
                }"
              />
            </section>

            <div class="grid gap-5 md:grid-cols-2">
              <section :class="[fieldSurfaceClass, invalidFields.calorias ? 'app-control-surface-error' : '']">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Calorías</p>
                <UInput
                  v-model.number="state.calorias"
                  class="mt-2 w-full"
                  variant="ghost"
                  type="number"
                  min="0"
                  :ui="textFieldUi"
                />
              </section>

              <section :class="[fieldSurfaceClass, invalidFields.tipo ? 'app-control-surface-error' : '']">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Tipo</p>
                <USelect
                  v-model="state.tipo"
                  :items="typeOptions"
                  value-key="value"
                  class="mt-2 w-full"
                  variant="ghost"
                  placeholder="Selecciona un tipo"
                  :ui="typeSelectUi"
                >
                  <template #default="{ modelValue }">
                    <span
                      v-if="normalizeTypeValue(modelValue)"
                      class="inline-flex min-w-0 items-center gap-2"
                    >
                      <UIcon
                        :name="getFoodTypeAppearance(normalizeTypeValue(modelValue)).icon"
                        class="size-4 shrink-0 text-muted"
                      />
                      <span class="truncate text-sm text-highlighted">
                        {{ getFoodTypeAppearance(normalizeTypeValue(modelValue)).label }}
                      </span>
                    </span>
                  </template>

                  <template #item-label="{ item: typeItem }">
                    <UBadge
                      :color="getFoodTypeAppearance(typeItem.value).color"
                      variant="soft"
                      :class="[
                        'inline-flex max-w-fit rounded-(--app-control-radius) px-2.5 py-1 ring-1 ring-inset',
                        getFoodTypeAppearance(typeItem.value).className
                      ]"
                    >
                      <UIcon
                        :name="getFoodTypeAppearance(typeItem.value).icon"
                        class="size-3.5 shrink-0"
                      />
                      {{ getFoodTypeAppearance(typeItem.value).label }}
                    </UBadge>
                  </template>
                </USelect>
              </section>
            </div>

            <section :class="[fieldSurfaceClass, invalidFields.imagen ? 'app-control-surface-error' : '']">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Imagen (URL)</p>
              <UInput
                v-model="state.imagen"
                class="mt-2 w-full"
                variant="ghost"
                placeholder="https://..."
                :ui="textFieldUi"
              />
            </section>
          </div>

          <div class="flex">
            <section :class="[fieldSurfaceClass, 'flex min-h-full w-full flex-col overflow-hidden']">
              <div class="flex items-center gap-3">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Vista previa</p>
              </div>

              <div
                class="mt-3 flex-1 overflow-hidden rounded-[calc(var(--app-control-radius)-2px)] border border-default bg-elevated/60"
              >
                <div class="relative h-full min-h-80 bg-linear-to-br from-muted/30 via-elevated to-muted/15">
                  <img
                    v-if="canRenderImagePreview"
                    :src="normalizedImageUrl"
                    :alt="state.nombre || 'Vista previa del platillo'"
                    class="absolute inset-0 h-full w-full object-cover"
                    @error="imageLoadFailed = true"
                  >

                  <div
                    v-else
                    class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
                  >
                    <div
                      class="flex size-12 items-center justify-center rounded-[calc(var(--app-control-radius)-4px)] border border-default bg-default/80 shadow-sm"
                    >
                      <UIcon
                        :name="normalizedImageUrl && !isImageUrlValid ? 'i-lucide-circle-alert' : 'i-lucide-image'"
                        :class="['size-5', normalizedImageUrl && !isImageUrlValid ? 'text-error' : 'text-dimmed']"
                      />
                    </div>
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        {{ imagePlaceholderText }}
                      </p>
                      <p class="text-xs text-muted">Usa una URL completa que empiece con http:// o https://</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section class="border-t border-default/70 pt-5">
          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <UButton
              color="neutral"
              size="lg"
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
              size="lg"
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
