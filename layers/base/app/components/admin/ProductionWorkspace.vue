<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { WeeklyCycle, ExpenseListResponse } from '~~/layers/menu/shared/types/types'
import type { ProductionRunDto, ProductionGroup, ShoppingListDto, ProductionMeal } from '~~/layers/menu/shared/types/operations'
const props = defineProps<{ shopping?: boolean }>()
// Operations staff cannot read expenses or orders; those links stay admin-only.
const isAdmin = computed(() => useStaffRole().value === 'admin')
const route = useRoute()
const toast = useToast()
const requestFetch = useRequestFetch()
const cycleId = ref(typeof route.query.ciclo === 'string' ? route.query.ciclo : '')
const runId = ref(typeof route.query.version === 'string' ? route.query.version : '')
const generating = ref(false)
const requestKey = ref('')
const edit = ref<ShoppingListDto['items'][number] | null>(null)
const editing = ref(false)
const purchased = ref(false)
const expenseId = ref<string>('')
const expenseSearch = ref('')
const saving = ref(false)
const { data: cycles, error: cyclesError, refresh: refreshCycles } = await useFetch<WeeklyCycle[]>('/api/cycles', { default: () => [] })
const weekFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const cycleItems = computed(() => cycles.value.map(c => ({ label: `Semana del ${weekFormatter.format(new Date(`${c.weekStart}T00:00:00.000Z`))}`, value: c.id })))
if (!cycleId.value) cycleId.value = cycles.value.find(c => ['CLOSED', 'IN_PRODUCTION'].includes(c.status))?.id ?? cycles.value[0]?.id ?? ''
const { data: runs, status, error, refresh } = await useAsyncData(`production-${props.shopping ? 'shopping' : 'kitchen'}`, () => cycleId.value ? requestFetch<ProductionRunDto[]>(`/api/operations/production/${cycleId.value}`) : Promise.resolve([]), { watch: [cycleId], default: () => [] })
watch(cycleId, () => { runId.value = ''; requestKey.value = '' })
const run = computed(() => runs.value.find(r => r.id === runId.value) ?? runs.value[0])
const runItems = computed(() => runs.value.map((r, i) => ({ label: `${i === 0 ? 'Más reciente · ' : ''}${new Date(r.createdAt).toLocaleString('es-MX', { timeZone: 'America/Tijuana' })}`, value: r.id })))
const { data: list, error: shoppingError, refresh: refreshShopping } = await useAsyncData('operations-shopping-list', () => props.shopping && run.value ? requestFetch<ShoppingListDto>(`/api/operations/shopping/${run.value.id}`) : Promise.resolve(null), { watch: [() => run.value?.id] })
const { data: expenses, error: expenseError, refresh: refreshExpenses } = await useFetch<ExpenseListResponse>('/api/expenses', { query: { q: expenseSearch, limit: 100 }, immediate: false })
const expenseItems = computed(() => [{ label: 'Sin gasto vinculado', value: '' }, ...(expenses.value?.items.map(e => ({ label: `${formatDate(e.expenseDate)} · ${e.description} · ${transformPrice(e.amount)}`, value: e.id })) ?? []), ...(edit.value?.expenseId && !expenses.value?.items.some(e => e.id === edit.value?.expenseId) ? [{ label: `Gasto vinculado (${edit.value.expenseId})`, value: edit.value.expenseId }] : [])])
const groupColumns: TableColumn<ProductionGroup>[] = [{ accessorKey: 'date', header: 'Entrega' }, { accessorKey: 'slotType', header: 'Tiempo' }, { accessorKey: 'name', header: 'Platillo' }, { accessorKey: 'role', header: 'Componente' }, { accessorKey: 'portions', header: 'Porciones' }]
const shoppingColumns = computed<TableColumn<ShoppingListDto['items'][number]>[]>(() => [{ accessorKey: 'name', header: 'Ingrediente' }, { accessorKey: 'category', header: 'Categoría' }, { accessorKey: 'quantity', header: 'Cantidad' }, { accessorKey: 'purchased', header: 'Compra' }, ...(isAdmin.value ? [{ id: 'expense', header: 'Gasto' }] : []), { id: 'actions', header: 'Acción' }])
const mealColumns: TableColumn<ProductionMeal>[] = [{ accessorKey: 'folio', header: 'Pedido' }, { accessorKey: 'customer', header: 'Cliente' }, { accessorKey: 'dayOfWeek', header: 'Día de consumo' }, { accessorKey: 'slotType', header: 'Tiempo' }, { id: 'dishes', header: 'Menú guardado' }, { id: 'notes', header: 'Indicaciones' }]
const canGenerate = computed(() => ['CLOSED', 'IN_PRODUCTION', 'COMPLETED'].includes(cycles.value.find(c => c.id === cycleId.value)?.status ?? ''))
function message(e: unknown) { return (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Inténtalo de nuevo.' }
async function generate() {
  if (!cycleId.value || generating.value) return
  generating.value = true
  requestKey.value ||= crypto.randomUUID()
  try {
    runId.value = await $fetch<string>(`/api/operations/production/${cycleId.value}`, { method: 'POST', body: { requestKey: requestKey.value } })
    requestKey.value = ''; await refresh()
    toast.add({ title: 'Producción consolidada', color: 'success' })
  } catch (e) { toast.add({ title: 'No fue posible consolidar', description: message(e), color: 'error' }) } finally { generating.value = false }
}
const productionReady = useState('admin-production-availability', () => false)
onMounted(() => {
  watchEffect(() => { productionReady.value = !props.shopping && canGenerate.value && !generating.value && status.value === 'success' && !cyclesError.value })
})
onUnmounted(() => { productionReady.value = false })
const createRequest = useState('admin-production-create-request', () => 0)
watch(createRequest, () => generate())
async function editItem(item: ShoppingListDto['items'][number]) {
  edit.value = item; purchased.value = item.purchased; expenseId.value = item.expenseId ?? ''; editing.value = true
  if (isAdmin.value) await refreshExpenses()
}
async function saveItem() {
  if (!edit.value || !run.value || !list.value || saving.value) return
  saving.value = true
  try {
    list.value = await $fetch<ShoppingListDto>(`/api/operations/shopping/${run.value.id}/${edit.value.id}`, { method: 'PUT', body: { version: list.value.version, purchased: purchased.value, ...(isAdmin.value ? { expenseId: expenseId.value || null } : {}) } })
    editing.value = false
  } catch (e) { toast.add({ title: 'No se guardó la compra', description: message(e), color: 'error' }); await refreshShopping() } finally { saving.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <UAlert v-if="cyclesError" color="error" title="No se pudieron cargar los ciclos" :actions="[{ label: 'Reintentar', onClick: () => refreshCycles() }]" />
    <div class="flex flex-wrap items-end gap-3">
      <UFormField label="Ciclo"><USelect v-model="cycleId" :items="cycleItems" placeholder="Selecciona semana" :disabled="generating" /></UFormField>
      <UFormField v-if="runs.length" label="Consolidación"><USelect :model-value="run?.id" :items="runItems" :disabled="generating" @update:model-value="runId = String($event)" /></UFormField>
      <UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Actualizar" :loading="status === 'pending'" @click="refresh()" />
      <UButton v-if="run" color="neutral" variant="outline" :to="`/admin/etiquetas?ciclo=${cycleId}&version=${run.id}`" target="_blank" icon="i-lucide-printer" label="Etiquetas" />
      <UButton v-if="run" color="neutral" variant="outline" :to="`${shopping ? '/admin/produccion' : '/admin/compras'}?ciclo=${cycleId}&version=${run.id}`" :label="shopping ? 'Ver producción' : 'Lista de súper'" />
    </div>
    <UAlert v-if="!canGenerate && cycleId" title="Recepción sin cerrar" description="Cierra la recepción de pedidos en Menú antes de consolidar esta semana." color="info" />
    <UEmpty v-if="error" title="No se pudo cargar la producción"><template #actions><UButton label="Reintentar" @click="refresh()" /></template></UEmpty>
    <USkeleton v-else-if="status === 'pending'" class="h-40" />
    <UEmpty v-else-if="!run" title="Sin consolidaciones" description="Selecciona un ciclo cerrado y usa Consolidar producción para guardar las comidas y generar su lista de súper." icon="i-lucide-chef-hat" />
    <template v-else>
      <UAlert v-if="run.stale" color="warning" icon="i-lucide-triangle-alert" title="Esta consolidación tiene cambios pendientes" description="Cambió un pedido, una exclusión o una receta. Revisa y consolida de nuevo antes de producir, comprar o imprimir. Las compras de versiones anteriores se conservan para consulta." />
      <p class="text-sm text-muted">{{ run.snapshot.meals.length }} comidas · {{ new Set(run.snapshot.meals.map(m => m.orderId)).size }} pedidos · Consolidó {{ run.actorLabel || 'Administrador' }}. Una nueva consolidación inicia otra lista de compras; revisa lo ya comprado antes de repetir compras.</p>
      <UCard v-if="run.snapshot.missingRecipes.length" title="Compras por completar" description="Estos platillos no aportan cantidades a la lista de súper. Revisa sus recetas y rendimientos.">
        <ul class="space-y-2"><li v-for="(item, i) in run.snapshot.missingRecipes" :key="i">{{ item.name }} · {{ item.portions }} porciones · {{ item.reason }}</li></ul>
      </UCard>
      <template v-if="shopping">
        <UAlert title="Cantidades de receta" description="La lista suma ingredientes por porción. Solo convierte kg a g y l a ml; otras unidades se mantienen separadas. No descuenta inventario ni incluye merma adicional. Vincular un gasto existente no registra una salida nueva." color="info" />
        <UEmpty v-if="shoppingError" title="No se pudo cargar la lista de súper"><template #actions><UButton label="Reintentar" @click="refreshShopping()" /></template></UEmpty>
        <UCard v-else title="Lista de súper" :ui="{ body: 'p-0 sm:p-0' }">
          <UTable :data="list?.items ?? []" :columns="shoppingColumns">
            <template #quantity-cell="{ row }">{{ row.original.quantity }} {{ row.original.unit }}</template>
            <template #purchased-cell="{ row }"><UBadge :color="row.original.purchased ? 'success' : 'warning'" :label="row.original.purchased ? 'Comprado' : 'Pendiente'" variant="subtle" /></template>
            <template #expense-cell="{ row }">{{ row.original.expenseId ? 'Vinculado' : 'Sin vincular' }}</template>
            <template #actions-cell="{ row }"><UButton size="sm" color="neutral" variant="outline" label="Actualizar compra" @click="editItem(row.original)" /></template>
            <template #empty>No hay cantidades calculables. Revisa las recetas pendientes.</template>
          </UTable>
        </UCard>
      </template>
      <template v-else>
        <UCard title="Producción por entrega y platillo" :ui="{ body: 'p-0 sm:p-0' }"><UTable :data="run.snapshot.groups" :columns="groupColumns"><template #date-cell="{ row }">{{ formatDate(row.original.date) }}</template></UTable></UCard>
        <UCard title="Contenedores"><ul class="space-y-2"><li v-for="(c, i) in run.snapshot.containers" :key="i">{{ formatDate(c.date) }} · {{ c.container }} · {{ c.count }}</li></ul></UCard>
        <UCard title="Detalle de comidas e indicaciones" :ui="{ body: 'p-0 sm:p-0' }">
          <UTable :data="run.snapshot.meals" :columns="mealColumns">
            <template #folio-cell="{ row }"><ULink v-if="isAdmin" :to="`/admin/pedidos/${row.original.orderId}`">#{{ row.original.folio }}</ULink><template v-else>#{{ row.original.folio }}</template></template>
            <template #dishes-cell="{ row }"><ul><li v-for="(c, i) in row.original.components" :key="i">{{ c.name }}{{ c.substitution ? ' (sustitución)' : '' }}</li></ul></template>
            <template #notes-cell="{ row }"><p>{{ [row.original.notes, row.original.orderNotes, ...row.original.exclusions].filter(Boolean).join(' · ') || 'Sin indicaciones' }}</p></template>
          </UTable>
        </UCard>
      </template>
    </template>
    <UModal v-model:open="editing" title="Actualizar compra" :description="isAdmin ? 'Marca la compra y vincula un gasto registrado si corresponde.' : 'Marca si ya se compró este ingrediente.'" :dismissible="!saving">
      <template #body><div class="space-y-4">
        <p>{{ edit?.name }} · {{ edit?.quantity }} {{ edit?.unit }}</p>
        <UCheckbox v-model="purchased" label="Comprado" :disabled="saving" />
        <template v-if="isAdmin">
          <UFormField label="Gasto existente" description="Busca por descripción o proveedor."><USelectMenu v-model="expenseId" v-model:search-term="expenseSearch" :items="expenseItems" value-key="value" :ignore-filter="true" class="w-full" :disabled="saving" /></UFormField>
          <UAlert v-if="expenseError" title="No se pudieron buscar gastos" color="error" />
          <UButton to="/admin/gastos" target="_blank" color="neutral" variant="link" label="Abrir gastos" />
        </template>
      </div></template>
      <template #footer><UButton label="Guardar compra" :loading="saving" @click="saveItem" /></template>
    </UModal>
  </div>
</template>
