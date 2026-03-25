<template>
  <section class="bg-green-50/50 dark:bg-neutral-900/50">
    <TheHeader />

    <BaseSeparator />

    <UContainer class="relative py-4">
      <slot />
    </UContainer>

    <BaseSeparator />

    <TheFooter />
  </section>
</template>
