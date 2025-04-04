<template>
  <div class="min-h-screen max-w-screen bg-green-50/50 dark:bg-neutral-900/50">
    <UContainer>
      <TheHeader />
      <USeparator />
      <section class="pt-4">
        <slot />
      </section>
    </UContainer>
    <UButton
      variant="outline"
      icon="i-heroicons-bars-3-bottom-right"
      size="xl"
      class="fixed right-4 bottom-4"
    />
  </div>
</template>
