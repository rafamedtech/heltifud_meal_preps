<script setup lang="ts">
import type { WeeklyMenu } from "~~/layers/menu/shared/types/types"

const {
  data: menus,
  refresh,
  status
} = useLazyFetch<WeeklyMenu[]>("/api/menu/all", {
  default: () => []
})

const isLoading = computed(() => status.value === "idle" || status.value === "pending")
const activeMenu = computed(() => menus.value.find((menu) => menu.isActive) ?? null)
const latestCreatedMenu = computed(() => menus.value[0] ?? null)

const { deleteMenuOnDB, setActiveMenuOnDB } = useMenu()
const toast = useToast()
const deletingId = ref<string | null>(null)
const activatingId = ref<string | null>(null)

async function onDelete(id: string) {
  deletingId.value = id

  try {
    await deleteMenuOnDB(id)
    await refresh()
    toast.add({ title: "Menú eliminado", color: "success" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar"
    toast.add({ title: "Error", description: message, color: "error" })
  } finally {
    deletingId.value = null
  }
}

async function onSetActive(id: string) {
  activatingId.value = id

  try {
    await setActiveMenuOnDB(id)
    await refresh()
    toast.add({ title: "Menú activo actualizado", color: "success" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el menú activo"
    toast.add({ title: "Error", description: message, color: "error" })
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
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-2">
        <div class="space-y-1">
          <h1 class="text-3xl font-semibold tracking-tight text-primary">Menú semanal</h1>
          <p class="max-w-2xl text-sm text-muted">
            Crea nuevos menús, edita los existentes y mantén visible la próxima rotación semanal.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 lg:justify-end">
        <UButton
          to="/admin/menu/crear-nuevo"
          icon="i-lucide-plus"
        >
          Nuevo menú
        </UButton>
      </div>
    </section>

    <section class="space-y-4">
      <section class="grid gap-3 lg:grid-cols-3">
            <div class="app-surface-soft px-4 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Menú activo</p>
              <USkeleton
                v-if="isLoading"
                class="mt-3 h-6 w-40 rounded-lg"
              />
              <div
                v-else
                class="mt-3 space-y-1"
              >
                <p class="line-clamp-1 text-base font-semibold text-highlighted">
                  {{ activeMenu?.name ?? "Sin menú activo" }}
                </p>
                <p class="text-sm text-muted">
                  {{ activeMenu ? `${formatDate(activeMenu.startDate)} - ${formatDate(activeMenu.endDate)}` : "Activa uno desde la lista inferior." }}
                </p>
              </div>
            </div>

            <div class="app-surface-soft px-4 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Último agregado</p>
              <USkeleton
                v-if="isLoading"
                class="mt-3 h-6 w-40 rounded-lg"
              />
              <div
                v-else
                class="mt-3 space-y-1"
              >
                <p class="line-clamp-1 text-base font-semibold text-highlighted">
                  {{ latestCreatedMenu?.name ?? "Sin registros" }}
                </p>
                <p class="text-sm text-muted">
                  {{ latestCreatedMenu ? `Creado el ${formatDate(latestCreatedMenu.createdAt)}` : "Crea tu primer menú semanal." }}
                </p>
              </div>
            </div>

            <div class="app-surface-soft px-4 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Menús creados</p>
              <USkeleton
                v-if="isLoading"
                class="mt-3 h-8 w-14 rounded-lg"
              />
              <div
                v-else
                class="mt-3 space-y-1"
              >
                <p class="text-2xl font-bold text-highlighted">
                  {{ menus.length }}
                </p>
                <p class="text-sm text-muted">Total de menús semanales registrados.</p>
              </div>
            </div>
      </section>

      <section
        v-if="isLoading"
        class="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        <USkeleton
          v-for="index in 4"
          :key="index"
          class="h-48 w-full"
        />
      </section>

      <UAlert
        v-else-if="!menus.length"
        title="Aún no hay menús"
        description="Empieza creando el primer menú semanal desde el botón de arriba."
        color="neutral"
        variant="soft"
        icon="i-lucide-notebook-tabs"
      />

      <section
        v-else
        class="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        <UCard
          v-for="menu in menus"
          :key="menu.id"
          class="app-surface"
        >
          <template #header>
            <section class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-primary-500">{{ menu.name }}</h3>
                <p class="text-sm text-muted mt-1">{{ formatDate(menu.startDate) }} - {{ formatDate(menu.endDate) }}</p>
              </div>

              <UBadge
                :color="menu.isActive ? 'success' : 'neutral'"
                variant="soft"
              >
                {{ menu.isActive ? "Activo" : "Inactivo" }}
              </UBadge>
            </section>
          </template>

          <section class="space-y-3">
            <p class="text-sm text-muted">{{ menu.days.length }} días configurados con 5 momentos por día.</p>

            <section class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
                <span class="text-muted">Creado</span>
                <p class="font-medium">{{ formatDate(menu.createdAt) }}</p>
              </div>
              <div class="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
                <span class="text-muted">Actualizado</span>
                <p class="font-medium">{{ formatDate(menu.updatedAt) }}</p>
              </div>
            </section>
          </section>

          <template #footer>
            <section class="flex flex-wrap justify-end gap-2">
              <UButton
                :variant="menu.isActive ? 'soft' : 'outline'"
                :color="menu.isActive ? 'success' : 'primary'"
                icon="i-lucide-badge-check"
                :loading="activatingId === menu.id"
                :disabled="menu.isActive"
                @click="onSetActive(menu.id)"
              >
                {{ menu.isActive ? "Activo" : "Activar" }}
              </UButton>
              <UButton
                :to="`/admin/menu/${menu.id}`"
                variant="outline"
                icon="i-lucide-pencil"
              >
                Editar
              </UButton>
              <UButton
                :to="'/menu'"
                variant="ghost"
                icon="i-lucide-eye"
              >
                Ver público
              </UButton>
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash"
                :loading="deletingId === menu.id"
                @click="onDelete(menu.id)"
              >
                Eliminar
              </UButton>
            </section>
          </template>
        </UCard>
      </section>
    </section>
  </main>
</template>
