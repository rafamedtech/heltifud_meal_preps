<script setup lang="ts">
import type { ButtonProps } from "#ui/types";

const props = defineProps<ButtonProps>();
</script>

<template>
  <UButton v-bind="props" :ui="{ leadingIcon: 'text-xl' }" size="lg" />
</template>
