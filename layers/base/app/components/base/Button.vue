<script setup lang="ts">
import type { ButtonProps } from "#ui/types";

const props = defineProps<ButtonProps>();

const forwardedProps = computed(() => {
  const buttonProps = { ...props };

  if (buttonProps.prefetch === false) {
    delete buttonProps.prefetch;
  }

  if (buttonProps.noPrefetch === false) {
    delete buttonProps.noPrefetch;
  }

  return buttonProps;
});
</script>

<template>
  <UButton v-bind="forwardedProps" :ui="{ leadingIcon: 'text-xl' }" size="lg" />
</template>
