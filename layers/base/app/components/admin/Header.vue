<script setup lang="ts">
// const colorMode = useColorMode();

// const isDark = computed({
//   get() {
//     return colorMode.value === 'dark';
//   },
//   set() {
//     colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
//   },
// });
</script>

<template>
  <header class="flex flex-col py-4">
    <AppLogo />
    <section class="hidden md:flex">
      <AdminNavigationMenu />
    </section>
    <!-- <section>
      <nav class="flex items-center gap-2">
        <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="ghost"
          size="lg"
          :ui="{ leadingIcon: 'text-xl', trailingIcon: 'text-xl' }"
          @click="isDark = !isDark"
        />
        <BaseButton icon="i-lucide-rocket" label="Ordenar" />
      </nav>
    </section> -->
  </header>
</template>
