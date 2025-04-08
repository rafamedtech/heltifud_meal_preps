<template>
  <div class="bg-green-50/50 dark:bg-neutral-900/50">
    <UContainer>
      <TheHeader />
      <USeparator />
      <section class="relative min-h-screen pt-4">
        <slot />
      </section>
      <section class="fixed inset-x-0 bottom-4 w-full px-4 md:hidden">
        <UCard
          class="dark:border-primary-500 w-full shadow-md dark:border"
          :ui="{ body: 'p-0 sm:p-0 px-2' }"
        >
          <MobileNav />
        </UCard>
      </section>
    </UContainer>
  </div>
</template>
