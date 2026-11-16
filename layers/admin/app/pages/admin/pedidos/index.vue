<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import { getLocalTimeZone, parseDate } from "@internationalized/date"
import type { CalendarDate } from "@internationalized/date"
import type { DeliverySequence, OrderListItem, OrderListResponse, OrderStatusValue, WeeklyCycle } from "~~/layers/menu/shared/types/types"
import { deliveryDateOf, orderFolioLabel } from "~~/layers/menu/shared/utils/orderDeliveries"

definePageMeta({ layout: "admin" })

useSeoMeta({
  title: "Pedidos | Heltifud Meal Preps",
  description: "Administra pedidos, entregas y menús personalizados.",
  robots: "noindex, nofollow"
})

const toast = useToast()
const { getOrders } = useOrders()
const { getCycles } = useCycles()
const PAGE_SIZE = 50
const ALL_WEEKS = "todas"
const response = ref<OrderListResponse>({
  items: [],
  summary: { total: 0, draft: 0, confirmed: 0, inProgress: 0, delivered: 0 }
})
const loading = ref(true)
const loadError = ref("")
const search = ref("")
const selectedStatus = ref("todos")
const selectedCycle = ref(ALL_WEEKS)
const cycles = ref<WeeklyCycle[]>([])
const page = ref(1)
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
  Boolean(search.value.trim() || selectedStatus.value !== "todos" || selectedCycle.value !== ALL_WEEKS || from.value || to.value)
)
// Week starts are civil dates; the year tells apart the same week of different years.
const weekFormatter = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const cycleOptions = computed(() => [
  { label: "Todas las semanas", value: ALL_WEEKS },
  ...cycles.value.map(cycle => ({ label: `Semana del ${weekFormatter.format(new Date(`${cycle.weekStart}T00:00:00.000Z`))}`, value: cycle.id }))
])
const total = computed(() => response.value.summary.total)
const rangeLabel = computed(() => {
  if (!total.value) return ""
  const first = (page.value - 1) * PAGE_SIZE + 1
  return `${first}–${first + response.value.items.length - 1} de ${total.value}`
})

const columns: TableColumn<OrderListItem>[] = [
  { accessorKey: "folio", header: "Folio" },
  { accessorKey: "customerName", header: "Cliente" },
  { accessorKey: "planTitle", header: "Plan" },
  { accessorKey: "status", header: "Estado" },
  { id: "firstDelivery", header: "Primera entrega" },
  { id: "secondDelivery", header: "Segunda entrega" },
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

function deliveryLabel(order: OrderListItem, sequence: DeliverySequence) {
  const date = deliveryDateOf(order.deliveries, sequence)
  return date ? formatDate(date) : "—"
}

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
      cycleId: selectedCycle.value === ALL_WEEKS ? undefined : selectedCycle.value,
      limit: PAGE_SIZE,
      offset: (page.value - 1) * PAGE_SIZE
    })
    if (currentRequest !== requestId) return
    // The last page can empty out when orders change elsewhere; step back to the new last page.
    if (!data.items.length && data.summary.total && page.value > 1) {
      page.value = Math.ceil(data.summary.total / PAGE_SIZE)
      return
    }
    response.value = data
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

// Filters always restart at the first page; a page change alone keeps them.
function loadFirstPage() {
  if (page.value === 1) loadOrders()
  else page.value = 1
}

function resetFilters() {
  clearTimeout(searchTimer)
  search.value = ""
  selectedStatus.value = "todos"
  selectedCycle.value = ALL_WEEKS
  from.value = ""
  to.value = ""
}

async function loadCycles() {
  try {
    cycles.value = await getCycles()
  } catch {
    // The list still works without the week filter.
    cycles.value = []
  }
}

watch(page, () => loadOrders())
watch([selectedStatus, selectedCycle], loadFirstPage)
watch([from, to], () => {
  if (!from.value || !to.value || from.value <= to.value) loadFirstPage()
})
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadFirstPage, 300)
})
onMounted(() => {
  loadOrders()
  loadCycles()
})
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <UPage>
    <div class="space-y-6">
    <div class="space-y-6">
      <UDashboardToolbar class="border-0 px-0">
        <div class="flex w-full flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="font-semibold text-highlighted">Listado de pedidos</h2>
            <UBadge v-if="!loading && !loadError" color="neutral" variant="subtle" :label="String(total)" />
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
      </UDashboardToolbar>

      <div class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
          <UFormField label="Buscar" class="sm:col-span-2 xl:col-span-1">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Cliente, teléfono o plan" class="w-full" />
          </UFormField>
          <UFormField label="Estado">
            <USelect v-model="selectedStatus" :items="statusOptions" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="Semana">
            <USelect v-model="selectedCycle" :items="cycleOptions" value-key="value" class="w-full" />
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
              :description="`${orderFolioLabel(order.folio)} · ${order.planTitle} · ${order.planVariantTitle}`"
              :to="`/admin/pedidos/${order.id}`"
            >
              <template #header>
                <UBadge :color="statusAppearance(order.status).color" variant="subtle" :icon="statusAppearance(order.status).icon" :label="statusAppearance(order.status).label" />
              </template>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted">Primera entrega</p>
                  <p class="text-highlighted">{{ deliveryLabel(order, 1) }}</p>
                </div>
                <div>
                  <p class="text-muted">Segunda entrega</p>
                  <p class="text-highlighted">{{ deliveryLabel(order, 2) }}</p>
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
            <template #folio-cell="{ row }"><span class="tabular-nums text-muted">{{ orderFolioLabel(row.original.folio) }}</span></template>
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
            <template #firstDelivery-cell="{ row }">{{ deliveryLabel(row.original, 1) }}</template>
            <template #secondDelivery-cell="{ row }">{{ deliveryLabel(row.original, 2) }}</template>
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

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-sm text-muted" role="status">
          {{ loading ? 'Cargando pedidos…' : loadError ? 'Pedidos no disponibles' : `${total} ${total === 1 ? 'pedido' : 'pedidos'}${isFiltering ? (total === 1 ? ' coincide con los filtros' : ' coinciden con los filtros') : ' en el listado'}${total > PAGE_SIZE ? ` · ${rangeLabel}` : ''}` }}
        </p>
        <UPagination
          v-if="!loadError && total > PAGE_SIZE"
          v-model:page="page"
          :total="total"
          :items-per-page="PAGE_SIZE"
          :disabled="loading"
        />
      </div>
    </div>
    </div>
  </UPage>
</template>
