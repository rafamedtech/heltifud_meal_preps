<script setup lang="ts">
import { customerContactSchema, type CustomerOffer } from '~~/layers/menu/shared/types/customerOrder'
import type { Plan, DayOfWeek, SlotTypeValue, ComponentRoleValue } from '~~/layers/menu/shared/types/types'
import { chosenDaysError, dayOfWeekLabel, planOrderDeliveries } from '~~/layers/menu/shared/utils/orderDeliveries'
import { roleFamily } from '~~/layers/menu/shared/utils/orderPersonalization'
import { CUSTOMER_DRAFT_KEY, readCustomerDraft, type CustomerDraft } from '~~/layers/menu/shared/utils/customerOrderDraft'

useSeoMeta({ title: 'Tu pedido | Heltifud', robots: 'noindex, nofollow', referrer: 'no-referrer' })
const route = useRoute()
const { data: plans, error: plansError, refresh: refreshPlans } = await useFetch<Plan[]>('/api/plans')
const state = reactive<CustomerDraft>({ version: 1, savedAt: 0, variantId: '', menuType: 'ESTANDAR', invitation: '', token: '', key: '',
  menuId: '', offerVersion: 0, offerRevision: '', expectedPrice: 0, days: [], meals: [], contact: { nombre: '', telefono: '', correoElectronico: '' },
  addresses: { 1: '', 2: '' }, deliveryDays: { 1: null, 2: null }, notes: '', pending: null })
const ready = ref(false)
const offer = ref<CustomerOffer | null>(null)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const submitError = ref('')
const restored = ref(false)
const discardOpen = ref(false)
const needsReview = ref(false)
const storageError = ref(false)
const locked = computed(() => saving.value || Boolean(state.pending))
const variants = computed(() => (plans.value ?? []).flatMap(plan => plan.variants.map(variant => ({
  label: `${plan.title} · ${variant.title} · ${transformPrice(variant.price)}`, value: variant.id,
}))))
const dayItems = computed(() => offer.value?.availableDays.map(day => ({ label: dayOfWeekLabel(day), value: day })) ?? [])
const daysError = computed(() => offer.value ? chosenDaysError(state.days, offer.value.availableDays, offer.value.variant.daysCount) : '')
const chosenSlots = computed(() => offer.value?.slots.filter(slot => state.days.includes(slot.dayOfWeek)) ?? [])
const deliveries = computed(() => offer.value ? planOrderDeliveries({ weekStart: offer.value.cycle.weekStart, days: state.days,
  rule: offer.value.cycle, preferred: state.deliveryDays }) : [])
const substitutionCount = computed(() => state.meals.filter(meal => state.days.includes(meal.dayOfWeek)).reduce((sum, meal) => sum + meal.components.filter(c => c.selectedId !== c.originalId).length, 0))
const unverifiedCount = computed(() => state.meals.filter(meal => state.days.includes(meal.dayOfWeek)).flatMap(meal => meal.components)
  .filter(c => offer.value?.options.find(option => option.id === c.selectedId)?.conflict.status === 'unverified').length)
const cutoffLabel = computed(() => offer.value ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Tijuana' }).format(new Date(offer.value.cycle.orderCutoffAt)) : '')
const mealLabel = (slotType: string) => ({ DESAYUNO: 'Desayuno', COMIDA: 'Comida', CENA: 'Cena', SNACK1: 'Snack 1', SNACK2: 'Snack 2' })[slotType] ?? slotType
const roleLabel = (role: ComponentRoleValue) => role === 'PLATILLO_PRINCIPAL' ? 'Platillo principal' : role === 'ADICIONAL' ? 'Adicional' : 'Guarnición'
const mealKey = (day: string, slot: string) => `${day}:${slot}`
function mealState(day: DayOfWeek, slot: SlotTypeValue) {
  return state.meals.find(meal => meal.dayOfWeek === day && meal.slotType === slot)!
}
function optionsFor(role: ComponentRoleValue) {
  return (offer.value?.options ?? []).filter(option => roleFamily(option.componentRole) === roleFamily(role)).map(option => ({
    label: option.nombre, value: option.id, disabled: option.conflict.status === 'excluded',
    description: `${dayOfWeekLabel(option.dayOfWeek)} · ${mealLabel(option.slotType)} · ${option.calorias} kcal${option.conflict.status !== 'ok' ? ` · ${option.conflict.reasons.join(', ')}` : ''}`,
  }))
}
function persist() {
  if (!ready.value) return
  try { localStorage.setItem(CUSTOMER_DRAFT_KEY, JSON.stringify({ ...state, savedAt: Date.now() })); storageError.value = false }
  catch { storageError.value = true }
}
let request = 0
async function loadOffer() {
  if (!ready.value || !state.variantId || state.pending) return
  const current = ++request
  loading.value = true; loadError.value = ''; offer.value = null
  try {
    const result = await $fetch<CustomerOffer>('/api/customer-order/offer', { query: { variantId: state.variantId, type: state.menuType },
      headers: state.invitation ? { 'x-customer-invitation': state.invitation } : {} })
    if (current !== request) return
    const different = Boolean(state.menuId && (state.menuId !== result.menu.id || state.offerVersion !== result.menu.version || state.expectedPrice !== result.variant.price || state.offerRevision !== result.revision))
    needsReview.value = different
    offer.value = result
    state.menuId = result.menu.id; state.offerVersion = result.menu.version; state.offerRevision = result.revision; state.expectedPrice = result.variant.price
    if (result.contact && !state.contact.nombre) state.contact = { ...result.contact }
    state.days = state.days.filter(day => result.availableDays.includes(day))
    if (!state.days.length && !different) state.days = result.availableDays.slice(0, result.variant.daysCount)
    state.meals = result.slots.map(slot => {
      const saved = state.meals.find(meal => meal.dayOfWeek === slot.dayOfWeek && meal.slotType === slot.slotType)
      return { dayOfWeek: slot.dayOfWeek, slotType: slot.slotType, notes: saved?.notes ?? '',
        components: slot.components.map(component => {
          const previous = saved?.components.find(c => c.originalId === component.originalId)
          const option = result.options.find(o => o.id === previous?.selectedId)
          return { originalId: component.originalId, selectedId: option && option.conflict.status !== 'excluded' && roleFamily(option.componentRole) === roleFamily(component.componentRole) ? option.id : component.selectedId }
        }) }
    })
  } catch (error) {
    if (current === request) loadError.value = (error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'No pudimos cargar el menú. Reintenta.'
  } finally { if (current === request) loading.value = false }
}
function resetOriginals() {
  offer.value?.slots.forEach(slot => {
    const meal = mealState(slot.dayOfWeek, slot.slotType)
    meal.components = slot.components.map(c => ({ originalId: c.originalId, selectedId: c.selectedId }))
  })
}
async function showConfirmation() {
  await navigateTo(`/pedido/confirmacion#pedido=${state.token}`)
}
async function send() {
  if (!state.pending) return
  saving.value = true; submitError.value = ''
  // Save the exact payload and secret before the request, including on retries.
  persist()
  try {
    await $fetch('/api/customer-order', { method: 'POST', query: { type: state.menuType }, body: state.pending,
      headers: { 'idempotency-key': state.key, 'x-order-token': state.token, ...(state.invitation ? { 'x-customer-invitation': state.invitation } : {}) } })
    try { localStorage.removeItem(CUSTOMER_DRAFT_KEY) } catch { /* The private link remains available. */ }
    await showConfirmation()
  } catch (error) {
    const e = error as { status?: number; statusCode?: number; data?: { statusMessage?: string } }
    const code = e.statusCode ?? e.status ?? 0
    submitError.value = e.data?.statusMessage ?? 'No pudimos confirmar la respuesta. Reintenta este mismo envío; tu pedido no se duplicará.'
    if (code >= 400 && code < 500) { state.pending = null; persist() }
  } finally { saving.value = false }
}
async function submit() {
  if (!offer.value || daysError.value || needsReview.value) return
  state.pending = { menuId: offer.value.menu.id, planVariantId: state.variantId, offerVersion: offer.value.menu.version, offerRevision: offer.value.revision,
    expectedPrice: offer.value.variant.price, contact: { ...state.contact }, days: [...state.days],
    meals: state.meals.filter(meal => state.days.includes(meal.dayOfWeek)).map(meal => ({ ...meal, slotType: meal.slotType as SlotTypeValue, components: meal.components.map(c => ({ ...c })) })),
    deliveries: deliveries.value.map(d => ({ sequence: d.sequence, deliveryDay: d.deliveryDay, address: state.addresses[d.sequence] })), notes: state.notes }
  await send()
}
async function recoverPending() {
  try { await $fetch('/api/customer-order/private', { headers: { 'x-order-token': state.token } }); await showConfirmation() }
  catch { submitError.value = 'Hay un envío pendiente. Reintenta para recibir su confirmación sin duplicarlo.' }
}
function discardDraft() {
  state.contact = { nombre: '', telefono: '', correoElectronico: '' }
  state.addresses = { 1: '', 2: '' }; state.days = []; state.meals = []; state.notes = ''
  state.deliveryDays = { 1: null, 2: null }; state.menuId = ''; state.offerVersion = 0
  state.invitation = ''; restored.value = false; discardOpen.value = false
  freshDraft(); void loadOffer()
}
function freshDraft() {
  state.key = crypto.randomUUID()
  state.token = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('')
}
onMounted(async () => {
  let draft: CustomerDraft | null = null
  try { draft = readCustomerDraft(localStorage.getItem(CUSTOMER_DRAFT_KEY)) } catch { storageError.value = true }
  const invitation = new URLSearchParams(location.hash.slice(1)).get('invitacion')
  if (draft && (!invitation || invitation === draft.invitation)) { Object.assign(state, draft); restored.value = true }
  else freshDraft()
  if (invitation) state.invitation = invitation
  if (invitation) history.replaceState(null, '', `${location.pathname}${location.search}`)
  if (!state.pending && typeof route.query.variante === 'string' && variants.value.some(v => v.value === route.query.variante)) state.variantId = route.query.variante
  if (!state.variantId) state.variantId = typeof route.query.variante === 'string' && variants.value.some(v => v.value === route.query.variante)
    ? route.query.variante : variants.value.find(v => (plans.value ?? []).find(p => p.id === route.query.plan)?.variants.some(x => x.id === v.value))?.value ?? variants.value[0]?.value ?? ''
  ready.value = true
  if (state.pending) await recoverPending()
  else await loadOffer()
})
watch(() => [state.variantId, state.menuType], () => { if (ready.value) void loadOffer() })
watch(state, persist, { deep: true })
</script>

<template>
  <main class="mx-auto w-full max-w-5xl space-y-6 py-6">
    <UPageHeader title="Tu semana, a tu gusto" description="Elige tu plan, acomoda tus comidas y dinos dónde entregarlas. Heltifud revisará tu pedido antes de confirmarlo." />
    <UButton v-if="ready && !state.pending" color="neutral" variant="ghost" size="sm" icon="i-lucide-trash-2" label="Borrar borrador de este dispositivo" @click="discardOpen = true" />
    <UModal v-model:open="discardOpen" title="Borrar borrador" description="Se borrarán la selección y los datos de contacto guardados en este dispositivo.">
      <template #footer><UButton color="neutral" variant="ghost" label="Conservar" @click="discardOpen = false" /><UButton color="error" label="Borrar borrador" @click="discardDraft" /></template>
    </UModal>
    <UAlert v-if="restored" color="info" variant="soft" icon="i-lucide-book-open" title="Recuperamos tu borrador" description="Revisa tu selección y la disponibilidad de esta semana antes de enviarlo." />
    <UAlert v-if="storageError" color="warning" variant="soft" title="No pudimos guardar el borrador" description="Mantén esta pestaña abierta hasta recibir la confirmación." />
    <UAlert v-if="submitError" color="warning" variant="soft" icon="i-lucide-circle-alert" :title="submitError">
      <template v-if="!state.pending" #actions><UButton color="neutral" variant="outline" label="Actualizar oferta" @click="loadOffer" /></template>
    </UAlert>
    <UPageCard v-if="state.pending" title="Tu envío está pendiente de respuesta" description="Conservamos los datos exactos del envío para que puedas reintentarlo sin crear otro pedido.">
      <UButton :loading="saving" icon="i-lucide-refresh-cw" label="Reintentar envío" @click="send" />
      <UButton color="neutral" variant="outline" label="Consultar si ya se recibió" @click="recoverPending" />
    </UPageCard>
    <template v-else>
      <UEmpty v-if="plansError" icon="i-lucide-cloud-alert" title="No pudimos cargar los planes">
        <template #actions><UButton color="neutral" variant="outline" label="Reintentar" @click="refreshPlans()" /></template>
      </UEmpty>
      <UPageCard v-else title="1. Elige tu plan" description="Las sustituciones incluidas conservan el precio del plan.">
        <div class="grid gap-5 md:grid-cols-2">
          <UFormField label="Plan y variante" name="variantId"><USelect v-model="state.variantId" :items="variants" class="w-full" :disabled="locked" /></UFormField>
          <UFormField v-if="!state.invitation" label="Menú" name="menuType"><USelect v-model="state.menuType" :items="[{ label: 'Estándar', value: 'ESTANDAR' }, { label: 'Vegetariano', value: 'VEGETARIANO' }]" class="w-full" :disabled="locked" /></UFormField>
        </div>
      </UPageCard>
      <UEmpty v-if="loading || !ready" loading title="Buscando el menú de tu semana" />
      <UEmpty v-else-if="loadError || !offer" icon="i-lucide-calendar-x" title="Esta oferta no está disponible" :description="loadError || 'Selecciona un plan para ver las comidas disponibles.'">
        <template #actions><UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Revisar disponibilidad" @click="loadOffer" /></template>
      </UEmpty>
      <template v-else>
        <UAlert v-if="needsReview" color="warning" variant="soft" title="La oferta cambió desde tu borrador" description="Actualizamos los platillos que ya no estaban disponibles. Revisa comidas, entregas y precio antes de continuar.">
          <template #actions><UButton color="neutral" variant="outline" label="Ya revisé la oferta actual" @click="needsReview = false" /></template>
        </UAlert>
        <UPageCard title="2. Tus días y comidas" :description="`${offer.menu.name} · ${offer.variant.daysCount} días · ${offer.variant.slotTypes.length} ${offer.variant.slotTypes.length === 1 ? 'tiempo' : 'tiempos'} por día. Pedidos hasta ${cutoffLabel} (Tijuana).`">
          <UFormField label="Días del plan" name="days" :error="daysError || undefined">
            <UCheckboxGroup v-model="state.days" :items="dayItems" variant="card" orientation="horizontal" :max="offer.variant.daysCount" :disabled="locked" />
          </UFormField>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-muted">{{ substitutionCount }} sustituciones · Puedes repetir tus platillos favoritos.</p>
            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-rotate-ccw" label="Restaurar menú compatible" :disabled="locked" @click="resetOriginals" />
          </div>
          <UAlert v-if="unverifiedCount" color="warning" variant="soft" title="Hay platillos por revisar por alergias" description="Algunos no tienen receta registrada. Escribe tus indicaciones y solicita la revisión de Heltifud antes de confirmar." />
          <UPageCard v-for="slot in chosenSlots" :key="mealKey(slot.dayOfWeek, slot.slotType)" variant="subtle" :title="`${dayOfWeekLabel(slot.dayOfWeek)} · ${mealLabel(slot.slotType)}`">
            <div class="grid gap-5 md:grid-cols-2">
              <UFormField v-for="(component, index) in slot.components" :key="component.originalId" :label="roleLabel(component.componentRole)" :name="component.originalId">
                <USelectMenu v-model="mealState(slot.dayOfWeek, slot.slotType).components[index]!.selectedId" :items="optionsFor(component.componentRole)" value-key="value" :disabled="locked" class="w-full" :search-input="{ placeholder: 'Buscar platillo' }" />
              </UFormField>
              <UFormField label="Notas para esta comida" :name="`notes-${mealKey(slot.dayOfWeek, slot.slotType)}`" hint="Opcional" class="md:col-span-2">
                <UTextarea v-model="mealState(slot.dayOfWeek, slot.slotType).notes" :disabled="locked" :maxlength="500" :rows="2" autoresize class="w-full" placeholder="Por ejemplo: salsa aparte" />
              </UFormField>
            </div>
          </UPageCard>
        </UPageCard>
        <UForm :schema="customerContactSchema" :state="state.contact" class="space-y-6" @submit="submit">
          <UPageCard title="3. Contacto y entregas" description="Usaremos estos datos para revisar y coordinar tu pedido.">
            <div class="grid gap-5 md:grid-cols-2">
              <UFormField label="Nombre" name="nombre" required><UInput v-model="state.contact.nombre" autocomplete="name" :disabled="locked" class="w-full" :maxlength="160" /></UFormField>
              <UFormField label="Teléfono de WhatsApp" name="telefono" required><UInput v-model="state.contact.telefono" autocomplete="tel" type="tel" :disabled="locked" class="w-full" :maxlength="24" /></UFormField>
              <UFormField label="Correo electrónico" name="correoElectronico" hint="Opcional" class="md:col-span-2"><UInput v-model="state.contact.correoElectronico" autocomplete="email" type="email" :disabled="locked" class="w-full" /></UFormField>
            </div>
            <UPageCard v-for="delivery in deliveries" :key="delivery.sequence" variant="subtle" :title="`Entrega ${delivery.sequence} · ${formatDate(delivery.scheduledDate)}`" :description="`Comidas de ${delivery.mealDays.map(dayOfWeekLabel).join(', ')}`">
              <UFormField label="Día de entrega" :name="`deliveryDay-${delivery.sequence}`"><USelect :model-value="state.deliveryDays[delivery.sequence] ?? undefined" :items="delivery.allowedDays.map(day => ({ label: dayOfWeekLabel(day), value: day }))" :placeholder="dayOfWeekLabel(delivery.deliveryDay)" :disabled="locked" class="w-full" @update:model-value="state.deliveryDays[delivery.sequence] = $event ?? null" /></UFormField>
              <UFormField label="Dirección completa e indicaciones" :name="`address-${delivery.sequence}`" required><UTextarea v-model="state.addresses[delivery.sequence]" autocomplete="street-address" :disabled="locked" required :minlength="8" :maxlength="1000" :rows="2" autoresize class="w-full" /></UFormField>
            </UPageCard>
            <UFormField label="Notas generales" name="orderNotes" hint="Opcional"><UTextarea v-model="state.notes" :disabled="locked" :maxlength="1000" autoresize class="w-full" placeholder="Alergias u otras indicaciones para revisar con Heltifud" /></UFormField>
          </UPageCard>
          <UPageCard title="4. Revisa y envía" :description="`${offer.variant.planTitle} · ${offer.variant.title}`">
            <dl class="grid gap-4 sm:grid-cols-3">
              <div><dt class="text-sm text-muted">Comidas</dt><dd class="font-medium text-highlighted">{{ chosenSlots.length }} tiempos · {{ state.days.length }} días</dd></div>
              <div><dt class="text-sm text-muted">Entregas</dt><dd class="font-medium text-highlighted">{{ deliveries.length }}</dd></div>
              <div><dt class="text-sm text-muted">Total del plan</dt><dd class="text-2xl font-semibold tabular-nums text-highlighted">{{ transformPrice(offer.variant.price) }}</dd></div>
            </dl>
            <p class="text-sm text-muted">El envío registra tu solicitud. Heltifud confirmará disponibilidad, cobertura de entrega y forma de pago por WhatsApp antes de preparar el pedido.</p>
            <p class="text-sm text-muted">Tu borrador, incluidos contacto y direcciones, se guarda en este dispositivo durante 7 días. El enlace privado de consulta vence a los 90 días.</p>
            <UButton type="submit" icon="i-lucide-send" label="Enviar pedido a Heltifud" :loading="saving" :disabled="locked || Boolean(daysError) || needsReview || deliveries.some(d => state.addresses[d.sequence].trim().length < 8)" class="w-full sm:w-fit" />
          </UPageCard>
        </UForm>
      </template>
    </template>
  </main>
</template>
