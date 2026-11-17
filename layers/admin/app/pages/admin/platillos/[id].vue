<script setup lang="ts">
import type { FoodCatalogItem } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const returnTo = computed(() => (typeof route.query.returnTo === 'string' ? route.query.returnTo : undefined));
const backTo = computed(() => returnTo.value ?? '/admin/platillos');
const foodCatalogBackRequest = useState('admin-food-catalog-back-request', () => 0);

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

// The form asks before discarding unsaved changes on any exit.
async function onBack() {
  await navigateTo(backTo.value);
}

watch(foodCatalogBackRequest, (value, previousValue) => {
  if (value !== previousValue) {
    void onBack();
  }
});
</script>

<template>
  <main class="space-y-6">
    <AdminFoodCatalogFormSkeleton v-if="isLoading" />

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="No se pudo cargar el platillo"
      :description="error.statusMessage || 'Intenta de nuevo en unos segundos.'"
      icon="i-lucide-circle-alert"
    />

    <template v-else>
      <div class="mx-auto w-full max-w-5xl">
        <AdminFoodCatalogForm :item="item" mode="edit" @saved="onSaved" />
      </div>
    </template>
  </main>
</template>
