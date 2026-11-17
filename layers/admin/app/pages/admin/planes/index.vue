<script setup lang="ts">
import { planInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type { Plan, PlanInput, SlotTypeValue } from "~~/layers/menu/shared/types/types"

definePageMeta({ layout: "admin" })

useSeoMeta({
  title: "Gestión de planes | Heltifud Meal Preps",
  description: "Administra planes, tiempos de comida, variantes y precios.",
  robots: "noindex, nofollow"
})

const toast = useToast()
const { createPlan, updatePlan, deletePlan } = usePlans()
const {
  data: plans,
  status,
  error,
  refresh
} = await useLazyFetch<Plan[]>("/api/plans/all", {
  default: () => []
})

const slotOptions: Array<{ label: string; value: SlotTypeValue; icon: string }> = [
  { label: "Desayuno", value: "DESAYUNO", icon: "i-lucide-sunrise" },
  { label: "Comida", value: "COMIDA", icon: "i-lucide-sun" },
  { label: "Cena", value: "CENA", icon: "i-lucide-moon-star" },
  { label: "Colación 1", value: "SNACK1", icon: "i-lucide-apple" },
  { label: "Colación 2", value: "SNACK2", icon: "i-lucide-cherry" }
]

const planCreateRequest = useState("admin-plan-create-request", () => 0)
watch(planCreateRequest, () => openCreate())
const slotChoices = computed(() => slotOptions.map(slot => ({
  ...slot,
  disabled: formState.slotTypes.length === 1 && formState.slotTypes.includes(slot.value)
})))

const isFormOpen = ref(false)
const editingPlan = ref<Plan | null>(null)
const pendingDelete = ref<Plan | null>(null)
const deleteConflict = ref("")
const saving = ref(false)
const deleting = ref(false)
const pausing = ref(false)
const formSnapshot = ref("")

function emptyPlan(): PlanInput {
  return {
    title: "",
    description: "",
    image: "",
    slotTypes: ["COMIDA"],
    isActive: true,
    variants: [{ title: "5 días", daysCount: 5, price: 0, isActive: true }]
  }
}

const formState = reactive<PlanInput>(emptyPlan())
const formTitle = computed(() => (editingPlan.value ? "Editar plan" : "Nuevo plan"))
const isFormDirty = computed(() => isFormOpen.value && JSON.stringify(formState) !== formSnapshot.value)
const { confirmOpen: leaveConfirmOpen, confirmLeave, leave: leaveWithoutSaving } = useLeaveGuard(isFormDirty)
// Closing with the X, Escape or the overlay asks first when there are changes.
const formOpen = computed({
  get: () => isFormOpen.value,
  set: (open) => {
    if (open) isFormOpen.value = true
    else closeForm()
  }
})
const isDeleteOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (open) => {
    if (!open) cancelDelete()
  }
})
const deleteDescription = computed(() => {
  if (!pendingDelete.value) return undefined
  return deleteConflict.value
    ? `${pendingDelete.value.title} conserva su historial de pedidos.`
    : `Se eliminarán ${pendingDelete.value.title} y sus variantes.`
})

function variantOrders(variantId?: string) {
  if (!variantId) return 0
  return editingPlan.value?.variants.find((variant) => variant.id === variantId)?.orderCount ?? 0
}

function ordersLabel(count: number) {
  return `${count} ${count === 1 ? "pedido" : "pedidos"}`
}

function openForm() {
  formSnapshot.value = JSON.stringify(formState)
  isFormOpen.value = true
}

function openCreate() {
  editingPlan.value = null
  Object.assign(formState, emptyPlan())
  openForm()
}

function openEdit(plan: Plan) {
  editingPlan.value = plan
  Object.assign(formState, {
    title: plan.title,
    description: plan.description,
    image: plan.image,
    slotTypes: [...plan.slotTypes],
    isActive: plan.isActive,
    variants: plan.variants.map(({ id, title, daysCount, price, isActive }) => ({ id, title, daysCount, price, isActive }))
  })
  openForm()
}

function closeForm() {
  if (saving.value) return
  confirmLeave(() => {
    isFormOpen.value = false
  })
}

function requestDelete(plan: Plan) {
  deleteConflict.value = ""
  pendingDelete.value = plan
}

function requestEditingPlanDelete() {
  if (!editingPlan.value) return
  requestDelete(editingPlan.value)
}

function cancelDelete() {
  if (deleting.value || pausing.value) return
  pendingDelete.value = null
  deleteConflict.value = ""
}

function addVariant() {
  const used = new Set(formState.variants.map((variant) => variant.daysCount))
  const daysCount = [3, 4, 5, 6, 7].find((days) => !used.has(days)) ?? 1
  formState.variants.push({ title: `${daysCount} días`, daysCount, price: 0, isActive: true })
}

function removeVariant(index: number) {
  if (formState.variants.length === 1 || variantOrders(formState.variants[index]?.id)) return
  formState.variants.splice(index, 1)
}

async function savePlan() {
  saving.value = true
  try {
    const saved = editingPlan.value ? await updatePlan(editingPlan.value.id, formState) : await createPlan(formState)
    toast.add({
      title: editingPlan.value ? "Plan actualizado" : "Plan creado",
      description: `${saved.title} ya está disponible en el catálogo.`,
      color: "success",
      icon: "i-lucide-circle-check"
    })
    isFormOpen.value = false
    await refresh()
  } catch (error) {
    toast.add({
      title: "No se pudo guardar el plan",
      description: apiErrorMessage(error, "Revisa la información e intenta de nuevo."),
      color: "error",
      icon: "i-lucide-circle-alert"
    })
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await deletePlan(pendingDelete.value.id)
    toast.add({ title: "Plan eliminado", color: "success", icon: "i-lucide-trash-2" })
    isFormOpen.value = false
    editingPlan.value = null
    pendingDelete.value = null
    await refresh()
  } catch (error) {
    const message = apiErrorMessage(error, "Intenta nuevamente.")
    if (apiErrorCode(error) === "PLAN_HAS_ORDERS") {
      deleteConflict.value = message
      return
    }
    toast.add({ title: "No se pudo eliminar el plan", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    deleting.value = false
  }
}

// A plan with orders is archived by pausing it: it keeps its history and stops
// being offered in new orders.
async function pausePending() {
  const plan = pendingDelete.value
  if (!plan) return
  pausing.value = true
  try {
    await updatePlan(plan.id, {
      title: plan.title,
      description: plan.description,
      image: plan.image,
      slotTypes: plan.slotTypes,
      isActive: false,
      variants: plan.variants.map(({ id, title, daysCount, price, isActive }) => ({ id, title, daysCount, price, isActive }))
    })
    toast.add({
      title: "Plan pausado",
      description: `${plan.title} ya no se ofrece en pedidos nuevos y conserva su historial.`,
      color: "success",
      icon: "i-lucide-circle-check"
    })
    isFormOpen.value = false
    editingPlan.value = null
    pendingDelete.value = null
    deleteConflict.value = ""
    await refresh()
  } catch (error) {
    toast.add({
      title: "No se pudo pausar el plan",
      description: apiErrorMessage(error, "Intenta nuevamente."),
      color: "error",
      icon: "i-lucide-circle-alert"
    })
  } finally {
    pausing.value = false
  }
}
</script>

<template>
  <main class="space-y-6">
    <UPageGrid v-if="status === 'pending'">
      <UCard v-for="index in 3" :key="index" aria-hidden="true"><USkeleton class="h-40 w-full" /></UCard>
    </UPageGrid>
    <UEmpty v-else-if="error" icon="i-lucide-cloud-alert" title="No fue posible cargar los planes">
      <template #actions><UButton color="neutral" variant="outline" @click="refresh()">Reintentar</UButton></template>
    </UEmpty>
    <UEmpty v-else-if="!plans.length" icon="i-lucide-clipboard-list" title="Aún no hay planes" description="Crea un plan con sus tiempos, variantes y precios.">
      <template #actions><UButton icon="i-lucide-plus" @click="openCreate">Crear plan</UButton></template>
    </UEmpty>
    <UPageGrid v-else>
      <UCard v-for="plan in plans" :key="plan.id" :title="plan.title" :description="plan.description">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <UUser :name="plan.title" :description="plan.description" />
            <UDropdownMenu :items="[{ label: 'Editar plan', icon: 'i-lucide-pencil', onSelect: () => openEdit(plan) }]" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" :aria-label="`Acciones de ${plan.title}`" />
            </UDropdownMenu>
          </div>
        </template>
        <dl class="divide-y divide-default">
          <div v-for="variant in plan.variants" :key="variant.id" class="flex items-center justify-between gap-3 py-3 text-sm">
            <dt class="flex items-center gap-2"><UBadge :color="variant.isActive ? 'success' : 'neutral'" variant="subtle" :label="variant.title" /></dt>
            <dd class="font-semibold tabular-nums text-highlighted">{{ transformPrice(variant.price) }}</dd>
          </div>
        </dl>
        <template #footer><UBadge :color="plan.isActive ? 'success' : 'neutral'" variant="subtle" :label="plan.isActive ? 'Activo' : 'Pausado'" /></template>
      </UCard>
    </UPageGrid>

    <UModal
      v-model:open="formOpen"
      :title="formTitle"
      description="Configura el contenido y las opciones que verá el equipo al crear pedidos."
      :ui="{ content: 'max-w-4xl' }"
      scrollable
    >
      <template #body>
        <UForm
          :schema="planInputSchema"
          :state="formState"
          class="space-y-7"
          @submit="savePlan"
        >
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField
              label="Nombre del plan"
              name="title"
              required
            >
              <UInput
                v-model="formState.title"
                icon="i-lucide-notebook-tabs"
                placeholder="Plan comidas"
                class="w-full"
                autofocus
              />
            </UFormField>
            <UFormField
              label="Imagen"
              name="image"
              required
            >
              <UInput
                v-model="formState.image"
                icon="i-lucide-image"
                placeholder="Ruta de Cloudinary"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Descripción"
              name="description"
              required
              class="md:col-span-2"
            >
              <UTextarea
                v-model="formState.description"
                :rows="3"
                autoresize
                class="w-full"
                placeholder="Describe para quién es este plan."
              />
            </UFormField>
          </div>

          <section>
            <div class="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 class="font-semibold text-highlighted">Tiempos incluidos</h3>
                <p class="text-xs text-muted">El pedido copiará únicamente estos tiempos del menú activo.</p>
              </div>
              <USwitch
                v-model="formState.isActive"
                label="Disponible"
              />
            </div>
            <UCheckboxGroup v-model="formState.slotTypes" :items="slotChoices" variant="card" orientation="horizontal" />
          </section>

          <section>
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 class="font-semibold text-highlighted">Variantes</h3>
                <p class="text-xs text-muted">Cada cantidad de días puede tener un precio distinto.</p>
              </div>
              <UButton
                type="button"
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-plus"
                @click="addVariant"
                >Agregar</UButton
              >
            </div>
            <div class="space-y-3">
              <div
                v-for="(variant, index) in formState.variants"
                :key="variant.id || index"
                class="grid gap-3 rounded-2xl border border-default bg-elevated/35 p-4 sm:grid-cols-[1fr_110px_150px_auto_auto] sm:items-end"
              >
                <UFormField
                  :name="`variants.${index}.title`"
                  label="Nombre"
                >
                  <UInput
                    v-model="variant.title"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :name="`variants.${index}.daysCount`"
                  label="Días"
                >
                  <UInputNumber
                    v-model="variant.daysCount"
                    :min="1"
                    :max="7"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :name="`variants.${index}.price`"
                  label="Precio"
                >
                  <UInputNumber
                    v-model="variant.price"
                    :min="0"
                    :step="50"
                    class="w-full"
                  />
                </UFormField>
                <USwitch
                  v-model="variant.isActive"
                  label="Activa"
                  class="pb-2"
                />
                <UButton
                  type="button"
                  icon="i-lucide-x"
                  color="error"
                  variant="ghost"
                  :disabled="formState.variants.length === 1 || variantOrders(variant.id) > 0"
                  :aria-label="variantOrders(variant.id) ? `${variant.title} tiene pedidos y no se puede quitar` : 'Quitar variante'"
                  class="mb-0.5"
                  @click="removeVariant(index)"
                />
                <p
                  v-if="variantOrders(variant.id)"
                  class="text-xs text-muted sm:col-span-5"
                >
                  Tiene {{ ordersLabel(variantOrders(variant.id)) }}. Para dejar de ofrecerla, desactívala en lugar de quitarla.
                </p>
              </div>
            </div>
          </section>

          <div class="flex justify-end gap-3 border-t border-default pt-5">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              :disabled="saving"
              @click="closeForm"
              >Cancelar</UButton
            >
            <UButton
              v-if="editingPlan"
              type="button"
              color="error"
              variant="soft"
              icon="i-lucide-trash-2"
              :disabled="saving"
              @click="requestEditingPlanDelete"
              >Eliminar plan</UButton
            >
            <UButton
              type="submit"
              icon="i-lucide-save"
              :loading="saving"
              >Guardar plan</UButton
            >
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteOpen"
      title="Eliminar plan"
      :description="deleteDescription"
      :ui="{ content: 'max-w-md' }"
    >
      <template #body>
        <UAlert
          v-if="deleteConflict"
          color="warning"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="No se puede eliminar"
          :description="pendingDelete?.isActive ? deleteConflict : `${deleteConflict} Ya está pausado.`"
        />
        <UAlert
          v-else
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Confirma esta acción"
          description="Solo se pueden eliminar planes sin pedidos. Si ya se vendió, podrás pausarlo para conservar su historial."
        />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="deleting || pausing"
            @click="cancelDelete"
            >{{ deleteConflict ? "Cerrar" : "Cancelar" }}</UButton
          >
          <UButton
            v-if="!deleteConflict"
            color="error"
            icon="i-lucide-trash-2"
            :loading="deleting"
            @click="confirmDelete"
            >Eliminar</UButton
          >
          <UButton
            v-else-if="pendingDelete?.isActive"
            icon="i-lucide-circle-pause"
            :loading="pausing"
            @click="pausePending"
            >Pausar plan</UButton
          >
        </div>
      </template>
    </UModal>

    <AdminUnsavedChangesModal
      v-model:open="leaveConfirmOpen"
      @leave="leaveWithoutSaving"
    />
  </main>
</template>
