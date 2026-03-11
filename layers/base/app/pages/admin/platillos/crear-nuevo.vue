<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const route = useRoute();

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
