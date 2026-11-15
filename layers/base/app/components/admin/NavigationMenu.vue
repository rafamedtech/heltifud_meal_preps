<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

defineProps<{ collapsed?: boolean }>()
const items = computed<NavigationMenuItem[]>(() => adminLinks.flat().map(item => ({
  ...item,
  exact: item.to === "/admin"
})))
</script>

<template>
  <UNavigationMenu :items="items" :collapsed="collapsed" orientation="vertical" tooltip popover />
</template>
