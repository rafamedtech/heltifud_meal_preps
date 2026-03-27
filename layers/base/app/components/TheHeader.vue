<script setup lang="ts">
const route = useRoute()
const mobileMenuOpen = ref(false)
const mobileNavItems = [
  {
    to: "/",
    label: "Inicio",
    icon: "i-lucide-house"
  },
  {
    to: "/planes",
    label: "Planes",
    icon: "i-lucide-newspaper"
  },
  {
    to: "/menu",
    label: "Menú",
    icon: "i-lucide-notebook-tabs"
  }
] as const

function isActive(path: string) {
  return route.path === path
}

function linkClass(path: string) {
  return isActive(path) ? "text-primary" : "text-muted hover:text-highlighted"
}

function mobileLinkClass(path: string) {
  return isActive(path)
    ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_0_1px_rgb(var(--ui-primary)/0.08)]"
    : "border-default/70 bg-default/40 text-toned hover:border-primary/20 hover:bg-elevated/80 hover:text-highlighted"
}

function openMobileMenu(event?: MouseEvent) {
  ;(event?.currentTarget as HTMLButtonElement | null)?.blur()
  requestAnimationFrame(() => {
    mobileMenuOpen.value = true
  })
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="bg-green-50/50 px-6 py-4 dark:bg-neutral-900/50">
    <div class="mx-auto max-w-7xl">
      <div class="flex items-center justify-between gap-4">
        <AppLogo />

        <nav class="hidden items-center gap-6 md:flex">
          <NuxtLink
            to="/"
            :class="['inline-flex items-center gap-2 text-sm transition-colors', linkClass('/')]"
          >
            <UIcon
              name="i-lucide-house"
              class="size-4"
            />
            Inicio
          </NuxtLink>
          <NuxtLink
            to="/planes"
            :class="['inline-flex items-center gap-2 text-sm transition-colors', linkClass('/planes')]"
          >
            <UIcon
              name="i-lucide-newspaper"
              class="size-4"
            />
            Planes
          </NuxtLink>
          <NuxtLink
            to="/menu"
            :class="['inline-flex items-center gap-2 text-sm transition-colors', linkClass('/menu')]"
          >
            <UIcon
              name="i-lucide-notebook-tabs"
              class="size-4"
            />
            Menú
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <ColorMode hide-label />

          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            square
            class="md:hidden"
            aria-label="Abrir navegación"
            @click="openMobileMenu($event)"
          />

          <BaseButton
            icon="i-lucide-rocket"
            label="Ordenar"
            to="https://wa.me/c/5216648161284"
            target="_blank"
            class="hidden md:inline-flex"
          />
        </div>
      </div>
    </div>
  </header>

  <UDrawer
    v-model:open="mobileMenuOpen"
    title="Navegación"
    description="Explora Heltifud."
    inset
    :ui="{ content: 'max-w-xl bg-default/95 backdrop-blur-xl' }"
  >
    <template #body>
      <section class="space-y-3 px-1 pb-2">
        <div class="flex items-center gap-3 rounded-2xl border border-default/70 bg-elevated/50 px-4 py-3">
          <div
            class="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20"
          >
            <UIcon
              name="i-lucide-menu"
              class="size-5"
            />
          </div>

          <div class="min-w-0">
            <p class="text-sm font-semibold text-highlighted">
              {{ mobileNavItems.find(item => isActive(item.to))?.label ?? "Explorar" }}
            </p>
            <p class="text-xs text-muted">
              Accede rápido a las secciones principales.
            </p>
          </div>
        </div>

        <NuxtLink
          v-for="item in mobileNavItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all active:scale-[0.99]',
            mobileLinkClass(item.to)
          ]"
          @click="closeMobileMenu"
        >
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-default/90 ring-1 ring-default/80"
          >
            <UIcon
              :name="item.icon"
              class="size-5"
            />
          </div>

          <span class="min-w-0 flex-1 text-base font-semibold">{{ item.label }}</span>

          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 shrink-0 opacity-55"
          />
        </NuxtLink>
      </section>
    </template>

    <template #footer>
      <div class="space-y-2 px-1 pb-1">
        <BaseButton
          icon="i-lucide-rocket"
          label="Ordenar"
          to="https://wa.me/c/5216648161284"
          target="_blank"
          class="w-full justify-center py-3"
        />

        <UButton
          color="neutral"
          variant="ghost"
          block
          label="Cerrar"
          class="py-3"
          @click="closeMobileMenu"
        />
      </div>
    </template>
  </UDrawer>
</template>
