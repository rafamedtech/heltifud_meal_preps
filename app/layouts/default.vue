<template>
  <div class="bg-green-50/50 dark:bg-neutral-900/50">
    <UContainer class="pb-24 md:pb-0">
      <!-- Header -->
      <TheHeader />

      <USeparator />

      <!-- Contenido principal -->
      <section class="relative min-h-screen pt-4">
        <slot />
      </section>

      <!-- Navegación móvil -->
      <section class="fixed inset-x-0 bottom-4 w-full px-4 md:hidden">
        <UCard class="dark:border-primary-500 w-full shadow-md dark:border" :ui="{ body: 'p-0 sm:p-0 px-2' }">
          <MobileNav />
        </UCard>
      </section>

      <!-- Footer -->
      <footer class="flex items-center justify-between py-8">
        <AppLogo class="bg-black" />
        <section class="flex gap-2">
          <BaseButton v-for="link in socialLinks" :key="link.id" :icon="link.icon" :to="link.link" variant="subtle" />
        </section>
      </footer>
    </UContainer>
  </div>
</template>
