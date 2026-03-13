<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const route = useRoute();

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
  <main>
    <AdminSection title="Platillos" title-size="lg">
      <template #description>
        <span>Crea un nuevo platillo y guárdalo en el catálogo reusable.</span>
      </template>

      <AdminFoodCatalogForm mode="create" @saved="onSaved" />
    </AdminSection>
  </main>
</template>
