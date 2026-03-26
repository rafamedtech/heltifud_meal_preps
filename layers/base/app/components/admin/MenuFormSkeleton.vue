<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-2">
        <USkeleton class="h-7 w-48 sm:h-8 sm:w-64" />
        <USkeleton class="h-4 w-64 max-w-full sm:w-96" />
      </div>

      <USkeleton class="h-9 w-24 rounded-lg sm:h-10 sm:w-28" />
    </div>

    <UCard
      :ui="{
        root: 'app-surface',
        header: 'px-6 py-5 sm:px-6',
        body: 'p-0 sm:p-0'
      }"
    >
      <template #header>
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2">
            <USkeleton class="h-5 w-32 sm:w-40" />
            <USkeleton class="h-4 w-56 max-w-full sm:w-80" />
          </div>

          <div class="flex items-center gap-3">
            <USkeleton class="h-9 w-28 rounded-lg sm:h-10 sm:w-36" />
            <USkeleton class="h-9 w-28 rounded-lg sm:h-10 sm:w-36" />
          </div>
        </div>
      </template>

      <div class="grid gap-6 px-6 py-6 lg:grid-cols-3">
        <div class="space-y-2">
          <USkeleton class="h-3 w-24 sm:w-28" />
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>
        <div class="space-y-2">
          <USkeleton class="h-3 w-20 sm:w-24" />
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>
        <div class="space-y-2">
          <USkeleton class="h-3 w-20 sm:w-24" />
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>
      </div>
    </UCard>

    <section class="space-y-5">
      <UCard
        v-for="day in 3"
        :key="day"
        variant="subtle"
        :ui="{ root: 'app-surface-soft overflow-hidden', header: 'px-5 py-4 sm:px-5', body: 'p-0 sm:p-0' }"
      >
        <template #header>
          <USkeleton class="h-5 w-24" />
        </template>

        <section class="grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-3">
          <section
            v-for="slot in 3"
            :key="slot"
            class="space-y-3 px-4 py-4 lg:border-r lg:border-default/70"
          >
            <USkeleton class="h-3 w-20 sm:w-24" />
            <USkeleton class="h-5 w-32 sm:w-40" />
            <USkeleton class="h-4 w-12 sm:w-16" />
          </section>
        </section>
      </UCard>
    </section>
  </section>
</template>
