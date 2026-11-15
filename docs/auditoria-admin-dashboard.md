# Auditoría y adaptación de administración a Nuxt UI

## Alcance y referencia

Se revisaron los 15 archivos de páginas de administración (14 rutas y el
contenedor `menu.vue`), su layout y los componentes compartidos que renderizan.
La implementación usa Nuxt UI 4.12.0 y las convenciones de `AGENTS.md`:
componentes primero, personalización mediante props, tamaños de formulario `xl`
heredados y radios predeterminados de cada componente.

Referencia: [Nuxt UI Dashboard](https://github.com/nuxt-ui-templates/dashboard),
commit `5fe43b8cc033a35a79e2c8432c64f70ab7ab1ef9`.
Se adaptaron su estructura de navegación, panel, barras de herramientas, tablas
y superficies a Heltifud. Se conserva su
[licencia MIT](references/nuxt-ui-dashboard-LICENSE.md).

## Resultado por ruta

| Ruta | Cambios aplicados o verificados |
| --- | --- |
| `/admin` | Inicio funcional con indicadores de datos reales, pedidos recientes con `UTable` y accesos con `UPageCard`. |
| `/admin/clientes` | Tabla nativa única con `UUser`, enlaces, acciones y estados `UEmpty`; filtros en `UDashboardToolbar`. Se conserva cargar más y crear cliente. |
| `/admin/clientes/[id]` | Cabecera `UPageHeader`, enlaces `ULink` y tabla nativa del historial de pedidos. |
| `/admin/gastos` | Tabla nativa en todos los tamaños, toolbar y estados vacíos nativos. Se conservan filtros, resumen y diálogos de registro y edición. |
| `/admin/menu` | Tabla nativa también en móvil, indicadores y skeletons con `UCard`; acciones de activación y eliminación conservadas. |
| `/admin/menu/crear-nuevo` | Adopta `MenuForm` actualizado: tarjetas nativas para comidas y editor con controles Nuxt UI. |
| `/admin/menu/[id]` | Adopta el mismo formulario y editor; se mantienen borradores y confirmaciones existentes. |
| `/admin/pedidos` | Toolbar y contenedor coherentes con el dashboard; tabla de escritorio y tarjetas móviles Nuxt UI existentes conservadas. |
| `/admin/pedidos/crear-nuevo` | Cabecera nativa y controles de cliente, plan y entregas existentes verificados. |
| `/admin/pedidos/[id]` | Cabecera y enlaces nativos; se conserva personalización de entregas y guardado. |
| `/admin/planes` | `UPageGrid`, `UCard`, `UUser`, badges y estados nativos; selección de comidas mediante `UCheckboxGroup` con variante de tarjetas. |
| `/admin/platillos` | `UTable` reemplaza la tabla artesanal; ordenación, filtros, selección y acciones nativas. |
| `/admin/platillos/crear-nuevo` | `UPageHeader` y formulario con `UFormField`, inputs, textarea y select nativos. |
| `/admin/platillos/[id]` | Adopta el formulario compartido actualizado y conserva receta, validación y guardado. |

## Componentes compartidos

- Layout con `UDashboardGroup`, `UDashboardSidebar`, `UDashboardPanel` y
  `UDashboardNavbar`; navegación con `UNavigationMenu`, búsqueda de secciones y
  menú de usuario nativos. Sidebar colapsable, redimensionable y móvil.
- Tablas con el tratamiento de cabecera y separadores del template mediante
  slots documentados del tema. Se retiraron tablas HTML y listados artesanales
  duplicados donde corresponde.
- `FoodCatalogForm`, `MetaField` y skeletons: campos y mensajes nativos, sin
  superficies que imiten controles ni ajustes de dimensiones de formulario.
- `MenuContainerSelect`: `URadioGroup` con variante de tarjetas y datos de
  capacidad. `MenuSlotEditor`: botones y campos nativos en lugar de `div` con
  roles interactivos, conservando acciones y selección de alimentos.
- La cuadrícula semanal es una composición específica del negocio con tarjetas
  Nuxt UI, ya que no existe un editor equivalente en la biblioteca.

No quedan controles HTML artesanales (`button`, `input`, `select`, `textarea`,
`table`) ni simulaciones interactivas con `role="button"` en las páginas y
componentes de administración revisados. Se conserva HTML semántico para texto,
imágenes, definiciones y distribución. No se pretende sustituir esas etiquetas
por componentes sin una necesidad funcional.

## Verificación

- ESLint, comprobación de tipos y compilación de producción completadas.
- 20 archivos de pruebas unitarias/componentes: **113 pruebas aprobadas**.
  La prueba de clientes se ajustó a la tabla única y verifica navegación con
  teclado y respeto de enlaces y botones internos.
- Verificación visible en la sesión Chrome activa del usuario: listados de las
  siete secciones, inicio, detalles de cliente/pedido/platillo/menú y pantallas
  de creación de pedido/platillo/menú.
- Apertura y cierre de creación de cliente y plan; selección de contenedores en
  el editor de menú; apertura y navegación del sidebar móvil.
- Vista móvil de 390 px: sin desbordamiento horizontal del documento. Las tablas
  conservan su desplazamiento interno cuando lo requieren.
- Sin errores ni advertencias nuevos de consola durante la comprobación final.
  No se guardaron, eliminaron ni modificaron registros durante estas pruebas.

Se mantienen los endpoints, permisos, autenticación, filtros y operaciones del
negocio. La verificación de navegador cubre renderizado y navegación; no ejecuta
operaciones destructivas ni escrituras de prueba en la base de datos.
