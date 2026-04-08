<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const toast = useToast()
const isConfirmOpen = ref(false)
const isLoggingOut = ref(false)
const mobileMenuOpen = ref(false)

const mobileNavItems = [
  {
    to: "/admin",
    label: "Inicio",
    icon: "i-lucide-house"
  },
  {
    to: "/admin/planes",
    label: "Planes",
    icon: "i-lucide-clipboard-list"
  },
  {
    to: "/admin/menu",
    label: "Menú",
    icon: "i-lucide-calendar-range"
  },
  {
    to: "/admin/platillos",
    label: "Platillos",
    icon: "i-lucide-utensils-crossed"
  }
] as const

function isActive(path: string) {
  return route.path === path
}

function mobileLinkClass(path: string) {
  return isActive(path)
    ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_0_1px_rgb(var(--ui-primary)/0.08)]"
    : "border-default/70 bg-default/40 text-toned hover:border-primary/20 hover:bg-elevated/80 hover:text-highlighted"
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function openLogoutConfirmFromMobile() {
  closeMobileMenu()
  isConfirmOpen.value = true
}

async function logout() {
  isLoggingOut.value = true

  const { error } = await supabase.auth.signOut()

  if (error) {
    isLoggingOut.value = false

    toast.add({
      title: "No fue posible cerrar sesión",
      description: error.message || "Inténtalo de nuevo.",
      color: "error",
      icon: "i-lucide-circle-alert"
    })
    return
  }

  isConfirmOpen.value = false
  isLoggingOut.value = false

  toast.add({
    title: "Sesión cerrada",
    description: "Redirigiendo al login.",
    color: "success",
    icon: "i-lucide-check-circle"
  })

  await navigateTo("/login", { replace: true })
}
</script>

<template>
  <header class="flex min-h-24 items-center justify-between gap-4">
    <div class="min-w-0">
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold text-highlighted">Panel de gestión</h1>
        <p class="mt-1 text-sm text-muted">Controla menús, platillos y rotación semanal.</p>
      </div>
    </div>

    <div class="flex items-center gap-2 lg:hidden">
      <ColorMode compact />

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium text-default transition-colors hover:bg-elevated active:bg-elevated focus:outline-none focus-visible:bg-elevated"
        aria-label="Abrir navegación del admin"
        @click="mobileMenuOpen = true"
      >
        <UIcon
          name="i-lucide-menu"
          class="size-5"
        />
      </button>

      <USlideover
        v-model:open="mobileMenuOpen"
        title="Navegación del panel"
        description="Accesos del panel administrativo."
        inset
        side="bottom"
        :ui="{
          content: 'max-w-xl bg-default/95 backdrop-blur-xl',
          title: 'sr-only',
          description: 'sr-only'
        }"
      >
        <template #body>
          <section class="space-y-3 px-1 pb-2">
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
          <div class="px-1 pb-1">
            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-log-out"
              class="w-full justify-center py-3"
              @click="openLogoutConfirmFromMobile"
            >
              Cerrar sesión
            </UButton>
          </div>
        </template>
      </USlideover>
    </div>

    <div class="hidden items-center gap-3 lg:flex">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-log-out"
        class="app-chip-surface"
        @click="isConfirmOpen = true"
      >
        Salir
      </UButton>
    </div>

    <UModal
      v-model:open="isConfirmOpen"
      title="Cerrar sesión"
      description="¿Seguro que quieres salir del panel administrativo?"
      :ui="{ content: 'max-w-md' }"
    >
      <template #body>
        <UAlert
          color="error"
          variant="soft"
          icon="i-lucide-log-out"
          title="Confirma esta acción"
          description="Se cerrará tu sesión actual y regresarás a la pantalla de login."
        />
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="isLoggingOut"
            @click="isConfirmOpen = false"
          >
            Cancelar
          </UButton>

          <UButton
            color="error"
            :loading="isLoggingOut"
            :disabled="isLoggingOut"
            icon="i-lucide-log-out"
            @click="logout"
          >
            Cerrar sesión
          </UButton>
        </div>
      </template>
    </UModal>
  </header>
</template>
