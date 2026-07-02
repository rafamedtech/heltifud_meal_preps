<template>
  <section class="space-y-4">
    <section class="grid gap-3 lg:grid-cols-3">
      <div class="app-surface-soft px-4 py-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-muted">Menú activo</p>
            <USkeleton class="mt-3 h-5 w-32 rounded-lg sm:h-6 sm:w-40" />
          </div>
          <div class="flex flex-col gap-2">
            <USkeleton class="h-8 w-24 rounded-lg" />
            <USkeleton class="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      <div class="app-surface-soft relative px-4 py-4">
        <p class="pr-20 text-xs uppercase tracking-[0.18em] text-muted">Siguiente menú</p>
        <USkeleton class="mt-3 h-5 w-32 rounded-lg sm:h-6 sm:w-40" />
      </div>

      <div class="app-surface-soft px-4 py-4">
        <p class="text-xs uppercase tracking-[0.18em] text-muted">Menús creados</p>
        <USkeleton class="mt-3 h-7 w-12 rounded-lg sm:h-8 sm:w-14" />
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 lg:hidden">
      <UCard
        v-for="index in 2"
        :key="index"
        class="app-surface"
        :ui="{
          header: 'bg-default px-5 py-4 sm:px-6',
          body: 'px-5 py-5 sm:px-6',
          footer: 'px-5 py-4 sm:px-6'
        }"
      >
        <template #header>
          <section class="flex items-center justify-between gap-3">
            <div class="space-y-2">
              <USkeleton class="h-6 w-44 rounded-lg" />
              <USkeleton class="h-4 w-52 rounded-lg" />
            </div>

            <section class="flex flex-wrap justify-end gap-2">
              <USkeleton class="h-9 w-24 rounded-lg" />
            </section>
          </section>
        </template>

        <section class="flex justify-center gap-2">
          <USkeleton class="h-9 w-20 rounded-lg" />
          <USkeleton class="h-9 w-24 rounded-lg" />
        </section>

        <template v-if="index === 1" #footer>
          <section class="flex justify-center">
            <USkeleton class="h-9 w-28 rounded-lg" />
          </section>
        </template>
      </UCard>
    </section>

    <section class="app-surface hidden overflow-hidden lg:block">
      <div class="grid grid-cols-[1.3fr_1fr_0.65fr_1.5fr] gap-6 border-b border-default px-5 py-3.5">
        <USkeleton
          v-for="index in 4"
          :key="index"
          class="h-4 w-20 rounded-lg"
        />
      </div>
      <div
        v-for="index in 4"
        :key="index"
        class="grid grid-cols-[1.3fr_1fr_0.65fr_1.5fr] items-center gap-6 border-b border-default px-5 py-4 last:border-b-0"
      >
        <USkeleton class="h-5 w-36 rounded-lg" />
        <USkeleton class="h-4 w-44 rounded-lg" />
        <USkeleton class="mx-auto h-8 w-20 rounded-lg" />
        <div class="flex justify-center gap-2">
          <USkeleton class="h-8 w-20 rounded-lg" />
          <USkeleton class="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </section>
  </section>
</template>
