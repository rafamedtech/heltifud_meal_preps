<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()
const isConfirmOpen = ref(false)
const isLoggingOut = ref(false)
const mobileMenuOpen = ref(false)

function openMobileMenu(event?: MouseEvent) {
  ;(event?.currentTarget as HTMLButtonElement | null)?.blur()
  requestAnimationFrame(() => {
    mobileMenuOpen.value = true
  })
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

async function logout() {
  isLoggingOut.value = true

  const { error } = await supabase.auth.signOut()

  if (error) {
    isLoggingOut.value = false

    toast.add({
      title: "No fue posible cerrar sesión",
      description: error.message || "Inténtalo de nuevo.",
      color: "error"
    })
    return
  }

  isConfirmOpen.value = false
  isLoggingOut.value = false

  toast.add({
    title: "Sesión cerrada",
    description: "Redirigiendo al login.",
    color: "success"
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

      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        square
        aria-label="Abrir navegación del admin"
        @click="openMobileMenu($event)"
      />
    </div>

    <div class="hidden items-center gap-3 lg:flex">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-log-out"
        class="app-chip-surface"
        @click="isConfirmOpen = true"
      >
        Logout
      </UButton>
    </div>

    <UDrawer
      v-model:open="mobileMenuOpen"
      title="Panel admin"
      description="Navega por las secciones administrativas."
      inset
      :ui="{ content: 'max-w-xl bg-default/95 backdrop-blur-xl' }"
    >
      <template #body>
        <section class="space-y-4 px-1 pb-2">
          <div class="rounded-2xl border border-default/70 bg-elevated/50 px-4 py-3">
            <p class="text-sm font-semibold text-highlighted">Accesos rápidos</p>
            <p class="mt-1 text-xs text-muted">Gestiona menús, planes y platillos desde aquí.</p>
          </div>

          <AdminNavigationMenu :collapsed="false" />
        </section>
      </template>

      <template #footer>
        <div class="space-y-2 px-1 pb-1">
          <UButton
            color="error"
            variant="soft"
            block
            icon="i-lucide-log-out"
            label="Cerrar sesión"
            @click="closeMobileMenu(); isConfirmOpen = true"
          />

          <UButton
            color="neutral"
            variant="ghost"
            block
            label="Cerrar"
            @click="closeMobileMenu"
          />
        </div>
      </template>
    </UDrawer>

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
