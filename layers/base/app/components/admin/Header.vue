<script setup lang="ts">
interface Props {
  collapsed?: boolean;
}

defineProps<Props>();

const today = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
}).format(new Date());
</script>

<template>
  <header class="flex items-center justify-between gap-4">
    <div class="min-w-0">
      <p class="text-xs uppercase tracking-[0.22em] text-muted">
        Admin
      </p>
      <h1 class="truncate text-xl font-semibold text-highlighted">
        Panel de gestión
      </h1>
      <p class="mt-1 text-sm text-muted">Controla menús, platillos y rotación semanal desde un solo lugar.</p>
    </div>

    <div class="hidden items-center gap-3 lg:flex">
      <UBadge color="neutral" variant="soft" class="rounded-xl px-3 py-1.5 text-[11px] capitalize">
        {{ today }}
      </UBadge>
    </div>
  </header>
</template>
