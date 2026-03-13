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

          <div
            v-if="isSidebarCollapsed"
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
        </div>

        <div class="admin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-5 px-3 xl:hidden">
          <AdminNavigationMenu collapsed />
        </div>

        <div
          v-if="isSidebarCollapsed"
          class="admin-scrollbar hidden min-h-0 flex-1 flex-col overflow-y-auto py-5 px-3 xl:flex"
        >
          <AdminNavigationMenu collapsed />
        </div>

        <div
          v-else
          class="admin-scrollbar hidden min-h-0 flex-1 flex-col overflow-y-auto py-4 px-3 xl:flex"
        >
          <AdminNavigationMenu :collapsed="false" />
        </div>

        <div class="border-t border-default/70 bg-default/60 py-4 px-3 xl:hidden">
          <div class="flex w-full justify-center">
            <ColorMode compact />
          </div>
        </div>

        <div
          v-if="isSidebarCollapsed"
          class="hidden border-t border-default/70 bg-default/60 py-4 px-3 xl:block"
        >
          <div class="flex flex-col items-center gap-3">
            <div class="flex w-full justify-center">
              <ColorMode compact />
            </div>

            <div class="flex w-full justify-center">
              <UButton
                square
                size="sm"
                variant="soft"
                color="neutral"
                icon="i-lucide-panel-left-open"
                class="app-surface-soft flex size-11 items-center justify-center p-0"
                :ui="{ leadingIcon: 'm-0 size-7 shrink-0' }"
                @click="isSidebarCollapsed = !isSidebarCollapsed"
              />
            </div>
          </div>
        </div>

        <div
          v-else
          class="hidden border-t border-default/70 bg-default/60 py-4 px-3 xl:block"
        >
          <div class="flex items-center justify-between gap-2">
            <ColorMode />

            <UButton
              size="sm"
              variant="ghost"
              color="neutral"
              class="rounded-xl px-2.5"
              icon="i-lucide-panel-left-close"
              @click="isSidebarCollapsed = !isSidebarCollapsed"
            >
              <span>Colapsar</span>
            </UButton>
          </div>
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
