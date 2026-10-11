<template>
  <section class="space-y-6" role="status" aria-label="Cargando menú" aria-busy="true">
    <UCard
      aria-hidden="true"
      :ui="{
        root: 'rounded-xl bg-default shadow-sm ring ring-default divide-y divide-default',
        header: 'bg-elevated/70 px-4 py-4 sm:px-5',
        body: 'p-0 sm:p-0'
      }"
    >
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="w-full max-w-md space-y-2">
            <div class="flex items-center gap-2.5">
              <USkeleton class="size-5 shrink-0" />
              <USkeleton class="h-5 w-32" />
              <USkeleton class="h-5 w-20 rounded-md" />
            </div>
            <USkeleton class="h-4 w-72 max-w-full" />
          </div>
          <USkeleton class="h-8 w-24 rounded-md" />
        </div>
      </template>

      <div class="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div
          v-for="field in 4"
          :key="field"
          class="min-w-0"
        >
          <USkeleton class="h-4 w-28" />
          <USkeleton class="mt-2 h-10 w-full rounded-md" />
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
        <div class="grid min-w-[calc(716px+var(--menu-label-width))] grid-cols-[var(--menu-label-width)_repeat(5,minmax(0,1fr))] gap-px bg-[var(--ui-border)] [--menu-label-width:44px] md:[--menu-label-width:104px]">
          <div class="sticky left-0 z-10 bg-elevated shadow-[1px_0_0_var(--ui-border)] md:static md:bg-elevated/70 md:shadow-none" />
          <div v-for="day in 5" :key="day" class="flex items-center justify-center bg-elevated/70 px-2 py-3">
            <USkeleton class="h-5 w-16" />
          </div>

          <template v-for="slot in 3" :key="slot">
            <div class="sticky left-0 z-10 flex items-center justify-center bg-elevated px-1 shadow-[1px_0_0_var(--ui-border)] md:static md:justify-start md:bg-elevated/70 md:px-3 md:shadow-none">
              <USkeleton class="h-5 w-16 shrink-0 -rotate-90 md:w-full md:rotate-0" />
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
