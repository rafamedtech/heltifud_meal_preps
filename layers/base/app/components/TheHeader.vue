<template>
  <header class="bg-green-50/50 px-6 py-4 dark:bg-neutral-900/50">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <AppLogo />

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          to="/"
          class="text-sm text-muted hover:text-highlighted"
        >
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/planes"
          class="text-sm text-muted hover:text-highlighted"
        >
          Planes
        </NuxtLink>
        <NuxtLink
          to="/menu"
          class="text-sm text-muted hover:text-highlighted"
        >
          Menú
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <ColorMode hide-label />

        <BaseButton
          icon="i-lucide-rocket"
          label="Ordenar"
          to="https://wa.me/c/5216648161284"
          target="_blank"
          class="hidden md:inline-flex"
        />
      </div>
    </div>
  </header>
</template>
