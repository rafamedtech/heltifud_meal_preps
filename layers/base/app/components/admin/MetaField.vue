<script setup lang="ts">
interface Props {
  label: string
  invalid?: boolean
}

const props = defineProps<Props>()

const containerClass = computed(() => [
  "app-control-surface px-4 py-3",
  props.invalid ? "ring-1 ring-error/40 border-error/50" : ""
])
</script>

<template>
  <section :class="containerClass">
    <span class="block text-[10px] uppercase tracking-[0.16em] text-muted">
      {{ label }}
    </span>

    <div class="mt-1.5 flex min-h-5 items-center">
      <slot />
    </div>
  </section>
</template>
