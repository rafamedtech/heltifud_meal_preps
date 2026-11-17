# Catálogo de componentes

Parte del [design system de Heltifud](../../DESIGN.md). Consultar aquí qué
componente usar antes de escribir interfaz. El orden de búsqueda es: este
catálogo → Nuxt UI → template Dashboard → componente propio.

Los nombres, props y slots se confirman en
[la referencia de Nuxt UI](../../.agents/skills/nuxt-ui/references/components.md),
en `.nuxt/ui/<componente>.ts` y en los tipos de
`node_modules/@nuxt/ui/dist/runtime/components/`.

## 1. Qué usar para cada necesidad

### Estructura y navegación

| Necesidad | Componente | Notas |
| --- | --- | --- |
| Shell de administración | `UDashboardGroup`, `UDashboardSidebar`, `UDashboardPanel` | Ya montado en `layouts/admin.vue`. No repetir en páginas. |
| Barra superior de la página | `UDashboardNavbar` | Vive en `AdminHeader`. Título e icono salen de la ruta. |
| Barra de filtros o pestañas | `UDashboardToolbar` | Slots `#left` y `#right`, o contenido libre. |
| Navegación lateral o de secciones | `UNavigationMenu` | `orientation="vertical"` en sidebar; `highlight` en subnavegación. |
| Búsqueda global | `UDashboardSearch` + `UDashboardSearchButton` | Grupos generados desde `adminLinks`. |
| Colapsar sidebar | `UDashboardSidebarCollapse` | Ya en `AdminHeader`. |
| Cabecera dentro del cuerpo | `UPageHeader` | Título, descripción y acciones en `#links`. |
| Migas de pan | `UBreadcrumb` | |
| Pestañas | `UTabs` | `:content="false"` cuando solo filtran. |
| Pasos de un proceso | `UStepper` | |
| Paginación | `UPagination` | |
| Sitio público: contenedor, cabecera, pie | `UContainer`, `UHeader`, `UFooter`, `UMain`, `UPage` | |
| Sitio público: secciones | `UPageSection`, `UPageHero`, `UPageCTA`, `UPageFeature` | |

### Contenido y datos

| Necesidad | Componente | Notas |
| --- | --- | --- |
| Tabla de datos | `UTable` | Estilo global del template ya aplicado en `app.config.ts`. |
| Tarjeta de contenido | `UCard` | Props `title` y `description`; slots `#header`, `#footer`. |
| Tarjeta enlazable o indicador | `UPageCard` | `icon`, `title`, `to`; `variant="outline"` o `subtle`. |
| Rejilla de tarjetas | `UPageGrid` | |
| Lista con título y descripción | `UPageList`, o `ul` con `divide-y divide-default` | Patrón de `MembersList` del template. |
| Persona con avatar | `UUser` | `size="sm"` en tablas. |
| Avatar suelto o grupo | `UAvatar`, `UAvatarGroup` | |
| Etiqueta de estado | `UBadge` | `variant="subtle"` y color semántico. |
| Indicador sobre un elemento | `UChip` | |
| Atajo de teclado o contador | `UKbd` | |
| Separador | `USeparator` | |
| Contenido plegable | `UCollapsible`, `UAccordion` | |
| Línea de tiempo | `UTimeline` | |
| Árbol | `UTree` | |
| Carrusel | `UCarousel` | |
| Progreso | `UProgress` | |
| Gráfica | `UChart` | Requiere `@tanstack/charts`, no instalado: pedir aprobación antes de añadirlo. |

### Formularios

| Necesidad | Componente | Notas |
| --- | --- | --- |
| Formulario con validación | `UForm` + `UFormField` | Esquema Zod; `name` en cada campo. |
| Texto | `UInput` | `icon` para el icono inicial; `class="w-full"`. |
| Texto largo | `UTextarea` | `autoresize` cuando crece con el contenido. |
| Número | `UInputNumber` | |
| Lista corta de opciones | `USelect` | `:items` con `value-key="value"`. |
| Lista con búsqueda | `USelectMenu` | La búsqueda está activa por defecto; no existe `searchable`. |
| Autocompletar con texto libre | `UInputMenu` | |
| Etiquetas | `UInputTags` | |
| Opción única visible | `URadioGroup` | `variant="card"` para opciones con descripción. |
| Varias opciones visibles | `UCheckboxGroup` | `variant="card"` como en planes. |
| Casilla | `UCheckbox` | |
| Interruptor | `USwitch` | |
| Rango numérico | `USlider` | |
| Fecha única | `CalendarInput` o `DatePicker` (propios) | Ver inventario. |
| Rango de fechas | `CalendarRangeInput` (propio) | |
| Fecha u hora tecleada | `UInputDate`, `UInputTime` | |
| Código de verificación | `UPinInput` | |
| Archivos | `UFileUpload` | |
| Color | `UColorPicker` | |
| Controles unidos | `UFieldGroup` | |
| Dirección | `GooglePlacesInput` (propio) | |

### Feedback y overlays

| Necesidad | Componente | Notas |
| --- | --- | --- |
| Diálogo | `UModal` | `title`, `description`, slots `#body` y `#footer`. |
| Panel lateral | `USlideover` | |
| Panel inferior en móvil | `UDrawer` | |
| Contenido flotante | `UPopover` | Base de los selectores de fecha. |
| Menú de acciones | `UDropdownMenu` | Arreglo anidado para grupos con separador. |
| Menú contextual | `UContextMenu` | |
| Ayuda al pasar el cursor | `UTooltip` | Obligatorio en botones de icono no evidentes. |
| Paleta de comandos | `UCommandPalette` | |
| Notificación | `useToast()` | |
| Aviso en la página | `UAlert` | `variant="soft"`. |
| Aviso global superior | `UBanner` | |
| Vacío, carga o error de datos | `UEmpty` | Prop `loading` para la carga. |
| Marcador de carga | `USkeleton` | |
| Página de error | `UError` | Ya en `app/error.vue`. |

## 2. Componentes propios del proyecto

Antes de crear un componente, comprobar esta lista. Todos componen Nuxt UI.

### Compartidos (`layers/base/app/components/`)

| Componente | Compone | Propósito | Por qué existe |
| --- | --- | --- | --- |
| `CalendarInput` | `UPopover`, `UButton`, `UCalendar` | Fecha única con modelo `string` ISO; cierra al elegir un día; `disabled` bloquea el botón mientras se guarda. | Nuxt UI no ofrece un selector de fecha con botón y popover en una sola pieza. |
| `CalendarRangeInput` | `UPopover`, `UButton`, `UCalendar` | Rango con modelos `start` y `end`, y limpieza. | Igual que el anterior, para rangos. |
| `DatePicker` | `UPopover`, `UButton`, `UCalendar` | Fecha única con modelo `Date`, estado `invalid` y cierre al elegir. | Igual; variante para formularios con validación. |
| `BaseButton` | `UButton` | Reenvía props con `useForwardProps`. | Wrapper heredado del sitio público. En UI nueva usar `UButton`. |
| `BaseCard` | `UCard`, `NuxtImg` | Tarjeta con imagen del sitio público. | Composición de marketing. |
| `BaseSection` | HTML semántico | Sección con título del sitio público. | Heredado. En UI nueva usar `UPageSection`. |
| `BaseSeparator` | `hr` | Separador del sitio público. | Heredado. En UI nueva usar `USeparator`. |
| `BaseGallery` | `UCarousel` | Galería de imágenes. | Composición de marketing. |
| `AppLogo` | `NuxtImg` | Logotipo. | Marca. |
| `AppModal` | `UModal` | Modal de variantes de plan para `useOverlay`. | Contenido de negocio. |
| `ColorMode` | `UButton` | Cambio de tema en el sitio público. | Heredado; en administración se usa `AdminUserMenu`. |
| `TheHeader`, `TheFooter`, `MobileNav`, `NavigationMenu` | `UNavigationMenu`, `USlideover` | Shell del sitio público. | Contenido de marca. |
| `MenuCard`, `MenuMeal`, `PlanCard`, `StepCard`, `FaqQuestion`, `SelectMenu` | `UCard`, `UButton`, `UCollapsible`, `USelect` | Piezas del sitio público. | Contenido de negocio. |

### Administración (`layers/base/app/components/admin/`)

| Componente | Compone | Propósito |
| --- | --- | --- |
| `AdminHeader` | `UDashboardNavbar`, `UDashboardSidebarCollapse`, `UButton`, `UModal` | Título por ruta, acción principal y cierre de sesión. |
| `AdminUserMenu` | `UDropdownMenu`, `UButton` | Usuario, apariencia y cierre de sesión. |
| `AdminNavigationMenu` | `UNavigationMenu` | Navegación a partir de `adminLinks`. |
| `AdminSection` | `UPageSection` | Sección con título dentro de formularios. |
| `AdminMetaField` | `UFormField` | Campo con etiqueta y estado inválido. |
| `AdminMenuContainerSelect` | `URadioGroup` / `USelect` | Selector de contenedor en tarjetas o lista. |
| `AdminFoodCatalogTable` (+ `Skeleton`) | `UTable` | Catálogo de platillos en modo gestión o selección. |
| `AdminFoodCatalogForm` (+ `Skeleton`), `AdminFoodItemFields`, `AdminFoodRecipeFields` | `UForm`, `UFormField`, controles | Alta y edición de platillos y recetas. |
| `AdminProductionWorkspace` | `UCard`, `UTable`, `USelect`, `UAlert`, `UEmpty`, `UModal`, `UCheckbox`, `USelectMenu` | Producción y compras por consolidación histórica. Composición de negocio sin equivalente completo en Nuxt UI o Dashboard; comparte selección de ciclo, versiones y advertencias. |
| `AdminMenuForm` (+ `Skeleton`), `AdminMenuSlotEditor`, `AdminMenuIndexSkeleton` | `UCard`, controles | Editor del menú semanal. Composición de negocio sin equivalente en Nuxt UI. Muestra el estado de la semana; no publica ni abre pedidos (ver patrón «Estado de la semana de un menú»). |

### Por capa

| Componente | Capa | Compone | Propósito |
| --- | --- | --- | --- |
| `GooglePlacesInput` | `admin` | `UInput`, `UIcon` | Autocompletado de direcciones de Google Maps. Su control externo mide 40 px y usa `--radius-md`. |
| `CustomerOrderHistory` | `admin` | `UCard`, `UTable`, `UPagination`, `UEmpty` | Historial de pedidos de un cliente. |
| `CustomerExclusions` | `admin` | `UCard`, `UBadge`, `UAlert`, `UModal`, `UForm`, `USelectMenu` | Alergias y exclusiones del cliente con su modal de edición. Composición de negocio: carga ingredientes y platillos al abrir y guarda la lista completa. |
| `StartDate` | `menu` | `UPopover`, `UButton`, `UCalendar` | Fecha de inicio en el menú público. |
| `MenuDate`, `MenuMobileCarousel` | `menu` | HTML | Piezas del menú público. |

`PlanCard` conserva la composición de marketing y ahora navega a `/pedido`
con los IDs de plan y variante; ya no abre el modal del catálogo de WhatsApp.
El formulario y la consulta privada componen directamente piezas Nuxt UI (ver
[patrón de pedido público](patrones.md#pedido-público-y-consulta-privada)).

## 3. Qué no reutilizar en UI nueva

- Clases globales `app-surface*`, `app-control-surface*`, `app-chip-surface`,
  `app-nav-item`, `app-sidebar*`, `app-divider` y `admin-shell` de `main.css`.
- Iconos `i-heroicons-*` e `i-mdi-*`.
- Clases de paleta presentes en el sitio público (`text-primary-500`,
  `bg-green-50`, `text-gray-50`, `text-amber-800`).
- `BaseButton`, `BaseSection` y `BaseSeparator` como punto de partida.

Estos elementos se conservan donde ya están. Al modificar una pantalla que los
usa, sustituirlos por el equivalente del design system solo dentro del alcance
del cambio pedido.

## 4. Registrar un componente nuevo

Añadir una fila en la tabla que corresponda de la sección 2 con: nombre,
componentes de Nuxt UI que compone, propósito y la limitación de Nuxt UI o del
template que lo justifica. Si introduce un patrón reutilizable, documentarlo en
[patrones.md](patrones.md).
