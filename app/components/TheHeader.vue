<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
</script>

<template>
  <header class="flex items-center justify-between py-4">
    <Logo class="bg-black" />
    <section class="hidden md:flex">
      <NavigationMenu />
    </section>
    <section>
      <nav class="flex items-center gap-2">
        <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="ghost"
          @click="isDark = !isDark"
          size="lg"
          :ui="{ leadingIcon: 'text-xl', trailingIcon: 'text-xl' }"
        />
        <BaseButton icon="i-lucide-rocket" label="Ordenar" />
      </nav>
    </section>
  </header>
</template>
