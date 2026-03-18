<script setup lang="ts">
import type { FoodCatalogItem } from "~~/layers/menu/shared/types/types"

definePageMeta({
  layout: "admin"
})

useSeoMeta({
  title: "Gestión de platillos | Heltifud Meal Preps",
  description: "Administra el catálogo de platillos reutilizables dentro del panel administrativo de Heltifud Meal Preps.",
  robots: "noindex, nofollow"
})

const route = useRoute()
const toast = useToast()
const deletingId = ref<string | null>(null)

const {
  data: items,
  refresh,
  status
} = useLazyFetch<FoodCatalogItem[]>("/api/food-components", {
  default: () => []
})

const isLoading = computed(() => status.value === "idle" || status.value === "pending")

const { deleteFoodCatalogItem } = useFoodCatalog()

const returnTo = computed(() => (typeof route.query.returnTo === "string" ? route.query.returnTo : undefined))

async function onDelete(id: string) {
  deletingId.value = id

  try {
    await deleteFoodCatalogItem(id)
    await refresh()
    toast.add({ title: "Platillo eliminado", color: "success" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el platillo"
    toast.add({ title: "Error", description: message, color: "error" })
  } finally {
    deletingId.value = null
  }
}

function editTo(item: FoodCatalogItem) {
  return { path: `/admin/platillos/${item.id}`, query: returnTo.value ? { returnTo: returnTo.value } : {} }
}
</script>

<template>
  <main class="flex min-h-full flex-col space-y-6">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-2">
        <div class="space-y-1">
          <h1 class="text-3xl font-semibold tracking-tight text-primary">Platillos</h1>
          <p class="max-w-2xl text-sm text-muted">Administra el catálogo de platillos para los menús semanales.</p>
        </div>
      </div>

      <div class="flex items-center gap-3 lg:justify-end">
        <UButton
          v-if="returnTo"
          :to="returnTo"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
        >
          Regresar
        </UButton>

        <UButton
          :to="{ path: '/admin/platillos/crear-nuevo', query: returnTo ? { returnTo } : {} }"
          icon="i-lucide-plus"
        >
          Nuevo platillo
        </UButton>
      </div>
    </section>

    <div class="mx-auto w-full max-w-5xl">
      <UCard
        class="app-surface flex-1 overflow-hidden"
        :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0', footer: 'p-0 sm:p-0' }"
      >
        <AdminFoodCatalogTable
          :items="items"
          :loading="isLoading"
          :deleting-id="deletingId"
          :edit-to="editTo"
          @delete="onDelete"
        />
      </UCard>
    </div>
  </main>
</template>
