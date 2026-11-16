# Plan de etapa 1: cimientos del pedido semanal

Fecha: 15 de noviembre de 2026. Origen:
[auditoria-flujo-semanal.md](auditoria-flujo-semanal.md).

## Objetivo

Que un pedido capturado desde admin sea confiable y tenga la estructura que necesitan
las etapas siguientes (intercambio, pedido del cliente, lista de súper, cocina y
entregas). Esta etapa no abre nada al cliente.

Resultado verificable: se crea un pedido para un cliente estándar y otro para uno
vegetariano en la misma semana; cada uno toma su menú, solo los días elegidos, con sus
dos entregas como registros propios y las comidas asignadas a cada una. Cambiar el
estado no altera direcciones y deja historial.

## Decisiones que aplica

- Mismo precio al cambiar entre tiempos: el plan vende N comidas.
- Corte fijo semanal.
- Reparto fijo de días por entrega, definido por ciclo.
- Menú estándar y vegetariano activos en paralelo.

## Fuera de alcance

Intercambio limitado al menú de la semana (etapa 2), página del cliente (3), lista de
súper (4), producción (5), tablero de entregas (6), pagos (7). La etapa 1 solo deja
los datos listos para ellas.

## Cambios al modelo de datos

### Nuevo: `OperationSettings` (una fila)

Valores por defecto para generar cada ciclo.

| Campo | Uso |
| --- | --- |
| `cutoffDay`, `cutoffTime` | Corte para el cliente: viernes (hora por definir) |
| `firstDeliveryAllowedDays` | Días permitidos para la entrega 1: domingo o lunes |
| `secondDeliveryAllowedDays` | Días permitidos para la entrega 2: miércoles o jueves |
| `firstDeliveryMealDays` | Comidas de la entrega 1: lunes a miércoles |
| `secondDeliveryMealDays` | Comidas de la entrega 2: jueves y viernes |
| `timeZone` | `America/Tijuana` |

### Nuevo: `WeeklyCycle`

Una fila por semana de servicio. Sustituye a `isActive` como fuente de «qué se vende».

| Campo | Uso |
| --- | --- |
| `weekStart` | Lunes de la semana, único |
| `status` | `DRAFT` → `OPEN` → `CLOSED` → `IN_PRODUCTION` → `COMPLETED` |
| `orderCutoffAt` | Instante de corte para el cliente, calculado desde ajustes, editable |
| `firstDeliveryAllowedDays`, `secondDeliveryAllowedDays` | Copia de los días permitidos por entrega |
| `firstDeliveryMealDays`, `secondDeliveryMealDays` | Copia de la regla de reparto |

El ciclo no fija una fecha única de entrega: cada pedido elige su día dentro de los
permitidos.

### `WeeklyMenu`

- Agregar `cycleId`. Estándar y vegetariano: único por (`cycleId`, `menuType`).
- Agregar `customerId` opcional. Un menú `PERSONALIZADO` pertenece a un cliente de
  tipo `dieta`: único por (`cycleId`, `customerId`). Confirmado: uno por cliente, no
  uno compartido por todos los de dieta.
- `isActive` queda derivado del estado del ciclo durante la transición y se retira al
  final de la etapa. Las rutas públicas `/api/menu` y `/api/menu/next` pasan a leer el
  ciclo `OPEN` y aceptan `menuType` (por defecto estándar).
- El traslape de fechas se valida por tipo, no global.

### Nuevo: `OrderDelivery`

| Campo | Uso |
| --- | --- |
| `orderId`, `sequence` (1 o 2) | Único por pedido |
| `scheduledDate` | Fecha civil |
| `locationNumber`, `addressSnapshot` | Dirección congelada al crear |
| `status` | `PENDING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED` |
| `deliveredAt`, `notes` | Para la etapa 6 |

`OrderMenuSlot` gana `deliveryId`. Los pedidos existentes son de prueba y se
eliminan; las columnas `first*`/`second*` de `Order` se quitan en la misma migración,
sin traslado de datos.

### `Order`

- `cycleId`: semana a la que pertenece.
- `folio`: consecutivo legible.
- `version`: control de edición concurrente.
- Estado global derivado de las entregas donde aplique (`PARTIALLY_DELIVERED`,
  `DELIVERED`).

### Nuevo: `OrderStatusEvent`

Estado anterior, estado nuevo, fecha, usuario y motivo. Solo se inserta.

### `OrderMenuComponent`

Agregar `sourceDayOfWeek` y `sourceSlotType` (de dónde viene el platillo en el menú) e
`isSubstitution`. En esta etapa solo se llenan al copiar; la etapa 2 los usa.

## Reglas de servidor

1. **Menú por tipo de cliente.** `menu` → estándar, `vegetariano` → vegetariano,
   `dieta` → su menú personalizado propio de esa semana. Si no existe el menú que le
   corresponde en el ciclo abierto, 409 con mensaje claro.
2. **Días elegidos.** El alta recibe la lista de días; su cantidad debe ser igual a
   `daysCount` de la variante. Solo se ofrecen días con platillo principal en todos
   los tiempos del plan. Se rechaza copiar tiempos vacíos.
3. **Entregas automáticas.** El reparto de comidas sale del ciclo; cada comida queda
   asignada a la entrega que cubre su día. Si todos los días elegidos caen en una sola
   entrega, se crea una sola. El día de cada entrega se propone desde la preferencia
   del cliente (`firstDeliveryDay`, `secondDeliveryDay`, ya existentes en su perfil) y
   se puede cambiar por pedido, siempre dentro de los días permitidos del ciclo.
   Cambiar el día en un pedido no modifica la preferencia del cliente.
4. **Corte en dos niveles.** El viernes cierra el autoservicio del cliente (etapa 3).
   Admin puede seguir creando y editando pedidos después, con aviso de «fuera de
   corte», hasta que cierra el ciclo a mano. Así entran las confirmaciones del sábado
   antes de mediodía. El pedido guarda si se capturó después del corte.
5. **Transiciones.** Mapa explícito de estados permitidos; cada cambio registra un
   evento. Pedido entregado o cancelado no se edita sin reabrir con motivo.
6. **Direcciones.** Se congelan al crear la entrega. Solo cambian si se elige otra
   ubicación de forma explícita.
7. **Edición concurrente.** La actualización envía `version`; si no coincide, 409.
8. **Fechas civiles.** Las fechas de entrega se tratan como `YYYY-MM-DD` de punta a
   punta, sin pasar por zona horaria.

## Cambios de interfaz

Aplican `DESIGN.md` y componentes de Nuxt UI; sin componentes propios nuevos salvo
necesidad comprobada.

- **Menú** (`admin/menu`): la lista se agrupa por semana; muestra estado del ciclo,
  corte y menús por tipo. Acciones: abrir pedidos, cerrar, pasar a producción.
  Sustituye a «marcar como activo».
- **Ajustes de operación**: formulario para corte y reparto por defecto. Ubicación
  propuesta: sección dentro de `admin/menu`.
- **Nuevo pedido** (`admin/pedidos/crear-nuevo`): selector de días según la variante;
  las entregas se muestran calculadas, con ubicación elegible; búsqueda remota de
  clientes.
- **Detalle de pedido** (`admin/pedidos/[id]`): folio, entregas como tarjetas con sus
  comidas, historial de estados, botones de transición en lugar de selector libre.
- **Lista de pedidos** (`admin/pedidos`): paginación, filtro por semana y por fecha de
  cualquiera de las entregas.
- **Clientes**: borrar un cliente con pedidos muestra mensaje útil y ofrece marcarlo
  inactivo.

## Orden de entrega

Cada bloque es un PR desplegable por sí solo.

| # | Bloque | Contenido | Cierra |
| --- | --- | --- | --- |
| 1.1 | Ciclo y ajustes | `OperationSettings`, `WeeklyCycle`, `cycleId` en menú, migración de menús existentes, UI de menú por semana, rutas públicas por tipo | H17, H18 |
| 1.2 | Entregas | Borrar pedidos de prueba, `OrderDelivery`, `deliveryId` en tiempos, quitar columnas `first*`/`second*` | H11 |
| 1.3 | Alta de pedido | Menú por tipo, días elegidos, sin tiempos vacíos, entregas automáticas, folio, `cycleId` | H05, H06, H08 |
| 1.4 | Estados y edición | Transiciones, `OrderStatusEvent`, `version`, direcciones congeladas, fechas civiles | H07, H09, H10, H13 |
| 1.5 | Listados | Paginación, filtros por semana y entrega, búsqueda remota de clientes, borrado de cliente | H14, H15, H16 |
| 1.6 | Limpieza | Eliminar `isActive`, actualizar design system y README | — |

1.2 depende de 1.1. 1.3 depende de ambos. 1.4 y 1.5 pueden ir en paralelo después de
1.3.

### Avance

| Bloque | Estado |
| --- | --- |
| 1.1 | Código, migración `20261115190000_add_weekly_cycles` y pruebas unitarias escritos el 15 de noviembre de 2026. Migración aplicada ese día con respaldo previo en `backups/` (sin versionar); 8 menús, 56 días, 280 tiempos y 305 componentes intactos. Verificado en navegador: lista de menús, menú de acciones, modal de ajustes y campo de cliente. Sin probar contra la base real: cambio de estado de una semana, guardar ajustes y crear menú personalizado. Edición del corte de una semana desde la interfaz agregada el 16 de noviembre de 2026 (acción «Editar corte» en `admin/menu`; fecha y hora en `America/Tijuana`; el servidor exige que sea anterior al lunes de la semana); cubierta con pruebas unitarias y de componente y comprobada en navegador con 1.5. |
| 1.2 | **Terminado y verificado el 16 de noviembre de 2026.** Migración `20261116120000_add_order_deliveries` aplicada con autorización para borrar los 3 pedidos de prueba y respaldo previo en `backups/antes-entregas-2026-11-16T21-10-47-435Z/` (sin versionar). Menús, platillos, recetas y demás datos ajenos a pedidos conservan exactamente su contenido. Verificados contra PostgreSQL: entregas propias, asignación de comidas, dirección congelada, cambio explícito de ubicación, filtro por segunda entrega y borrado en cascada. Verificados en la sesión autenticada del navegador: alta con dos entregas, detalle, cambio de estado y guardado, lista e historial. Corregido el desfase de un día al mostrar fechas civiles en lista y dashboard. Lint y 176 pruebas pasan. El pedido temporal se retiró al terminar. [Evidencia y alcance](verificacion-etapa-1.2.md). El control de estados por entrega y el estado global derivado se cerraron en 1.4. |
| 1.3 | **Terminado y verificado el 16 de noviembre de 2026.** Migración `20261116150000_add_order_cycle_folio` aplicada durante el cierre de 1.2. Prueba de integración repetible contra PostgreSQL en `scripts/verify-order-create.ts`: menú por tipo y por cliente de dieta, días elegidos y tiempos completos, entregas automáticas, preferencias y cambios por pedido, folio, `cycleId`, origen de componentes y corte. Altas estándar, vegetariana y personalizada completadas desde el formulario en la sesión autenticada; comprobadas contra la API. Menús, platillos y demás filas originales idénticos a la instantánea previa; todos los datos temporales retirados. Lint y 176 pruebas pasan. [Evidencia y comando de verificación](verificacion-etapa-1.3.md). Edición, `version`, transiciones e historial: cerrados en 1.4. Queda para 1.5: búsqueda remota de clientes. |
| 1.4 | **Terminado y verificado el 16 de noviembre de 2026.** Migración aditiva `20261116220000_order_workflow` aplicada con respaldo; 18 migraciones aplicadas. Edición con versión atómica y conflicto 409; días, tiempos, reparto y fechas validados contra el pedido y ciclo. Direcciones congeladas. Acciones de estado separadas, historial inmutable con usuario y motivo, estado global derivado de entregas y reapertura explícita. Integración PostgreSQL (incluida concurrencia real), navegador autenticado, lint, build y pruebas pasan; el typecheck global mantiene errores previos ajenos a pedidos. Fixtures retirados y datos originales idénticos al respaldo. [Reglas y evidencia](verificacion-etapa-1.4.md). |
| 1.5 | **Terminado y verificado el 16 de noviembre de 2026.** Sin migración. Listado de pedidos paginado (50 por página) y filtro por semana; búsqueda remota de clientes en el alta; borrado de cliente con pedidos o menús personalizados responde 409 y ofrece marcarlo inactivo. Verificación repetible contra PostgreSQL en `scripts/verify-order-list.ts` y recorrido en navegador con sesión administrativa; fixtures retirados y conteos originales confirmados. Lint y 199 pruebas pasan; typecheck sin errores en archivos de 1.5. [Evidencia](verificacion-etapa-1.5.md). |

## Pruebas

- Unitarias: reparto de días a entregas, cálculo de corte, mapa de transiciones,
  validación de días elegidos y de día de entrega permitido.
- Integración con PostgreSQL aislado: alta de pedido por tipo de cliente, rechazo de
  tiempos vacíos, conflicto de versión, migración de menús existentes a ciclos.
- Navegador, en la sesión activa del usuario: crear ciclo, abrir pedidos, alta de
  pedido estándar y vegetariano, cambio de estado con historial.

## Riesgos

- **Menús existentes: no se pierden.** La migración solo agrega columnas y asigna cada
  menú al ciclo de la semana de su `startDate`; no borra ni reescribe días, tiempos ni
  platillos. Antes de escribirla se revisan los datos reales en modo lectura (menús
  que no empiezan en lunes, dos menús del mismo tipo en una semana, personalizados sin
  cliente) y se respalda la base antes de aplicarla.
- **Pedidos existentes: se eliminan.** Son de prueba. Se borran en 1.2 con
  confirmación previa del usuario al momento de aplicar.
- **Rutas públicas.** `/menu` depende hoy de `isActive`; el cambio a ciclo debe
  mantener visible el menú vigente en todo momento.
- **Despliegue.** H22 sigue abierto: verificar que el sitio desplegado aplica
  migraciones antes de 1.1.

## Datos definidos

| Dato | Valor |
| --- | --- |
| Corte del cliente | Viernes; admin acepta confirmaciones tardías (p. ej. sábado antes de mediodía) |
| Entrega 1 | Domingo o lunes, a elección del cliente; lleva lunes a miércoles |
| Entrega 2 | Miércoles o jueves, a elección del cliente; lleva jueves y viernes |
| Cliente `dieta` | Menú personalizado propio, uno por cliente |
| Menús actuales | Se conservan |
| Pedidos actuales | De prueba; se pueden eliminar |

## Por confirmar

1. Hora del corte del viernes. No bloquea: es un valor de ajustes, editable.
