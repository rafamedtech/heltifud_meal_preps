<script setup lang="ts">
import type { OrderListResponse, OrderStatusValue } from "~~/layers/menu/shared/types/types"

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
  { label: "Confirmados", value: response.value.summary.confirmed, icon: "i-lucide-badge-check", tone: "text-info" },
  { label: "En proceso", value: response.value.summary.inProgress, icon: "i-lucide-chef-hat", tone: "text-primary" },
  { label: "Entregados", value: response.value.summary.delivered, icon: "i-lucide-package-check", tone: "text-success" }
])
const isFiltering = computed(() =>
  Boolean(search.value.trim() || selectedStatus.value !== "todos" || from.value || to.value)
)

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
    toast.add({
      title: "No se pudieron cargar los pedidos",
      description: loadError.value,
      color: "error",
      icon: "i-lucide-circle-alert"
    })
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

function openOrder(orderId: string) {
  return navigateTo(`/admin/pedidos/${orderId}`)
}

watch(selectedStatus, () => loadOrders())
watch([from, to], () => {
  if (!from.value || !to.value || from.value <= to.value) loadOrders()
})
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadOrders, 300)
})
onMounted(loadOrders)
</script>

<template>
  <main class="space-y-6">
    <header
      class="flex flex-col gap-5 rounded-3xl border border-default bg-default px-5 pt-6 pb-7 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7"
    >
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Pedidos y entregas</h1>
        <p class="mt-2 max-w-xl text-pretty text-sm leading-6 text-muted">
          Controla cada pedido desde la confirmación hasta su segunda entrega.
        </p>
      </div>
      <UButton
        to="/admin/pedidos/crear-nuevo"
        icon="i-lucide-plus"
        size="lg"
        class="shrink-0 justify-center"
        >Nuevo pedido</UButton
      >
    </header>

    <section
      class="grid grid-flow-col auto-cols-[minmax(9rem,1fr)] gap-3 overflow-x-auto pb-1 md:grid-flow-row md:grid-cols-4 md:auto-cols-auto md:overflow-visible md:pb-0"
      aria-label="Resumen de pedidos"
    >
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-default bg-default px-3 py-3 shadow-sm sm:px-4"
      >
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold tracking-wide text-dimmed">{{ stat.label }}</p>
          <p class="mt-0.5 text-xl font-bold tabular-nums text-highlighted">{{ stat.value }}</p>
        </div>
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-elevated">
          <UIcon
            :name="stat.icon"
            class="size-4"
            :class="stat.tone"
          />
        </span>
      </article>
    </section>

    <UCard
      :ui="{ body: 'p-0 sm:p-0' }"
      class="overflow-hidden rounded-3xl shadow-sm"
    >
      <template #header>
        <div class="grid gap-3 md:grid-cols-12 xl:grid-cols-[minmax(240px,1fr)_190px_160px_160px_auto] xl:items-end">
          <UFormField
            label="Buscar"
            class="md:col-span-7 xl:col-auto"
          >
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Cliente, teléfono o plan"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Estado"
            class="md:col-span-5 xl:col-auto"
          >
            <USelect
              v-model="selectedStatus"
              :items="statusOptions"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Desde"
            class="md:col-span-5 xl:col-auto"
          >
            <CalendarInput
              v-model="from"
              aria-label="Fecha inicial"
            />
          </UFormField>
          <UFormField
            label="Hasta"
            class="md:col-span-5 xl:col-auto"
          >
            <CalendarInput
              v-model="to"
              aria-label="Fecha final"
            />
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
        <div class="grid gap-3 p-3 sm:p-4 xl:hidden">
          <article
            v-for="index in 6"
            :key="index"
            class="grid gap-4 rounded-2xl border border-default p-4 md:grid-cols-[minmax(0,1fr)_7rem]"
            aria-hidden="true"
          >
            <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_13rem]">
              <div class="space-y-2"><USkeleton class="h-5 w-3/5" /><USkeleton class="h-6 w-24 rounded-lg" /></div>
              <USkeleton class="h-12 w-full rounded-xl" />
              <USkeleton class="h-14 rounded-xl sm:col-span-2 md:col-span-1" />
            </div>
            <div
              class="flex items-end justify-end border-t border-default/70 pt-3 md:flex-col md:items-center md:justify-center md:border-t-0 md:border-l md:pt-0 md:pl-4"
            >
              <USkeleton class="h-9 w-16" />
            </div>
          </article>
        </div>
        <div class="hidden space-y-3 p-5 xl:block">
          <USkeleton
            v-for="index in 6"
            :key="index"
            class="h-20 rounded-xl"
          />
        </div>
      </section>

      <section
        v-else-if="loadError"
        class="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <UIcon
          name="i-lucide-cloud-alert"
          class="size-10 text-error"
        />
        <div>
          <h2 class="font-semibold text-highlighted">No fue posible cargar los pedidos</h2>
          <p class="mt-1 text-sm text-muted">{{ loadError }}</p>
        </div>
        <UButton
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="loadOrders"
          >Reintentar</UButton
        >
      </section>

      <section
        v-else-if="!response.items.length"
        class="flex min-h-80 flex-col items-center justify-center px-6 text-center"
      >
        <div class="flex size-12 items-center justify-center rounded-2xl bg-elevated">
          <UIcon
            name="i-lucide-receipt-text"
            class="size-5 text-muted"
          />
        </div>
        <h2 class="mt-4 font-semibold text-highlighted">No hay pedidos en esta vista</h2>
        <p class="mt-1 max-w-sm text-sm text-muted">
          Crea el primer pedido o cambia los filtros para consultar otro periodo.
        </p>
        <UButton
          to="/admin/pedidos/crear-nuevo"
          icon="i-lucide-plus"
          class="mt-5"
          >Nuevo pedido</UButton
        >
      </section>

      <div v-else>
        <section
          class="grid gap-3 p-3 sm:p-4 xl:hidden"
          aria-label="Listado de pedidos"
        >
          <NuxtLink
            v-for="order in response.items"
            :key="`card-${order.id}`"
            :to="`/admin/pedidos/${order.id}`"
            :aria-label="`Abrir pedido de ${order.customerName}`"
            class="group grid min-w-0 cursor-pointer touch-manipulation select-none gap-4 rounded-2xl border border-default bg-default p-4 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 active:scale-[0.992] active:border-primary/60 active:bg-primary/5 active:shadow-inner active:duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transform-none md:grid-cols-[minmax(0,1fr)_7rem]"
          >
            <div class="grid min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_13rem]">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted transition-colors group-hover:text-primary">
                  {{ order.customerName }}
                </p>
                <UBadge
                  :color="statusAppearance(order.status).color"
                  variant="soft"
                  class="mt-2 shrink-0"
                >
                  <UIcon
                    :name="statusAppearance(order.status).icon"
                    class="size-3"
                  />
                  {{ statusAppearance(order.status).label }}
                </UBadge>
              </div>

              <div class="rounded-xl bg-elevated/60 px-3 py-2.5">
                <p class="truncate text-sm font-medium text-toned">{{ order.planTitle }}</p>
                <p class="mt-0.5 truncate text-xs text-muted">{{ order.planVariantTitle }}</p>
              </div>

              <div class="rounded-xl border border-default/70 px-3 py-2 text-xs sm:col-span-2 md:col-span-1">
                <div class="flex items-center gap-1.5 text-dimmed">
                  <UIcon
                    name="i-heroicons-calendar-days"
                    class="size-3.5"
                  />
                  <span>Entregas</span>
                </div>
                <div class="mt-1.5 grid grid-cols-2 divide-x divide-default/70">
                  <div class="min-w-0 pr-2">
                    <p class="truncate font-semibold tabular-nums text-toned">
                      <span class="sr-only">Primera entrega: </span>{{ formatDate(order.firstDeliveryDate) }}
                    </p>
                  </div>
                  <div class="min-w-0 pl-2">
                    <p class="truncate font-semibold tabular-nums text-toned">
                      <span class="sr-only">Segunda entrega: </span>{{ formatDate(order.secondDeliveryDate) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-end justify-end border-t border-default/70 pt-3 md:flex-col md:items-center md:justify-center md:border-t-0 md:border-l md:pt-0 md:pl-4"
            >
              <div class="md:text-center">
                <p class="text-xs text-dimmed">Total</p>
                <p class="font-semibold tabular-nums text-primary">{{ transformPrice(order.price) }}</p>
              </div>
            </div>
          </NuxtLink>
        </section>

        <div class="hidden overflow-x-auto xl:block">
          <table class="min-w-[820px] w-full text-sm">
            <thead class="bg-elevated/55 text-left text-xs font-medium uppercase tracking-[0.14em] text-muted">
              <tr>
                <th class="px-6 py-3">Cliente</th>
                <th class="px-5 py-3">Plan</th>
                <th class="px-5 py-3">Estado</th>
                <th class="px-5 py-3">Entregas</th>
                <th class="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="order in response.items"
                :key="order.id"
                role="link"
                tabindex="0"
                :aria-label="`Abrir pedido de ${order.customerName}`"
                class="cursor-pointer touch-manipulation select-none transition-[background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-elevated/35 active:bg-primary/10 active:shadow-inner active:duration-100 focus-visible:bg-primary/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                @click="openOrder(order.id)"
                @keydown.enter="openOrder(order.id)"
                @keydown.space.prevent="openOrder(order.id)"
              >
                <td class="px-6 py-4">
                  <p class="font-semibold text-highlighted">{{ order.customerName }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="font-medium text-toned">{{ order.planTitle }}</p>
                  <p class="mt-0.5 text-xs text-muted">{{ order.planVariantTitle }}</p>
                </td>
                <td class="px-5 py-4">
                  <UBadge
                    :color="statusAppearance(order.status).color"
                    variant="soft"
                    ><UIcon
                      :name="statusAppearance(order.status).icon"
                      class="size-3"
                    />{{ statusAppearance(order.status).label }}</UBadge
                  >
                </td>
                <td class="px-5 py-4">
                  <div class="grid min-w-52 grid-cols-2 gap-4 text-xs">
                    <div>
                      <p class="text-dimmed">Primera</p>
                      <p class="mt-1 font-medium tabular-nums text-toned">{{ formatDate(order.firstDeliveryDate) }}</p>
                    </div>
                    <div>
                      <p class="text-dimmed">Segunda</p>
                      <p class="mt-1 font-medium tabular-nums text-toned">{{ formatDate(order.secondDeliveryDate) }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-right font-semibold tabular-nums text-primary">
                  {{ transformPrice(order.price) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UCard>
  </main>
</template>
