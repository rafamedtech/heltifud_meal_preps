<script setup lang="ts">
defineProps<{ title: string; titleSize?: "base" | "lg" }>()
</script>

<template>
  <UPageSection :title="title" :ui="{ container: 'px-0 py-6 sm:px-0 sm:py-6 lg:px-0 lg:py-6', title: 'text-xl' }">
    <template #description><slot name="description" /></template>
    <slot />
    <template #links><slot name="footer" /></template>
  </UPageSection>
</template>
