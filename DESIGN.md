# Design system de Heltifud

Fuente única de verdad para cualquier trabajo de interfaz en este repositorio.
**Todo agente o persona que cree o modifique UI debe leer este documento antes
de escribir código**, y volver a él ante cualquier duda de diseño.

El sistema tiene dos bases, en este orden de autoridad:

1. **Nuxt UI 4.12** (`@nuxt/ui`), a través de su API documentada. Referencia
   local: [skill de Nuxt UI](.agents/skills/nuxt-ui/SKILL.md), los temas
   generados en `.nuxt/ui/<componente>.ts` y los tipos instalados en
   `node_modules/@nuxt/ui/dist/runtime/`.
2. **Template oficial Nuxt UI Dashboard**
   ([nuxt-ui-templates/dashboard](https://github.com/nuxt-ui-templates/dashboard),
   commit de referencia `5fe43b8cc033a35a79e2c8432c64f70ab7ab1ef9`, licencia
   [MIT](docs/references/nuxt-ui-dashboard-LICENSE.md)). Define cómo se componen
   los componentes de Nuxt UI en pantallas completas.

Documentos del sistema:

| Documento | Contenido |
| --- | --- |
| `DESIGN.md` (este archivo) | Flujo obligatorio, fundamentos, reglas y checklist. |
| [docs/design-system/componentes.md](docs/design-system/componentes.md) | Qué componente usar para cada necesidad e inventario de componentes propios. |
| [docs/design-system/patrones.md](docs/design-system/patrones.md) | Recetas con código para las pantallas y piezas recurrentes. |
| [docs/design-system/template-dashboard.md](docs/design-system/template-dashboard.md) | Mapa del template: qué archivo consultar y cómo está adaptado en Heltifud. |

## 1. Flujo obligatorio

Seguir estos pasos en orden. No saltar al siguiente si el anterior resuelve la
necesidad.

1. **Buscar en el design system.** Revisar
   [componentes.md](docs/design-system/componentes.md) y
   [patrones.md](docs/design-system/patrones.md). Si ya existe un patrón o un
   componente propio para el caso, usarlo tal cual.
2. **Buscar en Nuxt UI.** Si no está documentado aquí, localizar el componente
   en la [referencia de componentes](.agents/skills/nuxt-ui/references/components.md)
   y resolver con sus props, modelos, eventos y slots. Comprobar variantes y
   slots en `.nuxt/ui/<componente>.ts` antes de personalizar.
3. **Buscar en el template.** Si hace falta componer varias piezas (una
   pantalla, una barra, un listado), consultar
   [template-dashboard.md](docs/design-system/template-dashboard.md) y
   reproducir la composición del template adaptada a Heltifud.
4. **Crear un componente propio** solo si los tres pasos anteriores no cubren
   la necesidad. Aplicar la sección 6 completa, incluida la actualización de
   este design system.

Reglas que aplican en todos los pasos:

- No inventar props, variantes ni nombres de slots. Si no aparece en los tipos
  o en el tema generado, no existe.
- No añadir librerías de UI, de iconos ni de estilos.
- No escribir controles HTML propios (`button`, `input`, `select`, `textarea`,
  `table`, `dialog`) ni elementos con `role="button"`. El HTML semántico para
  texto, listas de definición, imágenes y distribución sí es válido.

## 2. Jerarquía de personalización

| Nivel | Cuándo | Cómo |
| --- | --- | --- |
| 1. Defaults | Siempre primero | No pasar nada: el proyecto ya define tamaño, radio y color. |
| 2. Props | El componente tiene la opción | `variant`, `color`, `size`, `icon`, `loading`, `items`, etc. |
| 3. `class` / `ui` | Las props no bastan | `class` para la raíz y `ui` para slots existentes del tema. |
| 4. `app.config.ts` | El ajuste se repite en todo el proyecto | `ui.<componente>` en `layers/base/app/app.config.ts`. |
| 5. Componente propio | Nuxt UI y el template no lo cubren | Sección 6. |

Prohibido en cualquier nivel: selectores sobre la estructura interna de un
componente, CSS global nuevo para algo que la API permite, parches a
`node_modules` y estilos inline para colores, radios o tamaños.

## 3. Fundamentos

### Color

Configurado en `layers/base/app/app.config.ts`. Usar siempre el nombre
semántico, nunca la paleta.

| Token | Paleta | Uso |
| --- | --- | --- |
| `primary` | green | Acción principal, enlaces activos, marca. |
| `secondary` | pink | Acento secundario y estados intermedios. |
| `neutral` | zinc | Texto, bordes, superficies, acciones secundarias. |
| `success` / `info` / `warning` / `error` | defaults de Nuxt UI | Estados y feedback. |

Utilidades permitidas para texto, fondo y borde:

- Texto: `text-dimmed`, `text-muted`, `text-toned`, `text-default`,
  `text-highlighted`, `text-inverted`.
- Fondo: `bg-default`, `bg-muted`, `bg-elevated`, `bg-accented`, `bg-inverted`.
- Borde: `border-default`, `border-muted`, `border-accented`; `divide-default`
  y `ring-default` siguen la misma escala.
- Color semántico: `text-primary`, `bg-primary/10`, `text-error`,
  `ring-primary/25`, etc.

No usar clases de paleta (`text-green-600`, `bg-zinc-100`, `text-gray-50`,
`text-primary-500`) ni valores hexadecimales. Los modos claro y oscuro salen de
los tokens; no escribir variantes `dark:` para colores.

Excepción documentada: los tintes por tiempo de comida de
`getFoodTypeAppearance()` en `layers/base/app/utils/foodTypeAppearance.ts`.
Son colores de categoría del negocio y solo se obtienen de esa función.

Significado de color en estados de negocio (reutilizar estos mapas, no crear
otros):

| Dominio | Estado → color |
| --- | --- |
| Pedido | Borrador `warning`, Confirmado `info`, En preparación `primary`, Entrega parcial `secondary`, Entregado `success`, Cancelado `error`. |
| Plan | Activo `success`, Pausado `neutral`. |
| Cliente | Prospecto `warning`, Activo `success`, Inactivo `neutral`. |
| Semana (ciclo) | Borrador `neutral`, Pedidos abiertos `success`, Pedidos cerrados `warning`, En producción `primary`, Completada `info`. Mapa en `CYCLE_STATUS_COLORS` (`weeklyCycle.ts`); también rige el estado de un menú. |

### Tipografía

- Familia: Montserrat (declarada en `main.css` y `layers/base/nuxt.config.ts`).
  No añadir otras familias.
- Los componentes definen su propia tipografía; no pasar `text-*` ni `font-*`
  a controles de formulario, botones, badges o celdas de tabla.
- Para texto libre: `text-sm text-muted` en texto auxiliar, `text-highlighted
  font-medium` en datos destacados, `text-2xl font-semibold tabular-nums
  text-highlighted` en cifras de indicadores. Los títulos de pantalla y de
  sección los ponen `UDashboardNavbar`, `UPageHeader`, `UCard` y `UPageCard`.
- Cifras alineadas: `tabular-nums`.

### Radios

- `--ui-radius: 0.375rem` en `layers/base/app/assets/css/main.css`. No
  modificarlo para ajustar un elemento.
- Cada componente conserva su radio por defecto. No añadir `rounded-*`, ni
  estilos inline, ni overrides de `ui` por estética.
- Controles de formulario (inputs, selects, botones, selectores de fecha):
  `rounded-md` = `--radius-md` = `0.5625rem` (9 px). Ya es el default; no
  repetir la clase.
- Controles propios y sus skeletons: `rounded-md`.
- Tarjetas, modales, avatares y demás: su radio propio de Nuxt UI.

### Tamaños

- Controles de formulario heredan `size: "xl"` desde `app.config.ts`
  (`button`, `input`, `inputNumber`, `textarea`, `select`, `selectMenu`).
  **Omitir `size`** en ellos, incluidos los botones que abren un calendario.
  Altura resultante: 40 px; sus skeletons usan `h-10`.
- Acciones compactas (botones de icono en filas de tabla, cabeceras de
  tarjeta, barras de herramientas): `size="sm"`. Acciones terciarias de texto,
  como «Limpiar filtros»: `size="xs"`.
- No introducir alturas, padding, tamaños de texto o de icono que alteren las
  dimensiones de un control.

### Espaciado y layout

- Separación vertical entre bloques de una página de administración:
  `space-y-6` (el cuerpo del panel ya aplica `gap-6`).
- Rejillas de formulario: `grid gap-5 md:grid-cols-2`; un campo ancho usa
  `md:col-span-2`. Controles a ancho completo: `class="w-full"`.
- Grupos de botones: `flex justify-end gap-3`.
- Rejillas de tarjetas: `UPageGrid`.
- Formularios de página completa: contenedor `mx-auto w-full max-w-5xl`.
- Anchos de modal mediante `:ui="{ content: 'max-w-md' }"` (confirmación),
  `max-w-3xl` (formulario) o `max-w-4xl` (formulario extenso).
- Toda pantalla debe funcionar desde 390 px sin desbordamiento horizontal del
  documento. Las tablas se desplazan dentro de su contenedor.

### Iconos

- Colección única para UI nueva o modificada: **Lucide**, formato
  `i-lucide-<nombre>`. `heroicons` y `mdi` existen solo en código heredado del
  sitio público; no añadir usos nuevos.
- Pasar el icono por prop (`icon`, `leading-icon`, `trailing-icon`) cuando el
  componente la ofrece. `UIcon` solo para iconos sueltos.
- No fijar tamaño de icono dentro de un control. En iconos sueltos: `size-4`
  o `size-5`.
- Iconos recurrentes: crear `i-lucide-plus`, guardar `i-lucide-save`, eliminar
  `i-lucide-trash` / `i-lucide-trash-2`, regresar `i-lucide-arrow-left`,
  buscar `i-lucide-search`, limpiar filtros `i-lucide-filter-x`, reintentar
  `i-lucide-refresh-cw`, error de carga `i-lucide-cloud-alert`, más acciones
  `i-lucide-ellipsis-vertical`, éxito `i-lucide-circle-check`, error
  `i-lucide-circle-alert`, fecha `i-lucide-calendar`.

### Superficies

- Usar las variantes de los componentes: `UCard` y `UPageCard`
  (`outline` por defecto, `subtle` para agrupar contenido secundario).
- Las clases `app-surface*`, `app-control-surface`, `app-chip-surface` y
  `app-sidebar*` de `main.css` son heredadas. No usarlas en UI nueva ni crear
  clases globales equivalentes.
- Sombras: las de cada componente. No añadir `shadow-*`.

## 4. Convenciones de componentes

| Elemento | Convención |
| --- | --- |
| Acción principal | `UButton` sin `color` ni `variant` (primary, solid) con `icon` y `label`. Una por vista. |
| Acción secundaria | `color="neutral" variant="outline"`. |
| Cancelar / descartar | `color="neutral" variant="ghost"`. |
| Acción destructiva | `color="error"` y confirmación previa en `UModal`. |
| Salir sin guardar | `color="warning"`. |
| Acción de fila | `UButton` de icono `color="neutral" variant="ghost" size="sm"` con `aria-label`; varias acciones dentro de `UDropdownMenu` con `:content="{ align: 'end' }"`. |
| Estado | `UBadge variant="subtle"` con color semántico y `label`. |
| Aviso en contexto | `UAlert variant="soft"` con `icon`, `title` y `description`. |
| Notificación | `useToast().add({ title, description, color, icon })`. |
| Campo | `UFormField` con `label` y `name` dentro de `UForm` con esquema Zod. |
| Vacío, carga y error | `UEmpty` (ver patrones). |
| Carga con forma | `USkeleton` que refleje el tamaño final. |
| Persona | `UUser` con `:avatar="{ alt: nombre }"`. |
| Enlace | `ULink`, o la prop `to` del componente. |
| Fecha | `CalendarInput`, `CalendarRangeInput` o `DatePicker` del proyecto. |

Formato de datos: dinero con `transformPrice()`, fechas con `formatDate()` o
`formatShortDate()` (`layers/base/app/utils/`). Idioma de la interfaz: español
de México. `UApp` ya recibe el locale `es`.

Las fechas civiles `YYYY-MM-DD` (p. ej., entregas) conservan su día al formatearse
con esas funciones. Los instantes con hora y los objetos `Date` se muestran en
`America/Tijuana`; no convertir una fecha civil a `Date` antes de pasársela.

## 5. Estructura de pantallas

Administración (`/admin/**`, layout `admin`):

- El layout `layers/base/app/layouts/admin.vue` ya contiene `UDashboardGroup`,
  `UDashboardSidebar`, `UDashboardSearch` y **un único `UDashboardPanel`** con
  `AdminHeader`. Las páginas renderizan solo el contenido del cuerpo: no
  declarar otro `UDashboardPanel` ni otro `UDashboardNavbar`.
- Una sección nueva se registra en tres lugares: `adminLinks` en
  `layers/base/app/utils/helpers.ts` (navegación y búsqueda), `pageHeaders` en
  `layers/base/app/components/admin/Header.vue` (título) y, si tiene acción
  principal, un `UButton` en el slot `#right` de ese mismo componente.
- Cada página declara `definePageMeta({ layout: "admin" })` y `useSeoMeta`
  con `robots: "noindex, nofollow"`.

Sitio público (layout `default`): `UContainer` con `TheHeader` y `TheFooter`.
Para secciones y tarjetas nuevas usar los componentes de página de Nuxt UI
(`UPageSection`, `UPageCard`, `UPageGrid`, `UPageHero`, `UPageCTA`).

Las recetas completas están en [patrones.md](docs/design-system/patrones.md).

## 6. Crear un componente propio

Solo es válido si se cumplen las tres condiciones:

1. No existe un componente de Nuxt UI que lo resuelva con props, slots o
   composición.
2. No existe en el template Dashboard.
3. No existe ya en el proyecto (ver inventario en
   [componentes.md](docs/design-system/componentes.md)).

Reglas de construcción:

- **Componer componentes de Nuxt UI.** El componente propio organiza piezas de
  Nuxt UI; no reimplementa botones, campos, overlays ni tablas. Las etiquetas
  HTML quedan para estructura y texto.
- Heredar los defaults del proyecto: sin `size`, sin `rounded-*`, sin colores
  de paleta. Si el componente dibuja un control que Nuxt UI no tiene, debe
  medir 40 px de alto y usar `rounded-md`.
- API en el estilo de Nuxt UI: `defineModel` para el valor, props tipadas con
  los tipos públicos de `@nuxt/ui`, y reenvío de props con `useForwardProps`
  de `reka-ui` cuando envuelve un componente (ver `BaseButton`).
- Accesibilidad: nombre accesible en controles sin texto, foco visible,
  operable con teclado y estados de carga anunciados.
- Ubicación: `layers/base/app/components/` si es compartido (`admin/` para
  administración), o `layers/<capa>/app/components/` si pertenece a una capa.
- Si necesita estado de carga, acompañarlo de su skeleton.
- Añadir una prueba en `tests/components/` cuando tenga lógica.

Al terminar, **actualizar el design system en el mismo cambio**: registrar el
componente en el inventario de
[componentes.md](docs/design-system/componentes.md) con su propósito y la
limitación de Nuxt UI que lo justifica, y añadir la receta a
[patrones.md](docs/design-system/patrones.md) si define un patrón reutilizable.
Al comunicar el cambio, explicar brevemente esa limitación.

## 7. Checklist antes de entregar

- [ ] Se siguió el flujo de la sección 1 y se reutilizó lo existente.
- [ ] Todos los controles y contenedores son componentes de Nuxt UI.
- [ ] Sin `size` en controles de formulario; sin `rounded-*` añadidos.
- [ ] Solo tokens semánticos de color; sin paleta, hexadecimales ni `dark:`
      para color.
- [ ] Solo iconos Lucide.
- [ ] Props, variantes y slots comprobados en `.nuxt/ui/` o en los tipos.
- [ ] Estados de carga, vacío y error cubiertos.
- [ ] Botones de icono con `aria-label`; formularios con `UFormField`.
- [ ] Funciona en 390 px y en modo claro y oscuro.
- [ ] `pnpm lint` y `pnpm test:unit` sin errores.
- [ ] Verificación en navegador según `AGENTS.md`.
- [ ] Si se creó un componente o patrón, el design system quedó actualizado.

## 8. Mantenimiento

Este documento prevalece sobre ejemplos genéricos de otras skills de diseño.
Cuando una decisión de diseño cambie (tokens en `app.config.ts` o `main.css`,
actualización de Nuxt UI o del template), actualizar estos documentos en el
mismo cambio para que sigan describiendo el código real.
