<template>
  <section class="space-y-6" role="status" aria-label="Cargando menú" aria-busy="true">
    <UCard
      aria-hidden="true"
      :ui="{
        root: 'app-surface',
        header: 'px-6 py-5 sm:px-6',
        body: 'p-0 sm:p-0'
      }"
    >
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="w-full max-w-2xl space-y-1">
            <USkeleton class="h-6 w-40 max-w-full" />
            <div class="flex min-h-5 items-center">
              <USkeleton class="h-4 w-full max-w-lg" />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center lg:justify-end lg:gap-3">
            <USkeleton class="h-10 w-full rounded-md lg:w-40" />
            <USkeleton class="h-10 w-full rounded-md lg:w-28" />
          </div>
        </div>
      </template>

      <div class="grid gap-4 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <div
          v-for="field in 3"
          :key="field"
          class="app-control-surface px-4 py-3"
          :class="{ 'md:col-span-2 lg:col-span-1': field === 1 }"
        >
          <div class="flex h-[15px] items-center">
            <USkeleton class="h-2.5 w-28" />
          </div>
          <div class="mt-1.5 flex min-h-5 items-center gap-2">
            <USkeleton class="size-4 shrink-0" />
            <USkeleton class="h-4 w-32 max-w-full" />
          </div>
        </div>
      </div>
    </UCard>

    <section class="space-y-4" aria-hidden="true">
      <div class="flex flex-wrap items-center justify-end gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <USkeleton class="h-8 w-32 rounded-md" />
          <USkeleton class="h-8 w-44 rounded-md" />
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-default bg-default shadow-sm">
        <!-- Match the editor's initial view: weekdays and the three main meals. -->
        <div class="grid min-w-[820px] grid-cols-[104px_repeat(5,minmax(0,1fr))] gap-px bg-[var(--ui-border)]">
          <div class="bg-elevated/70" />
          <div v-for="day in 5" :key="day" class="flex items-center justify-center bg-elevated/70 px-2 py-3">
            <USkeleton class="h-5 w-16" />
          </div>

          <template v-for="slot in 3" :key="slot">
            <div class="flex items-center bg-elevated/70 px-3">
              <USkeleton class="h-5 w-full" />
            </div>
            <div v-for="day in 5" :key="`${slot}-${day}`" class="bg-default p-1.5">
              <div class="flex h-40 w-full flex-col rounded-lg border border-default bg-default p-2">
                <USkeleton class="min-h-0 w-full flex-1 rounded-md" />
                <USkeleton class="mt-2 h-4 w-4/5" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </section>
</template>
