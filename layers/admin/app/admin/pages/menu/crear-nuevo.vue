<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

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
    <AdminMenuForm @saved="onSaved" />
  </main>
</template>
