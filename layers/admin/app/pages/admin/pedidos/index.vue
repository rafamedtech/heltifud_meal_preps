<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import { getLocalTimeZone, parseDate } from "@internationalized/date"
import type { CalendarDate } from "@internationalized/date"
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

const isFiltering = computed(() =>
  Boolean(search.value.trim() || selectedStatus.value !== "todos" || from.value || to.value)
)

const columns: TableColumn<OrderListItem>[] = [
  { accessorKey: "customerName", header: "Cliente" },
  { accessorKey: "planTitle", header: "Plan" },
  { accessorKey: "status", header: "Estado" },
  { accessorKey: "firstDeliveryDate", header: "Primera entrega" },
  { accessorKey: "secondDeliveryDate", header: "Segunda entrega" },
  { accessorKey: "price", header: "Total" },
  { id: "actions", header: "Acciones" }
]

function calendarModel(value: Ref<string>) {
  return computed<CalendarDate | undefined>({
    get: () => value.value ? parseDate(value.value) : undefined,
    set: date => { value.value = date?.toString() ?? "" }
  })
}

const fromDate = calendarModel(from)
const toDate = calendarModel(to)
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" })
function dateLabel(date: CalendarDate | undefined, placeholder: string) {
  return date ? dateFormatter.format(date.toDate(getLocalTimeZone())) : placeholder
}
const invalidDateRange = computed(() => Boolean(from.value && to.value && from.value > to.value))

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

watch(selectedStatus, () => loadOrders())
watch([from, to], () => {
  if (!from.value || !to.value || from.value <= to.value) loadOrders()
})
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadOrders, 300)
})
onMounted(loadOrders)
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <UPage>
    <div class="space-y-6">
    <UPageHeader
      title="Pedidos"
      description="Consulta tus pedidos y organiza sus dos entregas de la semana."
    >
      <template #links>
        <UButton to="/admin/pedidos/crear-nuevo" icon="i-lucide-plus" label="Nuevo pedido" />
      </template>
    </UPageHeader>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="font-semibold text-highlighted">Listado de pedidos</h2>
            <UBadge v-if="!loading && !loadError" color="neutral" variant="subtle" :label="String(response.items.length)" />
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-refresh-cw"
            label="Actualizar"
            :loading="loading"
            @click="loadOrders"
          />
        </div>
      </template>

      <div class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
          <UFormField label="Buscar" class="sm:col-span-2 xl:col-span-1">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Cliente, teléfono o plan" class="w-full" />
          </UFormField>
          <UFormField label="Estado">
            <USelect v-model="selectedStatus" :items="statusOptions" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="Desde">
            <UPopover :content="{ align: 'start' }">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-calendar"
                :label="dateLabel(fromDate, 'Fecha inicial')"
                aria-label="Abrir calendario para fecha inicial"
                class="w-full justify-start"
              />
              <template #content>
                <UCalendar v-model="fromDate" :max-value="toDate" class="p-2" />
              </template>
            </UPopover>
          </UFormField>
          <UFormField label="Hasta" :error="invalidDateRange ? 'La fecha final debe ser igual o posterior a la inicial.' : undefined">
            <UPopover :content="{ align: 'start' }">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-calendar"
                :label="dateLabel(toDate, 'Fecha final')"
                aria-label="Abrir calendario para fecha final"
                class="w-full justify-start"
              />
              <template #content>
                <UCalendar v-model="toDate" :min-value="fromDate" class="p-2" />
              </template>
            </UPopover>
          </UFormField>
          <UButton color="neutral" variant="outline" icon="i-lucide-filter-x" label="Limpiar" :disabled="!isFiltering" @click="resetFilters" />
        </div>

        <USeparator />

        <UEmpty
          v-if="loadError"
          icon="i-lucide-cloud-alert"
          title="No fue posible cargar los pedidos"
          :description="loadError"
        >
          <template #actions>
            <UButton variant="soft" icon="i-lucide-refresh-cw" label="Reintentar" @click="loadOrders" />
          </template>
        </UEmpty>
        <UEmpty
          v-else-if="!loading && !response.items.length"
          icon="i-lucide-receipt-text"
          :title="isFiltering ? 'No encontramos pedidos' : 'Tu primer pedido empieza aquí'"
          :description="isFiltering ? 'Prueba con otro cliente, estado o periodo de entrega.' : 'Crea un pedido para organizar su menú y sus entregas.'"
        >
          <template #actions>
            <UButton v-if="isFiltering" color="neutral" variant="outline" label="Limpiar filtros" @click="resetFilters" />
            <UButton v-else to="/admin/pedidos/crear-nuevo" icon="i-lucide-plus" label="Nuevo pedido" />
          </template>
        </UEmpty>

        <template v-else>
          <div class="space-y-4 lg:hidden" aria-label="Listado de pedidos" :aria-busy="loading">
            <template v-if="loading">
              <UCard v-for="index in 3" :key="index" aria-hidden="true">
                <div class="space-y-3">
                  <USkeleton class="h-5 w-1/2" />
                  <USkeleton class="h-4 w-2/3" />
                  <USkeleton class="h-10 w-full rounded-md" />
                </div>
              </UCard>
            </template>
            <UPageCard
              v-for="order in loading ? [] : response.items"
              :key="order.id"
              :title="order.customerName"
              :description="`${order.planTitle} · ${order.planVariantTitle}`"
              :to="`/admin/pedidos/${order.id}`"
            >
              <template #header>
                <UBadge :color="statusAppearance(order.status).color" variant="subtle" :icon="statusAppearance(order.status).icon" :label="statusAppearance(order.status).label" />
              </template>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted">Primera entrega</p>
                  <p class="text-highlighted">{{ formatDate(order.firstDeliveryDate) }}</p>
                </div>
                <div>
                  <p class="text-muted">Segunda entrega</p>
                  <p class="text-highlighted">{{ formatDate(order.secondDeliveryDate) }}</p>
                </div>
              </div>
              <template #footer>
                <div class="flex items-center justify-between gap-3">
                  <span class="font-semibold tabular-nums text-highlighted">{{ transformPrice(order.price) }}</span>
                  <UIcon name="i-lucide-arrow-up-right" class="size-5 text-muted" />
                </div>
              </template>
            </UPageCard>
          </div>

          <UTable
            :data="loading ? [] : response.items"
            :columns="columns"
            :loading="loading"
            class="hidden lg:block"
            aria-label="Listado de pedidos"
            @select="(_event, row) => navigateTo(`/admin/pedidos/${row.original.id}`)"
          >
            <template #customerName-cell="{ row }">
              <ULink :to="`/admin/pedidos/${row.original.id}`" class="font-medium">
                {{ row.original.customerName }}
              </ULink>
            </template>
            <template #planTitle-cell="{ row }">
              <UUser :name="row.original.planTitle" :description="row.original.planVariantTitle" />
            </template>
            <template #status-cell="{ row }">
              <UBadge :color="statusAppearance(row.original.status).color" variant="subtle" :icon="statusAppearance(row.original.status).icon" :label="statusAppearance(row.original.status).label" />
            </template>
            <template #firstDeliveryDate-cell="{ row }">{{ formatDate(row.original.firstDeliveryDate) }}</template>
            <template #secondDeliveryDate-cell="{ row }">{{ formatDate(row.original.secondDeliveryDate) }}</template>
            <template #price-cell="{ row }">
              <span class="font-medium tabular-nums">{{ transformPrice(row.original.price) }}</span>
            </template>
            <template #actions-cell="{ row }">
              <UButton
                :to="`/admin/pedidos/${row.original.id}`"
                :aria-label="`Abrir pedido de ${row.original.customerName}`"
                icon="i-lucide-arrow-up-right"
                color="neutral"
                variant="ghost"
                size="sm"
              />
            </template>
            <template #loading>
              <div class="space-y-4" aria-label="Cargando pedidos">
                <USkeleton v-for="index in 3" :key="index" class="h-10 w-full rounded-md" />
              </div>
            </template>
          </UTable>
        </template>
      </div>

      <template #footer>
        <p class="text-sm text-muted" role="status">
          {{ loading ? 'Cargando pedidos…' : loadError ? 'Pedidos no disponibles' : `${response.items.length} ${response.items.length === 1 ? 'pedido' : 'pedidos'}${isFiltering ? (response.items.length === 1 ? ' coincide con los filtros' : ' coinciden con los filtros') : ' en el listado'}` }}
        </p>
      </template>
    </UCard>
    </div>
  </UPage>
</template>
