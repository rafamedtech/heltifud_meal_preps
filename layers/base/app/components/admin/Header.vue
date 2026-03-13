<script setup lang="ts">
interface Props {
  collapsed?: boolean
}

const props = defineProps<Props>()

const today = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  month: "short",
  day: "numeric"
}).format(new Date())

const collapsed = computed(() => props.collapsed ?? false)
</script>

<template>
  <header class="flex min-h-24 items-center justify-between gap-4">
    <div class="min-w-0">
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold text-highlighted">Panel de gestión</h1>
        <p class="mt-1 text-sm text-muted">
          {{ collapsed ? "Navegación compacta activa." : "Controla menús, platillos y rotación semanal." }}
        </p>
      </div>
    </div>

    <div class="hidden items-center gap-3 lg:flex">
      <span
        class="app-chip-surface inline-flex items-center px-3 py-1.5 text-[11px] capitalize text-toned"
      >
        {{ today }}
      </span>
    </div>
  </header>
</template>
