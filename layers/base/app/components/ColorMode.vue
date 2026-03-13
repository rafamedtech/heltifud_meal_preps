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
      :class="compact ? 'app-surface-soft flex size-11 items-center justify-center p-0' : ''"
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
        :class="compact ? 'app-surface-soft size-11' : ''"
      />
    </template>
  </ClientOnly>
</template>
