<script setup lang="ts">
import type { FoodCatalogItem } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const returnTo = computed(() => (typeof route.query.returnTo === 'string' ? route.query.returnTo : undefined));
const backTo = computed(() => returnTo.value ?? '/admin/platillos');

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
        <USkeleton class="h-10 w-72 rounded-lg" />
        <USkeleton class="h-5 w-full max-w-2xl rounded-lg" />
      </section>

      <div class="mx-auto w-full max-w-5xl">
        <USkeleton class="h-[640px] w-full rounded-xl" />
      </div>
    </section>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="No se pudo cargar el platillo"
      :description="error.statusMessage || 'Intenta de nuevo en unos segundos.'"
      icon="i-lucide-circle-alert"
    />

    <template v-else>
      <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-1">
          <h1 class="text-3xl font-semibold tracking-tight text-primary">Editar platillo</h1>
          <p class="max-w-2xl text-sm text-muted">
            Edita un platillo existente y conserva su información actualizada dentro del catálogo reusable.
          </p>
        </div>

        <div class="flex items-center gap-3 lg:justify-end">
          <UButton
            :to="backTo"
            variant="ghost"
            color="neutral"
            icon="i-lucide-arrow-left"
          >
            Regresar
          </UButton>
        </div>
      </section>

      <div class="mx-auto w-full max-w-5xl">
        <AdminFoodCatalogForm :item="item" mode="edit" @saved="onSaved" />
      </div>
    </template>
  </main>
</template>
