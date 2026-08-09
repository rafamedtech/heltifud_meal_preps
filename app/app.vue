<script setup lang="ts">
import { es } from "@nuxt/ui/locale"

const pageTransition = {
  onAfterLeave: () => {
    if (!import.meta.client) {
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" })

    document.querySelectorAll<HTMLElement>("[data-route-scroll-container]").forEach((element) => {
      element.scrollTo({ top: 0, left: 0, behavior: "auto" })
    })
  },
}
</script>

<template>
  <UApp :locale="es">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :transition="pageTransition" />
    </NuxtLayout>
  </UApp>
</template>
