<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <UFooter>
    <template #left>
      <section class="flex flex-col items-center gap-2">
        <AppLogo />
        <p class="text-xs">© {{ currentYear }} Todos los derechos reservados.</p>
      </section>
    </template>

    <template #right>
      <BaseButton
        v-for="link in socialLinks"
        :key="link.id"
        :icon="link.icon"
        :to="link.link"
        variant="subtle"
        target="_blank"
      />
    </template>
  </UFooter>
</template>
