<script setup lang="ts">
interface Props {
  compact?: boolean
}

const props = defineProps<Props>()
const compact = computed(() => props.compact ?? false)
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>

<template>
  <ClientOnly>
    <UColorModeButton
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      color="neutral"
      :variant="compact ? 'soft' : 'ghost'"
      :size="compact ? 'sm' : 'lg'"
      :square="compact"
      :class="compact ? 'flex size-11 items-center justify-center rounded-2xl border border-default bg-elevated p-0 shadow-sm' : ''"
      :ui="compact
        ? { leadingIcon: 'm-0 size-7 shrink-0', trailingIcon: 'm-0 size-7 shrink-0' }
        : { leadingIcon: 'text-xl', trailingIcon: 'text-xl' }"
      @click="isDark = !isDark"
    />

    <template #fallback>
      <UButton
        loading
        :variant="compact ? 'soft' : 'ghost'"
        color="neutral"
        :square="compact"
        :class="compact ? 'size-11 rounded-2xl border border-default bg-elevated shadow-sm' : ''"
      />
    </template>
  </ClientOnly>
</template>
