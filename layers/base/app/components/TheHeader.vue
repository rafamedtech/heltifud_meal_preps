<template>
  <UHeader
    :ui="{ root: 'bg-green-50/50 dark:bg-neutral-900/50 border-none', header: 'px-32' }"
    mode="drawer"
  >
    <template #title>
      <AppLogo />
    </template>

    <nav class="hidden md:flex">
      <NavigationMenu />
    </nav>

    <template #right>
      <section class="flex gap-2">
        <!-- <section class="flex items-center gap-2"> -->
        <ColorMode>
          <template #fallback>
            <UButton
              icon="mdi:theme-light-dark"
              variant="ghost"
              color="neutral"
            />
          </template>
        </ColorMode>
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
      />
      <section class="pt-2.5 flex justify-center">
        <UButton
          icon="i-lucide-rocket"
          label="Ordenar"
          to="https://wa.me/c/5216648161284"
          target="_blank"
          prefetch
        />
      </section>
    </template>
  </UHeader>
</template>
