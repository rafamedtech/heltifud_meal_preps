<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const router = useRouter();
const returnTo = computed(() => (typeof route.query.returnTo === 'string' ? route.query.returnTo : undefined));
const backTo = computed(() => returnTo.value ?? '/admin/platillos');

useSeoMeta({
  title: 'Gestión de platillos | Crear nuevo platillo | Heltifud Meal Preps',
  description: 'Crea un nuevo platillo dentro del catálogo reutilizable del panel administrativo de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})

async function onSaved(itemId: string) {
  if (typeof route.query.returnTo === 'string') {
    const destination = router.resolve(route.query.returnTo);
    await navigateTo({
      path: destination.path,
      query: {
        ...destination.query,
        createdCatalogItemId: itemId,
      },
      hash: destination.hash,
    });
    return;
  }

  await navigateTo('/admin/platillos');
}

// The form asks before discarding unsaved changes on any exit.
async function onBack() {
  await navigateTo(backTo.value);
}
</script>

<template>
  <main class="space-y-6">
    <UPageHeader title="Crear nuevo platillo" description="Guarda un platillo reutilizable para los menús semanales.">
      <template #links><UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Regresar" @click="onBack" /></template>
    </UPageHeader>

    <div class="mx-auto w-full max-w-5xl">
      <AdminFoodCatalogForm mode="create" @saved="onSaved" />
    </div>
  </main>
</template>
