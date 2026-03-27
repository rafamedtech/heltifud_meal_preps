<script setup lang="ts">
const isSidebarCollapsed = useState("admin-sidebar-collapsed", () => false)

const sidebarWidthClass = computed(() => (isSidebarCollapsed.value ? "md:w-24 xl:w-24" : "md:w-24 xl:w-64"))
</script>

<template>
  <div class="admin-shell h-dvh min-h-dvh overflow-hidden bg-neutral-50 text-highlighted dark:bg-neutral-950">
    <div class="flex h-full w-full">
      <aside
        class="app-sidebar hidden h-full shrink-0 transition-[width] duration-200 md:flex md:flex-col"
        :class="sidebarWidthClass"
      >
        <div class="app-sidebar-header relative flex h-24 items-center px-4">
          <div class="relative flex h-14 w-full flex-col items-center justify-center gap-3 xl:hidden">
            <NuxtLink
              to="/admin"
              class="flex h-full w-full items-center justify-center rounded-2xl"
              aria-label="Ir al panel principal"
            >
              <figure class="flex w-14 items-center justify-center">
                <NuxtImg
                  src="/brand/heltifud-logo-vertical-black-v2.png"
                  alt=""
                  width="513"
                  height="625"
                  class="block h-auto w-14 dark:hidden"
                />
                <NuxtImg
                  src="/brand/heltifud-logo-vertical-v2.png"
                  alt=""
                  width="513"
                  height="625"
                  class="hidden h-auto w-14 dark:block"
                />
              </figure>
            </NuxtLink>
          </div>

          <Transition
            name="sidebar-swap"
            mode="out-in"
          >
            <div
              v-if="isSidebarCollapsed"
              key="sidebar-header-collapsed"
              class="relative hidden h-14 w-full flex-col items-center justify-center gap-3 xl:flex"
            >
              <NuxtLink
                to="/admin"
                class="flex h-full w-full items-center justify-center rounded-2xl"
                aria-label="Ir al panel principal"
              >
                <figure class="flex w-14 items-center justify-center">
                  <NuxtImg
                    src="v1774637949/heltifud/heltifud-logo-vertical-black-v2_kwuarg.png"
                    alt=""
                    width="513"
                    height="625"
                    class="block h-auto w-14 dark:hidden"
                  />
                  <NuxtImg
                    src="v1774637152/heltifud/heltifud-logo-vertical-v2_rxswcq.png"
                    alt=""
                    width="513"
                    height="625"
                    class="hidden h-auto w-14 dark:block"
                  />
                </figure>
              </NuxtLink>
            </div>

            <div
              v-else
              key="sidebar-header-expanded"
              class="relative hidden h-14 w-full items-center xl:flex"
            >
              <NuxtLink
                to="/admin"
                class="flex h-full min-w-0 items-center gap-2.5 rounded-xl px-1 py-0.5"
              >
                <!-- <div class="flex size-7 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <UIcon
                    name="i-heroicons-squares-2x2"
                    class="size-4"
                  />
                </div>  -->

                <div class="min-w-0">
                  <AppLogo />
                </div>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <div class="admin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-4 px-4 xl:hidden">
          <AdminNavigationMenu collapsed />
        </div>

        <div class="hidden min-h-0 flex-1 xl:block">
          <Transition
            name="sidebar-swap"
            mode="out-in"
          >
            <div
              v-if="isSidebarCollapsed"
              key="sidebar-nav-collapsed"
              class="admin-scrollbar min-h-0 h-full flex-1 flex-col overflow-y-auto py-4 px-4"
            >
              <AdminNavigationMenu collapsed />
            </div>

            <div
              v-else
              key="sidebar-nav-expanded"
              class="admin-scrollbar min-h-0 h-full flex-1 flex-col overflow-y-auto py-4 px-4"
            >
              <AdminNavigationMenu :collapsed="false" />
            </div>
          </Transition>
        </div>

        <div class="app-sidebar-footer py-4 px-4 xl:hidden">
          <div class="flex w-full justify-center">
            <ColorMode compact />
          </div>
        </div>

        <div class="app-sidebar-footer hidden py-4 px-4 xl:block">
          <Transition
            name="sidebar-swap"
            mode="out-in"
          >
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
                  class="app-nav-item app-sidebar-link border-0 bg-transparent text-muted shadow-none flex size-11 items-center justify-center p-0"
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
                class="app-nav-item app-sidebar-link justify-start border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-muted shadow-none"
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
          <div class="mx-auto flex w-full max-w-400 items-center justify-between gap-3">
            <section class="min-w-0 flex-1">
              <AdminHeader :collapsed="isSidebarCollapsed" />
            </section>
          </div>
        </div>

        <section
          class="admin-scrollbar min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] px-4 py-6 pb-24 md:px-8 md:pb-8"
        >
          <div class="mx-auto w-full max-w-400">
            <slot />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.sidebar-swap-enter-active,
.sidebar-swap-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.sidebar-swap-enter-from,
.sidebar-swap-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
