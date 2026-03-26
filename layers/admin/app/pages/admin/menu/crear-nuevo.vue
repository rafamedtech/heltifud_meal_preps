<script setup lang="ts">
import type { FoodCatalogItem } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const { data: catalogItems, status } = useLazyFetch<FoodCatalogItem[]>('/api/food-components', {
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
</script>

<template>
  <main>
    <AdminMenuFormSkeleton v-if="isLoading" />
    <AdminMenuForm v-else :catalog-items="catalogItems" @saved="onSaved" />
  </main>
</template>
