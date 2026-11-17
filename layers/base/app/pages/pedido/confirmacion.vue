<script setup lang="ts">
import type { PrivateCustomerOrder } from '~~/layers/menu/shared/types/customerOrder'
import { customerOrderSummary } from '~~/layers/menu/shared/utils/customerOrderSummary'
import { dayOfWeekLabel, orderFolioLabel } from '~~/layers/menu/shared/utils/orderDeliveries'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DELIVERY_STATUS_LABELS } from '~~/layers/menu/shared/utils/orderWorkflow'
import type { OrderStatusValue, DeliveryStatusValue } from '~~/layers/menu/shared/types/types'

useSeoMeta({ title: 'Consulta de tu pedido | Heltifud', robots: 'noindex, nofollow', referrer: 'no-referrer' })
const order = ref<PrivateCustomerOrder | null>(null)
const loading = ref(true)
const error = ref('')
const copied = ref(false)
let token = ''
const whatsapp = computed(() => order.value ? `https://wa.me/5216648161284?text=${encodeURIComponent(customerOrderSummary(order.value))}` : '')
async function load() {
  loading.value = true; error.value = ''
  try { order.value = await $fetch<PrivateCustomerOrder>('/api/customer-order/private', { headers: { 'x-order-token': token } }) }
  catch (e) { error.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'No pudimos consultar tu pedido. Reintenta.' }
  finally { loading.value = false }
}
async function copyLink() {
  try { await navigator.clipboard.writeText(location.href); copied.value = true }
  catch { error.value = 'Copia el enlace desde la barra de direcciones de tu navegador.' }
}
onMounted(async () => { token = new URLSearchParams(location.hash.slice(1)).get('pedido') ?? ''; await load() })
</script>

<template>
  <main class="mx-auto w-full max-w-5xl space-y-6 py-6">
    <UEmpty v-if="loading" loading title="Consultando tu pedido" />
    <UEmpty v-else-if="!order" icon="i-lucide-key-round" title="No pudimos abrir este pedido" :description="error">
      <template #actions><UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Reintentar" @click="load" /><UButton to="/pedido" label="Hacer un pedido" /></template>
    </UEmpty>
    <template v-else>
      <UPageHeader :title="`Tu pedido ${orderFolioLabel(order.folio)}`" description="Tu solicitud quedó registrada. Heltifud revisará las comidas, entregas y forma de pago antes de confirmarla.">
        <template #links><UBadge variant="subtle" :color="ORDER_STATUS_COLORS[order.status as OrderStatusValue]" :label="order.status === 'DRAFT' ? 'Recibido · pendiente de confirmación' : ORDER_STATUS_LABELS[order.status as OrderStatusValue]" /></template>
      </UPageHeader>
      <UAlert v-if="error" color="warning" variant="soft" :title="error" />
      <UPageCard :title="`${order.planTitle} · ${order.variantTitle}`" :description="`${order.contact.nombre} · ${order.contact.telefono}`">
        <p class="text-2xl font-semibold tabular-nums text-highlighted">{{ transformPrice(order.price) }}</p>
        <p class="text-sm text-muted">Total del plan registrado. La recepción de esta solicitud no acredita un pago.</p>
        <div class="flex flex-wrap gap-3">
          <UButton :to="whatsapp" target="_blank" rel="noopener noreferrer" icon="i-lucide-message-circle" label="Compartir pedido por WhatsApp" />
          <UButton color="neutral" variant="outline" icon="i-lucide-copy" :label="copied ? 'Enlace copiado' : 'Copiar enlace privado'" @click="copyLink" />
          <UButton color="neutral" variant="ghost" icon="i-lucide-refresh-cw" label="Actualizar estado" @click="load" />
        </div>
        <p class="text-sm text-muted">Guarda este enlace. Da acceso solo a este pedido y vence el {{ formatDate(order.expiresAt) }}. Compártelo únicamente con quien deba consultarlo.</p>
      </UPageCard>
      <UPageGrid>
        <UPageCard v-for="delivery in order.deliveries" :key="delivery.sequence" :title="`Entrega ${delivery.sequence}`" :description="formatDate(delivery.date)" icon="i-lucide-truck">
          <p class="text-default break-words">{{ delivery.address }}</p>
          <UBadge color="neutral" variant="subtle" :label="DELIVERY_STATUS_LABELS[delivery.status as DeliveryStatusValue]" />
        </UPageCard>
      </UPageGrid>
      <UPageCard title="Las comidas de tu pedido">
        <ul class="divide-y divide-default">
          <li v-for="meal in order.meals" :key="`${meal.dayOfWeek}:${meal.slotType}`" class="space-y-2 py-4">
            <p class="font-medium text-highlighted">{{ dayOfWeekLabel(meal.dayOfWeek) }} · {{ meal.slotType }}</p>
            <p class="text-default">{{ meal.dishes.join(' · ') }}</p>
            <p v-if="meal.notes" class="text-sm text-muted">{{ meal.notes }}</p>
          </li>
        </ul>
        <p v-if="order.notes" class="text-sm text-muted">Notas: {{ order.notes }}</p>
      </UPageCard>
    </template>
  </main>
</template>
