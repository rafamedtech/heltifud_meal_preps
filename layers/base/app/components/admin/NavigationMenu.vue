<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"
import { canAccessAdminPage } from "~~/layers/auth/shared/utils/staffAccess"

defineProps<{ collapsed?: boolean }>()
const staffRole = useStaffRole()
const items = computed<NavigationMenuItem[]>(() => adminLinks.flat().filter(item => staffRole.value && canAccessAdminPage(staffRole.value, String(item.to))).map(item => ({
  ...item,
  exact: item.to === "/admin"
})))
</script>

<template>
  <UNavigationMenu :items="items" :collapsed="collapsed" orientation="vertical" tooltip popover />
</template>
