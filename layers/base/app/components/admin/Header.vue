<script setup lang="ts">
interface Props {
  collapsed?: boolean;
}

defineProps<Props>();
</script>

<template>
  <header class="flex items-center justify-between gap-3">
    <div class="min-w-0">
      <p class="text-xs uppercase tracking-[0.22em] text-muted">
        Admin
      </p>
      <h1 class="truncate text-lg font-semibold text-highlighted">
        Panel de gestión
      </h1>
    </div>

    <div class="flex items-center gap-2">
      <ColorMode />
    </div>
  </header>
</template>
