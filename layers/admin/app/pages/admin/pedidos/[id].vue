<script setup lang="ts">
import { orderUpdateInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type {
  ComponentRoleValue,
  FoodCatalogItem,
  Order,
  OrderMenuComponentInput,
  OrderMenuSlotInput,
  OrderStatusValue,
  OrderUpdateInput
} from "~~/layers/menu/shared/types/types"

definePageMeta({ layout: "admin" })

const route = useRoute()
const id = String(route.params.id)
const [{ data: order, status, error, refresh }, { data: catalog }] = await Promise.all([
  useFetch<Order>(`/api/orders/${id}`),
  useFetch<FoodCatalogItem[]>("/api/food-components", { default: () => [] })
])

if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: "Pedido no encontrado" })
}

useSeoMeta({
  title: computed(() => order.value ? `${order.value.customerName} · Pedido | Heltifud` : "Pedido | Heltifud"),
  robots: "noindex, nofollow"
})

const toast = useToast()
const { updateOrder } = useOrders()
const saving = ref(false)
const replacementSelections = reactive<Record<string, string>>({})

const state = reactive<OrderUpdateInput>({
  status: order.value?.status ?? "DRAFT",
  firstDeliveryDate: order.value?.firstDeliveryDate ?? "",
  firstDeliveryLocation: order.value?.firstDeliveryLocation ?? 1,
  secondDeliveryDate: order.value?.secondDeliveryDate ?? "",
  secondDeliveryLocation: order.value?.secondDeliveryLocation ?? 1,
  notes: order.value?.notes ?? "",
  menuSlots: order.value?.menuSlots.map(slot => ({
    dayOfWeek: slot.dayOfWeek,
    dayOrder: slot.dayOrder,
    slotType: slot.slotType,
    contenedor: slot.contenedor,
    components: slot.components.map(({ id: _id, ...component }) => ({ ...component }))
  })) ?? []
})

const statusOptions: Array<{ label: string, value: OrderStatusValue, icon: string }> = [
  { label: "Borrador", value: "DRAFT", icon: "i-lucide-pencil-line" },
  { label: "Confirmado", value: "CONFIRMED", icon: "i-lucide-badge-check" },
  { label: "En preparación", value: "PREPARING", icon: "i-lucide-chef-hat" },
  { label: "Entrega parcial", value: "PARTIALLY_DELIVERED", icon: "i-lucide-truck" },
  { label: "Entregado", value: "DELIVERED", icon: "i-lucide-package-check" },
  { label: "Cancelado", value: "CANCELLED", icon: "i-lucide-ban" }
]
const roleOptions: Array<{ label: string, value: ComponentRoleValue }> = [
  { label: "Principal", value: "PLATILLO_PRINCIPAL" },
  { label: "Guarnición 1", value: "GUARNICION_1" },
  { label: "Guarnición 2", value: "GUARNICION_2" },
  { label: "Adicional", value: "ADICIONAL" }
]
const catalogOptions = computed(() => catalog.value.map(item => ({
  label: item.nombre,
  description: `${item.tipo} · ${item.calorias} kcal`,
  value: item.id
})))
const locationOptions = computed(() => order.value ? [
  { label: "Ubicación principal", value: 1, description: order.value.customer.ubicacion1 },
  ...(order.value.customer.ubicacion2 ? [{ label: "Ubicación secundaria", value: 2, description: order.value.customer.ubicacion2 }] : [])
] : [])
const dayGroups = computed(() => {
  const groups = new Map<number, { dayOfWeek: string, dayOrder: number, slots: OrderMenuSlotInput[] }>()
  state.menuSlots.forEach(slot => {
    const group = groups.get(slot.dayOrder) ?? { dayOfWeek: slot.dayOfWeek, dayOrder: slot.dayOrder, slots: [] }
    group.slots.push(slot)
    groups.set(slot.dayOrder, group)
  })
  return [...groups.values()].sort((a, b) => a.dayOrder - b.dayOrder)
})
const statusStep = computed(() => {
  const steps: OrderStatusValue[] = ["DRAFT", "CONFIRMED", "PREPARING", "PARTIALLY_DELIVERED", "DELIVERED"]
  return state.status === "CANCELLED" ? -1 : steps.indexOf(state.status)
})

function slotLabel(slot: string) {
  return { DESAYUNO: "Desayuno", COMIDA: "Comida", CENA: "Cena", SNACK1: "Colación 1", SNACK2: "Colación 2" }[slot] ?? slot
}

function dayLabel(day: string) {
  return { LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles", JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sábado", DOMINGO: "Domingo" }[day] ?? day
}

function componentKey(slot: OrderMenuSlotInput, component: OrderMenuComponentInput, index: number) {
  return `${slot.dayOrder}-${slot.slotType}-${component.componentRole}-${component.position}-${index}`
}

function replaceComponent(component: OrderMenuComponentInput, itemId: string | undefined, key: string) {
  if (!itemId) return
  const item = catalog.value.find(food => food.id === itemId)
  if (!item) return
  Object.assign(component, {
    catalogItemId: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion,
    calorias: item.calorias,
    imagen: item.imagen,
    tipo: item.tipo
  })
  replacementSelections[key] = ""
}

function addComponent(slot: OrderMenuSlotInput) {
  const item = catalog.value[0]
  if (!item) {
    toast.add({ title: "El catálogo está vacío", description: "Crea un platillo antes de agregar componentes.", color: "warning", icon: "i-lucide-triangle-alert" })
    return
  }
  slot.components.push({
    catalogItemId: item.id,
    componentRole: "ADICIONAL",
    position: slot.components.filter(component => component.componentRole === "ADICIONAL").length,
    nombre: item.nombre,
    descripcion: item.descripcion,
    calorias: item.calorias,
    imagen: item.imagen,
    tipo: item.tipo
  })
}

function removeComponent(slot: OrderMenuSlotInput, index: number) {
  if (slot.components.length === 1) return
  slot.components.splice(index, 1)
}

function normalizedSlots() {
  return state.menuSlots.map(slot => {
    const positions = new Map<ComponentRoleValue, number>()
    return {
      ...slot,
      components: slot.components.map(component => {
        const position = positions.get(component.componentRole) ?? 0
        positions.set(component.componentRole, position + 1)
        return { ...component, position }
      })
    }
  })
}

async function saveOrder() {
  saving.value = true
  try {
    const saved = await updateOrder(id, { ...state, menuSlots: normalizedSlots() })
    Object.assign(state, {
      status: saved.status,
      firstDeliveryDate: saved.firstDeliveryDate,
      firstDeliveryLocation: saved.firstDeliveryLocation,
      secondDeliveryDate: saved.secondDeliveryDate,
      secondDeliveryLocation: saved.secondDeliveryLocation,
      notes: saved.notes,
      menuSlots: saved.menuSlots.map(slot => ({
        dayOfWeek: slot.dayOfWeek,
        dayOrder: slot.dayOrder,
        slotType: slot.slotType,
        contenedor: slot.contenedor,
        components: slot.components.map(({ id: _id, ...component }) => ({ ...component }))
      }))
    })
    await refresh()
    toast.add({ title: "Pedido actualizado", description: "Las entregas y el menú personalizado quedaron guardados.", color: "success", icon: "i-lucide-circle-check" })
  } catch (error) {
    toast.add({ title: "No se pudo guardar el pedido", description: error instanceof Error ? error.message : "Revisa los cambios.", color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main v-if="status === 'pending'" class="space-y-5"><USkeleton class="h-44 rounded-3xl" /><div class="grid gap-5 lg:grid-cols-[320px_1fr]"><USkeleton class="h-120 rounded-3xl" /><USkeleton class="h-160 rounded-3xl" /></div></main>

  <main v-else-if="order" class="space-y-6">
    <header class="relative overflow-hidden rounded-3xl border border-default bg-default px-6 py-7 shadow-sm sm:px-8">
      <div class="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/8 blur-3xl" />
      <div class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UButton to="/admin/pedidos" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="-ml-3 mb-3">Volver a pedidos</UButton>
          <div class="flex flex-wrap items-center gap-3"><h1 class="text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">{{ order.customerName }}</h1><UBadge :color="state.status === 'CANCELLED' ? 'error' : 'primary'" variant="soft">{{ statusOptions.find(item => item.value === state.status)?.label }}</UBadge></div>
          <p class="mt-2 text-sm text-muted">{{ order.planTitle }} · {{ order.planVariantTitle }} · {{ transformPrice(order.price) }}</p>
        </div>
        <div class="flex flex-wrap gap-2"><UButton :to="`tel:${order.customerPhone}`" color="neutral" variant="soft" icon="i-lucide-phone">{{ order.customerPhone }}</UButton><UButton icon="i-lucide-save" :loading="saving" @click="saveOrder">Guardar cambios</UButton></div>
      </div>

      <div v-if="state.status !== 'CANCELLED'" class="relative mt-7 grid grid-cols-5 gap-2">
        <div v-for="(step, index) in statusOptions.slice(0, 5)" :key="step.value" class="min-w-0">
          <div class="h-1.5 rounded-full" :class="index <= statusStep ? 'bg-primary' : 'bg-elevated'" />
          <p class="mt-2 hidden truncate text-[11px] font-medium text-muted sm:block">{{ step.label }}</p>
        </div>
      </div>
    </header>

    <UForm :schema="orderUpdateInputSchema" :state="state" class="grid items-start gap-5 xl:grid-cols-[330px_minmax(0,1fr)]" @submit="saveOrder">
      <aside class="space-y-5 xl:sticky xl:top-0">
        <UCard class="rounded-3xl shadow-sm">
          <template #header><div><h2 class="font-semibold text-highlighted">Control del pedido</h2><p class="mt-1 text-xs text-muted">Estado operativo y notas internas.</p></div></template>
          <div class="space-y-5">
            <UFormField label="Estado" name="status" required><USelect v-model="state.status" :items="statusOptions" value-key="value" class="w-full" /></UFormField>
            <UFormField label="Notas" name="notes"><UTextarea v-model="state.notes" :rows="4" autoresize class="w-full" placeholder="Alergias o instrucciones" /></UFormField>
          </div>
        </UCard>

        <UCard class="rounded-3xl shadow-sm">
          <template #header><h2 class="font-semibold text-highlighted">Entregas</h2></template>
          <div class="space-y-5">
            <section class="space-y-3"><div class="flex items-center gap-2 text-sm font-semibold text-highlighted"><span class="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-inverted">1</span>Primera parte</div><UFormField label="Fecha" name="firstDeliveryDate"><UInput v-model="state.firstDeliveryDate" type="date" class="w-full" /></UFormField><UFormField label="Ubicación" name="firstDeliveryLocation"><USelect v-model="state.firstDeliveryLocation" :items="locationOptions" value-key="value" class="w-full" /></UFormField></section>
            <USeparator />
            <section class="space-y-3"><div class="flex items-center gap-2 text-sm font-semibold text-highlighted"><span class="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-inverted">2</span>Segunda parte</div><UFormField label="Fecha" name="secondDeliveryDate"><UInput v-model="state.secondDeliveryDate" type="date" class="w-full" /></UFormField><UFormField label="Ubicación" name="secondDeliveryLocation"><USelect v-model="state.secondDeliveryLocation" :items="locationOptions" value-key="value" class="w-full" /></UFormField></section>
          </div>
        </UCard>

        <UAlert color="info" variant="soft" icon="i-lucide-copy-check" title="Copia independiente" :description="order.sourceWeeklyMenuName ? `Origen: ${order.sourceWeeklyMenuName}` : 'El menú original ya no está disponible.'" />
      </aside>

      <section class="space-y-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 class="text-xl font-bold text-highlighted">Menú personalizado</h2><p class="mt-1 text-sm text-muted">Sustituye platillos desde el catálogo, cambia su función o agrega componentes.</p></div><UBadge color="neutral" variant="soft">{{ state.menuSlots.length }} tiempos</UBadge></div>

        <article v-for="day in dayGroups" :key="day.dayOrder" class="overflow-hidden rounded-3xl border border-default bg-default shadow-sm">
          <header class="flex items-center justify-between border-b border-default bg-elevated/50 px-5 py-4"><div class="flex items-center gap-3"><span class="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">{{ day.dayOrder }}</span><div><h3 class="font-semibold text-highlighted">{{ dayLabel(day.dayOfWeek) }}</h3><p class="text-xs text-muted">{{ day.slots.length }} tiempos incluidos</p></div></div></header>

          <div class="divide-y divide-default">
            <section v-for="slot in day.slots" :key="slot.slotType" class="p-5">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h4 class="font-semibold text-highlighted">{{ slotLabel(slot.slotType) }}</h4><p class="text-xs text-muted">{{ slot.components.length }} componentes</p></div><div class="flex items-center gap-2"><UInput v-model="slot.contenedor" size="sm" icon="i-lucide-package" placeholder="Contenedor" class="w-40" /><UButton type="button" size="sm" color="neutral" variant="soft" icon="i-lucide-plus" @click="addComponent(slot)">Agregar</UButton></div></div>

              <div class="grid gap-3">
                <div v-for="(component, componentIndex) in slot.components" :key="componentKey(slot, component, componentIndex)" class="grid gap-3 rounded-2xl border border-default bg-elevated/25 p-3 md:grid-cols-[minmax(0,1fr)_160px_210px_auto] md:items-center">
                  <div class="flex min-w-0 items-center gap-3"><div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-elevated"><NuxtImg v-if="component.imagen" :src="component.imagen" :alt="component.nombre" class="h-full w-full object-cover" /><UIcon v-else name="i-lucide-utensils" class="size-4 text-dimmed" /></div><div class="min-w-0"><p class="truncate font-medium text-highlighted">{{ component.nombre }}</p><p class="truncate text-xs text-muted">{{ component.calorias }} kcal · {{ component.tipo }}</p></div></div>
                  <USelect v-model="component.componentRole" :items="roleOptions" value-key="value" size="sm" class="w-full" />
                  <USelectMenu
                    :model-value="replacementSelections[componentKey(slot, component, componentIndex)]"
                    :items="catalogOptions"
                    value-key="value"
                    searchable
                    size="sm"
                    placeholder="Sustituir por..."
                    class="w-full"
                    @update:model-value="replaceComponent(component, $event as string | undefined, componentKey(slot, component, componentIndex))"
                  />
                  <UButton type="button" icon="i-lucide-trash-2" color="error" variant="ghost" :disabled="slot.components.length === 1" aria-label="Quitar componente" @click="removeComponent(slot, componentIndex)" />
                </div>
              </div>
            </section>
          </div>
        </article>

        <div class="sticky bottom-3 z-10 flex justify-end rounded-2xl border border-default bg-default/90 p-3 shadow-xl backdrop-blur"><UButton type="submit" size="lg" icon="i-lucide-save" :loading="saving">Guardar pedido</UButton></div>
      </section>
    </UForm>
  </main>
</template>
