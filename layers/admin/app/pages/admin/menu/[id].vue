<script setup lang="ts">
import type { FoodCatalogItem, WeeklyMenu } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();

const { data: menu, status, refresh, error } = useLazyFetch<WeeklyMenu>(`/api/menu/${route.params.id}`, {
  key: `admin-menu-${route.params.id}`,
});

const { data: catalogItems, status: catalogStatus } = useLazyFetch<FoodCatalogItem[]>('/api/food-components', {
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

async function onSaved() {
  await refresh();
  await navigateTo('/admin/menu');
}
</script>

<template>
  <main class="min-h-full space-y-6">
    <section
      v-if="isLoading"
      class="space-y-6"
    >
      <AdminMenuFormSkeleton />
    </section>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="No se pudo cargar el menú"
      :description="error.statusMessage || 'Intenta de nuevo en unos segundos.'"
      icon="i-lucide-circle-alert"
    />

    <AdminMenuForm v-else-if="menu" :menu="menu" :catalog-items="catalogItems" mode="edit" @saved="onSaved" />
  </main>
</template>
