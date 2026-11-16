<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import type { ExpenseListResponse, OrderListItem, OrderListResponse, Plan } from "~~/layers/menu/shared/types/types"
import { deliveryDateOf } from "~~/layers/menu/shared/utils/orderDeliveries"

definePageMeta({ layout: "admin" })
useSeoMeta({ title: "Panel de gestión | Heltifud Meal Preps", robots: "noindex, nofollow" })

const { data: orders, status: orderStatus, error: orderError, refresh: refreshOrders } = await useFetch<OrderListResponse>("/api/orders", { query: { limit: 5 }, lazy: true })
const { data: expenses, error: expenseError } = await useFetch<ExpenseListResponse>("/api/expenses", { query: { limit: 1 }, lazy: true })
const { data: plans, error: planError } = await useFetch<Plan[]>("/api/plans/all", { default: () => [], lazy: true })
const sectionLinks = adminLinks.flat().filter(item => item.to !== "/admin").map(item => ({ label: item.label, icon: item.icon, to: String(item.to) }))
const statistics = computed(() => [
  { title: "Pedidos", value: orderError.value ? "No disponible" : orders.value?.summary.total ?? "—", icon: "i-lucide-receipt-text", to: "/admin/pedidos" },
  { title: "Gastos del mes", value: expenseError.value ? "No disponible" : expenses.value ? transformPrice(expenses.value.summary.currentMonthTotal) : "—", icon: "i-lucide-wallet-cards", to: "/admin/gastos" },
  { title: "Planes activos", value: planError.value ? "No disponible" : plans.value.filter(plan => plan.isActive).length, icon: "i-lucide-clipboard-list", to: "/admin/planes" }
])
const columns: TableColumn<OrderListItem>[] = [
  { accessorKey: "customerName", header: "Cliente" },
  { accessorKey: "planTitle", header: "Plan" },
  { id: "firstDelivery", header: "Primera entrega" },
  { accessorKey: "price", header: "Total" },
  { id: "actions", header: "Acciones" }
]
</script>

<template>
  <div class="space-y-6">
    <UPageGrid>
      <UPageCard v-for="stat in statistics" :key="stat.title" :title="stat.title" :icon="stat.icon" :to="stat.to" variant="outline">
        <p class="text-2xl font-semibold tabular-nums text-highlighted">{{ stat.value }}</p>
      </UPageCard>
    </UPageGrid>
    <UCard title="Pedidos recientes" description="Los últimos pedidos registrados en Heltifud." :ui="{ body: 'p-0 sm:p-0' }">
      <UEmpty v-if="orderError" title="No fue posible cargar los pedidos" icon="i-lucide-cloud-alert">
        <template #actions><UButton color="neutral" variant="outline" label="Reintentar" @click="refreshOrders()" /></template>
      </UEmpty>
      <UTable v-else :data="orders?.items ?? []" :columns="columns" :loading="orderStatus === 'pending'" @select="(_event, row) => navigateTo(`/admin/pedidos/${row.original.id}`)">
        <template #customerName-cell="{ row }"><UUser :name="row.original.customerName" :avatar="{ alt: row.original.customerName }" size="sm" /></template>
        <template #firstDelivery-cell="{ row }">{{ deliveryDateOf(row.original.deliveries, 1) ? formatDate(deliveryDateOf(row.original.deliveries, 1)!) : "—" }}</template>
        <template #price-cell="{ row }">{{ transformPrice(row.original.price) }}</template>
        <template #actions-cell="{ row }"><UButton :to="`/admin/pedidos/${row.original.id}`" color="neutral" variant="ghost" size="sm" icon="i-lucide-arrow-up-right" :aria-label="`Abrir pedido de ${row.original.customerName}`" /></template>
      </UTable>
      <template #footer><UButton to="/admin/pedidos" color="neutral" variant="outline" label="Ver todos los pedidos" trailing-icon="i-lucide-arrow-right" /></template>
    </UCard>
    <UPageGrid>
      <UPageCard v-for="item in sectionLinks" :key="String(item.to)" :title="item.label" :icon="item.icon" :to="item.to" variant="outline" />
    </UPageGrid>
  </div>
</template>
