<script setup lang="ts">
const isSidebarCollapsed = useState('admin-sidebar-collapsed', () => false);

const sidebarWidthClass = computed(() => (isSidebarCollapsed.value ? 'md:w-24' : 'md:w-72'));
</script>

<template>
  <div class="admin-shell h-screen overflow-hidden bg-neutral-50 text-highlighted dark:bg-neutral-950">
    <div class="flex h-full w-full">
      <aside
        class="hidden h-full shrink-0 border-r border-default/70 bg-default/95 backdrop-blur transition-[width] duration-200 md:flex md:flex-col"
        :class="sidebarWidthClass"
      >
        <div
          class="border-b border-default/70 py-5"
          :class="isSidebarCollapsed ? 'flex flex-col items-center gap-3 px-3' : 'flex items-center gap-3 px-5'"
        >
          <NuxtLink
            to="/admin"
            :class="isSidebarCollapsed ? 'flex items-center justify-center rounded-2xl' : 'min-w-0 rounded-2xl'"
          >
            <div
              v-if="isSidebarCollapsed"
              class="flex size-12 items-center justify-center rounded-2xl border border-default bg-elevated text-primary shadow-sm"
            >
              <UIcon name="i-heroicons-squares-2x2" class="size-7" />
            </div>
            <div v-else class="rounded-2xl border border-default/60 bg-elevated px-2 shadow-xs">
              <AppLogo />
            </div>
          </NuxtLink>
        </div>

        <div
          class="flex min-h-0 flex-1 flex-col py-5"
          :class="isSidebarCollapsed ? 'px-2' : 'px-3.5'"
        >
          <AdminNavigationMenu :collapsed="isSidebarCollapsed" />
        </div>

        <div
          class="border-t border-default/70 py-4"
          :class="isSidebarCollapsed ? 'px-0' : 'px-3.5'"
        >
          <div
            class="flex gap-2"
            :class="isSidebarCollapsed ? 'flex-col items-center' : 'items-center justify-between'"
          >
            <div :class="isSidebarCollapsed ? 'flex w-full justify-center' : ''">
              <ColorMode :compact="isSidebarCollapsed" />
            </div>

            <div :class="isSidebarCollapsed ? 'flex w-full justify-center' : ''">
              <UButton
                v-if="isSidebarCollapsed"
                square
                size="sm"
                variant="soft"
                color="neutral"
                icon="i-lucide-panel-left-open"
                class="mx-auto flex size-11 items-center justify-center rounded-2xl border border-default bg-elevated p-0 shadow-sm"
                :ui="{ leadingIcon: 'm-0 size-7 shrink-0' }"
                @click="isSidebarCollapsed = !isSidebarCollapsed"
              />

              <UButton
                v-else
                size="sm"
                variant="soft"
                color="neutral"
                class="rounded-2xl px-3.5"
                icon="i-lucide-panel-left-close"
                @click="isSidebarCollapsed = !isSidebarCollapsed"
              >
                <span>Colapsar</span>
              </UButton>
            </div>
          </div>
        </div>
      </aside>

      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div class="border-b border-default/70 bg-default/80 px-4 py-4 backdrop-blur md:px-8">
          <div class="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
            <section class="min-w-0 flex-1">
              <AdminHeader :collapsed="isSidebarCollapsed" />
            </section>
          </div>
        </div>

        <section class="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] px-4 py-5 pb-24 md:px-8 md:pb-8">
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
