<template>
  <section class="space-y-4">
    <section class="grid gap-3 lg:grid-cols-3">
      <div class="app-surface-soft relative px-4 py-4">
        <p class="pr-20 text-xs uppercase tracking-[0.18em] text-muted">Menú activo</p>
        <USkeleton class="mt-3 h-5 w-32 rounded-lg sm:h-6 sm:w-40" />
      </div>

      <div class="app-surface-soft px-4 py-4">
        <p class="text-xs uppercase tracking-[0.18em] text-muted">Último agregado</p>
        <USkeleton class="mt-3 h-5 w-32 rounded-lg sm:h-6 sm:w-40" />
      </div>

      <div class="app-surface-soft px-4 py-4">
        <p class="text-xs uppercase tracking-[0.18em] text-muted">Menús creados</p>
        <USkeleton class="mt-3 h-7 w-12 rounded-lg sm:h-8 sm:w-14" />
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard
        v-for="index in 4"
        :key="index"
        :class="[
          'app-surface',
          index > 2 ? 'hidden xl:block' : ''
        ]"
        :ui="{
          header: 'bg-default px-5 py-4 sm:px-6',
          body: 'px-5 py-5 sm:px-6',
          footer: 'px-5 py-4 sm:px-6'
        }"
      >
        <template #header>
          <section class="flex items-start justify-between gap-3">
            <div class="space-y-2">
              <USkeleton class="h-6 w-44 rounded-lg" />
              <USkeleton class="h-4 w-52 rounded-lg" />
            </div>

            <section class="flex flex-wrap justify-end gap-2">
              <USkeleton class="h-9 w-24 rounded-lg" />
              <USkeleton class="h-9 w-24 rounded-lg" />
            </section>
          </section>
        </template>

        <section class="space-y-3">
          <section class="grid grid-cols-2 gap-2 text-sm">
            <div class="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
              <USkeleton class="h-3 w-14 rounded-lg" />
              <USkeleton class="mt-2 h-5 w-24 rounded-lg" />
            </div>
            <div class="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
              <USkeleton class="h-3 w-20 rounded-lg" />
              <USkeleton class="mt-2 h-5 w-24 rounded-lg" />
            </div>
          </section>
        </section>

        <template #footer>
          <section class="flex flex-wrap justify-end gap-2">
            <USkeleton class="h-9 w-20 rounded-lg" />
            <USkeleton class="h-9 w-24 rounded-lg" />
          </section>
        </template>
      </UCard>
    </section>
  </section>
</template>
