<script setup lang="ts">
import type { OrderListItem, OrderListResponse, OrderStatusValue } from "~~/layers/menu/shared/types/types"

definePageMeta({ layout: "admin" })

useSeoMeta({
  title: "Pedidos | Heltifud Meal Preps",
  description: "Administra pedidos, entregas y menús personalizados.",
  robots: "noindex, nofollow"
})

const toast = useToast()
const { getOrders } = useOrders()
const response = ref<OrderListResponse>({
  items: [],
  summary: { total: 0, draft: 0, confirmed: 0, inProgress: 0, delivered: 0 }
})
const loading = ref(true)
const loadError = ref("")
const search = ref("")
const selectedStatus = ref("todos")
const from = ref("")
const to = ref("")
let searchTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

const statusOptions = [
  { label: "Todos los estados", value: "todos" },
  { label: "Borrador", value: "DRAFT" },
  { label: "Confirmado", value: "CONFIRMED" },
  { label: "En preparación", value: "PREPARING" },
  { label: "Entrega parcial", value: "PARTIALLY_DELIVERED" },
  { label: "Entregado", value: "DELIVERED" },
  { label: "Cancelado", value: "CANCELLED" }
]

const stats = computed(() => [
  { label: "Pedidos", value: response.value.summary.total, icon: "i-lucide-receipt-text", tone: "text-highlighted" },
  { label: "Por confirmar", value: response.value.summary.draft, icon: "i-lucide-pencil-line", tone: "text-warning" },
  { label: "Confirmados", value: response.value.summary.confirmed, icon: "i-lucide-badge-check", tone: "text-info" },
  { label: "En proceso", value: response.value.summary.inProgress, icon: "i-lucide-chef-hat", tone: "text-primary" },
  { label: "Entregados", value: response.value.summary.delivered, icon: "i-lucide-package-check", tone: "text-success" }
])
const isFiltering = computed(() => Boolean(search.value.trim() || selectedStatus.value !== "todos" || from.value || to.value))

function statusAppearance(status: OrderStatusValue) {
  const values = {
    DRAFT: { label: "Borrador", color: "warning" as const, icon: "i-lucide-pencil-line" },
    CONFIRMED: { label: "Confirmado", color: "info" as const, icon: "i-lucide-badge-check" },
    PREPARING: { label: "En preparación", color: "primary" as const, icon: "i-lucide-chef-hat" },
    PARTIALLY_DELIVERED: { label: "Entrega parcial", color: "secondary" as const, icon: "i-lucide-truck" },
    DELIVERED: { label: "Entregado", color: "success" as const, icon: "i-lucide-package-check" },
    CANCELLED: { label: "Cancelado", color: "error" as const, icon: "i-lucide-ban" }
  }
  return values[status]
}

async function loadOrders() {
  const currentRequest = ++requestId
  loading.value = true
  loadError.value = ""
  try {
    const data = await getOrders({
      q: search.value.trim() || undefined,
      status: selectedStatus.value === "todos" ? undefined : selectedStatus.value,
      from: from.value || undefined,
      to: to.value || undefined,
      limit: 150
    })
    if (currentRequest === requestId) response.value = data
  } catch (error) {
    if (currentRequest !== requestId) return
    loadError.value = error instanceof Error ? error.message : "No se pudieron cargar los pedidos."
    toast.add({ title: "No se pudieron cargar los pedidos", description: loadError.value, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

function resetFilters() {
  search.value = ""
  selectedStatus.value = "todos"
  from.value = ""
  to.value = ""
  loadOrders()
}

function actionItems(order: OrderListItem) {
  return [[
    { label: "Abrir pedido", icon: "i-lucide-arrow-up-right", to: `/admin/pedidos/${order.id}` },
    { label: "Llamar al cliente", icon: "i-lucide-phone", to: `tel:${order.customerPhone}` }
  ]]
}

watch(selectedStatus, () => loadOrders())
watch([from, to], () => { if (!from.value || !to.value || from.value <= to.value) loadOrders() })
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadOrders, 300)
})
onMounted(loadOrders)
</script>

<template>
  <main class="space-y-6">
    <header class="flex flex-col gap-5 rounded-3xl border border-default bg-default px-5 pt-6 pb-7 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-7">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Pedidos y entregas</h1>
        <p class="mt-2 max-w-xl text-pretty text-sm leading-6 text-muted">Controla cada pedido desde la confirmación hasta su segunda entrega y conserva su menú personalizado.</p>
      </div>
      <UButton to="/admin/pedidos/crear-nuevo" icon="i-lucide-plus" size="lg" class="shrink-0 justify-center">Nuevo pedido</UButton>
    </header>

    <section class="grid grid-cols-2 gap-3 md:grid-cols-[1.15fr_1fr_1fr] md:grid-rows-2" aria-label="Resumen de pedidos">
      <article
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="rounded-2xl border border-default bg-default px-4 py-4 shadow-sm"
        :class="index === 0 ? 'col-span-2 md:col-span-1 md:row-span-2 md:flex md:flex-col md:justify-between md:p-5' : ''"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-semibold tracking-wide text-dimmed">{{ stat.label }}</p>
          <span class="flex size-8 items-center justify-center rounded-lg bg-elevated">
            <UIcon :name="stat.icon" class="size-4" :class="stat.tone" />
          </span>
        </div>
        <p class="mt-2 font-bold tabular-nums text-highlighted" :class="index === 0 ? 'text-4xl tracking-tight md:text-5xl' : 'text-2xl'">{{ stat.value }}</p>
      </article>
    </section>

    <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden rounded-3xl shadow-sm">
      <template #header>
        <div class="grid gap-3 md:grid-cols-12 xl:grid-cols-[minmax(240px,1fr)_190px_160px_160px_auto] xl:items-end">
          <UFormField label="Buscar" class="md:col-span-7 xl:col-auto">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Cliente, teléfono o plan" class="w-full" />
          </UFormField>
          <UFormField label="Estado" class="md:col-span-5 xl:col-auto">
            <USelect v-model="selectedStatus" :items="statusOptions" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="Desde" class="md:col-span-5 xl:col-auto">
            <UInput v-model="from" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Hasta" class="md:col-span-5 xl:col-auto">
            <UInput v-model="to" type="date" class="w-full" />
          </UFormField>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-filter-x"
            label="Limpiar"
            class="md:col-span-2 md:self-end md:justify-center xl:col-auto"
            :disabled="!isFiltering"
            @click="resetFilters"
          />
        </div>
      </template>

      <section v-if="loading">
        <div class="grid gap-3 p-3 sm:p-4 md:grid-cols-2 xl:hidden">
          <article v-for="index in 6" :key="index" class="space-y-4 rounded-2xl border border-default p-4" aria-hidden="true">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-2"><USkeleton class="h-5 w-3/5" /><USkeleton class="h-3.5 w-2/5" /></div>
              <USkeleton class="h-6 w-24 rounded-lg" />
            </div>
            <USkeleton class="h-12 w-full rounded-xl" />
            <div class="grid grid-cols-2 gap-2"><USkeleton class="h-24 rounded-xl" /><USkeleton class="h-24 rounded-xl" /></div>
            <div class="flex justify-between"><USkeleton class="h-5 w-20" /><USkeleton class="size-8 rounded-lg" /></div>
          </article>
        </div>
        <div class="hidden space-y-3 p-5 xl:block">
          <USkeleton v-for="index in 6" :key="index" class="h-20 rounded-xl" />
        </div>
      </section>

      <section v-else-if="loadError" class="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center">
        <UIcon name="i-lucide-cloud-alert" class="size-10 text-error" />
        <div><h2 class="font-semibold text-highlighted">No fue posible cargar los pedidos</h2><p class="mt-1 text-sm text-muted">{{ loadError }}</p></div>
        <UButton variant="soft" icon="i-lucide-refresh-cw" @click="loadOrders">Reintentar</UButton>
      </section>

      <section v-else-if="!response.items.length" class="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <div class="flex size-12 items-center justify-center rounded-2xl bg-elevated"><UIcon name="i-lucide-receipt-text" class="size-5 text-muted" /></div>
        <h2 class="mt-4 font-semibold text-highlighted">No hay pedidos en esta vista</h2>
        <p class="mt-1 max-w-sm text-sm text-muted">Crea el primer pedido o cambia los filtros para consultar otro periodo.</p>
        <UButton to="/admin/pedidos/crear-nuevo" icon="i-lucide-plus" class="mt-5">Nuevo pedido</UButton>
      </section>

      <div v-else>
        <section class="grid gap-3 p-3 sm:p-4 md:grid-cols-2 xl:hidden" aria-label="Listado de pedidos">
          <NuxtLink
            v-for="order in response.items"
            :key="`card-${order.id}`"
            :to="`/admin/pedidos/${order.id}`"
            class="group flex min-w-0 flex-col gap-4 rounded-2xl border border-default bg-default p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted transition-colors group-hover:text-primary">{{ order.customerName }}</p>
                <p class="mt-1 truncate text-xs text-muted">{{ order.customerPhone }}</p>
              </div>
              <UBadge :color="statusAppearance(order.status).color" variant="soft" class="shrink-0">
                <UIcon :name="statusAppearance(order.status).icon" class="size-3" />
                {{ statusAppearance(order.status).label }}
              </UBadge>
            </div>

            <div class="rounded-xl bg-elevated/60 px-3 py-2.5">
              <p class="truncate text-sm font-medium text-toned">{{ order.planTitle }}</p>
              <p class="mt-0.5 truncate text-xs text-muted">{{ order.planVariantTitle }}</p>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="min-w-0 rounded-xl border border-default/70 p-3">
                <div class="flex items-center gap-1.5 text-dimmed"><UIcon name="i-heroicons-truck" class="size-3.5" /><span>Primera entrega</span></div>
                <p class="mt-2 font-semibold tabular-nums text-toned">{{ formatDate(order.firstDeliveryDate) }}</p>
                <p class="mt-1 line-clamp-2 leading-4 text-muted">{{ order.firstDeliveryAddress }}</p>
              </div>
              <div class="min-w-0 rounded-xl border border-default/70 p-3">
                <div class="flex items-center gap-1.5 text-dimmed"><UIcon name="i-heroicons-map-pin" class="size-3.5" /><span>Segunda entrega</span></div>
                <p class="mt-2 font-semibold tabular-nums text-toned">{{ formatDate(order.secondDeliveryDate) }}</p>
                <p class="mt-1 line-clamp-2 leading-4 text-muted">{{ order.secondDeliveryAddress }}</p>
              </div>
            </div>

            <div class="mt-auto flex items-end justify-between gap-3 border-t border-default/70 pt-3">
              <div><p class="text-xs text-dimmed">Total</p><p class="font-semibold tabular-nums text-highlighted">{{ transformPrice(order.price) }}</p></div>
              <span class="flex size-9 items-center justify-center rounded-lg bg-elevated text-muted transition group-hover:bg-primary group-hover:text-inverted">
                <UIcon name="i-heroicons-arrow-right" class="size-4" />
              </span>
            </div>
          </NuxtLink>
        </section>

        <div class="hidden overflow-x-auto xl:block">
          <table class="min-w-[920px] w-full text-sm">
            <thead class="bg-elevated/55 text-left text-xs font-medium uppercase tracking-[0.14em] text-muted">
              <tr><th class="px-6 py-3">Cliente</th><th class="px-5 py-3">Plan</th><th class="px-5 py-3">Estado</th><th class="px-5 py-3">Primera entrega</th><th class="px-5 py-3">Segunda entrega</th><th class="px-5 py-3 text-right">Total</th><th class="w-14 px-4 py-3"><span class="sr-only">Acciones</span></th></tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="order in response.items" :key="order.id" class="transition hover:bg-elevated/35">
                <td class="px-6 py-4"><NuxtLink :to="`/admin/pedidos/${order.id}`" class="font-semibold text-highlighted hover:text-primary">{{ order.customerName }}</NuxtLink><p class="mt-0.5 text-xs text-muted">{{ order.customerPhone }}</p></td>
                <td class="px-5 py-4"><p class="font-medium text-toned">{{ order.planTitle }}</p><p class="mt-0.5 text-xs text-muted">{{ order.planVariantTitle }}</p></td>
                <td class="px-5 py-4"><UBadge :color="statusAppearance(order.status).color" variant="soft"><UIcon :name="statusAppearance(order.status).icon" class="size-3" />{{ statusAppearance(order.status).label }}</UBadge></td>
                <td class="max-w-56 px-5 py-4"><p class="font-medium text-toned">{{ formatDate(order.firstDeliveryDate) }}</p><p class="mt-0.5 truncate text-xs text-muted">{{ order.firstDeliveryAddress }}</p></td>
                <td class="max-w-56 px-5 py-4"><p class="font-medium text-toned">{{ formatDate(order.secondDeliveryDate) }}</p><p class="mt-0.5 truncate text-xs text-muted">{{ order.secondDeliveryAddress }}</p></td>
                <td class="px-5 py-4 text-right font-semibold tabular-nums text-highlighted">{{ transformPrice(order.price) }}</td>
                <td class="px-4 py-4"><UDropdownMenu :items="actionItems(order)"><UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones del pedido" /></UDropdownMenu></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UCard>
  </main>
</template>
