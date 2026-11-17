# Verificación T19: archivar planes y variantes

Fecha: 17 de noviembre de 2026. Rama `feat/t19-archivar-planes`.

## Alcance

T19 pedía archivar clientes, planes y variantes usados, traducir conflictos de
base de datos a 409/400 con mensajes útiles y proteger la salida con cambios
pendientes. Clientes ya quedó resuelto en 1.5 (409 `CUSTOMER_HAS_HISTORY` y
«Marcar inactivo»). Este cambio cubre lo restante.

### Planes y variantes

- **Archivar = pausar.** Un plan o una variante con `isActive = false` ya no se
  ofrece en pedidos nuevos (admin `orders.ts` y público `customerOrders.ts` lo
  rechazan) y conserva su historial. No se añadió otro estado.
- **Borrar un plan con pedidos** responde 409 `PLAN_HAS_ORDERS` con el número de
  pedidos. El modal cambia a aviso y ofrece «Pausar plan».
- **Quitar una variante con pedidos** al editar el plan responde 409
  `VARIANT_HAS_ORDERS` con el nombre y el número de pedidos. En el formulario, el
  botón de quitar esa variante está deshabilitado y una nota pide desactivarla.
- **Base de datos.** La FK `orders.plan_variant_id` pasa de `ON DELETE SET NULL`
  a `ON DELETE RESTRICT` (migración `20261118000000_restrict_plan_variant_delete`).
  Antes, borrar un plan cortaba en silencio el vínculo de sus pedidos con la
  variante. Si un pedido se crea entre la comprobación y el borrado, PostgreSQL
  lo impide y el servidor traduce P2003 al mismo 409.
- **Otros conflictos.** Título de plan repetido → 409 «Ya existe un plan llamado
  «…»». Dos variantes que intercambian días en un mismo guardado → 409 con
  instrucción. IDs que no son UUID → 400 en lugar de un 500 de Prisma.
- `GET /api/plans/all` (admin) incluye `orderCount` por variante. `GET /api/plans`
  (público) no lo expone.

### Mensajes útiles

`apiErrorMessage(error, respaldo)` muestra el `statusMessage` del servidor en
lugar de «[DELETE] /api/plans/…: 409». Se usa en planes, gastos, platillos y el
editor de menú.

### Cambios sin guardar

`useLeaveGuard(isDirty)` + `AdminUnsavedChangesModal`: con cambios pendientes,
salir por el sidebar, un enlace o «atrás» pide confirmación, y recargar o cerrar
la pestaña muestra el aviso nativo del navegador. Antes solo lo hacía el botón
«Regresar» de platillos y «Cancelar» de gastos.

| Pantalla | Antes | Ahora |
| --- | --- | --- |
| Planes (modal) | Cerraba sin preguntar | Cancelar, X, Escape, overlay y navegación preguntan |
| Gastos (modal) | Solo «Cancelar» preguntaba | También navegación y recarga |
| Platillos (crear/editar) | Solo «Regresar» preguntaba | También sidebar y recarga; un solo modal en el formulario |
| Detalle de pedido | Solo bloqueaba cambios de estado | Navegación y recarga preguntan |
| Editor de menú (editar) | Sin protección | Navegación y recarga preguntan; ir a crear o editar un platillo conserva el borrador sin preguntar |

## Pruebas

- `tests/unit/plans.test.ts` (12): borrado con y sin pedidos, P2003 en carrera,
  id inválido, 404, quitar variante usada o libre, P2002 de título, conteos solo
  en el listado admin.
- `tests/components/planArchive.test.ts` (4): conflicto → «Pausar plan» con las
  variantes intactas, variante usada no se puede quitar, cerrar con cambios pide
  confirmación, cerrar sin cambios no.
- `pnpm lint`, `pnpm typecheck` y `pnpm test:unit` (36 archivos, 300 pruebas) pasan.
- **PostgreSQL 16 local temporal** con todas las migraciones aplicadas (la FK
  queda en `RESTRICT`): con un pedido real sobre una variante se comprobaron
  conteos admin/público, 409 de plan y de variante, título repetido, pausa,
  `DELETE` directo rechazado con `23503`, el pedido conserva su variante,
  borrado de un plan sin pedidos e id inválido. El script quedó fuera del repo;
  T24 debe convertir estos casos en integración permanente.

- **Navegador** (`nuxt dev` local contra la base de producción, sesión admin,
  sin guardar nada): `/api/plans/all` trae `orderCount` (0 en todas las
  variantes: producción no tiene pedidos) y `/api/plans` no; `DELETE` con id
  inválido → 400 «El id del plan no es válido.». En planes, Escape con cambios
  abre «Salir sin guardar» y conserva el formulario; navegar con el router queda
  bloqueado hasta confirmar. En la edición de un platillo, el enlace del sidebar
  pide confirmación con cambios y navega libre sin ellos. El 409 no se probó en
  navegador porque requiere pedidos reales; quedó cubierto en PostgreSQL local.

## Migración en producción

Aplicada el 17 de noviembre de 2026 con aprobación del usuario, antes del merge
del PR #21 (el código anterior es compatible: nunca borraba con pedidos porque no
había pedidos, y la FK solo restringe borrados).

- `prisma migrate status`: solo faltaba `20261118000000_restrict_plan_variant_delete`.
- Respaldo local excluido de Git: `backups/antes-t19-2026-11-17T17-03-04Z/`. Contiene `database.dump` (esquema
  `public`, `pg_dump` 18, 161107 bytes, 27 tablas en `pg_restore --list`), conteo
  y huella por tabla en `manifest.json` y la comparación en `verification.json`.
- Antes: FK `SET NULL` (`n`), 0 pedidos, 4 planes, 11 variantes.
- `prisma migrate deploy` aplicó la migración. Después: FK `RESTRICT` (`r`);
  26 tablas idénticas al respaldo y solo `_prisma_migrations` pasó de 24 a 25
  filas. No se restauró el dump.
- `scripts/verify-database-hardening.ts` pasa en producción (grants, RLS,
  triggers de historial).

## Pendiente
- El alta de un menú nuevo, el alta de pedidos y el modal de clientes aún no
  rastrean cambios sin guardar; el editor de menú en modo creación conserva un
  borrador solo al ir a crear un platillo.
