<script setup lang="ts">
import type { FoodCatalogItem } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();

const { data: catalogItems, status, error, refresh } = useLazyFetch<FoodCatalogItem[]>('/api/food-components', {
  key: 'menu-form-catalog-items',
  default: () => [],
});

const isLoading = computed(() => status.value === 'idle' || status.value === 'pending');

useSeoMeta({
  title: 'Gestión de menús semanales | Crear nuevo menú | Heltifud Meal Preps',
  description: 'Crea un nuevo menú semanal dentro del panel de gestión de menús de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})

function onSaved() {
  navigateTo('/admin/menu');
}

onMounted(async () => {
  if (route.query.restoreMenuDraft === '1') {
    await refresh()
  }
})
</script>

<template>
  <main>
    <AdminMenuFormSkeleton v-if="isLoading" />
    <!-- Without the catalog the slots would offer no dishes, as if none existed. -->
    <UEmpty
      v-else-if="error"
      icon="i-lucide-cloud-alert"
      title="No fue posible cargar los platillos"
      :description="apiErrorMessage(error, 'Intenta de nuevo en unos segundos.')"
    >
      <template #actions>
        <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" @click="refresh()">Reintentar</UButton>
      </template>
    </UEmpty>
    <AdminMenuForm v-else :catalog-items="catalogItems" @saved="onSaved" />
  </main>
</template>
