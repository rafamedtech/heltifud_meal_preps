<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui"

defineProps<{
  collapsed?: boolean
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
      isLogoutConfirmOpen.value = true
    }
  }]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ side: 'top', align: 'start', collisionPadding: 12 }"
    :ui="{ content: 'w-64', itemLabel: 'truncate', itemDescription: 'truncate' }"
  >
    <UButton
      :avatar="avatar"
      :label="collapsed ? undefined : userName"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :square="collapsed"
      color="neutral"
      variant="ghost"
      aria-label="Abrir menú de usuario"
      :class="[
        'min-w-0 data-[state=open]:bg-elevated',
        collapsed ? 'size-11 justify-center p-0' : 'w-full justify-start px-3 py-2.5'
      ]"
      :ui="{ label: 'flex-1 text-left truncate', trailingIcon: 'shrink-0 text-dimmed' }"
    />
  </UDropdownMenu>
</template>
