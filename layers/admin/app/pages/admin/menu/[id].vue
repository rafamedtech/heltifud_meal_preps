<script setup lang="ts">
import type { FoodCatalogItem, WeeklyMenu } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();

const { data: menu, status, refresh, error } = useLazyFetch<WeeklyMenu>(`/api/menu/${route.params.id}`, {
  key: `admin-menu-${route.params.id}`,
});

const { data: catalogItems, status: catalogStatus, error: catalogError, refresh: refreshCatalog } = useLazyFetch<FoodCatalogItem[]>('/api/food-components', {
  key: 'menu-form-catalog-items',
  default: () => [],
});

const isLoading = computed(() =>
  status.value === 'idle' ||
  status.value === 'pending' ||
  catalogStatus.value === 'idle' ||
  catalogStatus.value === 'pending'
);

useSeoMeta({
  title: 'Gestión de menús semanales | Editar menú | Heltifud Meal Preps',
  description: 'Edita un menú semanal existente dentro del panel de gestión de menús de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})

async function onSaved(_menuId: string, exitEditor: boolean) {
  if (exitEditor) {
    await navigateTo('/admin/menu');
  } else {
    await refresh();
  }
}

function retryLoad() {
  return Promise.all([
    error.value ? refresh() : undefined,
    catalogError.value ? refreshCatalog() : undefined
  ])
}

onMounted(async () => {
  if (route.query.restoreMenuDraft === '1') {
    await refreshCatalog()
  }
})
</script>

<template>
  <main class="min-h-full space-y-6">
    <section
      v-if="isLoading"
      class="space-y-6"
    >
      <AdminMenuFormSkeleton />
    </section>

    <UEmpty
      v-else-if="error || catalogError"
      icon="i-lucide-cloud-alert"
      :title="error ? 'No fue posible cargar el menú' : 'No fue posible cargar los platillos'"
      :description="apiErrorMessage(error ?? catalogError, 'Intenta de nuevo en unos segundos.')"
    >
      <template #actions>
        <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" @click="retryLoad()">Reintentar</UButton>
      </template>
    </UEmpty>

    <AdminMenuForm v-else-if="menu" :menu="menu" :catalog-items="catalogItems" mode="edit" @saved="onSaved" />
  </main>
</template>
