<template>
  <header class="flex items-center justify-between py-4">
    <AppLogo />
    <section class="hidden md:flex">
      <NavigationMenu />
    </section>
    <section>
      <nav class="flex items-center gap-2">
        <!-- <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="ghost"
          size="lg"
          :ui="{ leadingIcon: 'text-xl', trailingIcon: 'text-xl' }"
          @click="isDark = !isDark"
        /> -->
        <ColorMode />
        <BaseButton
          icon="i-lucide-rocket"
          label="Ordenar"
          to="https://wa.me/c/5216648161284"
          target="_blank"
          prefetch
        />
      </nav>
    </section>
  </header>
</template>
