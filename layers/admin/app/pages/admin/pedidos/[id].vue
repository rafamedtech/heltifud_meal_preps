<script setup lang="ts">
import { orderUpdateInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type {
  DeliverySequence,
  DeliveryStatusValue,
  ComponentRoleValue,
  DishConflict,
  ExclusionKindValue,
  MenuChangeKindValue,
  Order,
  OrderMenuComponentData,
  OrderMenuComponentInput,
  OrderMenuOption,
  OrderMenuSlotInput,
  OrderPersonalization,
  OrderStatusValue,
  OrderUpdateInput
} from "~~/layers/menu/shared/types/types"
import { DELIVERY_SEQUENCE_LABELS, orderFolioLabel } from "~~/layers/menu/shared/utils/orderDeliveries"
import { orderPlaceKey, roleFamily } from "~~/layers/menu/shared/utils/orderPersonalization"

import { ORDER_ACTION_LABELS, DELIVERY_ACTION_LABELS, ORDER_TRANSITIONS, DELIVERY_TRANSITIONS, ORDER_STATUS_LABELS, DELIVERY_STATUS_LABELS, isClosedOrder } from "~~/layers/menu/shared/utils/orderWorkflow"

definePageMeta({ layout: "admin" })

const route = useRoute()
const id = String(route.params.id)
const [{ data: order, status, error, refresh }, { data: personalization, error: personalizationError, refresh: refreshPersonalization }] = await Promise.all([
  useFetch<Order>(`/api/orders/${id}`),
  useFetch<OrderPersonalization>(`/api/orders/${id}/personalization`)
])
const notFound = computed(() => error.value?.statusCode === 404)

useSeoMeta({
  title: computed(() => order.value ? `Pedido ${orderFolioLabel(order.value.folio)} · ${order.value.customerName} | Heltifud` : "Pedido | Heltifud"),
  robots: "noindex, nofollow"
})

const toast = useToast()
const { updateOrder, transitionOrder, transitionDelivery } = useOrders()
const saving = ref(false)
const revokeLinkOpen = ref(false)
async function revokePrivateLink() {
  try {
    await $fetch(`/api/orders/${id}/private-link`, { method: 'DELETE' })
    revokeLinkOpen.value = false
    toast.add({ title: 'Enlace privado revocado', color: 'success', icon: 'i-lucide-circle-check' })
  } catch { toast.add({ title: 'No pudimos revocar el enlace', color: 'error', icon: 'i-lucide-circle-alert' }) }
}
const replacementSelections = reactive<Record<string, string>>({})

// Each place keeps its role and position; `view` is the dish shown, the ids say where it comes from.
interface EditableComponent extends OrderMenuComponentInput { view: OrderMenuComponentData }
interface EditableSlot extends Omit<OrderMenuSlotInput, "components"> { components: EditableComponent[] }
interface EditableState extends Omit<OrderUpdateInput, "menuSlots"> { menuSlots: EditableSlot[] }

function editableState(source?: Order | null): EditableState {
  return {
    version: source?.version ?? 1,
    // Options in the editor belong to this menu version; the server rejects an older one.
    offerVersion: personalization.value?.menu?.version ?? source?.offerVersion ?? 1,
    deliveries: source?.deliveries.map(({ sequence, scheduledDate, locationNumber }) => ({ sequence, scheduledDate, locationNumber })) ?? [],
    notes: source?.notes ?? "",
    menuSlots: source?.menuSlots.map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      dayOrder: slot.dayOrder,
      slotType: slot.slotType,
      contenedor: slot.contenedor,
      components: slot.components.map(({ id: componentId, ...component }) => ({
        componentRole: component.componentRole,
        position: component.position,
        orderComponentId: componentId,
        view: { ...component }
      }))
    })) ?? []
  }
}

const state = reactive<EditableState>(editableState(order.value))

// Fill the form when the order arrives after a failed first load ("Reintentar").
// Refreshes of the same order keep the state as-is so in-progress edits survive.
let syncedOrderId = order.value?.id
watch(order, (value) => {
  if (!value || value.id === syncedOrderId) return
  syncedOrderId = value.id
  Object.assign(state, editableState(value))
})

const statusOptions: Array<{ label: string, value: OrderStatusValue, icon: string }> = [
  { label: "Borrador", value: "DRAFT", icon: "i-lucide-pencil-line" },
  { label: "Confirmado", value: "CONFIRMED", icon: "i-lucide-badge-check" },
  { label: "En preparación", value: "PREPARING", icon: "i-lucide-chef-hat" },
  { label: "Entrega parcial", value: "PARTIALLY_DELIVERED", icon: "i-lucide-truck" },
  { label: "Entregado", value: "DELIVERED", icon: "i-lucide-package-check" },
  { label: "Cancelado", value: "CANCELLED", icon: "i-lucide-ban" }
]
const roleLabels: Record<ComponentRoleValue, string> = {
  PLATILLO_PRINCIPAL: "Principal", GUARNICION_1: "Guarnición", GUARNICION_2: "Guarnición", ADICIONAL: "Adicional"
}
const exclusionColors: Record<ExclusionKindValue, "error" | "warning" | "neutral"> = { ALERGIA: "error", INGREDIENTE: "warning", PLATILLO: "neutral" }
const changeKinds: Record<MenuChangeKindValue, { label: string, icon: string }> = {
  SUSTITUCION: { label: "Sustitución", icon: "i-lucide-replace" },
  RESTAURACION: { label: "Restauración del menú", icon: "i-lucide-undo-2" },
  AUTOMATICA: { label: "Cambio automático por exclusión", icon: "i-lucide-shield-check" }
}
const optionsById = computed(() => new Map((personalization.value?.options ?? []).map(option => [option.id, option])))
const canSwap = computed(() => canEdit.value && Boolean(personalization.value?.menu))

function placeKey(slot: EditableSlot, component: EditableComponent) {
  return orderPlaceKey({ dayOfWeek: slot.dayOfWeek, slotType: slot.slotType, componentRole: component.componentRole, position: component.position })
}
function originalOption(slot: EditableSlot, component: EditableComponent) {
  const optionId = personalization.value?.originals[placeKey(slot, component)]
  return optionId ? optionsById.value.get(optionId) : undefined
}
function conflictOf(component: EditableComponent): DishConflict {
  if (component.menuComponentId) return optionsById.value.get(component.menuComponentId)?.conflict ?? { status: "ok" }
  return personalization.value?.componentConflicts[component.orderComponentId!] ?? { status: "ok" }
}
const unverifiedCount = computed(() => state.menuSlots.reduce((total, slot) => total + slot.components.filter(component => conflictOf(component).status === "unverified").length, 0))
const excludedCount = computed(() => state.menuSlots.reduce((total, slot) => total + slot.components.filter(component => conflictOf(component).status === "excluded").length, 0))

// Same family only, closest first; one entry per dish (it may repeat across the week).
function optionItems(slot: EditableSlot, component: EditableComponent) {
  const family = roleFamily(component.componentRole)
  const rank = (option: OrderMenuOption) => (option.slotType === slot.slotType ? 0 : 2) + (option.dayOfWeek === slot.dayOfWeek ? 0 : 1)
  const seen = new Set<string>()
  return (personalization.value?.options ?? [])
    .filter(option => roleFamily(option.componentRole) === family)
    .map((option, index) => ({ option, index }))
    .sort((a, b) => rank(a.option) - rank(b.option) || a.index - b.index)
    .filter(({ option }) => {
      const key = option.catalogItemId ?? option.nombre
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(({ option }) => ({
      label: option.nombre,
      description: option.conflict.status === "excluded"
        ? option.conflict.reasons.join(", ")
        : `${dayLabel(option.dayOfWeek)} · ${slotLabel(option.slotType)} · ${option.calorias} kcal`,
      value: option.id,
      disabled: option.conflict.status === "excluded",
      icon: option.conflict.status === "excluded" ? "i-lucide-ban" : option.conflict.status === "unverified" ? "i-lucide-triangle-alert" : undefined
    }))
}
const locationOptions = computed(() => order.value ? [
  { label: "Ubicación principal", value: 1, description: order.value.customer.ubicacion1 },
  ...((order.value.customer.ubicacion2 || order.value.deliveries.some(delivery => delivery.locationNumber === 2)) ? [{ label: "Ubicación secundaria", value: 2, description: order.value.customer.ubicacion2 }] : [])
] : [])
const dayGroups = computed(() => {
  const groups = new Map<number, { dayOfWeek: string, dayOrder: number, slots: EditableSlot[] }>()
  state.menuSlots.forEach(slot => {
    const group = groups.get(slot.dayOrder) ?? { dayOfWeek: slot.dayOfWeek, dayOrder: slot.dayOrder, slots: [] }
    group.slots.push(slot)
    groups.set(slot.dayOrder, group)
  })
  return [...groups.values()].sort((a, b) => a.dayOrder - b.dayOrder)
})
const currentStatus = computed(() => statusOptions.find(item => item.value === order.value?.status))
const statusColor = computed(() => ({
  DRAFT: "warning", CONFIRMED: "info", PREPARING: "primary", PARTIALLY_DELIVERED: "secondary", DELIVERED: "success", CANCELLED: "error"
} as const)[order.value?.status ?? "DRAFT"])
// Days whose meals travel in each delivery, as saved on the order.
const deliveryDays = computed(() => {
  const days = new Map<number, Map<number, string>>()
  order.value?.menuSlots.forEach(slot => {
    const group = days.get(slot.deliverySequence) ?? new Map<number, string>()
    group.set(slot.dayOrder, slot.dayOfWeek)
    days.set(slot.deliverySequence, group)
  })
  return days
})

function deliveryDaysLabel(sequence: number) {
  const days = [...(deliveryDays.value.get(sequence)?.entries() ?? [])].sort(([a], [b]) => a - b)
  return days.length ? days.map(([, day]) => dayLabel(day)).join(", ") : "Sin comidas asignadas"
}

// The saved address is frozen; it only changes when another location is chosen.
function deliveryAddress(sequence: number, location: number) {
  const saved = order.value?.deliveries.find(delivery => delivery.sequence === sequence)
  return saved && saved.locationNumber === location ? saved.address : locationAddress(location)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Tijuana" }).format(new Date(value))
}

function locationAddress(location: number) {
  if (!order.value) return ""
  return location === 2 ? order.value.customer.ubicacion2 : order.value.customer.ubicacion1
}

function slotLabel(slot: string) {
  return { DESAYUNO: "Desayuno", COMIDA: "Comida", CENA: "Cena", SNACK1: "Colación 1", SNACK2: "Colación 2" }[slot] ?? slot
}

function dayLabel(day: string) {
  return { LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles", JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sábado", DOMINGO: "Domingo" }[day] ?? day
}

function componentKey(slot: EditableSlot, component: EditableComponent) {
  return `${slot.dayOrder}-${slot.slotType}-${component.componentRole}-${component.position}`
}

function swapComponent(slot: EditableSlot, component: EditableComponent, optionId: string | undefined) {
  const option = optionId ? optionsById.value.get(optionId) : undefined
  if (!option || option.conflict.status === "excluded") return
  component.orderComponentId = undefined
  component.menuComponentId = option.id
  component.view = {
    catalogItemId: option.catalogItemId,
    componentRole: component.componentRole,
    position: component.position,
    nombre: option.nombre,
    descripcion: option.descripcion,
    calorias: option.calorias,
    imagen: option.imagen,
    tipo: option.tipo,
    sourceDayOfWeek: option.dayOfWeek,
    sourceSlotType: option.slotType,
    isSubstitution: originalOption(slot, component)?.id !== option.id
  }
  replacementSelections[componentKey(slot, component)] = ""
}

function canRestore(slot: EditableSlot, component: EditableComponent) {
  const original = originalOption(slot, component)
  return Boolean(component.view.isSubstitution && original && original.conflict.status !== "excluded")
}

function payload(): OrderUpdateInput {
  return {
    ...state,
    menuSlots: state.menuSlots.map(slot => ({
      ...slot,
      components: slot.components.map(({ componentRole, position, orderComponentId, menuComponentId }) =>
        orderComponentId ? { componentRole, position, orderComponentId } : { componentRole, position, menuComponentId })
    }))
  }
}

const conflict = ref(false)
const pendingTransition = ref<{ status: OrderStatusValue | DeliveryStatusValue, sequence?: DeliverySequence } | null>(null)
const transitionReason = ref("")
const transitionOpen = computed({ get: () => Boolean(pendingTransition.value), set: value => { if (!value) pendingTransition.value = null } })
const canEdit = computed(() => Boolean(order.value && order.value.cycleStatus === "OPEN" && !isClosedOrder(order.value.status)
  && order.value.deliveries.every(delivery => delivery.status === "PENDING")))
const dirty = computed(() => JSON.stringify(state) !== JSON.stringify(editableState(order.value)))
// Leaving the order (sidebar, links, reload) with unsaved edits asks first.
const { confirmOpen: leaveConfirmOpen, leave: leaveWithoutSaving } = useLeaveGuard(() => canEdit.value && dirty.value)
const orderActions = computed(() => order.value ? ORDER_TRANSITIONS[order.value.status] : [])
const reasonRequired = computed(() => pendingTransition.value?.status === "CANCELLED" || pendingTransition.value?.status === "FAILED" || Boolean(order.value && isClosedOrder(order.value.status)))
const transitionTitle = computed(() => {
  if (!pendingTransition.value) return "Cambiar estado"
  if (pendingTransition.value.sequence) return `${DELIVERY_SEQUENCE_LABELS[pendingTransition.value.sequence]}: ${DELIVERY_STATUS_LABELS[pendingTransition.value.status as DeliveryStatusValue]}`
  return order.value && isClosedOrder(order.value.status) ? "Reabrir pedido" : ORDER_STATUS_LABELS[pendingTransition.value.status as OrderStatusValue]
})
const menuChangeTimeline = computed(() => (order.value?.menuChanges ?? []).map(change => ({
  value: change.id,
  title: `${dayLabel(change.dayOfWeek)} · ${slotLabel(change.slotType)}: ${change.fromNombre} → ${change.toNombre}`,
  description: [changeKinds[change.kind].label, change.actorLabel ?? "Sistema", change.reason].filter(Boolean).join(" · "),
  date: new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Tijuana" }).format(new Date(change.createdAt)),
  icon: changeKinds[change.kind].icon
})))
const timeline = computed(() => (order.value?.statusEvents ?? []).map(event => ({
  value: event.id,
  title: event.deliverySequence
    ? `${DELIVERY_SEQUENCE_LABELS[event.deliverySequence as DeliverySequence]}: ${DELIVERY_STATUS_LABELS[event.fromDeliveryStatus!]} → ${DELIVERY_STATUS_LABELS[event.toDeliveryStatus!]}`
    : event.fromStatus ? `${ORDER_STATUS_LABELS[event.fromStatus]} → ${ORDER_STATUS_LABELS[event.toStatus]}` : ORDER_STATUS_LABELS[event.toStatus],
  description: [event.actorLabel ?? "Sistema", event.reason].filter(Boolean).join(" · "),
  date: new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Tijuana" }).format(new Date(event.createdAt)),
  icon: event.deliverySequence ? "i-lucide-truck" : "i-lucide-history"
})))

function deliveryActions(sequence: number) {
  if (!order.value || !["PREPARING", "PARTIALLY_DELIVERED"].includes(order.value.status)) return []
  const delivery = order.value.deliveries.find(item => item.sequence === sequence)
  return delivery ? DELIVERY_TRANSITIONS[delivery.status] : []
}
function deliveryStatus(sequence: number) {
  return order.value?.deliveries.find(item => item.sequence === sequence)?.status ?? "PENDING"
}
function civilDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))
}
function datesFor(sequence: DeliverySequence) {
  return (order.value?.deliveryDateOptions?.[sequence] ?? []).map(value => ({ value, label: civilDateLabel(value) }))
}
function startTransition(target: OrderStatusValue | DeliveryStatusValue, sequence?: DeliverySequence) {
  transitionReason.value = ""
  pendingTransition.value = { status: target, sequence }
}
// Saved components get new ids, so their conflicts are read again before rebuilding the form.
async function acceptSaved(saved: Order) {
  order.value = saved
  await refreshPersonalization()
  Object.assign(state, editableState(saved))
  conflict.value = false
}
async function reloadOrder() {
  await refresh()
  if (!error.value && order.value) await acceptSaved(order.value)
}
function mutationError(error: unknown) {
  const failure = error as { data?: { statusMessage?: string, data?: { code?: string } } }
  conflict.value = ["ORDER_VERSION_CONFLICT", "OFFER_VERSION_CONFLICT"].includes(failure.data?.data?.code ?? "")
  toast.add({ title: "No se pudo guardar el pedido", description: failure.data?.statusMessage ?? (error instanceof Error ? error.message : "Revisa los cambios."), color: "error", icon: "i-lucide-circle-alert" })
}
async function saveOrder() {
  saving.value = true
  try {
    await acceptSaved(await updateOrder(id, payload()))
    toast.add({ title: "Pedido actualizado", description: "Las entregas y el menú personalizado quedaron guardados.", color: "success", icon: "i-lucide-circle-check" })
  } catch (error) { mutationError(error) } finally { saving.value = false }
}
async function applyTransition() {
  if (!pendingTransition.value || !order.value || dirty.value) return
  saving.value = true
  try {
    const { status: target, sequence } = pendingTransition.value
    const input = { version: state.version, reason: transitionReason.value }
    const saved = sequence
      ? await transitionDelivery(id, sequence, { ...input, status: target as DeliveryStatusValue })
      : await transitionOrder(id, { ...input, status: target as OrderStatusValue })
    await acceptSaved(saved)
    pendingTransition.value = null
    toast.add({ title: "Estado actualizado", description: "El cambio quedó registrado en el historial.", color: "success", icon: "i-lucide-circle-check" })
  } catch (error) { pendingTransition.value = null; mutationError(error) } finally { saving.value = false }
}

</script>

<template>
  <main class="space-y-6">
    <UButton to="/admin/pedidos" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="-ml-3">Volver a pedidos</UButton>

    <UButton v-if="order" color="neutral" variant="outline" icon="i-lucide-key-round" label="Revocar consulta privada" @click="revokeLinkOpen = true" />
    <UModal v-model:open="revokeLinkOpen" title="Revocar enlace privado" description="El cliente dejará de poder consultar este pedido con el enlace actual. El pedido y su historial se conservan.">
      <template #footer>
        <UButton color="neutral" variant="ghost" label="Cancelar" @click="revokeLinkOpen = false" />
        <UButton color="error" label="Revocar enlace" @click="revokePrivateLink" />
      </template>
    </UModal>
    <section v-if="status === 'pending'" role="status" aria-live="polite" class="space-y-5">
      <span class="sr-only">Cargando pedido</span>
      <USkeleton class="h-44" />
      <div class="grid gap-5 lg:grid-cols-2"><USkeleton class="h-64" /><USkeleton class="h-64" /></div>
      <USkeleton class="h-96" />
    </section>

    <UCard v-else-if="error || !order" :ui="{ body: 'py-16 text-center' }">
      <UIcon :name="notFound ? 'i-lucide-package-x' : 'i-lucide-cloud-alert'" class="size-10 text-muted" />
      <h1 class="mt-4 text-xl font-semibold text-highlighted">{{ notFound ? "Pedido no encontrado" : "No fue posible cargar el pedido" }}</h1>
      <p class="mt-2 text-sm text-muted">{{ notFound ? "El registro ya no existe o el enlace es incorrecto." : "Intenta cargar nuevamente la información del pedido." }}</p>
      <UButton v-if="!notFound" class="mt-5" variant="soft" icon="i-lucide-refresh-cw" @click="refresh()">Reintentar</UButton>
    </UCard>

    <UForm v-else :schema="orderUpdateInputSchema" :state="state" :disabled="saving" class="space-y-6" @submit="saveOrder">
      <UPageHeader :title="order.planTitle" :description="`${order.planVariantTitle} · Creado el ${formatDate(order.createdAt)}`">
        <template #headline>
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="outline" icon="i-lucide-hash" :label="`Pedido ${orderFolioLabel(order.folio)}`" />
            <UBadge :color="statusColor" variant="subtle" :icon="currentStatus?.icon" :label="currentStatus?.label" />
            <UBadge v-if="order.capturedAfterCutoff" color="warning" variant="subtle" icon="i-lucide-clock-alert" label="Fuera de corte" />
          </div>
        </template>
        <template #links><UButton type="submit" icon="i-lucide-save" :loading="saving" :disabled="!canEdit || conflict" label="Guardar cambios" /></template>
      </UPageHeader>

      <UAlert v-if="conflict" color="warning" variant="soft" icon="i-lucide-refresh-cw" title="Revisa la versión actual" description="Tus cambios siguen en el formulario. Recargar reemplazará estos cambios por los guardados en el servidor.">
        <template #actions><UButton label="Recargar pedido" color="warning" @click="reloadOrder" /></template>
      </UAlert>
      <UAlert v-if="!canEdit" color="info" variant="soft" icon="i-lucide-lock-keyhole" title="Edición bloqueada" description="El contenido se puede editar con la semana abierta y las entregas pendientes. Los pedidos cerrados requieren una reapertura con motivo." />
      <UAlert v-if="dirty" color="warning" variant="soft" icon="i-lucide-pencil" title="Cambios sin guardar" description="Guarda o descarta los cambios antes de cambiar un estado.">
        <template #actions><UButton label="Descartar cambios" color="neutral" variant="outline" @click="Object.assign(state, editableState(order))" /></template>
      </UAlert>

      <div class="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <UCard>
          <template #header><h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-receipt-text" class="size-5 text-primary" />Resumen</h2></template>
          <dl class="grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt class="text-muted">Cliente</dt>
              <dd class="mt-1 break-words"><ULink :to="`/admin/clientes/${order.customerId}`" class="font-medium text-highlighted hover:text-primary">{{ order.customerName }}</ULink></dd>
            </div>
            <div>
              <dt class="text-muted">Teléfono</dt>
              <dd class="mt-1"><ULink :to="`tel:${order.customerPhone}`" class="font-medium text-highlighted hover:text-primary">{{ order.customerPhone }}</ULink></dd>
            </div>
            <div>
              <dt class="text-muted">Precio</dt>
              <dd class="mt-1 font-medium tabular-nums text-highlighted">{{ transformPrice(order.price) }}</dd>
            </div>
            <div>
              <dt class="text-muted">Menú de origen</dt>
              <dd class="mt-1 break-words" :class="order.sourceWeeklyMenuName ? 'font-medium text-highlighted' : 'text-dimmed'">{{ order.sourceWeeklyMenuName || "No disponible" }}</dd>
            </div>
          </dl>
          <div class="mt-5 space-y-4 border-t border-default pt-5">
            <div class="flex flex-wrap gap-3">
              <UButton v-for="target in orderActions" :key="target" type="button" :label="isClosedOrder(order.status) ? 'Reabrir pedido' : ORDER_ACTION_LABELS[target]" :color="target === 'CANCELLED' ? 'error' : 'neutral'" variant="outline" :disabled="dirty || conflict" @click="startTransition(target)" />
            </div>
            <UFormField label="Notas" name="notes"><UTextarea v-model="state.notes" :disabled="!canEdit" :rows="3" autoresize class="w-full" placeholder="Alergias o instrucciones" /></UFormField>
          </div>
        </UCard>

        <UCard class="flex flex-col" :ui="{ header: 'shrink-0', body: 'flex flex-1 flex-col' }">
          <template #header><h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-truck" class="size-5 text-primary" />Entregas</h2></template>
          <div class="grid flex-1 gap-4 sm:grid-cols-2">
            <UCard v-for="(delivery, deliveryIndex) in state.deliveries" :key="delivery.sequence" class="min-w-0" :ui="{ body: 'space-y-3' }">
              <div class="flex items-center gap-3">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{{ delivery.sequence }}</span>
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-highlighted">{{ DELIVERY_SEQUENCE_LABELS[delivery.sequence] }}</h3>
                  <p class="truncate text-xs text-muted">{{ deliveryDaysLabel(delivery.sequence) }}</p>
                </div>
              </div>
              <UBadge color="neutral" variant="subtle" :label="DELIVERY_STATUS_LABELS[deliveryStatus(delivery.sequence)]" />
              <UFormField label="Fecha" :name="`deliveries.${deliveryIndex}.scheduledDate`"><USelect v-model="delivery.scheduledDate" :items="datesFor(delivery.sequence)" value-key="value" :disabled="!canEdit" class="w-full" /></UFormField>
              <UFormField label="Ubicación" :name="`deliveries.${deliveryIndex}.locationNumber`"><USelect v-model="delivery.locationNumber" :disabled="!canEdit" :items="locationOptions" value-key="value" class="w-full" /></UFormField>
              <p class="whitespace-pre-line break-words text-sm leading-relaxed" :class="deliveryAddress(delivery.sequence, delivery.locationNumber) ? 'text-toned' : 'text-dimmed'">
                {{ deliveryAddress(delivery.sequence, delivery.locationNumber) || "Sin dirección registrada" }}
              </p>
              <div class="flex flex-wrap gap-3">
                <UButton v-for="target in deliveryActions(delivery.sequence)" :key="target" type="button" :label="DELIVERY_ACTION_LABELS[target]" color="neutral" variant="outline" :disabled="dirty || conflict" @click="startTransition(target, delivery.sequence)" />
              </div>
            </UCard>
          </div>
        </UCard>
      </div>

      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-utensils" class="size-5 text-primary" />Menú personalizado</h2>
          <UBadge color="neutral" variant="soft">{{ dayGroups.length }} días · {{ state.menuSlots.length }} tiempos</UBadge>
        </div>

        <UAlert v-if="personalizationError" color="warning" variant="soft" icon="i-lucide-cloud-alert" title="No fue posible cargar las opciones del menú" description="Los platillos guardados se muestran, pero no se pueden sustituir hasta cargar las opciones.">
          <template #actions><UButton label="Reintentar" color="neutral" variant="outline" icon="i-lucide-refresh-cw" @click="refreshPersonalization()" /></template>
        </UAlert>
        <template v-else-if="personalization">
          <UAlert v-if="!personalization.menu" color="info" variant="soft" icon="i-lucide-info" title="Sin menú de origen" description="El menú de la semana de este pedido ya no existe. Los platillos guardados se conservan y no se pueden sustituir." />
          <UAlert v-else-if="personalization.menuChanged" color="info" variant="soft" icon="i-lucide-info" title="El menú cambió después de guardar este pedido" description="Los platillos guardados se conservan. Las opciones de sustitución y la restauración usan el menú vigente." />
          <UAlert v-if="excludedCount" color="error" variant="soft" icon="i-lucide-ban" :title="`${excludedCount} ${excludedCount === 1 ? 'platillo no es compatible' : 'platillos no son compatibles'} con las exclusiones del cliente`" description="Sustitúyelos antes de guardar cambios en el pedido." />
          <UAlert v-if="unverifiedCount" color="warning" variant="soft" icon="i-lucide-triangle-alert" :title="`${unverifiedCount} ${unverifiedCount === 1 ? 'platillo sin receta' : 'platillos sin receta'}`" description="El cliente tiene alergias y estos platillos no tienen receta para revisarlas. Confírmalos a mano o sustitúyelos." />
          <div v-if="personalization.exclusions.length" class="flex flex-wrap items-center gap-2 px-1 text-sm">
            <span class="text-muted">Exclusiones del cliente:</span>
            <UBadge v-for="item in personalization.exclusions" :key="item.id" :color="exclusionColors[item.kind]" variant="subtle" :label="item.kind === 'ALERGIA' ? `Alergia: ${item.label}` : item.label" />
            <UButton :to="`/admin/clientes/${order.customerId}`" color="neutral" variant="link" size="xs" label="Editar" trailing-icon="i-lucide-arrow-up-right" />
          </div>
        </template>

        <div class="-mx-1 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-1 pb-3">
          <UCard
            v-for="day in dayGroups"
            :key="day.dayOrder"
            class="w-[min(20rem,calc(100vw-4rem))] shrink-0 snap-start"
            :ui="{ header: 'px-4 py-3 sm:px-4', body: 'p-0 sm:p-0' }"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{{ day.dayOrder }}</span>
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-highlighted">{{ dayLabel(day.dayOfWeek) }}</h3>
                  <p class="text-xs text-muted">Día {{ day.dayOrder }} · {{ day.slots.length }} {{ day.slots.length === 1 ? "tiempo" : "tiempos" }}</p>
                </div>
              </div>
            </template>

            <div class="divide-y divide-default">
              <div v-for="slot in day.slots" :key="slot.slotType" class="space-y-3 p-4">
                <h4 class="text-xs font-semibold uppercase tracking-wide text-muted">{{ slotLabel(slot.slotType) }}</h4>
                <UAlert v-if="order?.menuSlots.find(item => item.dayOfWeek === slot.dayOfWeek && item.slotType === slot.slotType)?.notes" color="info" variant="soft" title="Indicaciones del cliente" :description="order.menuSlots.find(item => item.dayOfWeek === slot.dayOfWeek && item.slotType === slot.slotType)?.notes" />
                <UInput v-model="slot.contenedor" :disabled="!canEdit" variant="soft" icon="i-lucide-package" placeholder="Contenedor" class="w-full" aria-label="Contenedor" />

                <div v-for="component in slot.components" :key="componentKey(slot, component)" class="space-y-2">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-elevated">
                      <NuxtImg v-if="component.view.imagen" :src="component.view.imagen" :alt="component.view.nombre" class="h-full w-full object-cover" />
                      <UIcon v-else name="i-lucide-utensils" class="size-4 text-dimmed" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-highlighted">{{ component.view.nombre }}</p>
                      <p class="truncate text-xs text-muted">{{ roleLabels[component.componentRole] }} · {{ component.view.calorias }} kcal</p>
                    </div>
                    <UTooltip v-if="canRestore(slot, component)" :text="`Restaurar: ${originalOption(slot, component)?.nombre}`">
                      <UButton type="button" size="xs" icon="i-lucide-undo-2" color="neutral" variant="ghost" :disabled="!canSwap" aria-label="Restaurar platillo del menú" @click="swapComponent(slot, component, originalOption(slot, component)?.id)" />
                    </UTooltip>
                  </div>
                  <div v-if="component.view.isSubstitution || conflictOf(component).status !== 'ok'" class="flex flex-wrap gap-1.5">
                    <UBadge v-if="component.view.isSubstitution" color="info" variant="subtle" icon="i-lucide-replace" :label="component.view.sourceDayOfWeek ? `Sustituido · del ${dayLabel(component.view.sourceDayOfWeek).toLowerCase()}` : 'Sustituido'" />
                    <UTooltip v-if="conflictOf(component).status !== 'ok'" :text="(conflictOf(component) as { reasons: string[] }).reasons.join(', ')">
                      <UBadge :color="conflictOf(component).status === 'excluded' ? 'error' : 'warning'" variant="subtle" :icon="conflictOf(component).status === 'excluded' ? 'i-lucide-ban' : 'i-lucide-triangle-alert'" :label="conflictOf(component).status === 'excluded' ? 'Excluido para el cliente' : 'Revisar alergias'" />
                    </UTooltip>
                  </div>
                  <USelectMenu
                    :disabled="!canSwap"
                    :model-value="replacementSelections[componentKey(slot, component)]"
                    :items="optionItems(slot, component)"
                    value-key="value"
                    variant="soft"
                    placeholder="Sustituir por otro del menú..."
                    class="w-full"
                    :aria-label="`Sustituir ${component.view.nombre}`"
                    @update:model-value="swapComponent(slot, component, $event as string | undefined)"
                  />
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </section>
      <UCard v-if="menuChangeTimeline.length">
        <template #header><h2 class="font-semibold text-highlighted">Cambios en el menú</h2></template>
        <UTimeline :items="menuChangeTimeline" />
      </UCard>
      <UCard>
        <template #header><h2 class="font-semibold text-highlighted">Historial de estados</h2></template>
        <UTimeline v-if="timeline.length" :items="timeline" />
        <UEmpty v-else icon="i-lucide-history" title="Sin cambios de estado" />
      </UCard>
    </UForm>
    <UModal v-model:open="transitionOpen" :title="transitionTitle" :description="order && isClosedOrder(order.status) ? 'La reapertura dejará las entregas pendientes y conservará el historial anterior.' : 'El cambio se guardará con tu usuario en el historial del pedido.'" :ui="{ content: 'max-w-md' }">
      <template #body>
        <UFormField label="Motivo" :required="reasonRequired"><UTextarea v-model="transitionReason" :maxlength="1000" class="w-full" /></UFormField>
      </template>
      <template #footer>
        <UButton label="Cancelar" color="neutral" variant="ghost" :disabled="saving" @click="transitionOpen = false" />
        <UButton label="Confirmar cambio" :loading="saving" :disabled="reasonRequired && !transitionReason.trim()" @click="applyTransition" />
      </template>
    </UModal>

    <AdminUnsavedChangesModal v-model:open="leaveConfirmOpen" description="Tienes cambios sin guardar en el pedido. Si sales ahora, se perderán." @leave="leaveWithoutSaving" />
  </main>
</template>
