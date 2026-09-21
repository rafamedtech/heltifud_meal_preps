<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const toast = useToast()
const isConfirmOpen = useState("admin-logout-confirm-open", () => false)
const isLoggingOut = ref(false)
const mobileMenuOpen = ref(false)
const expenseCreateRequest = useState("admin-expense-create-request", () => 0)
const customerCreateRequest = useState("admin-customer-create-request", () => 0)

const pageHeaders: Record<string, { title: string; description: string }> = {
  "/admin": {
    title: "Panel de gestión",
    description: "Consulta y administra las principales secciones de Heltifud Meal Preps."
  },
  "/admin/planes": {
    title: "Planes y precios",
    description: "Define qué tiempos incluye cada plan y ofrece diferentes cantidades de días."
  },
  "/admin/pedidos": {
    title: "Pedidos y entregas",
    description: "Controla cada pedido desde la confirmación hasta su segunda entrega."
  },
  "/admin/pedidos/crear-nuevo": {
    title: "Crear pedido",
    description: "Selecciona cliente, plan y entregas para registrar un nuevo pedido."
  },
  "/admin/clientes": {
    title: "Clientes",
    description: "Centraliza sus datos de contacto, origen y etapa de relación."
  },
  "/admin/gastos": {
    title: "Control de gastos",
    description: "Registra cada salida, consulta su historial y mantén visible el costo operativo."
  },
  "/admin/menu": {
    title: "Menú semanal",
    description: "Crea nuevos menús, edita los existentes y mantén visible la próxima rotación semanal."
  },
  "/admin/menu/crear-nuevo": {
    title: "Crear nuevo menú",
    description: "Crea un nuevo menú semanal y define los platillos de cada día."
  },
  "/admin/platillos": {
    title: "Platillos",
    description: "Administra el catálogo de platillos para los menús semanales."
  },
  "/admin/platillos/crear-nuevo": {
    title: "Crear nuevo platillo",
    description: "Crea un platillo reusable para utilizarlo en los menús semanales."
  }
}

const pageHeader = computed(() => {
  const path = route.path.replace(/\/$/, "") || "/"
  const exactHeader = pageHeaders[path]

  if (exactHeader) return exactHeader

  if (path.startsWith("/admin/clientes/")) {
    return {
      title: "Perfil del cliente",
      description: "Consulta sus datos de contacto, seguimiento y ubicaciones de entrega."
    }
  }

  if (path.startsWith("/admin/pedidos/")) {
    return {
      title: "Detalle del pedido",
      description: "Consulta y actualiza el estado, las entregas y el menú personalizado."
    }
  }

  if (path.startsWith("/admin/menu/")) {
    return {
      title: "Editar menú",
      description: "Actualiza la rotación, las fechas y los platillos del menú semanal."
    }
  }

  if (path.startsWith("/admin/platillos/")) {
    return {
      title: "Editar platillo",
      description: "Mantén actualizada la información del platillo dentro del catálogo."
    }
  }

  return pageHeaders["/admin"]!
})
const pageIcon = computed(() => {
  const path = route.path.replace(/\/$/, "") || "/"
  const matchingItem = adminLinks
    .flat()
    .filter((item) => typeof item.to === "string" && (path === item.to || path.startsWith(`${item.to}/`)))
    .sort((a, b) => String(b.to).length - String(a.to).length)[0]

  return matchingItem?.icon || "i-lucide-house"
})
const isExpensesPage = computed(() => route.path.replace(/\/$/, "") === "/admin/gastos")
const isCustomersPage = computed(() => route.path.replace(/\/$/, "") === "/admin/clientes")
const isMenuPage = computed(() => route.path.replace(/\/$/, "") === "/admin/menu")
const isMenuEditPage = computed(() => {
  const path = route.path.replace(/\/$/, "")
  return path.startsWith("/admin/menu/") && path !== "/admin/menu/crear-nuevo"
})
const isFoodCatalogPage = computed(() => route.path.replace(/\/$/, "") === "/admin/platillos")
const isFoodCatalogEditPage = computed(() => {
  const path = route.path.replace(/\/$/, "")
  return path.startsWith("/admin/platillos/") && path !== "/admin/platillos/crear-nuevo"
})
const foodCatalogBackRequest = useState("admin-food-catalog-back-request", () => 0)
const foodCatalogCreateTo = computed(() => ({
  path: "/admin/platillos/crear-nuevo",
  query: typeof route.query.returnTo === "string" ? { returnTo: route.query.returnTo } : {}
}))

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
    to: "/admin/clientes",
    label: "Clientes",
    icon: "i-lucide-users-round"
  },
  {
    to: "/admin/gastos",
    label: "Gastos",
    icon: "i-lucide-wallet-cards"
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

function requestExpenseCreate() {
  expenseCreateRequest.value += 1
}

function requestCustomerCreate() {
  customerCreateRequest.value += 1
}

function requestFoodCatalogBack() {
  foodCatalogBackRequest.value += 1
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
    <div class="flex min-w-0 items-center gap-2.5">
      <UIcon
        :name="pageIcon"
        class="size-6 shrink-0 text-primary"
      />
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold">{{ pageHeader.title }}</h1>
      </div>
    </div>

    <div class="flex items-center gap-2 min-[744px]:hidden">
      <UButton
        v-if="isFoodCatalogEditPage"
        square
        icon="i-lucide-arrow-left"
        aria-label="Regresar"
        @click="requestFoodCatalogBack"
      />

      <UButton
        v-if="isFoodCatalogPage"
        square
        icon="i-lucide-plus"
        aria-label="Nuevo platillo"
        :to="foodCatalogCreateTo"
      />

      <UButton
        v-if="isExpensesPage"
        square
        icon="i-lucide-plus"
        aria-label="Registrar gasto"
        @click="requestExpenseCreate"
      />

      <UButton
        v-if="isCustomersPage"
        square
        icon="i-lucide-user-plus"
        aria-label="Nuevo cliente"
        @click="requestCustomerCreate"
      />

      <UButton
        v-if="isMenuPage"
        square
        icon="i-lucide-plus"
        aria-label="Nuevo menú"
        to="/admin/menu/crear-nuevo"
      />

      <UButton
        v-if="isMenuEditPage"
        square
        icon="i-lucide-arrow-left"
        aria-label="Regresar"
        to="/admin/menu"
      />

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
          <div class="w-full px-1 pb-1">
            <AdminUserMenu
              mobile
              @logout="closeMobileMenu"
            />
          </div>
        </template>
      </USlideover>
    </div>

    <div class="hidden items-center gap-3 min-[744px]:flex">
      <UButton
        v-if="isFoodCatalogEditPage"
        icon="i-lucide-arrow-left"
        @click="requestFoodCatalogBack"
      >
        Regresar
      </UButton>

      <UButton
        v-if="isFoodCatalogPage"
        icon="i-lucide-plus"
        :to="foodCatalogCreateTo"
      >
        Nuevo platillo
      </UButton>

      <UButton
        v-if="isExpensesPage"
        icon="i-lucide-plus"
        @click="requestExpenseCreate"
      >
        Registrar
      </UButton>

      <UButton
        v-if="isCustomersPage"
        icon="i-lucide-user-plus"
        @click="requestCustomerCreate"
      >
        Nuevo
      </UButton>

      <UButton
        v-if="isMenuPage"
        icon="i-lucide-plus"
        to="/admin/menu/crear-nuevo"
      >
        Nuevo menú
      </UButton>

      <UButton
        v-if="isMenuEditPage"
        icon="i-lucide-arrow-left"
        to="/admin/menu"
      >
        Regresar
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
