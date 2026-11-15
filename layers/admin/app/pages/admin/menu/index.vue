<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import type { WeeklyMenu } from "~~/layers/menu/shared/types/types"

const {
  data: menus,
  refresh,
  status
} = await useLazyFetch<WeeklyMenu[]>("/api/menu/all", {
  default: () => []
})

const isLoading = computed(() => status.value === "pending")
const activeMenu = computed(() => menus.value.find((menu) => menu.isActive) ?? null)
const nextMenu = computed(() => {
  const now = Date.now()

  return menus.value
    .filter((menu) => new Date(menu.startDate).getTime() > now)
    .toSorted(
      (firstMenu, secondMenu) =>
        new Date(firstMenu.startDate).getTime() - new Date(secondMenu.startDate).getTime()
    )[0] ?? null
})
const menuTableColumns: TableColumn<WeeklyMenu>[] = [
  {
    accessorKey: "name",
    header: "Menú"
  },
  {
    id: "dates",
    header: "Vigencia"
  },
  {
    id: "status",
    header: "Estado",
    meta: {
      class: {
        th: "text-center",
        td: "text-center"
      }
    }
  },
  {
    id: "actions",
    header: "Acciones",
    meta: {
      class: {
        th: "text-center",
        td: "text-center"
      }
    }
  }
]

const { deleteMenuOnDB, setActiveMenuOnDB } = useMenu()
const toast = useToast()
const deletingId = ref<string | null>(null)
const activatingId = ref<string | null>(null)
const pendingDeleteMenu = ref<WeeklyMenu | null>(null)
const deleteModalDescription = computed(() =>
  pendingDeleteMenu.value
    ? `Se eliminará "${pendingDeleteMenu.value.name}". Esta acción no se puede deshacer.`
    : undefined
)
const isDeleteModalOpen = computed({
  get: () => Boolean(pendingDeleteMenu.value),
  set: (value) => {
    if (!value) {
      pendingDeleteMenu.value = null
    }
  }
})

function requestDelete(menu: WeeklyMenu) {
  pendingDeleteMenu.value = menu
}

async function onDelete(id: string) {
  deletingId.value = id

  try {
    await deleteMenuOnDB(id)
    await refresh()
    toast.add({ title: "Menú eliminado", color: "success", icon: "i-lucide-check-circle" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar"
    toast.add({ title: "Error", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    deletingId.value = null
    pendingDeleteMenu.value = null
  }
}

async function onSetActive(id: string) {
  activatingId.value = id

  try {
    await setActiveMenuOnDB(id)
    await refresh()
    toast.add({ title: "Menú activo actualizado", color: "success", icon: "i-lucide-check-circle" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el menú activo"
    toast.add({ title: "Error", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    activatingId.value = null
  }
}

definePageMeta({
  layout: "admin"
})

useSeoMeta({
  title: "Gestión de menús semanales | Heltifud Meal Preps",
  description: "Administra la rotación semanal de menús dentro del panel administrativo de Heltifud Meal Preps.",
  robots: "noindex, nofollow"
})
</script>

<template>
  <main class="flex min-h-full flex-col space-y-6">
    <section class="space-y-4">
      <AdminMenuIndexSkeleton v-if="isLoading" />

      <section
        v-else
        class="grid gap-3 lg:grid-cols-3"
      >
        <UCard>
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Menú activo</p>
              <div class="mt-3 space-y-1">
                <p class="line-clamp-1 text-base font-semibold text-highlighted">
                  {{ activeMenu?.name ?? "Sin menú activo" }}
                </p>
                <p class="text-sm text-muted">
                  {{
                    activeMenu
                      ? `${formatDate(activeMenu.startDate)} - ${formatDate(activeMenu.endDate)}`
                      : "Activa uno desde la lista inferior."
                  }}
                </p>
              </div>
            </div>

            <div v-if="activeMenu" class="flex shrink-0 flex-col gap-2">
              <UButton
                :to="`/admin/menu/${activeMenu.id}`"
                size="sm"
                variant="outline"
                color="neutral"
                icon="i-lucide-square-pen"
              >
                Editar
              </UButton>
              <UButton
                to="/menu"
                size="sm"
                variant="outline"
                color="neutral"
                icon="i-lucide-eye"
              >
                Ver público
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard>
          <p class="pr-20 text-xs uppercase tracking-[0.18em] text-muted">Siguiente menú</p>
          <UButton
            v-if="nextMenu"
            :to="`/admin/menu/${nextMenu.id}`"
            size="sm"
            variant="outline"
            color="neutral"
            icon="i-lucide-square-pen"
            class="absolute right-4 top-4"
          >
            Editar
          </UButton>
          <div class="mt-3 space-y-1">
            <p class="line-clamp-1 text-base font-semibold text-highlighted">
              {{ nextMenu?.name ?? "Sin menú programado" }}
            </p>
            <p class="text-sm text-muted">
              {{
                nextMenu
                  ? `${formatDate(nextMenu.startDate)} - ${formatDate(nextMenu.endDate)}`
                  : "Crea un menú con una fecha de inicio futura."
              }}
            </p>
          </div>
        </UCard>

        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Menús creados</p>
          <div class="mt-3 space-y-1">
            <p class="text-2xl font-bold text-highlighted">
              {{ menus.length }}
            </p>
            <p class="text-sm text-muted">Total de menús semanales registrados.</p>
          </div>
        </UCard>
      </section>

      <section
        v-if="isLoading"
        role="status"
        aria-live="polite"
        class="flex min-h-64 flex-col items-center justify-center gap-3 text-muted"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-12 animate-spin"
          aria-hidden="true"
        />
        <span>Cargando</span>
      </section>

      <UAlert
        v-if="!isLoading && !menus.length"
        title="Aún no hay menús"
        description="Empieza creando el primer menú semanal desde el botón de arriba."
        color="neutral"
        variant="soft"
        icon="i-lucide-notebook-tabs"
      />

      <section
        v-if="!isLoading && menus.length"
        class="overflow-hidden"
      >
        <UTable
          :data="menus"
          :columns="menuTableColumns"
          :meta="{
            class: {
              tr: (row) => row.original.isActive ? 'bg-primary/10' : ''
            }
          }"
          :ui="{
            th: 'px-5 py-3.5',
            td: 'px-5 py-4'
          }"
        >
          <template #name-cell="{ row }">
            <span
              class="font-semibold"
              :class="row.original.isActive ? 'text-primary' : 'text-highlighted'"
            >
              {{ row.original.name }}
            </span>
          </template>

          <template #dates-cell="{ row }">
            <span class="text-muted">
              {{ formatDate(row.original.startDate) }} - {{ formatDate(row.original.endDate) }}
            </span>
          </template>

          <template #status-cell="{ row }">
            <UButton
              size="sm"
              :variant="row.original.isActive ? 'solid' : 'soft'"
              :color="row.original.isActive ? 'success' : 'primary'"
              icon="i-lucide-badge-check"
              :loading="activatingId === row.original.id"
              :disabled="row.original.isActive"
              :class="row.original.isActive ? 'text-white dark:text-black' : ''"
              @click="onSetActive(row.original.id)"
            >
              {{ row.original.isActive ? "Activo" : "Activar" }}
            </UButton>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-center gap-1">
              <UButton
                :to="`/admin/menu/${row.original.id}`"
                size="sm"
                variant="ghost"
                color="neutral"
                icon="i-lucide-square-pen"
              >
                Editar
              </UButton>
              <UButton
                size="sm"
                color="error"
                variant="ghost"
                icon="i-lucide-trash"
                :loading="deletingId === row.original.id"
                @click="requestDelete(row.original)"
              >
                Eliminar
              </UButton>
            </div>
          </template>
        </UTable>
      </section>
    </section>

    <UModal
      v-model:open="isDeleteModalOpen"
      title="Eliminar menú"
      :description="deleteModalDescription"
      :ui="{ content: 'max-w-md' }"
    >
      <template #body>
        <section class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="Confirma la eliminación"
            description="Si continúas, el menú semanal y su configuración asociada dejarán de estar disponibles."
          />
        </section>
      </template>

      <template #footer>
        <section class="flex w-full justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            @click="pendingDeleteMenu = null"
          >
            Cancelar
          </UButton>
          <UButton
            color="error"
            :loading="deletingId === pendingDeleteMenu?.id"
            icon="i-lucide-trash"
            @click="pendingDeleteMenu && onDelete(pendingDeleteMenu.id)"
          >
            Eliminar menú
          </UButton>
        </section>
      </template>
    </UModal>
  </main>
</template>
