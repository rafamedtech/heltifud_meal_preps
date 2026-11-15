<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import { useForwardProps } from "reka-ui";

const props = defineProps<ButtonProps>();

const forwardedProps = useForwardProps(props);
</script>

<template>
  <UButton v-bind="forwardedProps" />
</template>
