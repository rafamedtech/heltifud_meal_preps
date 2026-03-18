<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const returnTo = computed(() => (typeof route.query.returnTo === 'string' ? route.query.returnTo : undefined));
const backTo = computed(() => returnTo.value ?? '/admin/platillos');

useSeoMeta({
  title: 'Gestión de platillos | Crear nuevo platillo | Heltifud Meal Preps',
  description: 'Crea un nuevo platillo dentro del catálogo reutilizable del panel administrativo de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})

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
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold tracking-tight text-primary">Crear nuevo platillo</h1>
        <p class="max-w-2xl text-sm text-muted">
          Crea un nuevo platillo y guárdalo en el catálogo reusable para usarlo en los menús semanales.
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
      <AdminFoodCatalogForm mode="create" @saved="onSaved" />
    </div>
  </main>
</template>
