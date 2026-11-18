<script setup lang="ts">
import { orderCreateInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type {
  Customer,
  CustomerListResponse,
  CustomerLocationNumber,
  DayOfWeek,
  DeliverySequence,
  OrderCreateInput,
  OrderOptions,
  Plan
} from "~~/layers/menu/shared/types/types"
import {
  DELIVERY_SEQUENCE_LABELS,
  dayOfWeekLabel,
  planOrderDeliveries,
  sortDays
} from "~~/layers/menu/shared/utils/orderDeliveries"

definePageMeta({ layout: "admin" })

useSeoMeta({
  title: "Nuevo pedido | Heltifud Meal Preps",
  description: "Crea un pedido desde el menú de la semana con pedidos abiertos.",
  robots: "noindex, nofollow"
})

const CUSTOMER_PAGE_SIZE = 20

const [
  { data: customerResponse, status: customerStatus, error: customerError, refresh: refreshCustomers },
  { data: plans, status: planStatus, error: planError, refresh: refreshPlans }
] = await Promise.all([
  useFetch<CustomerListResponse>("/api/customers", { query: { limit: CUSTOMER_PAGE_SIZE }, default: () => ({ items: [], nextCursor: null }) }),
  useFetch<Plan[]>("/api/plans", { default: () => [] })
])

const toast = useToast()
const { createOrder, getOrderOptions } = useOrders()
const { getCustomers } = useCustomers()
const saving = ref(false)
const state = reactive({
  customerId: "",
  planVariantId: "",
  days: [] as DayOfWeek[],
  notes: ""
})
// Per-order choices; an empty day means "use the customer's preference".
const deliveryChoices = reactive<Record<DeliverySequence, { deliveryDay: DayOfWeek | null, locationNumber: CustomerLocationNumber }>>({
  1: { deliveryDay: null, locationNumber: 1 },
  2: { deliveryDay: null, locationNumber: 1 }
})

// Customers are searched on the server, so any of them can be chosen, not only the first page.
interface CustomerOption { label: string, description: string, value: string, customer: Customer }

const customerSearch = ref("")
const customerResults = ref<Customer[] | null>(null)
const customerSearchLoading = ref(false)
const customerSearchError = ref(false)
const selectedCustomerOption = ref<CustomerOption>()
let customerSearchTimer: ReturnType<typeof setTimeout> | undefined
let customerSearchRequest = 0

const customerOptions = computed<CustomerOption[]>(() => (customerResults.value ?? customerResponse.value.items).map(customer => ({
  label: customer.nombre,
  description: customer.telefono,
  value: customer.id,
  customer
})))

async function searchCustomers(term: string) {
  const request = ++customerSearchRequest
  customerSearchError.value = false
  if (!term) {
    customerResults.value = null
    customerSearchLoading.value = false
    return
  }
  customerSearchLoading.value = true
  try {
    const result = await getCustomers({ q: term, limit: CUSTOMER_PAGE_SIZE })
    if (request === customerSearchRequest) customerResults.value = result.items
  } catch {
    if (request !== customerSearchRequest) return
    customerResults.value = []
    customerSearchError.value = true
  } finally {
    if (request === customerSearchRequest) customerSearchLoading.value = false
  }
}

watch(customerSearch, term => {
  clearTimeout(customerSearchTimer)
  customerSearchTimer = setTimeout(() => searchCustomers(term.trim()), 300)
})
watch(selectedCustomerOption, option => { state.customerId = option?.value ?? "" })
onBeforeUnmount(() => clearTimeout(customerSearchTimer))
const variantOptions = computed(() => plans.value.flatMap(plan => plan.variants
  .filter(variant => variant.isActive)
  .map(variant => ({
    label: `${plan.title} · ${variant.title}`,
    value: variant.id,
    plan,
    variant
  }))))
const selectedCustomer = computed(() => selectedCustomerOption.value?.customer ?? null)
const selectedOption = computed(() => variantOptions.value.find(option => option.value === state.planVariantId) ?? null)
const locationOptions = computed(() => {
  if (!selectedCustomer.value) return []
  return [
    { label: "Ubicación principal", value: 1, description: selectedCustomer.value.ubicacion1 },
    ...(selectedCustomer.value.ubicacion2
      ? [{ label: "Ubicación secundaria", value: 2, description: selectedCustomer.value.ubicacion2 }]
      : [])
  ]
})
const isLoading = computed(() => customerStatus.value === "pending" || planStatus.value === "pending")
// A failed load must not read as "no customers or plans yet".
const loadError = computed(() => customerError.value
  ? apiErrorMessage(customerError.value, "No se pudieron cargar los clientes.")
  : planError.value
    ? apiErrorMessage(planError.value, "No se pudieron cargar los planes.")
    : "")

function retryLoad() {
  return Promise.all([
    customerError.value ? refreshCustomers() : undefined,
    planError.value ? refreshPlans() : undefined
  ])
}

// What the open week offers this customer for this plan: menu, days and delivery rules.
const options = ref<OrderOptions | null>(null)
const optionsError = ref("")
const optionsLoading = ref(false)
let optionsRequest = 0

// `keepDays` keeps the chosen days still offered (reload after the menu changed).
async function loadOptions(customerId: string, planVariantId: string, keepDays = false) {
  const request = ++optionsRequest
  const previousDays = keepDays ? [...state.days] : []
  options.value = null
  optionsError.value = ""
  state.days = []
  if (!customerId || !planVariantId) return

  optionsLoading.value = true
  try {
    const result = await getOrderOptions({ customerId, planVariantId })
    if (request !== optionsRequest) return
    options.value = result
    // Nothing to choose when the menu has exactly the days the plan sells.
    if (result.availableDays.length === result.daysCount) state.days = [...result.availableDays]
    else state.days = previousDays.filter(day => result.availableDays.includes(day)).slice(0, result.daysCount)
  } catch (error) {
    if (request !== optionsRequest) return
    const fetchError = error as { data?: { statusMessage?: string }, statusMessage?: string }
    optionsError.value = fetchError.data?.statusMessage ?? fetchError.statusMessage ?? "No fue posible consultar la semana con pedidos abiertos."
  } finally {
    if (request === optionsRequest) optionsLoading.value = false
  }
}

watch(() => [state.customerId, state.planVariantId] as const, ([customerId, planVariantId]) => loadOptions(customerId, planVariantId))

watch(selectedCustomer, customer => {
  deliveryChoices[1].deliveryDay = null
  deliveryChoices[2].deliveryDay = null
  if (!customer?.ubicacion2) {
    deliveryChoices[1].locationNumber = 1
    deliveryChoices[2].locationNumber = 1
  }
})

const daysComplete = computed(() => Boolean(options.value) && state.days.length === options.value!.daysCount)
const dayItems = computed(() => (options.value?.availableDays ?? []).map(day => ({
  label: dayOfWeekLabel(day),
  value: day,
  disabled: daysComplete.value && !state.days.includes(day)
})))

// Deliveries follow from the days: one per half of the week that has meals.
const plannedDeliveries = computed(() => {
  if (!options.value || !state.days.length) return []
  return planOrderDeliveries({
    weekStart: options.value.cycle.weekStart,
    days: state.days,
    rule: options.value.cycle,
    preferred: {
      1: deliveryChoices[1].deliveryDay ?? selectedCustomer.value?.firstDeliveryDay,
      2: deliveryChoices[2].deliveryDay ?? selectedCustomer.value?.secondDeliveryDay
    }
  })
})

const payload = computed<OrderCreateInput>(() => ({
  customerId: state.customerId,
  planVariantId: state.planVariantId,
  days: sortDays(state.days),
  deliveries: plannedDeliveries.value.map(delivery => ({
    sequence: delivery.sequence,
    deliveryDay: delivery.deliveryDay,
    locationNumber: deliveryChoices[delivery.sequence].locationNumber
  })),
  notes: state.notes,
  offerVersion: options.value?.menu.version ?? 0
}))

const civilDateFormatter = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
function civilDateLabel(value: string) {
  return civilDateFormatter.format(new Date(`${value}T00:00:00.000Z`))
}

const cutoffFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeStyle: "short", timeZone: "America/Tijuana" })

function selectedAddress(location: CustomerLocationNumber) {
  if (!selectedCustomer.value) return "Selecciona primero un cliente"
  return location === 1 ? selectedCustomer.value.ubicacion1 : selectedCustomer.value.ubicacion2
}

// One key for this form: a retry after a lost response returns the order the
// server already created, and a retry with edited data is rejected instead of
// creating a second order. Nothing is stored when an attempt fails, so the
// same key also serves the corrected attempt.
let idempotencyKey: string | undefined

async function submitOrder() {
  if (saving.value) return
  saving.value = true
  try {
    idempotencyKey ??= crypto.randomUUID()
    const order = await createOrder(payload.value, idempotencyKey)
    toast.add({
      title: "Pedido creado",
      description: "Los días elegidos quedaron copiados y listos para personalizar.",
      color: "success",
      icon: "i-lucide-circle-check"
    })
    await navigateTo(`/admin/pedidos/${order.id}`)
  } catch (error) {
    const fetchError = error as { data?: { statusMessage?: string, data?: { code?: string } } }
    // The menu changed while the form was open: show the current offer and keep the days.
    if (fetchError.data?.data?.code === "OFFER_VERSION_CONFLICT") await loadOptions(state.customerId, state.planVariantId, true)
    toast.add({
      title: "No se pudo crear el pedido",
      description: fetchError.data?.statusMessage ?? (error instanceof Error ? error.message : "Revisa la información e intenta nuevamente."),
      color: "error",
      icon: "i-lucide-circle-alert"
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="space-y-6">
    <UPageHeader title="Nuevo pedido" description="Selecciona cliente, plan y días. Las entregas se calculan con las reglas de la semana.">
      <template #links><UButton to="/admin/pedidos" color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Volver a pedidos" /></template>
    </UPageHeader>

    <section v-if="isLoading" class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <USkeleton class="h-160" /><USkeleton class="h-96" />
    </section>

    <UEmpty v-else-if="loadError" icon="i-lucide-cloud-alert" title="No fue posible preparar el pedido" :description="loadError">
      <template #actions>
        <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" @click="retryLoad()">Reintentar</UButton>
      </template>
    </UEmpty>

    <UAlert v-else-if="!customerResponse.items.length || !plans.length" color="warning" variant="soft" icon="i-lucide-triangle-alert" title="Falta información para crear un pedido">
      <template #description>
        <p class="mt-1 text-sm">Necesitas al menos un cliente, un plan activo y una semana con pedidos abiertos.</p>
      </template>
      <template #actions>
        <UButton v-if="!customerResponse.items.length" to="/admin/clientes" color="neutral" variant="soft">Ir a clientes</UButton>
        <UButton v-if="!plans.length" to="/admin/planes" color="neutral" variant="soft">Ir a planes</UButton>
      </template>
    </UAlert>

    <UForm v-else :schema="orderCreateInputSchema" :state="payload" class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" @submit="submitOrder">
      <div class="space-y-5">
        <UCard class="shadow-sm">
          <template #header><div><h2 class="font-semibold text-highlighted">Cliente y plan</h2><p class="mt-1 text-xs text-muted">El tipo de cliente define el menú; la variante, cuántos días se eligen.</p></div></template>
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Cliente" name="customerId" required>
              <USelectMenu
                v-model="selectedCustomerOption"
                v-model:search-term="customerSearch"
                :items="customerOptions"
                by="value"
                ignore-filter
                :loading="customerSearchLoading"
                :search-input="{ placeholder: 'Nombre, teléfono o correo' }"
                placeholder="Buscar cliente"
                class="w-full"
              >
                <template #empty>
                  {{ customerSearchError ? "No fue posible buscar clientes. Intenta de nuevo." : customerSearchLoading ? "Buscando clientes…" : "Sin coincidencias" }}
                </template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Plan y variante" name="planVariantId" required>
              <USelectMenu v-model="state.planVariantId" :items="variantOptions" value-key="value" placeholder="Seleccionar plan" class="w-full" />
            </UFormField>
          </div>

          <div v-if="selectedCustomer" class="mt-5 grid gap-3 border-t border-default pt-5 sm:grid-cols-2">
            <div class="rounded-2xl bg-elevated/60 p-4"><p class="text-xs uppercase tracking-wider text-dimmed">Contacto</p><p class="mt-2 font-medium text-highlighted">{{ selectedCustomer.telefono }}</p><p class="mt-1 truncate text-xs text-muted">{{ selectedCustomer.correoElectronico || "Sin correo" }}</p></div>
            <div class="rounded-2xl bg-elevated/60 p-4"><p class="text-xs uppercase tracking-wider text-dimmed">Perfil</p><p class="mt-2 font-medium capitalize text-highlighted">{{ selectedCustomer.tipoCliente }}</p><p class="mt-1 text-xs text-muted">{{ selectedCustomer.ubicacion2 ? "2 ubicaciones disponibles" : "1 ubicación disponible" }}</p></div>
          </div>
        </UCard>

        <UAlert v-if="optionsError" color="warning" variant="soft" icon="i-lucide-triangle-alert" title="No se puede levantar este pedido" :description="optionsError">
          <template #actions><UButton to="/admin/menu" color="neutral" variant="soft">Ir a menús</UButton></template>
        </UAlert>
        <USkeleton v-else-if="optionsLoading" class="h-64" />

        <template v-else-if="options">
          <UAlert
            v-if="options.cycle.pastCutoff"
            color="warning"
            variant="soft"
            icon="i-lucide-clock-alert"
            title="Fuera de corte"
            :description="`El corte de esta semana fue el ${cutoffFormatter.format(new Date(options.cycle.orderCutoffAt))}. El pedido se puede crear y quedará marcado como capturado después del corte.`"
          />

          <UCard class="shadow-sm">
            <template #header><div><h2 class="font-semibold text-highlighted">Días del pedido</h2><p class="mt-1 text-xs text-muted">Solo aparecen los días con platillo principal en todos los tiempos del plan.</p></div></template>
            <UFormField name="days" :label="`Elige ${options.daysCount} ${options.daysCount === 1 ? 'día' : 'días'}`" :hint="`${state.days.length} de ${options.daysCount}`" required>
              <UCheckboxGroup v-model="state.days" :items="dayItems" value-key="value" orientation="horizontal" variant="card" />
            </UFormField>
          </UCard>

          <UCard class="shadow-sm">
            <template #header><div><h2 class="font-semibold text-highlighted">Entregas</h2><p class="mt-1 text-xs text-muted">Se crean según los días elegidos. El día cambia solo en este pedido, no en la preferencia del cliente.</p></div></template>
            <UEmpty v-if="!plannedDeliveries.length" icon="i-lucide-truck" title="Elige los días del pedido" description="Las entregas aparecerán aquí con sus comidas." />
            <div v-else class="grid gap-5 xl:grid-cols-2">
              <section v-for="(delivery, deliveryIndex) in plannedDeliveries" :key="delivery.sequence" class="rounded-2xl border border-default bg-elevated/30 p-4">
                <div class="mb-4 flex items-center gap-3"><span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-inverted">{{ delivery.sequence }}</span><div class="min-w-0"><h3 class="font-semibold text-highlighted">{{ DELIVERY_SEQUENCE_LABELS[delivery.sequence] }}</h3><p class="text-xs text-muted">Lleva: {{ delivery.mealDays.map(dayOfWeekLabel).join(", ") }}</p></div></div>
                <div class="space-y-4">
                  <UFormField label="Día de entrega" :name="`deliveries.${deliveryIndex}.deliveryDay`" :help="civilDateLabel(delivery.scheduledDate)" required>
                    <USelect
                      :model-value="delivery.deliveryDay"
                      :items="delivery.allowedDays.map(day => ({ label: dayOfWeekLabel(day), value: day }))"
                      value-key="value"
                      class="w-full"
                      @update:model-value="deliveryChoices[delivery.sequence].deliveryDay = $event as DayOfWeek"
                    />
                  </UFormField>
                  <UFormField label="Ubicación" :name="`deliveries.${deliveryIndex}.locationNumber`" required><USelect v-model="deliveryChoices[delivery.sequence].locationNumber" :items="locationOptions" value-key="value" class="w-full" /></UFormField>
                  <p class="rounded-xl bg-default px-3 py-2 text-xs leading-5 text-muted"><UIcon name="i-lucide-map-pin" class="mr-1 inline size-3.5" />{{ selectedAddress(deliveryChoices[delivery.sequence].locationNumber) }}</p>
                </div>
              </section>
            </div>
          </UCard>
        </template>

        <UCard class="shadow-sm">
          <UFormField label="Notas del pedido" name="notes" hint="Opcional"><UTextarea v-model="state.notes" :rows="4" autoresize class="w-full" placeholder="Alergias, instrucciones o acuerdos con el cliente." /></UFormField>
        </UCard>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-0">
        <UCard class="shadow-sm">
          <template #header><h2 class="font-semibold text-highlighted">Resumen</h2></template>
          <div v-if="selectedOption" class="space-y-5">
            <div><p class="text-xs uppercase tracking-wider text-dimmed">Plan</p><p class="mt-1 font-semibold text-highlighted">{{ selectedOption.plan.title }}</p><p class="text-sm text-muted">{{ selectedOption.variant.title }}</p></div>
            <div class="flex flex-wrap gap-2"><UBadge v-for="slot in selectedOption.plan.slotTypes" :key="slot" color="neutral" variant="soft">{{ slot.toLowerCase() }}</UBadge></div>
            <div v-if="options"><p class="text-xs uppercase tracking-wider text-dimmed">Semana</p><p class="mt-1 font-semibold text-highlighted">{{ civilDateLabel(options.cycle.weekStart) }}</p><p class="text-sm text-muted">{{ options.menu.name }}</p></div>
            <USeparator />
            <div class="flex items-end justify-between"><span class="text-sm text-muted">Total</span><span class="text-2xl font-bold tabular-nums text-highlighted">{{ transformPrice(selectedOption.variant.price) }}</span></div>
          </div>
          <div v-else class="py-8 text-center"><UIcon name="i-lucide-receipt-text" class="mx-auto size-8 text-dimmed" /><p class="mt-3 text-sm text-muted">Selecciona una variante para ver el resumen.</p></div>
          <template #footer><UButton type="submit" block icon="i-lucide-sparkles" :loading="saving" :disabled="!daysComplete || !plannedDeliveries.length">Crear y personalizar</UButton></template>
        </UCard>
        <UAlert color="info" variant="soft" icon="i-lucide-info" title="Copia del menú" description="Los cambios posteriores al menú semanal no modificarán este pedido." />
      </aside>
    </UForm>
  </main>
</template>
