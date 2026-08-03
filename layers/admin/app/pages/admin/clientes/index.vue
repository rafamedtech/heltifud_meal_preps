<script setup lang="ts">
import { customerInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import type {
  Customer,
  CustomerInput,
  CustomerSource,
  CustomerStatus,
  CustomerType
} from "~~/layers/menu/shared/types/types"

definePageMeta({ layout: "admin" })

useSeoMeta({
  title: "Gestión de clientes | Heltifud Meal Preps",
  description: "Administra los datos y el seguimiento de clientes de Heltifud Meal Preps.",
  robots: "noindex, nofollow"
})

const toast = useToast()
const { createCustomer, updateCustomer, deleteCustomer, getCustomers } = useCustomers()

const sourceOptions = [
  { label: "Todos los canales", value: "todos" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Sitio web", value: "sitio_web" },
  { label: "Recomendación", value: "recomendacion" },
  { label: "Otro", value: "otro" }
]

const statusOptions = [
  { label: "Todos los estados", value: "todos" },
  { label: "Prospecto", value: "prospecto" },
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" }
]

const customerTypeOptions = [
  { label: "Todos los tipos", value: "todos" },
  { label: "Menu", value: "menu" },
  { label: "Vegetariano", value: "vegetariano" },
  { label: "Dieta", value: "dieta" }
]

const customers = ref<Customer[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const loadError = ref("")
const search = ref("")
const selectedSource = ref("todos")
const selectedStatus = ref("todos")
const selectedType = ref("todos")
const isFormOpen = ref(false)
const editingCustomer = ref<Customer | null>(null)
const pendingDelete = ref<Customer | null>(null)
const saving = ref(false)
const deleting = ref(false)
let requestId = 0
let searchTimer: ReturnType<typeof setTimeout> | undefined

function emptyCustomer(): CustomerInput {
  return {
    nombre: "",
    telefono: "",
    ubicacion1: "",
    ubicacion2: "",
    correoElectronico: "",
    source: "whatsapp",
    status: "prospecto",
    tipoCliente: "menu"
  }
}

const formState = reactive<CustomerInput>(emptyCustomer())
const isFiltering = computed(() => Boolean(
  search.value.trim()
  || selectedSource.value !== "todos"
  || selectedStatus.value !== "todos"
  || selectedType.value !== "todos"
))
const formTitle = computed(() => editingCustomer.value ? "Editar cliente" : "Nuevo cliente")
const formDescription = computed(() => editingCustomer.value
  ? "Actualiza su información de contacto y seguimiento."
  : "Registra sus datos para comenzar a darle seguimiento.")
const deleteDescription = computed(() => pendingDelete.value
  ? `Se eliminará a ${pendingDelete.value.nombre}. Esta acción no se puede deshacer.`
  : undefined)
const isDeleteOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (open) => {
    if (!open) pendingDelete.value = null
  }
})

function currentQuery(cursor?: string | null) {
  return {
    q: search.value.trim() || undefined,
    source: selectedSource.value !== "todos" ? selectedSource.value : undefined,
    status: selectedStatus.value !== "todos" ? selectedStatus.value : undefined,
    tipoCliente: selectedType.value !== "todos" ? selectedType.value : undefined,
    cursor: cursor || undefined,
    limit: 30
  }
}

async function loadCustomers(append = false) {
  const currentRequest = ++requestId

  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    loadError.value = ""
  }

  try {
    const response = await getCustomers(currentQuery(append ? nextCursor.value : null))

    if (currentRequest !== requestId) return

    customers.value = append ? [...customers.value, ...response.items] : response.items
    nextCursor.value = response.nextCursor
  } catch (error) {
    if (currentRequest !== requestId) return

    const message = error instanceof Error ? error.message : "No se pudo cargar la lista de clientes."
    loadError.value = message
    toast.add({ title: "No se pudieron cargar los clientes", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

function resetFilters() {
  search.value = ""
  selectedSource.value = "todos"
  selectedStatus.value = "todos"
  selectedType.value = "todos"
}

function openCreate() {
  editingCustomer.value = null
  Object.assign(formState, emptyCustomer())
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
}

function cancelDelete() {
  pendingDelete.value = null
}

function openEdit(customer: Customer) {
  editingCustomer.value = customer
  Object.assign(formState, {
    nombre: customer.nombre,
    telefono: customer.telefono,
    ubicacion1: customer.ubicacion1,
    ubicacion2: customer.ubicacion2,
    correoElectronico: customer.correoElectronico,
    source: customer.source,
    status: customer.status,
    tipoCliente: customer.tipoCliente
  })
  isFormOpen.value = true
}

async function saveCustomer() {
  saving.value = true

  try {
    const saved = editingCustomer.value
      ? await updateCustomer(editingCustomer.value.id, formState)
      : await createCustomer(formState)

    isFormOpen.value = false
    toast.add({
      title: editingCustomer.value ? "Cliente actualizado" : "Cliente creado",
      description: `${saved.nombre} quedó guardado correctamente.`,
      color: "success",
      icon: "i-lucide-check-circle"
    })
    await loadCustomers()
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el cliente."
    toast.add({ title: "Error al guardar", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) return

  deleting.value = true

  try {
    await deleteCustomer(pendingDelete.value.id)
    const deletedName = pendingDelete.value.nombre
    pendingDelete.value = null
    toast.add({ title: "Cliente eliminado", description: `${deletedName} fue eliminado.`, color: "success", icon: "i-lucide-check-circle" })
    await loadCustomers()
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el cliente."
    toast.add({ title: "Error al eliminar", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    deleting.value = false
  }
}

function labelFor<T extends string>(options: readonly { label: string; value: string }[], value: T) {
  return options.find((option) => option.value === value)?.label ?? value
}

function statusAppearance(status: CustomerStatus) {
  return {
    prospecto: { color: "warning" as const, icon: "i-lucide-sparkles" },
    activo: { color: "success" as const, icon: "i-lucide-circle-check" },
    inactivo: { color: "neutral" as const, icon: "i-lucide-circle-pause" }
  }[status]
}

function sourceIcon(source: CustomerSource) {
  return {
    whatsapp: "i-lucide-message-circle",
    instagram: "i-lucide-instagram",
    facebook: "i-lucide-facebook",
    sitio_web: "i-lucide-globe-2",
    recomendacion: "i-lucide-users",
    otro: "i-lucide-ellipsis"
  }[source]
}

function actionItems(customer: Customer) {
  return [[
    { label: "Editar", icon: "i-lucide-square-pen", onSelect: () => openEdit(customer) },
    { label: "Eliminar", icon: "i-lucide-trash", color: "error" as const, onSelect: () => { pendingDelete.value = customer } }
  ]]
}

watch([selectedSource, selectedStatus, selectedType], () => loadCustomers())
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadCustomers(), 300)
})

onMounted(() => loadCustomers())
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <main class="flex min-h-full flex-col space-y-6">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold tracking-tight text-primary">Clientes</h1>
        <p class="max-w-2xl text-sm text-muted">Centraliza sus datos de contacto, origen y etapa de relación.</p>
      </div>

      <UButton icon="i-lucide-user-plus" size="lg" @click="openCreate">
        Nuevo cliente
      </UButton>
    </section>

    <UCard class="app-surface overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
      <section class="border-b border-default/70 px-5 py-5 sm:px-6">
        <div class="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_190px_190px_190px]">
          <UInput v-model="search" icon="i-lucide-search" size="lg" placeholder="Buscar por nombre, teléfono o correo" />
          <USelect v-model="selectedStatus" :items="statusOptions" value-key="value" size="lg" />
          <USelect v-model="selectedType" :items="customerTypeOptions" value-key="value" size="lg" />
          <USelect v-model="selectedSource" :items="sourceOptions" value-key="value" size="lg" />
        </div>

        <UButton v-if="isFiltering" label="Limpiar filtros" icon="i-lucide-filter-x" variant="ghost" color="neutral" size="xs" class="mt-3 ml-auto flex" @click="resetFilters" />
      </section>

      <section v-if="loading" class="space-y-3 px-5 py-6 sm:px-6">
        <USkeleton v-for="row in 6" :key="row" class="h-16 w-full rounded-xl" />
      </section>

      <section v-else-if="loadError" class="flex min-h-80 items-center justify-center px-5 py-10">
        <div class="max-w-md space-y-4 text-center">
          <UIcon name="i-lucide-cloud-alert" class="mx-auto size-10 text-error" />
          <div>
            <h2 class="font-semibold text-highlighted">No fue posible cargar los clientes</h2>
            <p class="mt-1 text-sm text-muted">{{ loadError }}</p>
          </div>
          <UButton icon="i-lucide-refresh-cw" variant="soft" @click="loadCustomers()">Reintentar</UButton>
        </div>
      </section>

      <section v-else-if="!customers.length" class="flex min-h-80 items-center justify-center px-5 py-10">
        <div class="max-w-md space-y-4 text-center">
          <div class="mx-auto flex size-12 items-center justify-center rounded-xl border border-default bg-elevated">
            <UIcon :name="isFiltering ? 'i-lucide-search-x' : 'i-lucide-users-round'" class="size-5 text-muted" />
          </div>
          <div>
            <h2 class="font-semibold text-highlighted">{{ isFiltering ? "No encontramos coincidencias" : "Aún no hay clientes" }}</h2>
            <p class="mt-1 text-sm text-muted">{{ isFiltering ? "Prueba otra búsqueda o limpia los filtros." : "Crea el primer registro para comenzar a administrar tu cartera." }}</p>
          </div>
          <UButton v-if="isFiltering" variant="soft" icon="i-lucide-filter-x" @click="resetFilters">Limpiar filtros</UButton>
          <UButton v-else icon="i-lucide-user-plus" @click="openCreate">Crear cliente</UButton>
        </div>
      </section>

      <div v-else class="overflow-x-auto">
        <table class="min-w-[860px] w-full text-sm">
          <thead class="bg-elevated/50">
            <tr class="border-b border-default/70 text-left text-xs font-medium uppercase tracking-[0.16em] text-muted">
              <th class="px-5 py-3 sm:px-6">Cliente</th>
              <th class="px-5 py-3">Contacto</th>
              <th class="px-5 py-3">Tipo de cliente</th>
              <th class="px-5 py-3">Origen</th>
              <th class="w-16 px-5 py-3"><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default/70">
            <tr v-for="customer in customers" :key="customer.id" class="transition-colors hover:bg-elevated/35">
              <td class="px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {{ customer.nombre.slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-highlighted">{{ customer.nombre }}</p>
                    <UBadge :color="statusAppearance(customer.status).color" variant="soft" size="sm" class="mt-1">
                      <UIcon :name="statusAppearance(customer.status).icon" class="size-3" />
                      {{ labelFor(statusOptions, customer.status) }}
                    </UBadge>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <a :href="`tel:${customer.telefono}`" class="flex items-center gap-2 text-toned hover:text-primary">
                  <UIcon name="i-lucide-phone" class="size-3.5" />{{ customer.telefono }}
                </a>
                <a v-if="customer.correoElectronico" :href="`mailto:${customer.correoElectronico}`" class="mt-1 flex max-w-60 items-center gap-2 truncate text-xs text-muted hover:text-primary">
                  <UIcon name="i-lucide-mail" class="size-3.5 shrink-0" />{{ customer.correoElectronico }}
                </a>
                <span v-else class="mt-1 block text-xs text-dimmed">Sin correo</span>
              </td>
              <td class="px-5 py-4">
                <p class="flex items-center gap-2 text-toned">
                  <UIcon name="i-lucide-contact-round" class="size-3.5 text-muted" />
                  {{ labelFor(customerTypeOptions, customer.tipoCliente as CustomerType) }}
                </p>
              </td>
              <td class="px-5 py-4">
                <p class="flex items-center gap-2 text-toned">
                  <UIcon :name="sourceIcon(customer.source)" class="size-3.5" />
                  {{ labelFor(sourceOptions, customer.source) }}
                </p>
              </td>
              <td class="px-5 py-4 text-right">
                <UDropdownMenu :items="actionItems(customer)">
                  <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones del cliente" />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section v-if="nextCursor && !loading" class="border-t border-default/70 px-5 py-4 text-center sm:px-6">
        <UButton color="neutral" variant="soft" icon="i-lucide-chevrons-down" :loading="loadingMore" @click="loadCustomers(true)">
          Cargar más clientes
        </UButton>
      </section>
    </UCard>

    <UModal v-model:open="isFormOpen" :title="formTitle" :description="formDescription" :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <UForm :schema="customerInputSchema" :state="formState" class="space-y-5" @submit="saveCustomer">
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Nombre" name="nombre" required>
              <UInput v-model="formState.nombre" icon="i-lucide-user-round" placeholder="Nombre completo" class="w-full" size="lg" autofocus />
            </UFormField>
            <UFormField label="Teléfono" name="telefono" required>
              <UInput v-model="formState.telefono" icon="i-lucide-phone" type="tel" placeholder="664 000 0000" class="w-full" size="lg" />
            </UFormField>
            <UFormField label="Correo electrónico" name="correoElectronico">
              <UInput v-model="formState.correoElectronico" icon="i-lucide-mail" type="email" placeholder="cliente@correo.com" class="w-full" size="lg" />
            </UFormField>
            <UFormField label="Origen" name="source" required>
              <USelect v-model="formState.source" :items="sourceOptions.slice(1)" value-key="value" class="w-full" size="lg" />
            </UFormField>
            <UFormField label="Ubicación principal" name="ubicacion1" required class="md:col-span-2">
              <UTextarea v-model="formState.ubicacion1" icon="i-lucide-map-pin" placeholder="Dirección o zona principal de entrega" autoresize :rows="2" class="w-full" />
            </UFormField>
            <UFormField label="Ubicación secundaria" name="ubicacion2" hint="Opcional" class="md:col-span-2">
              <UTextarea v-model="formState.ubicacion2" placeholder="Otra dirección o referencias" autoresize :rows="2" class="w-full" />
            </UFormField>
            <UFormField label="Estado" name="status" required>
              <USelect v-model="formState.status" :items="statusOptions.slice(1)" value-key="value" class="w-full" size="lg" />
            </UFormField>
            <UFormField label="Tipo de cliente" name="tipoCliente" required>
              <USelect v-model="formState.tipoCliente" :items="customerTypeOptions.slice(1)" value-key="value" class="w-full" size="lg" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 border-t border-default/70 pt-5">
            <UButton color="neutral" variant="ghost" type="button" :disabled="saving" @click="closeForm">Cancelar</UButton>
            <UButton type="submit" icon="i-lucide-save" :loading="saving">{{ editingCustomer ? "Guardar cambios" : "Crear cliente" }}</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteOpen" title="Eliminar cliente" :description="deleteDescription" :ui="{ content: 'max-w-md' }">
      <template #body>
        <UAlert color="error" variant="soft" icon="i-lucide-triangle-alert" title="Confirma esta acción" description="El registro y sus datos de contacto se eliminarán permanentemente." />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="ghost" :disabled="deleting" @click="cancelDelete">Cancelar</UButton>
          <UButton color="error" icon="i-lucide-trash" :loading="deleting" @click="confirmDelete">Eliminar cliente</UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>
