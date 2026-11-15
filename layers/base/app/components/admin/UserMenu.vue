<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui"

defineProps<{
  collapsed?: boolean
  mobile?: boolean
}>()

const emit = defineEmits<{
  logout: []
}>()

const user = useSupabaseUser()
const colorMode = useColorMode()
const isLogoutConfirmOpen = useState("admin-logout-confirm-open", () => false)

const userName = computed(() => {
  const metadata = user.value?.user_metadata
  return metadata?.full_name || metadata?.name || user.value?.email?.split("@")[0] || "Mi cuenta"
})
const avatar = computed(() => ({
  src: user.value?.user_metadata?.avatar_url,
  alt: userName.value
}))

const appearances = [
  { label: "Claro", icon: "i-lucide-sun", value: "light" },
  { label: "Oscuro", icon: "i-lucide-moon", value: "dark" },
  { label: "Sistema", icon: "i-lucide-monitor", value: "system" }
]

const items = computed<DropdownMenuItem[][]>(() => [
  [{
    type: "label",
    label: userName.value,
    description: user.value?.email,
    avatar: avatar.value
  }],
  [{
    label: "Apariencia",
    icon: "i-lucide-sun-moon",
    children: appearances.map(appearance => ({
      label: appearance.label,
      icon: appearance.icon,
      type: "checkbox" as const,
      checked: colorMode.preference === appearance.value,
      onSelect(event: Event) {
        event.preventDefault()
        colorMode.preference = appearance.value
      }
    }))
  }],
  [{
    label: "Cerrar sesión",
    icon: "i-lucide-log-out",
    onSelect() {
      emit("logout")
      isLogoutConfirmOpen.value = true
    }
  }]
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ side: 'top', align: 'start' }" :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-56' }">
    <UButton
      :avatar="avatar"
      :label="collapsed ? undefined : userName"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :square="collapsed"
      color="neutral"
      variant="ghost"
      aria-label="Abrir menú de usuario"
      class="w-full data-[state=open]:bg-elevated"
      :ui="{ label: 'flex-1 text-left truncate' }"
    />
  </UDropdownMenu>
</template>
