<script setup lang="ts">
interface Props {
  collapsed?: boolean
}

const props = defineProps<Props>()

const supabase = useSupabaseClient()
const toast = useToast()
const isConfirmOpen = ref(false)
const isLoggingOut = ref(false)
const collapsed = computed(() => props.collapsed ?? false)

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
        <p class="mt-1 text-sm text-muted">
          {{ collapsed ? "Navegación compacta activa." : "Controla menús, platillos y rotación semanal." }}
        </p>
      </div>
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
