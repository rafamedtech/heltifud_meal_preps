<template>
  <main class="space-y-6">
    <section class="space-y-2">
      <USkeleton class="h-8 w-56 rounded-lg sm:h-10 sm:w-72" />
      <USkeleton class="h-4 w-full max-w-lg rounded-lg sm:h-5 sm:max-w-2xl" />
    </section>

    <div class="mx-auto w-full max-w-5xl">
      <UCard class="app-surface">
        <section class="space-y-4">
          <section
            v-for="(labelWidth, index) in ['w-20', 'w-24', 'w-20', 'w-16', 'w-28']"
            :key="index"
            class="app-control-surface px-4 py-3"
          >
            <USkeleton :class="['h-3 rounded-lg', labelWidth]" />
            <USkeleton class="mt-2 h-10 w-full rounded-lg" />
          </section>

          <section class="flex justify-end pt-2">
            <USkeleton class="h-10 w-36 rounded-lg" />
          </section>
        </section>
      </UCard>
    </div>
  </main>
</template>
