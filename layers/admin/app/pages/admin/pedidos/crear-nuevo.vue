<script setup lang="ts">
import { orderCreateInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type { CustomerListResponse, OrderCreateInput, Plan } from "~~/layers/menu/shared/types/types"

definePageMeta({ layout: "admin" })

useSeoMeta({
  title: "Nuevo pedido | Heltifud Meal Preps",
  description: "Crea un pedido desde el menú semanal activo.",
  robots: "noindex, nofollow"
})

function isoDateOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const [{ data: customerResponse, status: customerStatus }, { data: plans, status: planStatus }] = await Promise.all([
  useFetch<CustomerListResponse>("/api/customers", { query: { limit: 100 }, default: () => ({ items: [], nextCursor: null }) }),
  useFetch<Plan[]>("/api/plans", { default: () => [] })
])

const toast = useToast()
const { createOrder } = useOrders()
const saving = ref(false)
const state = reactive<OrderCreateInput>({
  customerId: "",
  planVariantId: "",
  firstDeliveryDate: isoDateOffset(1),
  firstDeliveryLocation: 1,
  secondDeliveryDate: isoDateOffset(4),
  secondDeliveryLocation: 1,
  notes: ""
})

const customerOptions = computed(() => customerResponse.value.items.map(customer => ({
  label: customer.nombre,
  description: customer.telefono,
  value: customer.id
})))
const variantOptions = computed(() => plans.value.flatMap(plan => plan.variants
  .filter(variant => variant.isActive)
  .map(variant => ({
    label: `${plan.title} · ${variant.title}`,
    value: variant.id,
    plan,
    variant
  }))))
const selectedCustomer = computed(() => customerResponse.value.items.find(customer => customer.id === state.customerId) ?? null)
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

watch(selectedCustomer, customer => {
  if (!customer?.ubicacion2) {
    state.firstDeliveryLocation = 1
    state.secondDeliveryLocation = 1
  }
})

function selectedAddress(location: 1 | 2) {
  if (!selectedCustomer.value) return "Selecciona primero un cliente"
  return location === 1 ? selectedCustomer.value.ubicacion1 : selectedCustomer.value.ubicacion2
}

async function submitOrder() {
  saving.value = true
  try {
    const order = await createOrder(state)
    toast.add({
      title: "Pedido creado",
      description: "El menú activo quedó copiado y listo para personalizar.",
      color: "success",
      icon: "i-lucide-circle-check"
    })
    await navigateTo(`/admin/pedidos/${order.id}`)
  } catch (error) {
    toast.add({
      title: "No se pudo crear el pedido",
      description: error instanceof Error ? error.message : "Revisa la información e intenta nuevamente.",
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
    <header class="flex flex-col gap-5 rounded-3xl border border-default bg-default px-6 py-7 shadow-sm sm:px-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <UButton to="/admin/pedidos" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="-ml-3 mb-3">Volver a pedidos</UButton>
        <h1 class="text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">Crear pedido</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">Selecciona cliente, plan y las dos entregas. El menú activo se copiará automáticamente al guardar.</p>
      </div>
      <div class="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <UIcon name="i-lucide-wand-sparkles" class="size-4" /> Copia de menú editable
      </div>
    </header>

    <section v-if="isLoading" class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <USkeleton class="h-160 rounded-3xl" /><USkeleton class="h-96 rounded-3xl" />
    </section>

    <UAlert v-else-if="!customerResponse.items.length || !plans.length" color="warning" variant="soft" icon="i-lucide-triangle-alert" title="Falta información para crear un pedido">
      <template #description>
        <p class="mt-1 text-sm">Necesitas al menos un cliente, un plan activo y un menú activo.</p>
      </template>
      <template #actions>
        <UButton v-if="!customerResponse.items.length" to="/admin/clientes" color="neutral" variant="soft">Ir a clientes</UButton>
        <UButton v-if="!plans.length" to="/admin/planes" color="neutral" variant="soft">Ir a planes</UButton>
      </template>
    </UAlert>

    <UForm v-else :schema="orderCreateInputSchema" :state="state" class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" @submit="submitOrder">
      <div class="space-y-5">
        <UCard class="rounded-3xl shadow-sm">
          <template #header><div><h2 class="font-semibold text-highlighted">Cliente y plan</h2><p class="mt-1 text-xs text-muted">La variante define cuántos días se copiarán del menú.</p></div></template>
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Cliente" name="customerId" required>
              <USelectMenu v-model="state.customerId" :items="customerOptions" value-key="value" searchable placeholder="Buscar cliente" class="w-full" />
            </UFormField>
            <UFormField label="Plan y variante" name="planVariantId" required>
              <USelectMenu v-model="state.planVariantId" :items="variantOptions" value-key="value" searchable placeholder="Seleccionar plan" class="w-full" />
            </UFormField>
          </div>

          <div v-if="selectedCustomer" class="mt-5 grid gap-3 border-t border-default pt-5 sm:grid-cols-2">
            <div class="rounded-2xl bg-elevated/60 p-4"><p class="text-xs uppercase tracking-wider text-dimmed">Contacto</p><p class="mt-2 font-medium text-highlighted">{{ selectedCustomer.telefono }}</p><p class="mt-1 truncate text-xs text-muted">{{ selectedCustomer.correoElectronico || "Sin correo" }}</p></div>
            <div class="rounded-2xl bg-elevated/60 p-4"><p class="text-xs uppercase tracking-wider text-dimmed">Perfil</p><p class="mt-2 font-medium capitalize text-highlighted">{{ selectedCustomer.tipoCliente }}</p><p class="mt-1 text-xs text-muted">{{ selectedCustomer.ubicacion2 ? "2 ubicaciones disponibles" : "1 ubicación disponible" }}</p></div>
          </div>
        </UCard>

        <UCard class="rounded-3xl shadow-sm">
          <template #header><div><h2 class="font-semibold text-highlighted">Entregas</h2><p class="mt-1 text-xs text-muted">Cada parte puede enviarse a una dirección diferente del cliente.</p></div></template>
          <div class="grid gap-5 xl:grid-cols-2">
            <section class="rounded-2xl border border-default bg-elevated/30 p-4">
              <div class="mb-4 flex items-center gap-3"><span class="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-inverted">1</span><div><h3 class="font-semibold text-highlighted">Primera entrega</h3><p class="text-xs text-muted">Primera parte del pedido</p></div></div>
              <div class="space-y-4">
                <UFormField label="Fecha" name="firstDeliveryDate" required><UInput v-model="state.firstDeliveryDate" type="date" class="w-full" /></UFormField>
                <UFormField label="Ubicación" name="firstDeliveryLocation" required><USelect v-model="state.firstDeliveryLocation" :items="locationOptions" value-key="value" class="w-full" :disabled="!selectedCustomer" /></UFormField>
                <p class="rounded-xl bg-default px-3 py-2 text-xs leading-5 text-muted"><UIcon name="i-lucide-map-pin" class="mr-1 inline size-3.5" />{{ selectedAddress(state.firstDeliveryLocation) }}</p>
              </div>
            </section>

            <section class="rounded-2xl border border-default bg-elevated/30 p-4">
              <div class="mb-4 flex items-center gap-3"><span class="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-inverted">2</span><div><h3 class="font-semibold text-highlighted">Segunda entrega</h3><p class="text-xs text-muted">Segunda parte del pedido</p></div></div>
              <div class="space-y-4">
                <UFormField label="Fecha" name="secondDeliveryDate" required><UInput v-model="state.secondDeliveryDate" type="date" class="w-full" /></UFormField>
                <UFormField label="Ubicación" name="secondDeliveryLocation" required><USelect v-model="state.secondDeliveryLocation" :items="locationOptions" value-key="value" class="w-full" :disabled="!selectedCustomer" /></UFormField>
                <p class="rounded-xl bg-default px-3 py-2 text-xs leading-5 text-muted"><UIcon name="i-lucide-map-pin" class="mr-1 inline size-3.5" />{{ selectedAddress(state.secondDeliveryLocation) }}</p>
              </div>
            </section>
          </div>
        </UCard>

        <UCard class="rounded-3xl shadow-sm">
          <UFormField label="Notas del pedido" name="notes" hint="Opcional"><UTextarea v-model="state.notes" :rows="4" autoresize class="w-full" placeholder="Alergias, instrucciones o acuerdos con el cliente." /></UFormField>
        </UCard>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-0">
        <UCard class="rounded-3xl shadow-sm">
          <template #header><h2 class="font-semibold text-highlighted">Resumen</h2></template>
          <div v-if="selectedOption" class="space-y-5">
            <div><p class="text-xs uppercase tracking-wider text-dimmed">Plan</p><p class="mt-1 font-semibold text-highlighted">{{ selectedOption.plan.title }}</p><p class="text-sm text-muted">{{ selectedOption.variant.title }}</p></div>
            <div class="flex flex-wrap gap-2"><UBadge v-for="slot in selectedOption.plan.slotTypes" :key="slot" color="neutral" variant="soft">{{ slot.toLowerCase() }}</UBadge></div>
            <USeparator />
            <div class="flex items-end justify-between"><span class="text-sm text-muted">Total</span><span class="text-2xl font-bold tabular-nums text-highlighted">{{ transformPrice(selectedOption.variant.price) }}</span></div>
          </div>
          <div v-else class="py-8 text-center"><UIcon name="i-lucide-receipt-text" class="mx-auto size-8 text-dimmed" /><p class="mt-3 text-sm text-muted">Selecciona una variante para ver el resumen.</p></div>
          <template #footer><UButton type="submit" block size="lg" icon="i-lucide-sparkles" :loading="saving" :disabled="!selectedOption || !selectedCustomer">Crear y personalizar</UButton></template>
        </UCard>
        <UAlert color="info" variant="soft" icon="i-lucide-info" title="Menú activo" description="Los cambios posteriores al menú semanal no modificarán este pedido." />
      </aside>
    </UForm>
  </main>
</template>
