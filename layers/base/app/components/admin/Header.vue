<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const toast = useToast()
const isConfirmOpen = useState("admin-logout-confirm-open", () => false)
const isLoggingOut = ref(false)
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

const planCreateRequest = useState("admin-plan-create-request", () => 0)
const isPlansPage = computed(() => route.path.replace(/\/$/, "") === "/admin/planes")
const isOrdersPage = computed(() => route.path.replace(/\/$/, "") === "/admin/pedidos")
</script>

<template>
  <UDashboardNavbar :title="pageHeader.title" :icon="pageIcon" :ui="{ right: 'gap-2' }">
    <template #leading>
      <UDashboardSidebarCollapse size="sm" color="neutral" variant="ghost" />
    </template>
    <template #right>
      <UButton v-if="isFoodCatalogEditPage" color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Regresar" @click="requestFoodCatalogBack" />
      <UButton v-if="isFoodCatalogPage" icon="i-lucide-plus" label="Nuevo platillo" :to="foodCatalogCreateTo" />
      <UButton v-if="isExpensesPage" icon="i-lucide-plus" label="Registrar gasto" @click="requestExpenseCreate" />
      <UButton v-if="isCustomersPage" icon="i-lucide-user-plus" label="Nuevo cliente" @click="requestCustomerCreate" />
      <UButton v-if="isPlansPage" icon="i-lucide-plus" label="Crear plan" @click="planCreateRequest++" />
      <UButton v-if="isOrdersPage" icon="i-lucide-plus" label="Nuevo pedido" to="/admin/pedidos/crear-nuevo" />
      <UButton v-if="isMenuPage" icon="i-lucide-plus" label="Nuevo menú" to="/admin/menu/crear-nuevo" />
      <UButton v-if="isMenuEditPage" color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Regresar" to="/admin/menu" />
    </template>
  </UDashboardNavbar>
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
</template>
