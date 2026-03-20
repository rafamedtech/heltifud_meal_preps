<script setup lang="ts">
interface Props {
  compact?: boolean
}

const props = defineProps<Props>()
const compact = computed(() => props.compact ?? false)
const colorMode = useColorMode()
const sharedIconClass = 'm-0 size-5 shrink-0'

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
    <UButton
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      color="neutral"
      :variant="'ghost'"
      :size="compact ? 'sm' : 'lg'"
      :square="compact"
      :class="compact ? 'app-nav-item border-0 bg-transparent text-muted shadow-none hover:bg-default/90 hover:text-highlighted flex size-11 items-center justify-center p-0' : 'app-nav-item justify-start border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-muted shadow-none hover:bg-default/90 hover:text-highlighted'"
      :ui="compact
        ? { leadingIcon: sharedIconClass, trailingIcon: sharedIconClass }
        : { base: 'justify-start', leadingIcon: sharedIconClass, trailingIcon: sharedIconClass }"
      @click="isDark = !isDark"
    >
      <span v-if="!compact">{{ isDark ? 'Dark mode' : 'Light mode' }}</span>
    </UButton>

    <template #fallback>
      <UButton
        loading
        :variant="'ghost'"
        color="neutral"
        :square="compact"
        :class="compact ? 'app-nav-item border-0 bg-transparent text-muted shadow-none size-11' : 'app-nav-item justify-start border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-muted shadow-none'"
        :aria-label="'Loading color mode'"
      />
    </template>
  </ClientOnly>
</template>
