<template>
  <section class="bg-green-50/50 dark:bg-neutral-900/50">
    <!-- Header -->
    <TheHeader />

    <USeparator />

    <!-- Contenido principal -->
    <UContainer class="relative py-4">
      <slot />
    </UContainer>

    <USeparator />

    <!-- Footer -->
    <TheFooter />
  </section>
</template>
