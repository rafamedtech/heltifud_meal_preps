<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Account, AccountsResponse, PaymentDetail, PaymentInput } from '~~/layers/menu/shared/types/operations'
import { paymentInputSchema, paymentMethods } from '~~/layers/menu/shared/types/operations'
import { ORDER_STATUS_LABELS } from '~~/layers/menu/shared/utils/orderWorkflow'
import type { OrderStatusValue } from '~~/layers/menu/shared/types/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Cobros y saldos | Heltifud', robots: 'noindex, nofollow' })
const toast = useToast()
const route = useRoute()
const page = ref(1)
const search = ref('')
const submittedSearch = ref('')
const view = ref('all')
watch([submittedSearch, view], () => { page.value = 1 })
const { data, status, error, refresh } = await useFetch<AccountsResponse>('/api/operations/accounts', { query: { page, search: submittedSearch, view }, lazy: true })
const selected = ref<PaymentDetail | null>(null)
const open = ref(false)
const loadingDetail = ref(false)
const saving = ref(false)
const detailError = ref('')
const state = reactive<PaymentInput>({ kind: 'PAYMENT', amount: 0, method: 'TRANSFER', reference: '', reason: '', receivedAt: '', idempotencyKey: '' })
const columns: TableColumn<Account>[] = [
  { accessorKey: 'folio', header: 'Pedido' }, { accessorKey: 'customerName', header: 'Cliente' }, { accessorKey: 'status', header: 'Estado' },
  { accessorKey: 'total', header: 'Total' }, { accessorKey: 'paid', header: 'Cobrado neto' }, { accessorKey: 'balance', header: 'Saldo' }, { accessorKey: 'refundable', header: 'Por devolver' }, { id: 'actions', header: 'Movimientos' }
]
async function show(id: string) {
  selected.value = null; open.value = true; loadingDetail.value = true; detailError.value = ''
  try {
    selected.value = await $fetch<PaymentDetail>(`/api/operations/accounts/${id}`)
    Object.assign(state, { kind: selected.value.account.refundable > 0 ? 'REFUND' : 'PAYMENT', amount: selected.value.account.balance || selected.value.account.refundable, method: 'TRANSFER', reference: '', reason: '', receivedAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana' }).format(new Date()), idempotencyKey: crypto.randomUUID() })
  } catch (e) { detailError.value = message(e) } finally { loadingDetail.value = false }
}
// Paying with store credit is limited by both the balance and the customer's credit.
const maxAmount = computed(() => {
  if (!selected.value) return 0
  const { balance, paid } = selected.value.account
  if (state.kind === 'REFUND') return paid
  return state.method === 'CREDIT' ? Math.min(balance, selected.value.customerCredit) : balance
})
const methodItems = computed(() => paymentMethods.map(method => ({
  ...method,
  disabled: method.value === 'CREDIT' && state.kind === 'PAYMENT' && (selected.value?.customerCredit ?? 0) <= 0
})))
const methodHint = computed(() => state.method !== 'CREDIT' ? undefined
  : state.kind === 'REFUND' ? 'La devolución queda como saldo a favor del cliente para otro pedido.'
  : 'Se descuenta del saldo a favor del cliente.')
function message(e: unknown) { return (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'No fue posible completar la operación.' }
async function save() {
  if (!selected.value || saving.value) return
  saving.value = true
  try {
    selected.value = await $fetch<PaymentDetail>(`/api/operations/accounts/${selected.value.account.id}`, { method: 'POST', body: { ...state } })
    state.idempotencyKey = crypto.randomUUID(); state.amount = 0; state.reason = ''; state.reference = ''
    toast.add({ title: 'Movimiento registrado', color: 'success' }); await refresh()
  } catch (e) { toast.add({ title: 'No se registró el movimiento', description: message(e), color: 'error' }) }
  finally { saving.value = false }
}
onMounted(() => { if (typeof route.query.pedido === 'string') show(route.query.pedido) })
</script>

<template>
  <div class="space-y-6">
    <UPageGrid>
      <UPageCard v-for="item in [{ label: 'Saldo por cobrar', value: data?.summary.balance }, { label: 'Cobrado neto', value: data?.summary.paid }, { label: 'Por devolver', value: data?.summary.refundable }]" :key="item.label" :title="item.label" variant="outline">
        <p class="text-2xl font-semibold tabular-nums text-highlighted">{{ error ? 'No disponible' : item.value === undefined ? '—' : transformPrice(item.value) }}</p>
      </UPageCard>
    </UPageGrid>
    <UAlert title="Cobros manuales" description="Los movimientos no se editan ni se borran. Registra una devolución para corregir un abono. Los totales corresponden al filtro actual." icon="i-lucide-info" color="info" variant="soft" />
    <form class="flex flex-wrap gap-3" @submit.prevent="submittedSearch = search.trim()">
      <UInput v-model="search" placeholder="Cliente o folio" aria-label="Buscar cobros" icon="i-lucide-search" />
      <UButton type="submit" color="neutral" variant="outline" label="Buscar" />
      <USelect v-model="view" :items="[{ label: 'Todos', value: 'all' }, { label: 'Con saldo', value: 'balance' }, { label: 'Por devolver', value: 'refund' }]" aria-label="Filtrar cuentas" />
    </form>
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UEmpty v-if="error" title="No fue posible cargar los cobros" icon="i-lucide-cloud-alert"><template #actions><UButton label="Reintentar" @click="refresh()" /></template></UEmpty>
      <UTable v-else :data="data?.items ?? []" :columns="columns" :loading="status === 'pending'">
        <template #folio-cell="{ row }"><ULink :to="`/admin/pedidos/${row.original.id}`">#{{ row.original.folio }}</ULink></template>
        <template #status-cell="{ row }">{{ ORDER_STATUS_LABELS[row.original.status as OrderStatusValue] }}</template>
        <template #total-cell="{ row }">{{ transformPrice(row.original.total) }}</template>
        <template #paid-cell="{ row }">{{ transformPrice(row.original.paid) }}</template>
        <template #balance-cell="{ row }">{{ transformPrice(row.original.balance) }}</template>
        <template #refundable-cell="{ row }">{{ transformPrice(row.original.refundable) }}</template>
        <template #actions-cell="{ row }"><UButton size="sm" color="neutral" variant="outline" label="Ver / registrar" @click="show(row.original.id)" /></template>
        <template #empty>No hay cuentas que coincidan con el filtro.</template>
      </UTable>
      <template #footer><UPagination v-model:page="page" :total="data?.total ?? 0" :items-per-page="50" /></template>
    </UCard>
    <UModal v-model:open="open" :dismissible="!saving" title="Movimientos del pedido" description="Abonos y devoluciones con fecha, motivo y responsable.">
      <template #body>
        <USkeleton v-if="loadingDetail" class="h-40" />
        <UAlert v-else-if="detailError" :description="detailError" title="No se pudo abrir la cuenta" color="error" />
        <div v-else-if="selected" class="space-y-5">
          <p class="font-medium text-highlighted">#{{ selected.account.folio }} · {{ selected.account.customerName }}</p>
          <p>Saldo: {{ transformPrice(selected.account.balance) }} · Cobrado neto: {{ transformPrice(selected.account.paid) }} · Por devolver: {{ transformPrice(selected.account.refundable) }}</p>
          <p class="text-sm text-muted">Saldo a favor del cliente: {{ transformPrice(selected.customerCredit) }}</p>
          <UForm :schema="paymentInputSchema" :state="state" class="space-y-4" @submit="save">
            <UFormField label="Movimiento" name="kind"><USelect v-model="state.kind" :items="[{ label: 'Abono', value: 'PAYMENT' }, { label: 'Devolución', value: 'REFUND' }]" class="w-full" :disabled="saving" /></UFormField>
            <UFormField label="Importe (MXN)" name="amount" required><UInputNumber v-model="state.amount" :min="0" :step="0.01" :max="maxAmount" class="w-full" :disabled="saving" /></UFormField>
            <UFormField label="Medio" name="method" :description="methodHint"><USelect v-model="state.method" :items="methodItems" class="w-full" :disabled="saving" /></UFormField>
            <UFormField label="Fecha" name="receivedAt"><CalendarInput v-model="state.receivedAt" label="Fecha de recepción" :disabled="saving" /></UFormField>
            <UFormField label="Referencia" name="reference"><UInput v-model="state.reference" :maxlength="200" class="w-full" :disabled="saving" /></UFormField>
            <UFormField label="Motivo" name="reason" required><UTextarea v-model="state.reason" :maxlength="500" class="w-full" :disabled="saving" /></UFormField>
            <UButton type="submit" label="Registrar movimiento" :loading="saving" :disabled="maxAmount <= 0" />
          </UForm>
          <USeparator label="Historial" />
          <UEmpty v-if="!selected.entries.length" title="Sin movimientos" icon="i-lucide-wallet" />
          <ul v-else class="divide-y divide-default">
            <li v-for="entry in selected.entries" :key="entry.id" class="space-y-1 py-3">
              <p class="font-medium">{{ entry.kind === 'PAYMENT' ? 'Abono' : 'Devolución' }} · {{ transformPrice(entry.amount) }} · {{ formatDate(entry.receivedAt) }}</p>
              <p class="text-sm text-muted">{{ paymentMethods.find(m => m.value === entry.method)?.label }} · {{ entry.reference || 'Sin referencia' }} · {{ entry.actorLabel || 'Administrador' }}</p>
              <p class="text-sm">{{ entry.reason }}</p>
            </li>
          </ul>
        </div>
      </template>
    </UModal>
  </div>
</template>
