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
const { data: plans, status, error, refresh } = await useLazyFetch<Plan[]>("/api/plans/all", {
  default: () => []
})

const slotOptions: Array<{ label: string, value: SlotTypeValue, icon: string }> = [
  { label: "Desayuno", value: "DESAYUNO", icon: "i-lucide-sunrise" },
  { label: "Comida", value: "COMIDA", icon: "i-lucide-sun" },
  { label: "Cena", value: "CENA", icon: "i-lucide-moon-star" },
  { label: "Colación 1", value: "SNACK1", icon: "i-lucide-apple" },
  { label: "Colación 2", value: "SNACK2", icon: "i-lucide-cherry" }
]

const isFormOpen = ref(false)
const editingPlan = ref<Plan | null>(null)
const pendingDelete = ref<Plan | null>(null)
const saving = ref(false)
const deleting = ref(false)

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
const activePlans = computed(() => plans.value.filter(plan => plan.isActive).length)
const activeVariants = computed(() => plans.value.flatMap(plan => plan.variants).filter(variant => variant.isActive).length)
const formTitle = computed(() => editingPlan.value ? "Editar plan" : "Nuevo plan")
const isDeleteOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: open => { if (!open) pendingDelete.value = null }
})

function openCreate() {
  editingPlan.value = null
  Object.assign(formState, emptyPlan())
  isFormOpen.value = true
}

function openEdit(plan: Plan) {
  editingPlan.value = plan
  Object.assign(formState, {
    title: plan.title,
    description: plan.description,
    image: plan.image,
    slotTypes: [...plan.slotTypes],
    isActive: plan.isActive,
    variants: plan.variants.map(variant => ({ ...variant }))
  })
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
}

function requestDelete(plan: Plan) {
  pendingDelete.value = plan
}

function cancelDelete() {
  pendingDelete.value = null
}

function addVariant() {
  const used = new Set(formState.variants.map(variant => variant.daysCount))
  const daysCount = [3, 4, 5, 6, 7].find(days => !used.has(days)) ?? 1
  formState.variants.push({ title: `${daysCount} días`, daysCount, price: 0, isActive: true })
}

function removeVariant(index: number) {
  if (formState.variants.length === 1) return
  formState.variants.splice(index, 1)
}

function toggleSlot(slot: SlotTypeValue, checked: boolean) {
  if (checked && !formState.slotTypes.includes(slot)) formState.slotTypes.push(slot)
  if (!checked && formState.slotTypes.length > 1) {
    formState.slotTypes = formState.slotTypes.filter(item => item !== slot)
  }
}

async function savePlan() {
  saving.value = true
  try {
    const saved = editingPlan.value
      ? await updatePlan(editingPlan.value.id, formState)
      : await createPlan(formState)
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
      description: error instanceof Error ? error.message : "Revisa la información e intenta de nuevo.",
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
    pendingDelete.value = null
    await refresh()
  } catch (error) {
    toast.add({
      title: "No se pudo eliminar el plan",
      description: error instanceof Error ? error.message : "Intenta nuevamente.",
      color: "error",
      icon: "i-lucide-circle-alert"
    })
  } finally {
    deleting.value = false
  }
}

function priceRange(plan: Plan) {
  const prices = plan.variants.map(variant => variant.price)
  if (!prices.length) return "Sin precios"
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? transformPrice(min) : `${transformPrice(min)} – ${transformPrice(max)}`
}
</script>

<template>
  <main class="space-y-6">
    <header class="relative overflow-hidden rounded-3xl border border-default bg-default px-6 py-7 shadow-sm sm:px-8">
      <div class="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_70%_30%,color-mix(in_oklab,var(--ui-primary)_16%,transparent),transparent_66%)]" />
      <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Planes y precios</h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-muted">Define qué tiempos incluye cada plan y ofrece diferentes cantidades de días sin duplicar productos.</p>
        </div>
        <UButton icon="i-lucide-plus" size="lg" @click="openCreate">Crear plan</UButton>
      </div>
      <div class="relative mt-7 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-default/70 bg-elevated/60 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wider text-dimmed">Planes activos</p>
          <p class="mt-1 text-2xl font-bold text-highlighted">{{ activePlans }}</p>
        </div>
        <div class="rounded-2xl border border-default/70 bg-elevated/60 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wider text-dimmed">Variantes activas</p>
          <p class="mt-1 text-2xl font-bold text-highlighted">{{ activeVariants }}</p>
        </div>
        <div class="rounded-2xl border border-default/70 bg-elevated/60 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wider text-dimmed">Configuración</p>
          <p class="mt-1 text-sm font-semibold text-toned">Un plan, múltiples precios</p>
        </div>
      </div>
    </header>

    <section v-if="status === 'pending'" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <USkeleton v-for="index in 4" :key="index" class="h-96 rounded-3xl" />
    </section>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="No fue posible cargar los planes"
      :description="error.message"
      :actions="[{ label: 'Reintentar', onClick: () => refresh() }]"
    />

    <section v-else-if="!plans.length" class="rounded-3xl border border-dashed border-default bg-default px-6 py-20 text-center">
      <UIcon name="i-lucide-notebook-tabs" class="mx-auto size-10 text-dimmed" />
      <h2 class="mt-4 font-semibold text-highlighted">Aún no hay planes</h2>
      <p class="mt-1 text-sm text-muted">Crea el primero para comenzar a registrar pedidos.</p>
      <UButton class="mt-5" icon="i-lucide-plus" @click="openCreate">Crear plan</UButton>
    </section>

    <section v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="group overflow-hidden rounded-3xl border border-default bg-default shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div class="relative h-44 overflow-hidden bg-elevated">
          <NuxtImg :src="plan.image" :alt="plan.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          <div class="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />
          <UBadge :color="plan.isActive ? 'success' : 'neutral'" variant="solid" class="absolute right-4 top-4">
            {{ plan.isActive ? "Activo" : "Pausado" }}
          </UBadge>
          <div class="absolute inset-x-0 bottom-0 px-5 pb-4 text-white">
            <p class="text-xs font-medium uppercase tracking-widest text-white/70">{{ priceRange(plan) }}</p>
            <h2 class="mt-1 text-xl font-bold">{{ plan.title }}</h2>
          </div>
        </div>

        <div class="space-y-5 p-5">
          <p class="min-h-10 text-sm leading-5 text-muted">{{ plan.description }}</p>

          <div class="flex flex-wrap gap-2">
            <UBadge v-for="slot in plan.slotTypes" :key="slot" color="neutral" variant="soft">
              {{ slotOptions.find(option => option.value === slot)?.label }}
            </UBadge>
          </div>

          <div class="space-y-2 rounded-2xl bg-elevated/65 p-3">
            <div v-for="variant in plan.variants" :key="variant.id" class="flex items-center justify-between gap-3 text-sm">
              <span class="flex items-center gap-2 text-toned">
                <span class="size-1.5 rounded-full" :class="variant.isActive ? 'bg-success' : 'bg-muted'" />
                {{ variant.title }}
              </span>
              <span class="font-semibold tabular-nums text-highlighted">{{ transformPrice(variant.price) }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-default/70 pt-4">
            <span class="text-xs text-dimmed">{{ plan.variants.length }} opciones</span>
            <div class="flex gap-1">
              <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" aria-label="Editar plan" @click="openEdit(plan)" />
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" aria-label="Eliminar plan" @click="requestDelete(plan)" />
            </div>
          </div>
        </div>
      </article>
    </section>

    <UModal v-model:open="isFormOpen" :title="formTitle" description="Configura el contenido y las opciones que verá el equipo al crear pedidos." :ui="{ content: 'max-w-4xl' }" scrollable>
      <template #body>
        <UForm :schema="planInputSchema" :state="formState" class="space-y-7" @submit="savePlan">
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Nombre del plan" name="title" required>
              <UInput v-model="formState.title" icon="i-lucide-notebook-tabs" placeholder="Plan comidas" class="w-full" autofocus />
            </UFormField>
            <UFormField label="Imagen" name="image" required>
              <UInput v-model="formState.image" icon="i-lucide-image" placeholder="Ruta de Cloudinary" class="w-full" />
            </UFormField>
            <UFormField label="Descripción" name="description" required class="md:col-span-2">
              <UTextarea v-model="formState.description" :rows="3" autoresize class="w-full" placeholder="Describe para quién es este plan." />
            </UFormField>
          </div>

          <section>
            <div class="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 class="font-semibold text-highlighted">Tiempos incluidos</h3>
                <p class="text-xs text-muted">El pedido copiará únicamente estos tiempos del menú activo.</p>
              </div>
              <USwitch v-model="formState.isActive" label="Disponible" />
            </div>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <label
                v-for="slot in slotOptions"
                :key="slot.value"
                class="flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 transition"
                :class="formState.slotTypes.includes(slot.value) ? 'border-primary bg-primary/5 text-highlighted' : 'border-default bg-elevated/40 text-muted'"
              >
                <UCheckbox
                  :model-value="formState.slotTypes.includes(slot.value)"
                  @update:model-value="toggleSlot(slot.value, Boolean($event))"
                />
                <UIcon :name="slot.icon" class="size-4" />
                <span class="text-sm font-medium">{{ slot.label }}</span>
              </label>
            </div>
          </section>

          <section>
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 class="font-semibold text-highlighted">Variantes</h3>
                <p class="text-xs text-muted">Cada cantidad de días puede tener un precio distinto.</p>
              </div>
              <UButton type="button" size="sm" color="neutral" variant="soft" icon="i-lucide-plus" @click="addVariant">Agregar</UButton>
            </div>
            <div class="space-y-3">
              <div v-for="(variant, index) in formState.variants" :key="variant.id || index" class="grid gap-3 rounded-2xl border border-default bg-elevated/35 p-4 sm:grid-cols-[1fr_110px_150px_auto_auto] sm:items-end">
                <UFormField :name="`variants.${index}.title`" label="Nombre">
                  <UInput v-model="variant.title" class="w-full" />
                </UFormField>
                <UFormField :name="`variants.${index}.daysCount`" label="Días">
                  <UInputNumber v-model="variant.daysCount" :min="1" :max="7" class="w-full" />
                </UFormField>
                <UFormField :name="`variants.${index}.price`" label="Precio">
                  <UInputNumber v-model="variant.price" :min="0" :step="50" class="w-full" />
                </UFormField>
                <USwitch v-model="variant.isActive" label="Activa" class="pb-2" />
                <UButton type="button" icon="i-lucide-x" color="error" variant="ghost" :disabled="formState.variants.length === 1" aria-label="Quitar variante" class="mb-0.5" @click="removeVariant(index)" />
              </div>
            </div>
          </section>

          <div class="flex justify-end gap-3 border-t border-default pt-5">
            <UButton type="button" color="neutral" variant="ghost" :disabled="saving" @click="closeForm">Cancelar</UButton>
            <UButton type="submit" icon="i-lucide-save" :loading="saving">Guardar plan</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteOpen" title="Eliminar plan" :description="pendingDelete ? `Se eliminarán ${pendingDelete.title} y sus variantes.` : undefined" :ui="{ content: 'max-w-md' }">
      <template #body>
        <UAlert color="error" variant="soft" icon="i-lucide-triangle-alert" title="Los pedidos históricos se conservarán" description="Mantendrán el nombre y precio guardados, pero ya no podrás crear pedidos nuevos con este plan." />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="ghost" :disabled="deleting" @click="cancelDelete">Cancelar</UButton>
          <UButton color="error" icon="i-lucide-trash-2" :loading="deleting" @click="confirmDelete">Eliminar</UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>
