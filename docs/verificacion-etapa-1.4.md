# Verificación de 1.4: estados y edición

Fecha: 16 de noviembre de 2026. **Terminado** en la base configurada en el
repositorio y en `http://localhost:3000`. No se desplegó la aplicación.

## Comportamiento implementado

El guardado de contenido y los cambios de estado son operaciones separadas.
Todas reciben la versión leída; cada operación aceptada la incrementa. La
comparación y el incremento son atómicos dentro de la transacción, antes de
reescribir comidas o entregas. Un conflicto devuelve 409 con código
`ORDER_VERSION_CONFLICT`; el formulario conserva los cambios locales hasta que
el operador decide recargar.

| Estado del pedido | Acciones permitidas |
| --- | --- |
| Borrador | Confirmar o cancelar |
| Confirmado | Iniciar preparación o cancelar |
| En preparación | Cancelar; operar entregas |
| Entrega parcial | Cancelar; operar entregas pendientes |
| Entregado / cancelado | Reabrir a confirmado, con motivo obligatorio |

Los estados parcial y entregado no se eligen directamente: se calculan desde
las entregas. Una entrega completada da estado parcial mientras quede otra
pendiente; todas completadas dan entregado. Una cancelación conserva su estado.

| Estado de entrega | Acciones permitidas |
| --- | --- |
| Pendiente | Iniciar reparto |
| En reparto | Marcar entregada o fallida |
| Fallida | Volver a pendiente o iniciar reparto de nuevo |
| Entregada | Sin transición individual; requiere reapertura del pedido |

Una entrega fallida exige motivo. La entrega completada guarda `deliveredAt`.
Reabrir un pedido exige motivo, deja sus entregas pendientes y borra sus marcas
actuales de entrega; los cambios anteriores permanecen en el historial.

## Historial y autorización

`OrderStatusEvent` registra creación, cambios de pedido y cambios de entrega:
estados anterior/nuevo, versión, fecha, usuario y motivo. El usuario proviene de
`auth.getUser()` y del control administrativo existente; no se acepta del cuerpo
del cliente. Las reaperturas registran también las entregas que vuelven a
pendientes.

Un trigger rechaza `UPDATE` y `DELETE` de eventos con error `55000`. La única
excepción es el borrado en cascada cuando desaparece el pedido padre. La tabla
tiene RLS y ningún privilegio de cliente para `anon` o `authenticated`.

Rutas administrativas:

- `PUT /api/orders/:id`: contenido, entregas y `version`; no acepta `status`.
- `POST /api/orders/:id/status`: transición con `version`, `status` y `reason`.
- `POST /api/orders/:id/deliveries/:sequence/status`: transición de entrega con
  los mismos campos.

Ambas rutas nuevas devolvieron 401 ante solicitudes HTTP anónimas.

## Edición de contenido y fechas

- Solo con ciclo abierto, pedido no cerrado y todas las entregas pendientes.
- Conserva los días, tiempos y orden contratados. Cada tiempo necesita principal.
- Las entregas deben respetar el reparto de comidas del ciclo; no se puede
  quitar una que transporte comidas.
- La fecha solo puede ser una de las calculadas para los días permitidos de
  esa entrega en ese ciclo. La interfaz ofrece esas fechas mediante `USelect`.
- La dirección congelada se conserva al guardar y al cambiar estados, aunque
  cambie el perfil del cliente. Solo otra ubicación seleccionada explícitamente
  actualiza la dirección de esa entrega.
- Las fechas civiles continúan siendo cadenas `YYYY-MM-DD` en la API y el
  formulario, y se almacenan como `DATE`. La conversión de Prisma utiliza
  medianoche UTC sin cambiar el día civil.

El detalle usa botones de transición, confirmación mediante `UModal`, motivo
cuando corresponde y `UTimeline` para el historial. Impide cambiar estados con
ediciones sin guardar; permite guardarlas o descartarlas explícitamente.

## Migración, respaldo y conservación

Se aplicó `20261116220000_order_workflow`, aditiva: agrega `version`, eventos,
índice, RLS y protección del historial. Si hay pedidos anteriores, inserta un
evento inicial explícito sin inventar un usuario anterior. En esta base no
había pedidos al aplicar la migración. `prisma migrate status`: 18 aplicadas.

Respaldo local excluido de Git:
`backups/antes-1.4-2026-11-16T21-56-47-670Z/`.
Incluye `database.dump` (361583 bytes, índice validado con `pg_restore --list`),
instantánea previa, huellas SHA-256 y `verification.json`. No se restauró el dump.

Tras retirar todos los fixtures, las filas originales resultaron idénticas al
respaldo: 8 menús, 56 días, 280 tiempos, 305 componentes, 183 platillos,
68 ingredientes, 133 relaciones de recetas, 13 clientes, 4 planes, 11 variantes,
47 gastos, 8 ciclos y sus ajustes. Pedidos, entregas, copias e historial quedaron
vacíos. La migración se agregó al registro de Prisma; la secuencia de folios
mantiene el avance de las pruebas.

## Validación

Prueba repetible contra PostgreSQL:

```sh
node --import tsx --env-file=.env scripts/verify-order-workflow.ts
```

Crea únicamente un cliente y pedido temporales y los elimina en `finally`.
Comprobó dos actualizaciones simultáneas con la misma versión: exactamente una
aceptada y otra 409. También verificó rechazos sin escrituras, direcciones
congeladas, cambios explícitos de ubicación, estados derivados, fallo/reintento
de entrega, bloqueo de edición, cancelación/reapertura, inmutabilidad del
historial y permisos de cliente. Se volvió a ejecutar la integración de 1.3,
que pasó con el nuevo modelo.

En la sesión autenticada del usuario se verificaron el conflicto y conservación
del texto local, la recarga explícita, confirmación, preparación, ambas entregas
en reparto/completadas, estado parcial, estado entregado y reapertura con motivo
obligatorio. Los eventos guardaron al administrador autenticado. Al reabrir,
ambas entregas quedaron pendientes y sin `deliveredAt`. Se inspeccionó la vista
a 390 px en claro y oscuro, sin desbordamiento horizontal.

`pnpm lint` y `pnpm build`: pasan. Suite completa: 183 pruebas pasadas;
comprobación final focalizada: 14 pasadas, incluido un caso adicional de ciclo
cerrado (184 pruebas cubiertas en total).

El typecheck general con `vue-tsc` mantiene siete errores ajenos a pedidos,
preexistentes en `FoodCatalogForm.vue` (`.value` en plantillas) y `MenuForm.vue`
(nulabilidad). No reportó errores en los archivos modificados de pedidos. El
proyecto no tiene instalado un comprobador para `nuxt typecheck`; se utilizó
`pnpm dlx vue-tsc --noEmit --project .nuxt/tsconfig.json` sin cambiar dependencias.

La idempotencia del alta de pedidos de H13 continúa pendiente; 1.4 resuelve su
control de edición concurrente. Intercambios, tablero operativo de entregas y
autoservicio conservan sus etapas respectivas.
