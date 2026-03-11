<script setup lang="ts">
const isSidebarCollapsed = useState('admin-sidebar-collapsed', () => false);

const sidebarWidthClass = computed(() => (isSidebarCollapsed.value ? 'md:w-20' : 'md:w-72'));
</script>

<template>
  <div class="h-screen overflow-hidden bg-green-50/50 dark:bg-neutral-900/50">
    <div class="flex h-full w-full">
      <aside
        class="hidden h-full shrink-0 border-r border-default bg-default/95 transition-[width] duration-200 md:flex md:flex-col"
        :class="sidebarWidthClass"
      >
        <div
          class="border-b border-default py-4"
          :class="isSidebarCollapsed ? 'flex flex-col items-center gap-3 px-2' : 'flex items-center justify-between gap-3 px-4'"
        >
          <NuxtLink
            to="/admin"
            :class="isSidebarCollapsed ? 'flex items-center justify-center rounded-2xl' : 'min-w-0 rounded-2xl'"
          >
            <div v-if="isSidebarCollapsed" class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UIcon name="i-heroicons-squares-2x2" class="size-5" />
            </div>
            <div v-else class="rounded-2xl">
              <AppLogo />
            </div>
          </NuxtLink>

          <UButton
            square
            size="sm"
            variant="ghost"
            color="neutral"
            class="shrink-0 rounded-2xl"
            :icon="isSidebarCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
          />
        </div>

        <div
          class="flex min-h-0 flex-1 flex-col py-4"
          :class="isSidebarCollapsed ? 'px-1.5' : 'px-3'"
        >
          <AdminNavigationMenu :collapsed="isSidebarCollapsed" />
        </div>
      </aside>

      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div class="border-b border-default bg-default/80 px-4 py-3 backdrop-blur md:px-6">
          <div class="flex items-center justify-between gap-3">
            <section class="flex items-center gap-3">
              <AdminHeader :collapsed="isSidebarCollapsed" />
            </section>
          </div>
        </div>

        <section class="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-24 md:px-6 md:pb-6">
          <slot />
        </section>
      </main>
    </div>

    <section class="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
      <UCard class="w-full shadow-md dark:border dark:border-primary-500" :ui="{ body: 'p-0 sm:p-0 px-2' }">
        <MobileNav />
      </UCard>
    </section>
  </div>
</template>
