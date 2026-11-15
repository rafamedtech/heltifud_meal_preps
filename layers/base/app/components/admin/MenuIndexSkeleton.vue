<template>
  <section class="grid gap-3 lg:grid-cols-3">
    <UCard>
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Menú activo</p>
          <USkeleton class="mt-3 h-5 w-32 sm:h-6 sm:w-40" />
        </div>
        <div class="flex flex-col gap-2">
          <USkeleton class="h-8 w-24" />
          <USkeleton class="h-8 w-24" />
        </div>
      </div>
    </UCard>

    <UCard>
      <p class="pr-20 text-xs uppercase tracking-[0.18em] text-muted">Siguiente menú</p>
      <USkeleton class="mt-3 h-5 w-32 sm:h-6 sm:w-40" />
    </UCard>

    <UCard>
      <p class="text-xs uppercase tracking-[0.18em] text-muted">Menús creados</p>
      <USkeleton class="mt-3 h-7 w-12 sm:h-8 sm:w-14" />
    </UCard>
  </section>
</template>
