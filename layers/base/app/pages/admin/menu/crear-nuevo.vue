<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

function onSaved() {
  navigateTo('/admin/menu');
}
</script>

<template>
  <main>
    <AdminMenuForm @saved="onSaved" />
  </main>
</template>
