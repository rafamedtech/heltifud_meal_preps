# Patrones de interfaz

Parte del [design system de Heltifud](../../DESIGN.md). Recetas para las piezas
recurrentes. Copiar la estructura y adaptar datos y textos; no cambiar
variantes, tamaños ni radios.

Todos los ejemplos usan solo props y slots presentes en Nuxt UI 4.12 y en el
código del proyecto.

## 1. Página de administración

El layout ya aporta sidebar, navbar y panel. La página solo declara su
contenido.

```vue
<script setup lang="ts">
definePageMeta({ layout: "admin" })
useSeoMeta({ title: "Proveedores | Heltifud Meal Preps", robots: "noindex, nofollow" })
</script>

<template>
  <main class="flex min-h-full flex-col space-y-6">
    <!-- toolbar, estados y contenido -->
  </main>
</template>
```

Para dar de alta la sección:

1. Añadir el enlace en `adminLinks` (`layers/base/app/utils/helpers.ts`) con
   `label`, `icon` (Lucide) y `to`. Alimenta el sidebar y la búsqueda, que se
   filtran por rol con `canAccessAdminPage()`. Una sección nueva es solo para
   `admin`; si el rol `operations` debe verla, añadir su ruta a
   `operationsAdminPages` y sus APIs a `operationsApiRoutes` en
   `layers/auth/shared/utils/staffAccess.ts`. Dentro de una página compartida,
   ocultar enlaces y acciones de administración con
   `useStaffRole().value === 'admin'` (ver `reparto.vue`).
2. Añadir título y descripción en `pageHeaders` de
   `layers/base/app/components/admin/Header.vue`.
3. Si tiene acción principal, añadirla en el slot `#right` de ese componente
   (patrón 2).

## 2. Acción principal en la barra superior

La acción vive en `AdminHeader`. Si navega, usar `to`. Si abre un modal de la
página, comunicar con un contador en `useState`.

```vue
<!-- AdminHeader.vue -->
<script setup lang="ts">
const supplierCreateRequest = useState("admin-supplier-create-request", () => 0)
const isSuppliersPage = computed(() => route.path.replace(/\/$/, "") === "/admin/proveedores")
</script>

<template #right>
  <UButton v-if="isSuppliersPage" icon="i-lucide-plus" label="Nuevo proveedor" @click="supplierCreateRequest++" />
</template>
```

```ts
// página
const supplierCreateRequest = useState("admin-supplier-create-request", () => 0)
watch(supplierCreateRequest, openCreate)
```

Regresar desde una pantalla de edición:
`<UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Regresar" to="/admin/…" />`.

## 3. Barra de filtros

```vue
<UDashboardToolbar class="border-0 px-0">
  <div class="grid w-full gap-3 md:grid-cols-3 xl:grid-cols-[minmax(260px,1fr)_190px_190px]">
    <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar por nombre" class="md:col-span-3 xl:col-span-1" />
    <USelect v-model="status" :items="statusOptions" value-key="value" />
    <USelect v-model="type" :items="typeOptions" value-key="value" />
  </div>

  <UButton v-if="isFiltering" label="Limpiar filtros" icon="i-lucide-filter-x" variant="ghost" color="neutral" size="xs" class="mt-3 ml-auto flex" @click="resetFilters" />
</UDashboardToolbar>
```

Los filtros heredan el tamaño `xl`. Los rangos de fecha usan
`CalendarRangeInput`.

## 4. Estados de carga, error y vacío

Siempre en este orden, antes del contenido.

```vue
<UEmpty v-if="loading" loading title="Cargando proveedores" />

<UEmpty v-else-if="loadError" icon="i-lucide-cloud-alert" title="No fue posible cargar los proveedores" :description="loadError">
  <template #actions>
    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" @click="load()">Reintentar</UButton>
  </template>
</UEmpty>

<UEmpty
  v-else-if="!items.length"
  :icon="isFiltering ? 'i-lucide-search-x' : 'i-lucide-truck'"
  :title="isFiltering ? 'No encontramos coincidencias' : 'Aún no hay proveedores'"
  :description="isFiltering ? 'Prueba otra búsqueda o limpia los filtros.' : 'Crea el primer registro para comenzar.'"
>
  <template #actions>
    <UButton v-if="isFiltering" color="neutral" variant="outline" icon="i-lucide-filter-x" @click="resetFilters">Limpiar filtros</UButton>
    <UButton v-else icon="i-lucide-plus" @click="openCreate">Crear proveedor</UButton>
  </template>
</UEmpty>
```

Cuando la forma final es conocida (tarjetas, formularios, detalle), usar
`USkeleton` con las dimensiones reales dentro de un contenedor con
`role="status"` y un texto `sr-only`:

```vue
<section v-if="status === 'pending'" role="status" aria-live="polite" class="space-y-5">
  <span class="sr-only">Cargando proveedor</span>
  <USkeleton class="h-44" />
  <USkeleton class="h-10 w-full rounded-md" /> <!-- control de formulario -->
</section>
```

## 5. Tabla de datos

El tratamiento visual del template (cabecera `bg-elevated/50`, separadores) ya
está en `ui.table` de `app.config.ts`. No repetir esos overrides.

```vue
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"

const columns: TableColumn<Supplier>[] = [
  { accessorKey: "nombre", header: "Proveedor" },
  { accessorKey: "status", header: "Estado" },
  { accessorKey: "total", header: "Total" },
  { id: "actions", header: "Acciones" }
]
</script>

<template>
  <UTable :data="items" :columns="columns" aria-label="Listado de proveedores" @select="(event, row) => open(event, row.original)">
    <template #nombre-cell="{ row }">
      <ULink :to="`/admin/proveedores/${row.original.id}`">
        <UUser :name="row.original.nombre" :avatar="{ alt: row.original.nombre }" size="sm" />
      </ULink>
    </template>
    <template #status-cell="{ row }">
      <UBadge :color="statusAppearance(row.original.status).color" variant="subtle" :label="statusLabel(row.original.status)" />
    </template>
    <template #total-cell="{ row }">{{ transformPrice(row.original.total) }}</template>
    <template #actions-cell="{ row }">
      <UDropdownMenu :items="actionItems(row.original)" :content="{ align: 'end' }">
        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" aria-label="Acciones del proveedor" />
      </UDropdownMenu>
    </template>
  </UTable>
</template>
```

Reglas:

- Personalizar celdas con slots `#<columna>-cell`. Usar `h()` en `cell` solo
  cuando el slot no sea suficiente.
- La columna de acciones lleva `header: "Acciones"`; una cabecera vacía rompe
  la hidratación.
- Una sola acción: botón de icono con `aria-label`. Varias: `UDropdownMenu`.
- Carga dentro de una tarjeta: prop `:loading`. Tabla dentro de `UCard`:
  `:ui="{ body: 'p-0 sm:p-0' }"`.
- Más resultados: botón «Cargar más» (`color="neutral" variant="outline"
  icon="i-lucide-chevrons-down"`) o `UPagination`.

Menú de acciones de fila:

```ts
function actionItems(item: Supplier): DropdownMenuItem[][] {
  return [
    [
      { label: "Ver detalle", icon: "i-lucide-eye", to: `/admin/proveedores/${item.id}` },
      { label: "Editar", icon: "i-lucide-pencil", onSelect: () => openEdit(item) }
    ],
    [{ label: "Eliminar", icon: "i-lucide-trash", color: "error", onSelect: () => askDelete(item) }]
  ]
}
```

## 6. Indicadores

```vue
<UPageGrid>
  <UPageCard v-for="stat in statistics" :key="stat.title" :title="stat.title" :icon="stat.icon" :to="stat.to" variant="outline">
    <p class="text-2xl font-semibold tabular-nums text-highlighted">{{ stat.value }}</p>
  </UPageCard>
</UPageGrid>
```

Variación junto a la cifra:
`<UBadge :color="delta > 0 ? 'success' : 'error'" variant="subtle" :label="`${delta}%`" />`.

## 7. Tarjeta de contenido

```vue
<UCard title="Pedidos recientes" description="Los últimos pedidos registrados.">
  <!-- contenido -->
  <template #footer>
    <UButton to="/admin/pedidos" color="neutral" variant="outline" label="Ver todos" trailing-icon="i-lucide-arrow-right" />
  </template>
</UCard>
```

Pares etiqueta–valor dentro de una tarjeta: lista de definición.

```vue
<dl class="grid gap-4 sm:grid-cols-2">
  <div>
    <dt class="text-sm text-muted">Teléfono</dt>
    <dd class="font-medium text-highlighted">{{ customer.telefono }}</dd>
  </div>
</dl>
```

## 8. Formulario en modal

```vue
<UModal v-model:open="isFormOpen" :title="formTitle" :description="formDescription" :ui="{ content: 'max-w-3xl' }">
  <template #body>
    <UForm :schema="schema" :state="formState" class="space-y-5" @submit="save">
      <div class="grid gap-5 md:grid-cols-2">
        <UFormField label="Nombre" name="nombre" required>
          <UInput v-model="formState.nombre" icon="i-lucide-user-round" placeholder="Nombre completo" class="w-full" autofocus />
        </UFormField>
        <UFormField label="Estado" name="status" required>
          <USelect v-model="formState.status" :items="statusOptions" value-key="value" class="w-full" />
        </UFormField>
        <UFormField label="Notas" name="notas" hint="Opcional" class="md:col-span-2">
          <UTextarea v-model="formState.notas" autoresize class="w-full" />
        </UFormField>
      </div>

      <div class="flex justify-end gap-3 border-t border-default pt-5">
        <UButton color="neutral" variant="ghost" type="button" :disabled="saving" @click="closeForm">Cancelar</UButton>
        <UButton type="submit" icon="i-lucide-save" :loading="saving">{{ editing ? "Guardar cambios" : "Crear proveedor" }}</UButton>
      </div>
    </UForm>
  </template>
</UModal>
```

Reglas:

- Esquema Zod compartido con el servidor (`layers/menu/shared/types/`).
- `required` en campos obligatorios; `hint="Opcional"` en los que no lo son.
- Sin `size` en los controles; `class="w-full"` en cada uno.
- Botón de envío con `:loading`; el de cancelar con `:disabled` mientras se
  guarda.
- Formularios largos: `scrollable` en `UModal` y `max-w-4xl`.

## 9. Formulario de página completa

```vue
<main class="space-y-6">
  <UPageHeader title="Crear proveedor" description="Registra un proveedor para asociarlo a los gastos.">
    <template #links>
      <UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Regresar" @click="onBack" />
    </template>
  </UPageHeader>

  <div class="mx-auto w-full max-w-5xl">
    <!-- UForm con secciones en UCard o AdminSection -->
  </div>
</main>
```

Agrupar campos relacionados en `UCard` con `title` o en `AdminSection`. Para
ajustes en filas (etiqueta y descripción a la izquierda, control a la derecha)
usar el patrón del template descrito en
[template-dashboard.md](template-dashboard.md#ajustes).

## 10. Confirmaciones

Eliminar:

```vue
<UModal v-model:open="isDeleteOpen" title="Eliminar proveedor" :description="deleteDescription" :ui="{ content: 'max-w-md' }">
  <template #body>
    <UAlert color="error" variant="soft" icon="i-lucide-triangle-alert" title="Confirma esta acción" description="El registro se eliminará permanentemente." />
  </template>
  <template #footer>
    <div class="flex w-full justify-end gap-3">
      <UButton color="neutral" variant="ghost" :disabled="deleting" @click="cancelDelete">Cancelar</UButton>
      <UButton color="error" icon="i-lucide-trash" :loading="deleting" @click="confirmDelete">Eliminar proveedor</UButton>
    </div>
  </template>
</UModal>
```

Salir con cambios sin guardar: usar `AdminUnsavedChangesModal` con
`useLeaveGuard`. No copiar el modal en cada pantalla.

```ts
const isDirty = computed(() => JSON.stringify(formState) !== snapshot.value)
const { confirmOpen, confirmLeave, leave, leaveTo } = useLeaveGuard(isDirty)
```

```vue
<AdminUnsavedChangesModal v-model:open="confirmOpen" @leave="leave" />
```

- Mientras `isDirty` sea verdadero, salir de la ruta (sidebar, enlaces, atrás)
  pide confirmación y recargar o cerrar la pestaña muestra el aviso nativo.
- Un formulario en modal cierra con `confirmLeave(() => { isOpen.value = false })`;
  enlazar el modal con un `computed` cuyo `set(false)` llame a ese cierre para
  cubrir la X, Escape y el overlay (ver `admin/planes/index.vue`).
- Después de guardar, igualar el snapshot al estado o navegar con `leaveTo()`
  para salir sin preguntar. `leaveTo()` también sirve para salidas intencionales
  que conservan un borrador (editor de menú → crear platillo).
- El guard vive donde está el estado: si el formulario es un componente
  (`AdminFoodCatalogForm`, `AdminMenuForm`), la página solo navega.

## 11. Notificaciones

```ts
const toast = useToast()

toast.add({ title: "Proveedor creado", description: `${saved.nombre} ya está disponible.`, color: "success", icon: "i-lucide-circle-check" })

toast.add({
  title: "No se pudo guardar el proveedor",
  description: apiErrorMessage(error, "Revisa la información e intenta de nuevo."),
  color: "error",
  icon: "i-lucide-circle-alert"
})
```

Los errores de `$fetch` se muestran con `apiErrorMessage(error, respaldo)`
(`layers/base/app/utils/apiErrorMessage.ts`), que toma el `statusMessage` del
servidor; `error.message` solo dice «[DELETE] /api/…: 409». Para decidir según
el conflicto usar `apiErrorCode(error)` (`PLAN_HAS_ORDERS`,
`CUSTOMER_HAS_HISTORY`, etc.).

Título breve que nombra el resultado; descripción con el siguiente paso o la
causa. No usar `alert()` ni mensajes sueltos en la plantilla para resultados de
acciones.

## 12. Detalle de un registro

```vue
<main class="space-y-6">
  <UButton to="/admin/proveedores" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="-ml-3">Volver a proveedores</UButton>

  <!-- skeleton, luego UEmpty de error o no encontrado -->

  <template v-else>
    <UPageHeader :title="supplier.nombre" :description="`Proveedor desde ${formatDate(supplier.createdAt)}`">
      <template #links>
        <UButton icon="i-lucide-pencil" label="Editar" color="neutral" variant="outline" @click="openEdit" />
      </template>
    </UPageHeader>

    <div class="grid gap-5 lg:grid-cols-2">
      <UCard title="Contacto"><!-- dl --></UCard>
      <UCard title="Actividad"><!-- UTable --></UCard>
    </div>
  </template>
</main>
```

## 13. Selectores de fecha

```vue
<UFormField label="Fecha de entrega" name="fecha" required>
  <DatePicker v-model="formState.fecha" label="Fecha de entrega" :invalid="fechaInvalida" />
</UFormField>

<CalendarInput v-model="filters.date" label="Fecha" />
<CalendarRangeInput v-model:start="filters.from" v-model:end="filters.to" />
```

No pasar `size`: el botón hereda `xl`. No recrear la combinación
`UPopover` + `UButton` + `UCalendar` en la página.

## 14. Opciones como tarjetas

```vue
<URadioGroup v-model="value" :items="options" variant="card" orientation="horizontal" aria-label="Tipo de contenedor" :ui="{ fieldset: 'grid grid-cols-2 gap-2 sm:grid-cols-5' }" />

<UCheckboxGroup v-model="selected" :items="choices" variant="card" />
```

Cada opción con `label` y `description`. No construir tarjetas seleccionables
con `div` y manejadores de clic.

## 15. Menú de usuario y apariencia

Resuelto en `AdminUserMenu` (`UDropdownMenu` con etiqueta de usuario, submenú
de apariencia con elementos `type: "checkbox"` y cierre de sesión). Las nuevas
opciones de cuenta se añaden como grupos de ese menú.


## Estados e historial de pedidos

Referencia: `layers/admin/app/pages/admin/pedidos/[id].vue`.

- `UBadge` muestra el estado guardado con los colores de `DESIGN.md`.
- `UButton` ofrece solo transiciones del mapa compartido `orderWorkflow.ts`.
  Guardar contenido y cambiar estado son operaciones separadas.
- `UModal` confirma la transición y usa `UFormField` + `UTextarea` para el
  motivo; cancelación, reapertura y entrega fallida lo requieren.
- `UTimeline` presenta usuario, fecha, estados y motivo; no admite edición.
- Para fechas de entrega con opciones cerradas del ciclo, `USelect` muestra
  exclusivamente las fechas permitidas como cadenas `YYYY-MM-DD`. Un calendario
  libre no representa esa restricción.
- Ante conflicto de versión, `UAlert` conserva el formulario y ofrece recargar
  explícitamente. Las acciones de estado se deshabilitan con cambios sin guardar.

Se componen componentes existentes de Nuxt UI; no se creó un control propio.

## Instante con fecha y hora de negocio

Referencia: modal «Editar corte de la semana» en
`layers/admin/app/pages/admin/menu/index.vue`.

- Patrón 8 (formulario en modal) con dos campos: `CalendarInput` para la fecha
  y `UInput type="time"` con `icon="i-lucide-clock"` para la hora.
- El estado del formulario guarda la hora de pared (`YYYY-MM-DD` y `HH:MM`) en
  `America/Tijuana`. Convertir con `utcToZonedDateTime()` al abrir y con
  `zonedDateTimeToUtc()` al guardar (`layers/menu/shared/utils/weeklyCycle.ts`);
  no usar la zona horaria del navegador.
- Una regla que cruza ambos campos se muestra con `UAlert color="error"
  variant="soft"` y deshabilita el envío; el servidor la valida de nuevo.

Se componen componentes existentes; no se creó un control propio.

## Listado paginado en servidor

Referencia: `layers/admin/app/pages/admin/pedidos/index.vue`.

- `UPagination` con `v-model:page`, `:total` y `:items-per-page`, visible solo
  cuando el total supera una página; `:disabled` mientras carga.
- Cambiar cualquier filtro regresa a la página 1. El contador muestra el total
  del filtro, no las filas de la página.

## Selector con búsqueda en servidor

Referencia: selector de cliente en
`layers/admin/app/pages/admin/pedidos/crear-nuevo.vue`.

- `USelectMenu` con `v-model:search-term`, `ignore-filter` y `:loading`; la
  página consulta la API con una espera breve y descarta respuestas viejas.
- El modelo es la opción completa (sin `value-key`) con `by="value"`, para que
  la selección siga visible aunque ya no esté entre los resultados.
- El slot `#empty` distingue búsqueda en curso, sin coincidencias y error.

## Borrado bloqueado por historial

Referencias: modales de borrado en
`layers/admin/app/pages/admin/clientes/index.vue` y
`layers/admin/app/pages/admin/planes/index.vue`.

Cuando el servidor rechaza el borrado con 409, el mismo modal del patrón 10
cambia el `UAlert` a `color="warning"` con el motivo y sustituye el botón
destructivo por la alternativa que conserva el historial: «Marcar inactivo» en
clientes y «Pausar plan» en planes. Si el registro ya está inactivo o pausado,
solo queda «Cerrar».

En el formulario de un plan, una variante con pedidos no se puede quitar: el
botón de quitar se deshabilita, su `aria-label` explica el motivo y una nota
indica cuántos pedidos tiene y que se desactive en su lugar. El conteo
(`orderCount`) solo llega en el listado administrativo.


## Estado de la semana de un menú

Referencias: columna de estado en `layers/admin/app/pages/admin/menu/index.vue`
y cabecera de `layers/base/app/components/admin/MenuForm.vue`.

- La vigencia de un menú es el estado de su semana (`WeeklyCycle.status`); el
  menú no guarda un indicador propio de activo ni de publicado.
- `UBadge variant="subtle"` con `CYCLE_STATUS_LABELS` y `CYCLE_STATUS_COLORS`
  de `layers/menu/shared/utils/weeklyCycle.ts`. No redefinir el mapa de colores
  en la página.
- Abrir o cerrar pedidos se hace solo desde las acciones de la semana en
  `admin/menu`. El editor del menú guarda contenido y no cambia el estado.

## Personalización del menú de un pedido

Referencia: sección «Menú personalizado» de
`layers/admin/app/pages/admin/pedidos/[id].vue`.

- Cada lugar del pedido es fijo; no hay botones para agregar, quitar ni cambiar
  la función de un platillo.
- `USelectMenu` con `placeholder` «Sustituir por otro del menú...» lista solo
  opciones del menú de la misma familia, la más cercana primero y una entrada
  por platillo. Una opción excluida va `disabled` con el motivo en
  `description` e icono `i-lucide-ban`; una sin receta para revisar alergias usa
  `i-lucide-triangle-alert`.
- `UBadge variant="subtle"`: «Sustituido» `info` con `i-lucide-replace`;
  «Excluido para el cliente» `error`; «Revisar alergias» `warning`. El motivo va
  en `UTooltip`.
- Restaurar: `UButton` de icono `i-lucide-undo-2` dentro de `UTooltip` con el
  nombre del original; solo aparece si el original no está excluido.
- `UAlert variant="soft"` arriba de los días: menú de origen inexistente o
  cambiado (`info`), platillos excluidos (`error`), sin receta (`warning`).
- Un 409 `OFFER_VERSION_CONFLICT` usa el mismo aviso de recarga que el
  conflicto de versión del pedido.
- La bitácora va en una `UCard` «Cambios en el menú» con `UTimeline`, separada
  del historial de estados.

Se componen componentes existentes; no se creó un control propio.


## Pedido público y consulta privada

`layers/base/app/pages/pedido/index.vue` compone `UPageHeader`, `UPageCard`,
`UCheckboxGroup`, `USelectMenu`, `UForm`, `UFormField`, `UInput` y `UTextarea`.
Las cuatro secciones son plan, comidas, contacto/entregas y resumen. Hereda
controles `xl`; usa tarjetas `subtle` para comidas y entregas. Carga, oferta no
disponible, cambios de versión y envío incierto tienen estados explícitos.
El borrador conserva los datos en el dispositivo por 7 días, con aviso y
borrado mediante `UModal`. Un envío incierto conserva su payload y bloquea
edición hasta resolverlo, para reintentar sin duplicados.

`pedido/confirmacion.vue` usa las mismas piezas y muestra el snapshot recibido.
`DRAFT` se presenta al cliente como «Recibido · pendiente de confirmación», con
color `warning`; los demás colores vienen de `ORDER_STATUS_COLORS` compartido.
Compartir por WhatsApp es un `UButton` enlazado con el resumen persistido.
La invitación se administra en la ficha del cliente; la revocación de consulta
se confirma con `UModal` desde el detalle del pedido.
No se crearon controles ni wrappers propios para estas pantallas.


## Operación por consolidación guardada

`AdminProductionWorkspace` sirve a `/admin/produccion` y `/admin/compras`.
Compone los controles y tablas de Nuxt UI; la acción principal de consolidación
vive en `AdminHeader`. Carga, error con reintento y vacío son estados explícitos.
Las lecturas SSR de `useAsyncData` utilizan `useRequestFetch` para conservar la
sesión. La disponibilidad compartida de la acción se actualiza al montar,
evita diferencias entre servidor e hidratación y exige una carga exitosa.

Cada consolidación conserva comidas, sustituciones, indicaciones, exclusiones,
recetas y cantidades calculadas. Un `UAlert` advierte si su origen cambió;
una tarjeta enumera recetas incompletas. Una nueva versión inicia otra lista
independiente de compras. La edición de compra usa `UModal`, `UCheckbox` y
`USelectMenu` para vincular un gasto existente.

`/admin/cobros` compone resumen, filtros, `UTable` y `UModal` con `UForm` para
abonos y devoluciones manuales. El medio «Saldo a favor» muestra el saldo del
cliente en el modal y limita el importe con `UInputNumber :max`; como devolución,
lo acredita. `/admin/reparto` compone una `UCard` por estado (Pendiente, En
reparto, Fallida, Entregada, No entregada; `md:grid-cols-2 xl:grid-cols-3
2xl:grid-cols-5`), con dirección histórica, saldo, responsable, notas e
incidencias. Reutiliza las transiciones del pedido y abre un modal para motivo o
asignación/evidencia. Desde Fallida, «Reprogramar» añade un `CalendarInput`
opcional para la nueva fecha y «Cerrar sin entregar» (`color="error"
variant="outline"`) muestra un `UAlert` de advertencia y exige motivo.

Iniciar la preparación con saldo pendiente: el servidor responde 409
`PAYMENT_PENDING`; el modal del pedido sigue abierto con un `UAlert` warning (acción
«Registrar cobro») y un `UCheckbox` «Preparar con saldo pendiente» que vuelve
obligatorio el motivo.

### Etiquetas imprimibles

`/admin/etiquetas` usa layout independiente, filtros y acciones Nuxt UI y
artículos semánticos por comida. La cuadrícula y `@media print` son estilos
propios porque Nuxt UI/Dashboard no ofrecen paginación física de etiquetas.
Referencia A4, etiquetas de 100 × 70 mm mínimos, separación de 3 mm; el contenido
largo puede aumentar la altura. No se añaden radios propios. Los colores de
tinta se fijan a negro únicamente al imprimir. La impresión se bloquea si la
consolidación está desactualizada. Validar escala y papel antes de un lote;
no equivale a una plantilla calibrada para hojas adhesivas de un proveedor.
