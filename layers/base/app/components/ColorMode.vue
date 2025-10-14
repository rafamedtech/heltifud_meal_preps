<script setup lang="ts">
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
  <UColorModeButton
    :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
    color="neutral"
    variant="ghost"
    size="lg"
    :ui="{ leadingIcon: 'text-xl', trailingIcon: 'text-xl' }"
    @click="isDark = !isDark"
  >
    <template #fallback>
      <UButton
        loading
        variant="ghost"
        color="neutral"
      />
    </template>
  </UColorModeButton>
</template>
