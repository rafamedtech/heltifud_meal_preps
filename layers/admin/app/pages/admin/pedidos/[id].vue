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
const notFound = computed(() => error.value?.statusCode === 404)

useSeoMeta({
  title: computed(() => order.value ? `${order.value.planTitle} · ${order.value.customerName} | Heltifud` : "Pedido | Heltifud"),
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
const currentStatus = computed(() => statusOptions.find(item => item.value === state.status))
const statusColor = computed(() =>
  state.status === "CANCELLED" ? "error" : state.status === "DELIVERED" ? "success" : state.status === "DRAFT" ? "neutral" : "primary"
)
const deliveries = computed(() => [
  { number: 1, title: "Primera entrega", dateField: "firstDeliveryDate", locationField: "firstDeliveryLocation" },
  { number: 2, title: "Segunda entrega", dateField: "secondDeliveryDate", locationField: "secondDeliveryLocation" }
] as const)

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Tijuana" }).format(new Date(value))
}

function locationAddress(location: number) {
  if (!order.value) return ""
  return location === 2 ? order.value.customer.ubicacion2 : order.value.customer.ubicacion1
}

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
  <main class="space-y-6">
    <UButton to="/admin/pedidos" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="-ml-3">Volver a pedidos</UButton>

    <section v-if="status === 'pending'" role="status" aria-live="polite" class="space-y-5">
      <span class="sr-only">Cargando pedido</span>
      <USkeleton class="h-44 rounded-2xl" />
      <div class="grid gap-5 lg:grid-cols-2"><USkeleton class="h-64 rounded-2xl" /><USkeleton class="h-64 rounded-2xl" /></div>
      <USkeleton class="h-96 rounded-2xl" />
    </section>

    <UCard v-else-if="error || !order" class="app-surface" :ui="{ body: 'py-16 text-center' }">
      <UIcon :name="notFound ? 'i-lucide-package-x' : 'i-lucide-cloud-alert'" class="size-10 text-muted" />
      <h1 class="mt-4 text-xl font-semibold text-highlighted">{{ notFound ? "Pedido no encontrado" : "No fue posible cargar el pedido" }}</h1>
      <p class="mt-2 text-sm text-muted">{{ notFound ? "El registro ya no existe o el enlace es incorrecto." : "Intenta cargar nuevamente la información del pedido." }}</p>
      <UButton v-if="!notFound" class="mt-5" variant="soft" icon="i-lucide-refresh-cw" @click="refresh()">Reintentar</UButton>
    </UCard>

    <UForm v-else :schema="orderUpdateInputSchema" :state="state" class="space-y-6" @submit="saveOrder">
      <header class="flex flex-col gap-5 px-1 pb-3 pt-1 sm:flex-row sm:items-center sm:gap-6 sm:pb-5">
        <div class="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
          <UIcon name="i-lucide-shopping-bag" class="size-8" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="min-w-0 break-words text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">{{ order.planTitle }}</h1>
            <UBadge :color="statusColor" variant="soft">
              <UIcon v-if="currentStatus" :name="currentStatus.icon" class="size-3" />
              {{ currentStatus?.label }}
            </UBadge>
          </div>
          <p class="mt-3 text-sm text-muted">{{ order.planVariantTitle }} · Creado el {{ formatDate(order.createdAt) }}</p>
        </div>
        <UButton type="submit" icon="i-lucide-save" :loading="saving" class="self-start sm:self-center">Guardar cambios</UButton>
      </header>

      <div class="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <UCard class="app-surface">
          <template #header><h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-receipt-text" class="size-5 text-primary" />Resumen</h2></template>
          <dl class="grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt class="text-muted">Cliente</dt>
              <dd class="mt-1 break-words"><NuxtLink :to="`/admin/clientes/${order.customerId}`" class="font-medium text-highlighted hover:text-primary">{{ order.customerName }}</NuxtLink></dd>
            </div>
            <div>
              <dt class="text-muted">Teléfono</dt>
              <dd class="mt-1"><a :href="`tel:${order.customerPhone}`" class="font-medium text-highlighted hover:text-primary">{{ order.customerPhone }}</a></dd>
            </div>
            <div>
              <dt class="text-muted">Precio</dt>
              <dd class="mt-1 font-medium tabular-nums text-highlighted">{{ transformPrice(order.price) }}</dd>
            </div>
            <div>
              <dt class="text-muted">Menú de origen</dt>
              <dd class="mt-1 break-words" :class="order.sourceWeeklyMenuName ? 'font-medium text-highlighted' : 'text-dimmed'">{{ order.sourceWeeklyMenuName || "No disponible" }}</dd>
            </div>
          </dl>
          <div class="mt-5 space-y-4 border-t border-default pt-5">
            <UFormField label="Estado" name="status" required><USelect v-model="state.status" :items="statusOptions" value-key="value" class="w-full" /></UFormField>
            <UFormField label="Notas" name="notes"><UTextarea v-model="state.notes" :rows="3" autoresize class="w-full" placeholder="Alergias o instrucciones" /></UFormField>
          </div>
        </UCard>

        <UCard class="app-surface flex flex-col" :ui="{ header: 'shrink-0', body: 'flex flex-1 flex-col' }">
          <template #header><h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-truck" class="size-5 text-primary" />Entregas</h2></template>
          <div class="grid flex-1 gap-4 sm:grid-cols-2">
            <section v-for="delivery in deliveries" :key="delivery.number" class="flex min-w-0 flex-col gap-3 rounded-xl border border-default bg-elevated/30 p-4">
              <div class="flex items-center gap-3">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{{ delivery.number }}</span>
                <h3 class="text-sm font-semibold text-highlighted">{{ delivery.title }}</h3>
              </div>
              <UFormField label="Fecha" :name="delivery.dateField"><UInput v-model="state[delivery.dateField]" type="date" class="w-full" /></UFormField>
              <UFormField label="Ubicación" :name="delivery.locationField"><USelect v-model="state[delivery.locationField]" :items="locationOptions" value-key="value" class="w-full" /></UFormField>
              <p class="whitespace-pre-line break-words text-sm leading-relaxed" :class="locationAddress(state[delivery.locationField]) ? 'text-toned' : 'text-dimmed'">
                {{ locationAddress(state[delivery.locationField]) || "Sin dirección registrada" }}
              </p>
            </section>
          </div>
        </UCard>
      </div>

      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-utensils" class="size-5 text-primary" />Menú personalizado</h2>
          <UBadge color="neutral" variant="soft">{{ dayGroups.length }} días · {{ state.menuSlots.length }} tiempos</UBadge>
        </div>

        <div class="-mx-1 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-1 pb-3">
          <UCard
            v-for="day in dayGroups"
            :key="day.dayOrder"
            class="app-surface w-[min(20rem,calc(100vw-4rem))] shrink-0 snap-start"
            :ui="{ header: 'px-4 py-3 sm:px-4', body: 'p-0 sm:p-0' }"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{{ day.dayOrder }}</span>
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-highlighted">{{ dayLabel(day.dayOfWeek) }}</h3>
                  <p class="text-xs text-muted">Día {{ day.dayOrder }} · {{ day.slots.length }} {{ day.slots.length === 1 ? "tiempo" : "tiempos" }}</p>
                </div>
              </div>
            </template>

            <div class="divide-y divide-default">
              <div v-for="slot in day.slots" :key="slot.slotType" class="space-y-3 p-4">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="text-xs font-semibold uppercase tracking-wide text-muted">{{ slotLabel(slot.slotType) }}</h4>
                  <UButton type="button" size="xs" color="neutral" variant="ghost" icon="i-lucide-plus" aria-label="Agregar componente" @click="addComponent(slot)" />
                </div>
                <UInput v-model="slot.contenedor" size="sm" variant="soft" icon="i-lucide-package" placeholder="Contenedor" class="w-full" aria-label="Contenedor" />

                <div v-for="(component, componentIndex) in slot.components" :key="componentKey(slot, component, componentIndex)" class="space-y-2">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-elevated">
                      <NuxtImg v-if="component.imagen" :src="component.imagen" :alt="component.nombre" class="h-full w-full object-cover" />
                      <UIcon v-else name="i-lucide-utensils" class="size-4 text-dimmed" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-highlighted">{{ component.nombre }}</p>
                      <p class="truncate text-xs text-muted">{{ component.calorias }} kcal · {{ component.tipo }}</p>
                    </div>
                    <UButton type="button" size="xs" icon="i-lucide-x" color="neutral" variant="ghost" class="hover:text-error" :disabled="slot.components.length === 1" aria-label="Quitar componente" @click="removeComponent(slot, componentIndex)" />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <USelect v-model="component.componentRole" :items="roleOptions" value-key="value" size="xs" variant="soft" class="w-full" aria-label="Función" />
                    <USelectMenu
                      :model-value="replacementSelections[componentKey(slot, component, componentIndex)]"
                      :items="catalogOptions"
                      value-key="value"
                      searchable
                      size="xs"
                      variant="soft"
                      placeholder="Sustituir..."
                      class="w-full"
                      aria-label="Sustituir componente"
                      @update:model-value="replaceComponent(component, $event as string | undefined, componentKey(slot, component, componentIndex))"
                    />
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </UForm>
  </main>
</template>
