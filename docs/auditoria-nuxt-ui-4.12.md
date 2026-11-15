# Auditoría de Nuxt UI 4.12.0

Fecha: 15 de noviembre de 2026. Versión anterior: 4.5.1.

## Alcance

Se revisaron 39 componentes de Nuxt UI y 626 instancias en 53 archivos de `app/` y `layers/`. Los conteos representan usos en plantillas, no elementos montados simultáneamente. Se contrastaron las 14 publicaciones intermedias, las props y eventos del código instalado, los tipos públicos y los slots del tema generado.

Esta actualización continúa en Nuxt UI 4. Los cambios incompatibles de InputMenu entre 4.6.0 y 4.6.1 no aplican: el proyecto no utiliza ese componente. No es necesario migrar los componentes compatibles solo por existir funcionalidades nuevas.

## Hallazgos corregidos

| Área | Hallazgo | Ajuste |
| --- | --- | --- |
| SelectMenu | `searchable` no es una prop de la API instalada; la búsqueda utiliza `searchInput` y está activa por defecto. | Se retiró el atributo de los cinco usos afectados y se comprobó el filtrado de proveedores en Chrome. |
| Button / Link | El wrapper descartaba todo `prefetch=false` y `noPrefetch=false`, incluso cuando eran explícitos. Existía además un parche de Vite sobre el código de la librería. | `BaseButton` usa `useForwardProps` de Reka UI, conserva los valores explícitos y deja que los ausentes hereden los defaults. Se retiró el parche: Nuxt UI 4.12 ya distingue props ausentes mediante `useComponentProps`. |
| Formularios | Varios controles forzaban tamaños distintos y el wrapper de botón alteraba iconos. | Los controles heredan `xl`; se añadió el mismo default para InputNumber y Textarea. Se conservaron los tamaños contextuales de acciones compactas. |
| Tema | Clases y CSS sustituían el radio de Card y Badge. | Se retiraron los overrides encontrados; las superficies CSS conservan su radio solo en elementos propios sin `data-slot`. El token global `--ui-radius` permanece igual. |
| Calendar | StartDate mostraba una fecha local distinta del modelo. El default de `defineModel` tampoco utilizaba el objeto de opciones. | La etiqueta y el calendario usan el mismo modelo y el default usa una fábrica. |
| Calendarios propios | Los triggers imponían `lg`; la prop `ariaLabel` colisionaba con el tratamiento de `aria-label` en la comprobación de plantillas. | Se hereda el tamaño del proyecto y se utiliza `label` para construir el nombre accesible. |
| Input / Textarea | La descripción del platillo pasaba `rows` a un Input. | Se utiliza Textarea y se retiraron overrides de padding y tipografía de esos controles. |
| GooglePlacesInput | El fallback usaba `lg`; el control externo medía 36 px y usaba el token de radio base. | Fallback con tamaño heredado y control propio de 40 px con `--radius-md`. Se incluyeron los tipos ambientales de Google Maps. |
| Tipos de selectores | Categorías readonly y modelos amplios de RadioGroup no coincidían con los tipos públicos. | Opciones compatibles con SelectItem y uniones precisas para los modelos. El selector de contenedor acepta el null del modelo existente. |
| Modal | El objeto `close` incluía `aria-label`, que no pertenece a su tipo público actual. | Se conserva `disabled` y se hereda la etiqueta localizada de cierre. |
| Table | Las cabeceras de acciones con cadena vacía provocaban un fragmento SSR sin ancla al hidratar. | Se utiliza la cabecera accesible «Acciones» en pedidos e ingredientes. |
| Ingredientes | El índice de destino podía perder su estrechamiento antes de asignar el ingrediente creado. | Se obtiene y comprueba la fila antes de actualizarla. |

Los slots personalizados revisados coinciden con los temas generados de 4.12.0. App conserva el locale español explícito, necesario porque el proyecto no utiliza `@nuxtjs/i18n`. Form, Carousel, Pagination y los overlays mantienen sus APIs vigentes; Table conserva sus columnas y slots con la corrección de cabeceras indicada.

## Validación

- Lint: correcto.
- Pruebas unitarias y de componentes: 113 correctas, en 20 archivos. Incluyen regresiones del modelo de fecha y prefetch explícito/ausente.
- Compilación de producción: correcta.
- Comprobación de tipos con TypeScript 6.0.3 y vue-tsc 3.2.6: correcta. Herramienta instalada temporalmente fuera del proyecto.
- vue-tsc 3.3.14 produjo falsos accesos `.value` sobre objetos `reactive` de FoodCatalogForm en su código virtual; se contrastó con 3.2.6 sin modificar el modelo de la aplicación para silenciarlos.
- Chrome: sesión autenticada existente, carga de gastos, apertura/cierre de Modal, búsqueda de proveedor y apertura de Calendar. Se canceló el formulario sin guardar.
- Pedidos tras la corrección de Table: recarga completa, tres pedidos visibles y consola sin errores ni advertencias de hidratación.
- Medición en Chrome: inputs visibles y botón de fecha con altura de 40 px y radio calculado de 9 px.
- La validación manual cubre escritorio y estos flujos; no constituye un recorrido manual de las 626 instancias ni sustituye una prueba móvil completa.

## Inventario final

| Componente | Instancias en plantillas |
| --- | ---: |
| UAlert | 19 |
| UApp | 2 |
| UBadge | 25 |
| UButton | 150 |
| UCalendar | 6 |
| UCard | 43 |
| UCarousel | 2 |
| UCheckbox | 1 |
| UCollapsible | 1 |
| UContainer | 1 |
| UDropdownMenu | 8 |
| UEmpty | 2 |
| UError | 1 |
| UFooter | 1 |
| UForm | 8 |
| UFormField | 62 |
| UIcon | 94 |
| UInput | 27 |
| UInputNumber | 4 |
| ULink | 1 |
| UMain | 1 |
| UModal | 20 |
| UNavigationMenu | 2 |
| UPage | 1 |
| UPageCard | 1 |
| UPageHeader | 1 |
| UPagination | 1 |
| UPopover | 6 |
| URadioGroup | 2 |
| USelect | 27 |
| USelectMenu | 6 |
| USeparator | 3 |
| USkeleton | 71 |
| USlideover | 2 |
| USwitch | 3 |
| UTable | 5 |
| UTextarea | 7 |
| UTooltip | 8 |
| UUser | 1 |

## Fuentes

- [Publicaciones oficiales de Nuxt UI](https://github.com/nuxt/ui/releases), de 4.6.0 a 4.12.0.
- [Publicación 4.12.0](https://github.com/nuxt/ui/releases/tag/v4.12.0).
- [SelectMenu](https://ui.nuxt.com/docs/components/select-menu).
- [Temas](https://ui.nuxt.com/docs/getting-started/theme).
- Tipos y componentes instalados en `node_modules/@nuxt/ui/dist/runtime/` y temas generados en `.nuxt/ui/`.
