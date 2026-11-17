<script setup lang="ts">
import type { DeliveryBoardItem } from '~~/layers/menu/shared/types/operations'
import { deliveryOperationSchema } from '~~/layers/menu/shared/types/operations'
import { DELIVERY_TRANSITIONS, DELIVERY_STATUS_LABELS, DELIVERY_ACTION_LABELS } from '~~/layers/menu/shared/utils/orderWorkflow'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Tablero de reparto | Heltifud', robots: 'noindex, nofollow' })
const toast = useToast()
const isAdmin = computed(() => useStaffRole().value === 'admin')
const route = useRoute()
const router = useRouter()
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana' }).format(new Date())
const date = ref(typeof route.query.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(route.query.fecha) ? route.query.fecha : today)
// Keep the board date in the URL so returning from an order restores it.
watch(date, fecha => router.replace({ query: { ...route.query, fecha: fecha === today ? undefined : fecha } }))
const { data, error, status, refresh } = await useFetch<DeliveryBoardItem[]>('/api/operations/deliveries', { query: { date }, default: () => [], lazy: true })
const deliveryCount = (count: number) => `${count} ${count === 1 ? 'entrega' : 'entregas'}`
const selected = ref<DeliveryBoardItem | null>(null)
const open = ref(false)
const saving = ref(false)
const transition = ref<DeliveryBoardItem['status'] | ''>('')
const reason = ref('')
const state = reactive({ version: 1, assignedTo: '', incident: '', evidenceUrl: '' })
function edit(item: DeliveryBoardItem, next: DeliveryBoardItem['status'] | '' = '') {
  selected.value = item; transition.value = next; reason.value = ''; Object.assign(state, { version: item.version, assignedTo: item.assignedTo, incident: item.incident, evidenceUrl: item.evidenceUrl }); open.value = true
}
async function save() {
  if (!selected.value || saving.value) return
  saving.value = true
  try {
    if (transition.value) await $fetch(`/api/orders/${selected.value.orderId}/deliveries/${selected.value.sequence}/status`, { method: 'POST', body: { version: state.version, status: transition.value, reason: reason.value } })
    else await $fetch(`/api/operations/deliveries/${selected.value.id}`, { method: 'PUT', body: { ...state } })
    open.value = false; await refresh(); toast.add({ title: 'Entrega actualizada', color: 'success' })
  } catch (e) {
    toast.add({ title: 'No se pudo actualizar la entrega', description: (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Inténtalo de nuevo.', color: 'error' }); await refresh()
  } finally { saving.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end gap-3">
      <UFormField label="Fecha de entrega" class="w-48"><CalendarInput v-model="date" label="Fecha de entrega" /></UFormField>
      <UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Actualizar" :loading="status === 'pending'" @click="refresh()" />
    </div>
    <UAlert title="Cobro y reparto" :description="`El saldo mostrado corresponde al pedido completo. Los cambios de reparto no registran cobros. ${isAdmin ? 'Abre la cuenta para registrar el dinero recibido.' : 'Entrega a administración el dinero recibido para registrarlo.'}`" icon="i-lucide-info" color="info" variant="soft" />
    <UEmpty v-if="error" title="No fue posible cargar el reparto"><template #actions><UButton label="Reintentar" @click="refresh()" /></template></UEmpty>
    <USkeleton v-else-if="status === 'pending'" class="h-40" />
    <div v-else class="grid gap-4 xl:grid-cols-4">
      <UCard v-for="column in (['PENDING', 'OUT_FOR_DELIVERY', 'FAILED', 'DELIVERED'] as const)" :key="column" :title="DELIVERY_STATUS_LABELS[column]" :description="deliveryCount(data.filter(d => d.status === column).length)">
        <UEmpty v-if="!data.some(d => d.status === column)" title="Sin entregas" icon="i-lucide-package-check" />
        <div v-else class="space-y-4">
          <UCard v-for="item in data.filter(d => d.status === column)" :key="item.id" :title="`#${item.folio} · ${item.customer}`" variant="subtle">
            <div class="space-y-3">
              <p class="text-sm">Entrega {{ item.sequence }} · {{ item.meals }} comidas</p><p>{{ item.address }}</p>
              <p class="text-sm text-muted">{{ item.phone }} · {{ item.assignedTo || 'Sin repartidor asignado' }}</p>
              <p v-if="!['PREPARING', 'PARTIALLY_DELIVERED', 'DELIVERED'].includes(item.orderStatus)" class="text-sm text-muted">{{ isAdmin ? 'Inicia la preparación desde el pedido para habilitar el reparto.' : 'Administración debe iniciar la preparación del pedido para habilitar el reparto.' }}</p>
              <p>Saldo del pedido: {{ transformPrice(item.balance) }}</p>
              <UAlert v-if="item.deliveryNotes" title="Nota de la entrega" :description="item.deliveryNotes" :color="item.status === 'FAILED' ? 'error' : 'info'" />
              <UAlert v-if="item.incident" title="Incidencia" :description="item.incident" color="warning" />
              <div class="flex flex-wrap gap-2">
                <UButton size="sm" color="neutral" variant="outline" label="Asignación / evidencia" @click="edit(item)" />
                <UButton v-for="next in (['PREPARING', 'PARTIALLY_DELIVERED'].includes(item.orderStatus) ? DELIVERY_TRANSITIONS[item.status] : [])" :key="next" size="sm" :label="DELIVERY_ACTION_LABELS[next]" @click="edit(item, next)" />
                <template v-if="isAdmin">
                  <UButton size="sm" color="neutral" variant="link" :to="`/admin/cobros?pedido=${item.orderId}`" label="Cobros" />
                  <UButton size="sm" color="neutral" variant="link" :to="`/admin/pedidos/${item.orderId}`" label="Pedido e historial" />
                </template>
                <UButton v-if="item.evidenceUrl" size="sm" color="neutral" variant="link" :to="item.evidenceUrl" target="_blank" rel="noopener noreferrer" label="Ver evidencia" />
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
    </div>
    <UModal v-model:open="open" :title="transition ? DELIVERY_ACTION_LABELS[transition] : 'Asignación e incidencia'" description="Los cambios se guardan con el responsable y se rechazan si el pedido cambió." :dismissible="!saving">
      <template #body>
        <UForm :state="state" :schema="deliveryOperationSchema" class="space-y-4" @submit="save">
          <p>#{{ selected?.folio }} · {{ selected?.customer }}</p>
          <template v-if="transition"><UFormField label="Motivo / referencia" description="Obligatorio si la entrega falló o si se reintenta."><UTextarea v-model="reason" :maxlength="1000" class="w-full" :disabled="saving" /></UFormField></template>
          <template v-else>
            <UFormField name="assignedTo" label="Repartidor"><UInput v-model="state.assignedTo" :maxlength="120" class="w-full" :disabled="saving" /></UFormField>
            <UFormField name="incident" label="Incidencia"><UTextarea v-model="state.incident" :maxlength="1000" class="w-full" :disabled="saving" /></UFormField>
            <UFormField name="evidenceUrl" label="Enlace de evidencia" description="Enlace HTTPS a un comprobante existente."><UInput v-model="state.evidenceUrl" placeholder="https://..." class="w-full" :disabled="saving" /></UFormField>
            <ul v-if="selected?.activities.length" class="space-y-2 text-sm text-muted"><li v-for="a in selected.activities" :key="a.id">{{ new Date(a.createdAt).toLocaleString('es-MX') }} · {{ a.actorLabel || 'Administrador' }} · Asignación o incidencia actualizada</li></ul>
          </template>
          <UButton type="submit" label="Guardar" :loading="saving" />
        </UForm>
      </template>
    </UModal>
  </div>
</template>
