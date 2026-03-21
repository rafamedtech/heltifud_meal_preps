<script setup lang="ts">
const isMobileMenuOpen = ref(false)

function handleHeaderToggle(toggle: () => void, event: MouseEvent) {
  const trigger = event.currentTarget

  if (trigger instanceof HTMLButtonElement) {
    trigger.blur()
  }

  requestAnimationFrame(() => {
    toggle()
  })
}
</script>

<template>
  <UHeader
    v-model:open="isMobileMenuOpen"
    :ui="{ root: 'bg-green-50/50 dark:bg-neutral-900/50 border-none', header: 'px-32' }"
    mode="drawer"
  >
    <template #title>
      <AppLogo />
    </template>

    <template #toggle="{ open, toggle }">
      <UButton
        color="neutral"
        variant="ghost"
        :aria-label="open ? 'Cerrar navegación' : 'Abrir navegación'"
        :icon="open ? 'i-lucide-x' : 'i-lucide-menu'"
        class="-me-1.5 lg:hidden"
        @click="handleHeaderToggle(toggle, $event)"
      />
    </template>

    <nav class="hidden md:flex">
      <NavigationMenu />
    </nav>

    <template #right>
      <section class="flex gap-2">
        <ColorMode hide-label />

        <BaseButton
          icon="i-lucide-rocket"
          label="Ordenar"
          to="https://wa.me/c/5216648161284"
          target="_blank"
          prefetch
          class="hidden md:inline-flex"
        />
      </section>
    </template>

    <template #body>
      <UNavigationMenu
        :items="links"
        orientation="vertical"
        class="-mx-2.5"
        :ui="{ link: 'text-lg' }"
      />
      <section class="pt-2.5 flex justify-center">
        <UButton
          icon="i-lucide-rocket"
          label="Ordenar"
          to="https://wa.me/c/5216648161284"
          target="_blank"
          prefetch
          size="lg"
        />
      </section>
    </template>
  </UHeader>
</template>
