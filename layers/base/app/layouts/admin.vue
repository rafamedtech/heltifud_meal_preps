<script setup lang="ts">
const isSidebarCollapsed = useState('admin-sidebar-collapsed', () => false);

const sidebarWidthClass = computed(() => (isSidebarCollapsed.value ? 'md:w-24 xl:w-24' : 'md:w-24 xl:w-64'));
</script>

<template>
  <div class="admin-shell h-dvh min-h-dvh overflow-hidden bg-neutral-50 text-highlighted dark:bg-neutral-950">
    <div class="flex h-full w-full">
      <aside
        class="hidden h-full shrink-0 border-r border-default/70 bg-[color-mix(in_srgb,var(--ui-bg)_92%,white)]/95 backdrop-blur-xl transition-[width] duration-200 md:flex md:flex-col"
        :class="sidebarWidthClass"
      >
        <div class="relative flex min-h-24 items-center border-b border-default/70 px-3 py-4 xl:px-4">
          <div class="pointer-events-none absolute inset-x-3 top-3 h-20 rounded-[28px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-2xl" />

          <div class="relative flex w-full flex-col items-center gap-3 xl:hidden">
            <NuxtLink to="/admin" class="flex items-center justify-center rounded-xl">
              <div class="app-surface-soft flex size-12 items-center justify-center text-primary">
                <UIcon name="i-heroicons-squares-2x2" class="size-7" />
              </div>
            </NuxtLink>
          </div>

          <Transition name="sidebar-swap" mode="out-in">
            <div
              v-if="isSidebarCollapsed"
              key="sidebar-header-collapsed"
              class="relative hidden w-full flex-col items-center gap-3 xl:flex"
            >
              <NuxtLink to="/admin" class="flex items-center justify-center rounded-xl">
                <div class="app-surface-soft flex size-12 items-center justify-center text-primary">
                  <UIcon name="i-heroicons-squares-2x2" class="size-7" />
                </div>
              </NuxtLink>
            </div>

            <div
              v-else
              key="sidebar-header-expanded"
              class="relative hidden w-full items-center xl:flex"
            >
              <NuxtLink
                to="/admin"
                class="app-surface-soft flex min-w-0 items-center gap-3 px-3 py-2"
              >
                <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UIcon
                    name="i-heroicons-squares-2x2"
                    class="size-5"
                  />
                </div>

                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">Heltifud Admin</p>
                  <p class="truncate text-xs text-muted">Gestión de operación</p>
                </div>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <div class="admin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-5 px-3 xl:hidden">
          <AdminNavigationMenu collapsed />
        </div>

        <div class="hidden min-h-0 flex-1 xl:block">
          <Transition name="sidebar-swap" mode="out-in">
            <div
              v-if="isSidebarCollapsed"
              key="sidebar-nav-collapsed"
              class="admin-scrollbar min-h-0 h-full flex-1 flex-col overflow-y-auto py-5 px-3"
            >
              <AdminNavigationMenu collapsed />
            </div>

            <div
              v-else
              key="sidebar-nav-expanded"
              class="admin-scrollbar min-h-0 h-full flex-1 flex-col overflow-y-auto py-4 px-3"
            >
              <AdminNavigationMenu :collapsed="false" />
            </div>
          </Transition>
        </div>

        <div class="border-t border-default/70 bg-[color-mix(in_srgb,var(--ui-bg)_92%,white)]/95 py-4 px-3 xl:hidden">
          <div class="flex w-full justify-center">
            <ColorMode compact />
          </div>
        </div>

        <div class="hidden border-t border-default/70 bg-[color-mix(in_srgb,var(--ui-bg)_92%,white)]/95 py-4 px-3 xl:block">
          <Transition name="sidebar-swap" mode="out-in">
            <div
              v-if="isSidebarCollapsed"
              key="sidebar-footer-collapsed"
              class="flex flex-col items-center gap-3"
            >
              <div class="flex w-full justify-center">
                <ColorMode compact />
              </div>

              <div class="flex w-full justify-center">
                <UButton
                  square
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-panel-left-open"
                  class="app-nav-item border-0 bg-transparent text-muted shadow-none hover:bg-default/90 hover:text-highlighted flex size-11 items-center justify-center p-0"
                  :ui="{ leadingIcon: 'm-0 size-5 shrink-0' }"
                  @click="isSidebarCollapsed = !isSidebarCollapsed"
                />
              </div>
            </div>

            <div
              v-else
              key="sidebar-footer-expanded"
              class="flex flex-col items-stretch gap-3"
            >
              <ColorMode />

              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                class="app-nav-item justify-start border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-muted shadow-none hover:bg-default/90 hover:text-highlighted"
                :ui="{ base: 'justify-start', leadingIcon: 'm-0 size-5 shrink-0' }"
                icon="i-lucide-panel-left-close"
                @click="isSidebarCollapsed = !isSidebarCollapsed"
              >
                <span>Colapsar</span>
              </UButton>
            </div>
          </Transition>
        </div>
      </aside>

      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div class="h-24 border-b border-default/70 bg-default/70 px-4 backdrop-blur-xl md:px-8">
          <div class="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
            <section class="min-w-0 flex-1">
              <AdminHeader :collapsed="isSidebarCollapsed" />
            </section>
          </div>
        </div>

        <section class="admin-scrollbar min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] px-4 py-6 pb-24 md:px-8 md:pb-8">
          <div class="mx-auto w-full max-w-[1600px]">
            <slot />
          </div>
        </section>
      </main>
    </div>

    <section class="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
      <UCard class="w-full border-default/70 shadow-lg" :ui="{ body: 'p-0 sm:p-0 px-2' }">
        <MobileNav />
      </UCard>
    </section>
  </div>
</template>

<style scoped>
.sidebar-swap-enter-active,
.sidebar-swap-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.sidebar-swap-enter-from,
.sidebar-swap-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
