# Template Nuxt UI Dashboard

Parte del [design system de Heltifud](../../DESIGN.md). Segunda fuente de
referencia después de Nuxt UI: indica cómo componer los componentes en
pantallas completas.

- Repositorio: <https://github.com/nuxt-ui-templates/dashboard>
- Commit de referencia: `5fe43b8cc033a35a79e2c8432c64f70ab7ab1ef9`
  (Nuxt UI `^4.12.0`, la misma versión del proyecto).
- Licencia: [MIT](../references/nuxt-ui-dashboard-LICENSE.md).
- Archivo concreto:
  `https://github.com/nuxt-ui-templates/dashboard/blob/5fe43b8cc033a35a79e2c8432c64f70ab7ab1ef9/<ruta>`

Consultar el archivo en ese commit, no en `main`, para que las props coincidan
con la versión instalada. Para leerlo sin navegador:
`gh api repos/nuxt-ui-templates/dashboard/contents/<ruta>?ref=5fe43b8cc033a35a79e2c8432c64f70ab7ab1ef9 -H "Accept: application/vnd.github.raw"`.

## Cómo usarlo

1. Identificar en la tabla el archivo del template que resuelve la necesidad.
2. Comprobar si Heltifud ya lo tiene adaptado (columna «En Heltifud»). Si es
   así, usar la versión del proyecto y su receta en [patrones.md](patrones.md).
3. Si no está adaptado, reproducir la composición del template aplicando las
   adaptaciones obligatorias de la sección siguiente.

## Adaptaciones obligatorias

El template es la referencia de composición, no de valores. Al traer un
patrón:

| En el template | En Heltifud |
| --- | --- |
| `UDashboardPanel` y `UDashboardNavbar` en cada página | Un único panel en `layouts/admin.vue`; título y acción principal en `AdminHeader`. |
| Tamaño `md` por defecto | Controles de formulario heredan `xl`. No copiar `size` salvo en acciones compactas. |
| Clases `rounded-*` (`rounded-full` en el botón de alta, `rounded-none` en rangos, `first:rounded-l-lg` en tablas y tarjetas) | No copiarlas. Cada componente conserva su radio. |
| Overrides `ui` de `UTable` en cada tabla | Ya globales en `ui.table` de `app.config.ts`. No repetirlos. |
| Cancelar con `variant="subtle"` | `color="neutral" variant="ghost"`. |
| Botones del modal dentro de `#body` | Formularios: dentro de `UForm`. Confirmaciones: en `#footer`. |
| Textos en inglés, `en-US`, USD/EUR | Español de México, `transformPrice()` y `formatDate()`. |
| Fuente Public Sans y paleta verde propia | Montserrat y tokens de `app.config.ts`. |
| `@vueuse/core`, `@tanstack/table-core`, `@tanstack/charts`, `scule` | No instalados. Antes de depender de ellos, resolver con Vue, Nuxt y Nuxt UI; añadir una dependencia requiere aprobación del usuario. |
| Selector de color primario y neutro en el menú de usuario | No se ofrece. Solo apariencia clara, oscura y sistema. |
| Aviso de cookies por toast | No aplica. |

## Mapa de archivos

### Shell

| Archivo del template | Patrón | En Heltifud |
| --- | --- | --- |
| `app/layouts/default.vue` | `UDashboardGroup` + `UDashboardSidebar` colapsable y redimensionable, dos `UNavigationMenu` (principal y secundario con `mt-auto`), `UDashboardSearch`. | `layers/base/app/layouts/admin.vue`. |
| `app/components/UserMenu.vue` | `UDropdownMenu` sobre `UButton` con avatar; submenús con `type: 'checkbox'`. | `AdminUserMenu`. |
| `app/components/TeamsMenu.vue` | Selector de equipo en la cabecera del sidebar. | No adaptado. El sidebar muestra `AppLogo`. |
| `app/components/NotificationsSlideover.vue` | `USlideover` con lista de `UAvatar` + `UChip` y fecha relativa. | No adaptado. Referencia para un panel de notificaciones o actividad. |
| `app/composables/useDashboard.ts` | Estado compartido y atajos con `defineShortcuts`. | No adaptado. Estado entre navbar y página con `useState` (patrón 2). |
| `app/error.vue` | `UError`. | `app/error.vue`. |

### Inicio

| Archivo del template | Patrón | En Heltifud |
| --- | --- | --- |
| `app/pages/index.vue` | Navbar con acciones, `UDashboardToolbar` con rango de fechas y periodo, cuerpo con indicadores, gráfica y tabla. | `layers/admin/app/pages/admin/index.vue`. |
| `app/components/home/HomeStats.vue` | `UPageGrid` de `UPageCard` con icono, título, cifra y `UBadge` de variación. | Patrón 6. |
| `app/components/home/HomeSales.vue` | `UTable` con `UBadge` de estado y columna numérica alineada a la derecha. | Patrón 5. |
| `app/components/home/HomeChart.vue` | `UChart type="area"` dentro de `UCard` con total en la cabecera. | No adaptado. Referencia para gráficas; requiere `@tanstack/charts`, que no está instalado. |
| `app/components/home/HomeDateRangePicker.vue` | `UPopover` + `UButton` + `UCalendar range` con rangos predefinidos. | `CalendarRangeInput`. Los rangos predefinidos no están adaptados. |
| `app/components/home/HomePeriodSelect.vue` | `USelect variant="ghost"` en toolbar. | No adaptado. |

### Listados

| Archivo del template | Patrón | En Heltifud |
| --- | --- | --- |
| `app/pages/customers.vue` | Búsqueda, filtro de estado, visibilidad de columnas con `UDropdownMenu`, selección de filas con `UCheckbox`, ordenación en cabecera, acciones por fila, pie con conteo y `UPagination`. | `clientes/index.vue` y `AdminFoodCatalogTable` (ordenación y selección). |
| `app/components/customers/AddModal.vue` | `UModal` con `UForm` + Zod; el botón que lo abre es el slot por defecto del modal. | Patrón 8. El botón de apertura vive en `AdminHeader`. |
| `app/components/customers/DeleteModal.vue` | Confirmación con conteo y `loading-auto`. | Patrón 10. |

### Bandeja de dos paneles

| Archivo del template | Patrón | En Heltifud |
| --- | --- | --- |
| `app/pages/inbox.vue` | Dos `UDashboardPanel` (lista redimensionable y detalle), `UTabs` como filtro en el navbar, `USlideover` para el detalle en móvil. | No adaptado. Requiere un layout sin el panel único de `admin.vue`; consultar al usuario antes de introducirlo. |
| `app/components/inbox/InboxList.vue` | Lista seleccionable con `divide-y divide-default`, borde lateral de selección y navegación con flechas. | No adaptado. |
| `app/components/inbox/InboxMail.vue` | Panel de detalle con navbar propio (`:toggle="false"`), botón de cierre y acciones de icono con `UTooltip`. | No adaptado. |

### Ajustes

| Archivo del template | Patrón | En Heltifud |
| --- | --- | --- |
| `app/pages/settings.vue` | Subnavegación con `UNavigationMenu highlight` en `UDashboardToolbar`; cuerpo centrado `lg:max-w-2xl`. | No adaptado. Referencia para secciones con subpáginas. |
| `app/pages/settings/index.vue` | Cabecera de sección con `UPageCard variant="naked" orientation="horizontal"` y botón de guardar; campos en `UPageCard variant="subtle"` separados por `USeparator`, cada `UFormField` en fila con `description`. | No adaptado. Receta abajo. |
| `app/pages/settings/members.vue` + `app/components/settings/MembersList.vue` | `UPageCard` con búsqueda en `#header` y lista `divide-y divide-default` con avatar, `USelect` y `UDropdownMenu`. | No adaptado. |
| `app/pages/settings/notifications.vue` | Grupos de `USwitch` en `UPageCard variant="subtle"` con `UFormField` en fila. | No adaptado. |
| `app/pages/settings/security.vue` | Cambio de contraseña en `UPageCard variant="subtle"` y tarjeta de eliminación de cuenta con botón `color="error"`. | No adaptado. |

## Recetas del template aún no adaptadas

### Ajustes

Formulario de ajustes en filas, ya con las adaptaciones de Heltifud:

```vue
<UForm id="settings" :schema="schema" :state="state" @submit="onSubmit">
  <UPageCard title="Perfil" description="Esta información se muestra en los pedidos." variant="naked" orientation="horizontal" class="mb-4">
    <UButton form="settings" type="submit" label="Guardar cambios" icon="i-lucide-save" class="w-fit lg:ms-auto" />
  </UPageCard>

  <UPageCard variant="subtle">
    <UFormField name="nombre" label="Nombre" description="Aparece en recibos y comunicaciones." required class="flex max-sm:flex-col justify-between items-start gap-4">
      <UInput v-model="state.nombre" autocomplete="off" />
    </UFormField>
    <USeparator />
    <UFormField name="avisos" label="Avisos por correo" description="Recibe un resumen semanal." class="flex max-sm:flex-col justify-between items-start gap-4">
      <USwitch v-model="state.avisos" />
    </UFormField>
  </UPageCard>
</UForm>
```

### Subnavegación de una sección

```vue
<UDashboardToolbar class="border-0 px-0">
  <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
</UDashboardToolbar>
<NuxtPage />
```

### Lista con acciones

```vue
<UPageCard variant="subtle" :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
  <template #header>
    <UInput v-model="q" icon="i-lucide-search" placeholder="Buscar" class="w-full" />
  </template>

  <ul role="list" class="divide-y divide-default">
    <li v-for="item in items" :key="item.id" class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <UUser :name="item.nombre" :description="item.correo" :avatar="{ alt: item.nombre }" />
      <UDropdownMenu :items="actions(item)" :content="{ align: 'end' }">
        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" aria-label="Acciones" />
      </UDropdownMenu>
    </li>
  </ul>
</UPageCard>
```

### Filtro por pestañas

```vue
<UTabs v-model="selectedTab" :items="tabItems" :content="false" size="xs" />
```

## Al adaptar un patrón nuevo

Mover su fila a «adaptado» indicando el archivo de Heltifud, y documentar la
receta en [patrones.md](patrones.md). Si se actualiza Nuxt UI, revisar el
template en su versión equivalente y actualizar el commit de referencia en este
archivo, en [DESIGN.md](../../DESIGN.md) y en
[la auditoría](../auditoria-admin-dashboard.md) si corresponde.
