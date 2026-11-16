<script setup lang="ts">
import { customerExclusionsInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type { CustomerExclusion, CustomerExclusionsInput, ExclusionKindValue, FoodCatalogItem, Ingredient } from "~~/layers/menu/shared/types/types"

const props = defineProps<{ customerId: string }>()

const toast = useToast()
const { updateCustomerExclusions } = useCustomers()
const { data: exclusions, status, error, refresh } = await useFetch<CustomerExclusion[]>(
  () => `/api/customers/${props.customerId}/exclusions`,
  { lazy: true, default: () => [] }
)

const groups: Array<{ kind: ExclusionKindValue, label: string, color: "error" | "warning" | "neutral", icon: string }> = [
  { kind: "ALERGIA", label: "Alergias", color: "error", icon: "i-lucide-shield-alert" },
  { kind: "INGREDIENTE", label: "Ingredientes que no consume", color: "warning", icon: "i-lucide-carrot" },
  { kind: "PLATILLO", label: "Platillos que no consume", color: "neutral", icon: "i-lucide-utensils-crossed" }
]
const byKind = (kind: ExclusionKindValue) => exclusions.value.filter(item => item.kind === kind)
const hasAllergies = computed(() => byKind("ALERGIA").length > 0)

const open = ref(false)
const saving = ref(false)
const choicesStatus = ref<"idle" | "pending" | "error" | "success">("idle")
const ingredients = ref<Ingredient[]>([])
const catalog = ref<FoodCatalogItem[]>([])
const state = reactive<CustomerExclusionsInput>({ allergyIngredientIds: [], ingredientIds: [], catalogItemIds: [] })

const ingredientItems = computed(() => ingredients.value.map(item => ({ label: item.nombre, description: item.categoria, value: item.id })))
const catalogItems = computed(() => catalog.value.map(item => ({ label: item.nombre, description: `${item.tipo} · ${item.calorias} kcal`, value: item.id })))

async function loadChoices() {
  choicesStatus.value = "pending"
  try {
    const [ingredientList, catalogList] = await Promise.all([
      $fetch<Ingredient[]>("/api/ingredients"),
      $fetch<FoodCatalogItem[]>("/api/food-components")
    ])
    ingredients.value = ingredientList
    catalog.value = catalogList
    choicesStatus.value = "success"
  } catch {
    choicesStatus.value = "error"
  }
}

function openEditor() {
  const ids = (kind: ExclusionKindValue) => byKind(kind).map(item => (kind === "PLATILLO" ? item.catalogItemId : item.ingredientId)!)
  Object.assign(state, { allergyIngredientIds: ids("ALERGIA"), ingredientIds: ids("INGREDIENTE"), catalogItemIds: ids("PLATILLO") })
  open.value = true
  if (choicesStatus.value !== "success") loadChoices()
}

async function save() {
  saving.value = true
  try {
    exclusions.value = await updateCustomerExclusions(props.customerId, { ...state })
    open.value = false
    toast.add({ title: "Exclusiones guardadas", description: "Se aplicarán solas en los próximos pedidos y al editar los actuales.", color: "success", icon: "i-lucide-circle-check" })
  } catch (failure) {
    const message = (failure as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: "No se pudieron guardar las exclusiones", description: message ?? "Intenta de nuevo.", color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-shield-alert" class="size-5 text-primary" />Alergias y exclusiones</h2>
        <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-pencil" label="Editar" :disabled="status === 'pending' || Boolean(error)" @click="openEditor" />
      </div>
    </template>

    <div v-if="status === 'pending'" role="status" aria-live="polite" class="space-y-3">
      <span class="sr-only">Cargando exclusiones</span>
      <USkeleton class="h-6 w-2/3" /><USkeleton class="h-6 w-1/2" />
    </div>
    <UEmpty v-else-if="error" icon="i-lucide-cloud-alert" title="No fue posible cargar las exclusiones.">
      <template #actions><UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Reintentar" @click="refresh()" /></template>
    </UEmpty>
    <div v-else class="space-y-5">
      <p class="text-sm text-muted">
        El sistema las aplica solo: al crear un pedido cambia cada platillo excluido por otro compatible del menú de la semana, y al editarlo no permite elegirlos.
      </p>
      <dl class="grid gap-5 text-sm md:grid-cols-3">
        <div v-for="group in groups" :key="group.kind">
          <dt class="text-muted">{{ group.label }}</dt>
          <dd class="mt-2 flex flex-wrap gap-2">
            <UBadge v-for="item in byKind(group.kind)" :key="item.id" :color="group.color" variant="subtle" :icon="group.icon" :label="item.label" />
            <span v-if="!byKind(group.kind).length" class="text-dimmed">Ninguno</span>
          </dd>
        </div>
      </dl>
      <UAlert v-if="hasAllergies" color="warning" variant="soft" icon="i-lucide-triangle-alert" title="Platillos sin receta" description="Las alergias solo se revisan en platillos con receta capturada. Los pedidos marcan los platillos sin receta para revisarlos a mano." />
    </div>

    <UModal v-model:open="open" title="Alergias y exclusiones" description="Elige ingredientes y platillos que este cliente no debe recibir." :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <UEmpty v-if="choicesStatus === 'error'" icon="i-lucide-cloud-alert" title="No fue posible cargar ingredientes y platillos.">
          <template #actions><UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Reintentar" @click="loadChoices" /></template>
        </UEmpty>
        <UForm v-else id="customer-exclusions-form" :schema="customerExclusionsInputSchema" :state="state" :disabled="saving" class="grid gap-5" @submit="save">
          <UFormField label="Alergias" name="allergyIngredientIds" description="Ingredientes que el cliente no puede consumir por salud.">
            <USelectMenu v-model="state.allergyIngredientIds" multiple :items="ingredientItems" value-key="value" :loading="choicesStatus === 'pending'" placeholder="Buscar ingrediente" class="w-full" />
          </UFormField>
          <UFormField label="Ingredientes que no consume" name="ingredientIds">
            <USelectMenu v-model="state.ingredientIds" multiple :items="ingredientItems" value-key="value" :loading="choicesStatus === 'pending'" placeholder="Buscar ingrediente" class="w-full" />
          </UFormField>
          <UFormField label="Platillos que no consume" name="catalogItemIds">
            <USelectMenu v-model="state.catalogItemIds" multiple :items="catalogItems" value-key="value" :loading="choicesStatus === 'pending'" placeholder="Buscar platillo" class="w-full" />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton label="Cancelar" color="neutral" variant="ghost" :disabled="saving" @click="open = false" />
          <UButton type="submit" form="customer-exclusions-form" icon="i-lucide-save" label="Guardar" :loading="saving" :disabled="choicesStatus !== 'success'" />
        </div>
      </template>
    </UModal>
  </UCard>
</template>
