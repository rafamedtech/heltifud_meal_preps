<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import type { OrderListItem, OrderListResponse } from "~~/layers/menu/shared/types/types"
import { orderFolioLabel } from "~~/layers/menu/shared/utils/orderDeliveries"

const columns: TableColumn<OrderListItem>[] = [
  { accessorKey: "planTitle", header: "Plan" },
  { accessorKey: "status", header: "Estado" },
  { id: "deliveries", header: "Entregas" },
  { accessorKey: "price", header: "Total" },
  { id: "actions", header: "Acciones" }
]

const props = defineProps<{ customerId: string }>()
const page = ref(1)
const pageSize = 10
const { data: orders, status, error, refresh } = await useFetch<OrderListResponse>("/api/orders", {
  query: computed(() => ({ customerId: props.customerId, limit: pageSize, offset: (page.value - 1) * pageSize })),
  lazy: true
})

const statusLabels = {
  DRAFT: "Borrador", CONFIRMED: "Confirmado", PREPARING: "En preparación",
  PARTIALLY_DELIVERED: "Entrega parcial", DELIVERED: "Entregado", CANCELLED: "Cancelado"
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value))
}
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-shopping-bag" class="size-5 text-primary" />Historial de pedidos</h2>
        </div>
        <UBadge v-if="orders && !error" color="neutral" variant="soft">{{ orders.summary.total }} pedidos</UBadge>
      </div>
    </template>

    <UEmpty v-if="status === 'pending'" loading title="Cargando pedidos" />
    <UEmpty v-else-if="error" icon="i-lucide-cloud-alert" title="No fue posible cargar los pedidos del cliente.">
      <template #actions><UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" @click="refresh()">Reintentar pedidos</UButton></template>
    </UEmpty>
    <UEmpty v-else-if="!orders?.items.length" icon="i-lucide-shopping-bag" title="Sin pedidos registrados" description="Los pedidos de este cliente aparecerán aquí." />
    <UTable v-else :data="orders.items" :columns="columns" @select="(_event, row) => navigateTo(`/admin/pedidos/${row.original.id}`)">
      <template #planTitle-cell="{ row }"><ULink :to="`/admin/pedidos/${row.original.id}`"><UUser :name="row.original.planTitle" :description="`${orderFolioLabel(row.original.folio)} · ${row.original.planVariantTitle} · Creado: ${dateLabel(row.original.createdAt)}`" /></ULink></template>
      <template #status-cell="{ row }"><UBadge :color="row.original.status === 'CANCELLED' ? 'error' : row.original.status === 'DELIVERED' ? 'success' : 'neutral'" variant="subtle" :label="statusLabels[row.original.status]" /></template>
      <template #deliveries-cell="{ row }"><p v-for="(delivery, index) in row.original.deliveries" :key="delivery.id" :class="index ? 'text-xs text-muted' : undefined">{{ index ? "" : "Entregas: " }}{{ dateLabel(delivery.scheduledDate) }}</p></template>
      <template #price-cell="{ row }">{{ transformPrice(row.original.price) }}</template>
      <template #actions-cell="{ row }"><UButton :to="`/admin/pedidos/${row.original.id}`" color="neutral" variant="ghost" size="sm" label="Ver pedido" trailing-icon="i-lucide-arrow-up-right" /></template>
    </UTable>
    <template v-if="orders && orders.summary.total > pageSize" #footer>
      <div class="flex justify-center">
        <UPagination v-model:page="page" :total="orders.summary.total" :items-per-page="pageSize" :disabled="status === 'pending'" />
      </div>
    </template>
  </UCard>
</template>
