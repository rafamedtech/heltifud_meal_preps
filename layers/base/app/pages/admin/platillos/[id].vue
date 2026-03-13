<script setup lang="ts">
import type { FoodCatalogItem } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();

useSeoMeta({
  title: 'Gestión de platillos | Editar platillo | Heltifud Meal Preps',
  description: 'Edita un platillo existente dentro del catálogo reutilizable del panel administrativo de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})

const { data: item, status, error } = useLazyFetch<FoodCatalogItem>(`/api/food-components/${route.params.id}`, {
  key: `food-catalog-${route.params.id}`,
});

const isLoading = computed(() => status.value === 'idle' || status.value === 'pending');

async function onSaved() {
  if (typeof route.query.returnTo === 'string') {
    await navigateTo(route.query.returnTo);
    return;
  }

  await navigateTo('/admin/platillos');
}
</script>

<template>
  <main class="space-y-6">
    <section v-if="isLoading" class="space-y-6">
      <section class="space-y-2">
        <USkeleton class="h-4 w-24 rounded-lg" />
        <USkeleton class="h-10 w-72 rounded-lg" />
        <USkeleton class="h-5 w-full max-w-2xl rounded-lg" />
      </section>

      <USkeleton class="h-[640px] w-full rounded-xl" />
    </section>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="No se pudo cargar el platillo"
      :description="error.statusMessage || 'Intenta de nuevo en unos segundos.'"
      icon="i-lucide-circle-alert"
    />

    <AdminSection v-else title="Platillos" title-size="lg">
      <template #description>
        <span>Edita un platillo existente y conserva su información actualizada.</span>
      </template>

      <AdminFoodCatalogForm :item="item" mode="edit" @saved="onSaved" />
    </AdminSection>
  </main>
</template>
