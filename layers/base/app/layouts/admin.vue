<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

const sidebarOpen = ref(false)
const navigation = computed<NavigationMenuItem[]>(() => adminLinks.flat().map(item => ({
  ...item,
  exact: item.to === "/admin",
  onSelect: () => { sidebarOpen.value = false }
})))
const searchGroups = computed(() => [{ id: "navigation", label: "Secciones", items: navigation.value.map(({ label, icon, to }) => ({ label, icon, to })) }])
const route = useRoute()
watch(() => route.path, () => {
  if (import.meta.client) document.querySelector(".admin-panel-scroll")?.scrollTo({ top: 0, left: 0 })
}, { flush: "post" })
</script>

<template>
  <UDashboardGroup unit="rem" storage-key="heltifud-admin" class="bg-default">
    <UDashboardSidebar
      id="admin"
      v-model:open="sidebarOpen"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'border-t border-default' }"
      :menu="{ title: 'Navegación del panel', description: 'Secciones de administración de Heltifud.' }"
    >
      <template #header="{ collapsed }">
        <ULink
          to="/admin"
          aria-label="Ir al panel principal"
          class="flex w-full items-center"
          :class="collapsed ? 'justify-center' : 'justify-start'"
        >
          <template v-if="collapsed">
            <NuxtImg
              src="v1774637949/heltifud/heltifud-logo-vertical-black-v2_kwuarg.png"
              alt=""
              width="513"
              height="625"
              class="block h-10 w-auto dark:hidden"
            />
            <NuxtImg
              src="v1774637152/heltifud/heltifud-logo-vertical-v2_rxswcq.png"
              alt=""
              width="513"
              height="625"
              class="hidden h-10 w-auto dark:block"
            />
          </template>
          <AppLogo v-else />
        </ULink>
      </template>
      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" label="Buscar…" class="bg-transparent ring-default" />
        <UNavigationMenu :collapsed="collapsed" :items="navigation" orientation="vertical" tooltip popover />
        <UNavigationMenu
          :collapsed="collapsed"
          :items="[{ label: 'Ver sitio web', icon: 'i-lucide-external-link', to: '/', target: '_blank' }]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>
      <template #footer="{ collapsed }">
        <AdminUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>
    <UDashboardSearch :groups="searchGroups" />
    <UDashboardPanel id="admin-content" :ui="{ body: 'gap-6 admin-panel-scroll' }">
      <template #header><AdminHeader /></template>
      <template #body><slot /></template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
