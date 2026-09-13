<script setup lang="ts">
import type { OrderListResponse } from "~~/layers/menu/shared/types/types"

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
  <UCard class="app-surface" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-shopping-bag" class="size-5 text-primary" />Historial de pedidos</h2>
        </div>
        <UBadge v-if="orders && !error" color="neutral" variant="soft">{{ orders.summary.total }} pedidos</UBadge>
      </div>
    </template>

    <div v-if="status === 'pending'" role="status" aria-live="polite" class="flex items-center justify-center gap-2 py-12 text-sm text-muted">
      <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />Cargando pedidos
    </div>
    <div v-else-if="error" class="space-y-3 px-6 py-10 text-center">
      <p class="text-sm text-muted">No fue posible cargar los pedidos del cliente.</p>
      <UButton color="neutral" variant="soft" icon="i-lucide-refresh-cw" @click="refresh()">Reintentar pedidos</UButton>
    </div>
    <div v-else-if="!orders?.items.length" class="px-6 py-12 text-center">
      <UIcon name="i-lucide-shopping-bag" class="size-9 text-dimmed" />
      <p class="mt-3 font-medium text-highlighted">Sin pedidos registrados</p>
      <p class="mt-1 text-sm text-muted">Los pedidos de este cliente aparecerán aquí.</p>
    </div>
    <div v-else class="divide-y divide-default">
      <NuxtLink
        v-for="order in orders.items"
        :key="order.id"
        :to="`/admin/pedidos/${order.id}`"
        class="grid gap-4 px-5 py-5 transition-colors hover:bg-elevated/35 focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-semibold text-highlighted">{{ order.planTitle }}</h3>
            <UBadge :color="order.status === 'CANCELLED' ? 'error' : order.status === 'DELIVERED' ? 'success' : 'neutral'" variant="soft" size="sm">{{ statusLabels[order.status] }}</UBadge>
          </div>
          <p class="mt-1 text-sm text-toned">{{ order.planVariantTitle }}</p>
          <p class="mt-2 text-xs text-muted">Creado: {{ dateLabel(order.createdAt) }} · Entregas: {{ dateLabel(order.firstDeliveryDate) }} y {{ dateLabel(order.secondDeliveryDate) }}</p>
        </div>
        <div class="flex items-center justify-between gap-6 sm:text-right">
          <span class="font-semibold tabular-nums text-highlighted">{{ transformPrice(order.price) }}</span>
          <span class="flex items-center gap-1 text-sm font-medium text-primary">Ver pedido<UIcon name="i-lucide-arrow-up-right" class="size-4" /></span>
        </div>
      </NuxtLink>
    </div>
    <template v-if="orders && orders.summary.total > pageSize" #footer>
      <div class="flex justify-center">
        <UPagination v-model:page="page" :total="orders.summary.total" :items-per-page="pageSize" :disabled="status === 'pending'" />
      </div>
    </template>
  </UCard>
</template>
