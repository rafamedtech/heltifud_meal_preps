<script setup lang="ts">
import { customerDeliveryDayLabel } from "~~/layers/menu/shared/utils/customerDeliveryDays"
import type { Customer } from "~~/layers/menu/shared/types/types"

definePageMeta({ layout: "admin" })

const route = useRoute()
const {
  data: customer,
  status,
  error,
  refresh
} = await useFetch<Customer>(() => `/api/customers/${encodeURIComponent(String(route.params.id))}`)

useSeoMeta({
  title: computed(() =>
    customer.value ? `${customer.value.nombre} · Cliente | Heltifud` : "Perfil del cliente | Heltifud"
  ),
  robots: "noindex, nofollow"
})

const statusLabels = { prospecto: "Prospecto", activo: "Activo", inactivo: "Inactivo" }
const statusIcons = { prospecto: "i-lucide-sparkles", activo: "i-lucide-circle-check", inactivo: "i-lucide-circle-pause" }
const typeLabels = { menu: "Menú", vegetariano: "Vegetariano", dieta: "Dieta" }
const sourceLabels = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  sitio_web: "Sitio web",
  recomendacion: "Recomendación",
  otro: "Otro"
}
const initials = computed(() =>
  customer.value?.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
)
const notFound = computed(() => error.value?.statusCode === 404)

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Tijuana" }).format(new Date(value))
}
</script>

<template>
  <main class="space-y-6">
    <UButton
      to="/admin/clientes"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="-ml-3"
      >Volver a clientes</UButton
    >

    <section
      v-if="status === 'pending'"
      role="status"
      aria-live="polite"
      class="space-y-5"
    >
      <span class="sr-only">Cargando perfil del cliente</span>
      <USkeleton class="h-44 rounded-2xl" />
      <div class="grid gap-5 lg:grid-cols-2">
        <USkeleton class="h-64 rounded-2xl" /><USkeleton class="h-64 rounded-2xl" />
      </div>
    </section>

    <UCard
      v-else-if="error || !customer"
      class="app-surface"
      :ui="{ body: 'py-16 text-center' }"
    >
      <UIcon
        :name="notFound ? 'i-lucide-user-round-x' : 'i-lucide-cloud-alert'"
        class="size-10 text-muted"
      />
      <h1 class="mt-4 text-xl font-semibold text-highlighted">
        {{ notFound ? "Cliente no encontrado" : "No fue posible cargar el perfil" }}
      </h1>
      <p class="mt-2 text-sm text-muted">
        {{
          notFound
            ? "El registro ya no existe o el enlace es incorrecto."
            : "Intenta cargar nuevamente la información del cliente."
        }}
      </p>
      <UButton
        v-if="!notFound"
        class="mt-5"
        variant="soft"
        icon="i-lucide-refresh-cw"
        @click="refresh()"
        >Reintentar</UButton
      >
    </UCard>

    <template v-else>
      <header class="flex flex-col gap-5 px-1 pb-3 pt-1 sm:flex-row sm:items-center sm:gap-6 sm:pb-5">
        <div
          class="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary"
          aria-hidden="true"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="min-w-0 break-words text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">
              {{ customer.nombre }}
            </h1>
            <UBadge
              :color="
                customer.status === 'activo' ? 'success' : customer.status === 'prospecto' ? 'warning' : 'neutral'
              "
              variant="soft"
            >
              <UIcon :name="statusIcons[customer.status]" class="size-3" />
              {{ statusLabels[customer.status] }}
            </UBadge>
          </div>
          <p class="mt-3 text-sm text-muted">Cliente desde {{ formatDate(customer.createdAt) }}</p>
        </div>
        <UButton
          :to="`tel:${customer.telefono}`"
          icon="i-lucide-phone"
          class="self-start sm:self-center"
          >Llamar al cliente</UButton
        >
      </header>

      <div class="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <UCard class="app-surface">
          <template #header
            ><h2 class="flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-contact-round"
                class="size-5 text-primary"
              />Información general
            </h2></template
          >
          <dl class="grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt class="text-muted">Teléfono</dt>
              <dd class="mt-1">
                <a
                  :href="`tel:${customer.telefono}`"
                  class="font-medium text-highlighted hover:text-primary"
                  >{{ customer.telefono }}</a
                >
              </dd>
            </div>
            <div>
              <dt class="text-muted">Correo electrónico</dt>
              <dd class="mt-1 [overflow-wrap:anywhere]">
                <a
                  v-if="customer.correoElectronico"
                  :href="`mailto:${customer.correoElectronico}`"
                  class="font-medium text-highlighted hover:text-primary"
                  >{{ customer.correoElectronico }}</a
                ><span
                  v-else
                  class="text-dimmed"
                  >Sin correo registrado</span
                >
              </dd>
            </div>
          </dl>
          <dl class="mt-5 grid grid-cols-2 gap-5 border-t border-default pt-5 text-sm">
            <div>
              <dt class="text-muted">Origen</dt>
              <dd class="mt-1 font-medium text-highlighted">{{ sourceLabels[customer.source] }}</dd>
            </div>
            <div>
              <dt class="text-muted">Tipo de cliente</dt>
              <dd class="mt-1 font-medium text-highlighted">{{ typeLabels[customer.tipoCliente] }}</dd>
            </div>
            <div class="col-span-2 border-t border-default pt-4">
              <dt class="text-muted">Última actualización</dt>
              <dd class="mt-1 text-highlighted">{{ formatDate(customer.updatedAt) }}</dd>
            </div>
          </dl>
        </UCard>

        <UCard class="app-surface flex flex-col" :ui="{ header: 'shrink-0', body: 'flex flex-1 flex-col gap-5' }">
          <template #header
            ><h2 class="flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-map-pin"
                class="size-5 text-primary"
              />Ubicaciones de entrega
            </h2></template
          >
          <dl class="grid grid-cols-2 gap-5 border-b border-default pb-5 text-sm">
              <div>
                <dt class="text-muted">Día de primera entrega</dt>
                <dd class="mt-1 font-medium text-highlighted">{{ customerDeliveryDayLabel(customer.firstDeliveryDay) }}</dd>
              </div>
              <div>
                <dt class="text-muted">Día de segunda entrega</dt>
                <dd class="mt-1 font-medium text-highlighted">{{ customerDeliveryDayLabel(customer.secondDeliveryDay) }}</dd>
              </div>
          </dl>
          <div class="grid flex-1 gap-4 sm:grid-cols-2">
            <section
              v-for="(location, index) in [customer.ubicacion1, customer.ubicacion2]"
              :key="index"
              class="flex min-w-0 flex-col gap-3 rounded-xl border border-default bg-elevated/30 p-4"
            >
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary"
                >{{ index + 1 }}</span
              >
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-highlighted">
                  {{ index === 0 ? "Ubicación principal" : "Ubicación secundaria" }}
                </h3>
                <p
                  class="mt-2 whitespace-pre-line break-words text-sm leading-relaxed"
                  :class="location ? 'text-toned' : 'text-dimmed'"
                >
                  {{ location || "Sin ubicación secundaria registrada" }}
                </p>
              </div>
            </section>
          </div>
        </UCard>
      </div>
      <CustomerOrderHistory :key="customer.id" :customer-id="customer.id" />
    </template>
  </main>
</template>
