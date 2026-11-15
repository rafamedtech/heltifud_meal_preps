<script setup lang="ts">
defineProps<{ label: string; invalid?: boolean }>()
</script>

<template>
  <UFormField :label="label" :error="invalid"><slot /></UFormField>
</template>
