# Verificación: operación, compras, cocina y reparto (etapa 4)

16 de noviembre de 2026, America/Tijuana. Implementado localmente sin commit;
migración `20261117020000_operations` aplicada en la base configurada.
Aplicación sin desplegar.

Cubre T17, T18, T20 y T22 del [plan general](plan-pedidos-clientes.md) y la
parte implementada de T21. T19/H24 no forma parte de esta etapa.

## Comportamiento

- **Cobros y saldos (`/admin/cobros`, T17).** Libro de movimientos por pedido:
  abono (`PAYMENT`) o devolución (`REFUND`), método efectivo, transferencia o
  tarjeta cobrada fuera del sistema, referencia, motivo obligatorio y fecha de
  recepción. Montos positivos con dos decimales como máximo. El saldo se calcula
  desde el precio guardado en el pedido y el nombre desde el contacto snapshot.
  Los anticipos son abonos parciales; una devolución reabre el saldo. El estado
  de pago no altera la preparación ni la entrega.
- Cancelar un pedido elimina el saldo por cobrar y deja como devolución
  pendiente solo el neto cobrado. Se rechazan devoluciones mayores al neto.
- **Dashboard operativo (`/admin`, T18).** Datos desde PostgreSQL: pedidos por
  confirmar (`DRAFT`), entregas de hoy sin entregar, entregas atrasadas,
  entregas fallidas, saldo por cobrar y devoluciones pendientes. Los conteos de
  entregas excluyen pedidos en borrador y cancelados.
- **Producción (`/admin/produccion`, T20).** Consolidación por ciclo desde
  pedidos no borrador ni cancelados: por fecha, tiempo, platillo y porciones;
  contenedores por fecha; comidas por entrega con notas, sustituciones guardadas
  y exclusiones vigentes como advertencia. Cada consolidación es una versión
  inmutable. Si cambia un pedido, una exclusión o una receta, la versión se
  marca desactualizada y pide consolidar de nuevo.
- **Lista de súper (`/admin/compras`, T22).** Ingredientes por receta con su
  rendimiento (`recipe_yield`); unidades de volumen, peso y medidas caseras no se
  mezclan. Recetas desconocidas, rendimientos faltantes y cantidades inválidas
  se reportan explícitamente; no se inventan cantidades ni totales parciales.
  Cada consolidación conserva su lista: marcar comprado y vincular un gasto
  existente usan control de versión. Cambiar una receta no altera listas
  anteriores.
- **Etiquetas (`/admin/etiquetas`, T21 parcial).** Por cliente, comida y
  entrega desde una consolidación concreta. La impresión se bloquea si la
  versión está desactualizada o falló la carga.
- **Reparto (`/admin/reparto`, T21 parcial).** Tablero diario con dirección
  histórica de la entrega, comidas, saldo, responsable, incidencia y enlace de
  evidencia (solo HTTPS). Cada cambio queda en `delivery_activities` con
  operador; escrituras con versión vieja devuelven 409. Las transiciones de
  entrega son individuales y no cierran otras entregas del pedido.

Componente compartido: `AdminProductionWorkspace` para producción y compras,
registrado en [componentes](design-system/componentes.md) y
[patrones](design-system/patrones.md).

## Datos y acceso

Migración `20261117020000_operations`, aditiva:

- Tablas `order_payments`, `production_runs`, `shopping_lists`,
  `shopping_items` y `delivery_activities`; columnas `assigned_to`,
  `incident` y `evidence_url` en `order_deliveries`; `recipe_yield` en
  `FoodCatalogItem`.
- `CHECK` de montos, cantidades, versiones y rendimientos positivos; tipo y
  método de pago válidos.
- Triggers que rechazan `UPDATE` y `DELETE` en `order_payments` y
  `production_runs`. Las correcciones se hacen con movimientos compensatorios.
- Idempotencia: único `(order_id, idempotency_key)` en pagos y `request_key` en
  consolidaciones. Reintento igual devuelve el mismo registro; con datos
  distintos devuelve 409.
- Las cinco tablas tienen RLS y sin privilegios para `PUBLIC`, `anon` y
  `authenticated`. Acceso solo por el servidor.
- `/api/operations/*` exige sesión administrativa (`admin-auth.ts`) y responde
  con los headers privados de `customer-order-privacy.ts`.

## Evidencia

Ejecutado el 16 de noviembre de 2026 con Node 24.11.1 (fuera del rango del
`engines`; pnpm solo avisa).

- `pnpm vitest run`: 34 archivos, 261 pruebas pasan. `tests/unit/operations.test.ts`
  cubre centavos exactos, devolución tras cancelación, validaciones (centavos,
  fecha, motivo, evidencia HTTPS), conteo de sustituciones, contenedores y
  entregas separadas, unidades incompatibles, cantidades inválidas y recetas o
  rendimientos faltantes.
- `eslint layers scripts tests`: sin errores.
- `node --env-file=.env --import tsx scripts/verify-operations.ts`: integración
  PostgreSQL en un esquema desechable `ops_verify_*` creado desde
  `prisma/schema.prisma` más las salvaguardas de la migración. Se elimina al
  terminar; no toca tablas de negocio. Cinco comprobaciones pasan:
  1. Dos cobros concurrentes no cobran de más; reintentos duplicados crean un
     solo movimiento; reintentos con otro monto y devoluciones excesivas, 409.
  2. El libro no admite edición ni borrado; totales filtrados usan contacto y
     precio guardados; búsqueda por folio.
  3. Consolidaciones concurrentes con la misma clave crean una sola versión;
     recetas históricas congeladas, advertencia de desactualización, compras
     versionadas con gasto vinculado y 409 ante versión vieja.
  4. Asignaciones de reparto auditadas, escrituras viejas rechazadas, avance de
     estados sin invalidar la consolidación, entrega fallida en el dashboard y
     cancelación que libera la devolución.
  5. RLS activo y sin acceso directo para `anon` ni `authenticated`.
- `prisma migrate status`: 23 migraciones, base al día.

## Sin verificar

- Typecheck: `nuxi typecheck` no corre porque el repositorio no tiene
  `vue-tsc` ni Golar instalados.
- Navegador con datos: registrar un cobro, consolidar, marcar compras e
  imprimir etiquetas desde la UI. Cobros y consolidaciones son inmutables y no
  se pueden borrar después, así que no se hicieron sobre fixtures; quedan para
  el ensayo real (ver «Navegador con fixtures»).
- Modo claro: no revisado.
- E2E: `tests/e2e` solo contiene `home.spec.ts`; no hay pruebas de estas rutas.
- `pnpm build` no se ejecutó en esta verificación.

## Navegador

16 de noviembre de 2026. Sesión administrativa existente (perfil default de la
vista previa de T3 Code) sobre `pnpm dev` en `localhost:3000`, sin modificar
datos ni autenticación. Tema oscuro del sistema.

- Las seis rutas cargan con la sesión, aparecen en la barra lateral y muestran
  su título: `/admin`, `/admin/cobros`, `/admin/produccion`, `/admin/compras`,
  `/admin/reparto` y `/admin/etiquetas`.
- Dashboard: las seis métricas operativas en $0.00 / 0, coherentes con una
  base sin pedidos; tarjetas enlazan a cobros, pedidos y reparto.
- Cobros, producción, compras y reparto muestran estado vacío claro
  («No hay cuentas…», «Sin consolidaciones», «Sin entregas» por columna).
- Sin desbordamiento horizontal en 1280 px ni en 390 px en las seis rutas.

Observaciones corregidas en la misma sesión y comprobadas en navegador:

- `/admin/etiquetas` sin `?ciclo=` ya no llama a
  `/api/operations/production/` (antes 404 y «No fue posible cargar las
  etiquetas»); ahora muestra «Consolidación no encontrada».
- Fechas de reparto y de cobros: `UInput type="date"` sustituido por
  `CalendarInput`, según `DESIGN.md`. `CalendarInput` admite `disabled` para
  bloquear la fecha mientras se guarda el movimiento. En reparto muestra
  «16 nov 2026», mide 40 px y al elegir otro día consulta
  `/api/operations/deliveries?date=2026-11-20`. El campo de cobros vive en el
  modal de una cuenta y no se pudo abrir sin pedidos.
- Aviso «Cobro y reparto»: `variant="soft"` e icono `i-lucide-info`, igual que
  el aviso de cobros.

## Navegador con fixtures

16 de noviembre de 2026, autorizado por el usuario. Fixtures reversibles: ciclo
cerrado de la semana 2098-12-01, tres clientes «ZZ Verificación operación» y
pedidos #900101–#900103 confirmados ($1,450, $1,550 y $1,650), con entregas el
1 y el 4 de diciembre de 2098. Sin cobros ni consolidaciones. Se eliminaron al
terminar (3 pedidos, 3 clientes, 1 ciclo) y el dashboard volvió a ceros.

- Dashboard: saldo por cobrar $4,650.00 (suma exacta) y 3 pedidos; tras la
  entrega fallida, «Entregas fallidas» 1.
- Cobros: tres cuentas con total, saldo y estado; el modal de #900101 muestra
  saldo, formulario y «Sin movimientos». `CalendarInput` mide 40 px, abre el
  calendario y cambia la fecha sin cerrar el modal. No se registró movimiento.
- Reparto (fecha 2098-12-01 elegida con el calendario): tres entregas
  pendientes con dirección guardada, teléfono y saldo. Antes de preparar el
  pedido, el tablero indica «Inicia la preparación desde el pedido».
- Asignación: `http://` rechazado con «Usa un enlace HTTPS.»; con `https://`
  guarda repartidor, incidencia y enlace «Ver evidencia» (toast «Entrega
  actualizada»).
- Estados: pedido a «En preparación» desde su detalle; entrega a «En reparto»;
  «Marcar fallida» sin motivo rechazado («Escribe el motivo de la entrega
  fallida.»), con motivo pasa a «Fallida» y muestra la nota.
- Producción lista el ciclo de prueba («Semana 1 dic»); no se consolidó.

Detalles menores observados y corregidos después (comprobados en navegador sin
fixtures; lint y 261 pruebas pasan):

- Columnas de reparto: singular «1 entrega» y plural «0 entregas».
- La fecha de reparto vive en `?fecha=YYYY-MM-DD` (se omite si es hoy): elegir
  el 20 nov actualiza la URL y recargar `/admin/reparto?fecha=2026-11-20`
  conserva «20 nov 2026».
- Selector de ciclo de producción y compras: «Semana del 16 nov 2026», mismo
  formato que el listado de pedidos. Sin desbordamiento en 390 px.
- `CalendarInput` cierra el calendario al elegir un día, como `DatePicker`.
  Afecta también a gastos y al corte del menú.

## Límites y cierre de T21

T21 sigue abierto. Falta:

- Calibrar la impresión física de etiquetas con la impresora y el papel reales.
- Completar los rendimientos de las recetas en uso; sin ellos la lista de súper
  reporta faltantes en lugar de cantidades.
- Ensayar una semana real con cocina y reparto sin copiar datos manualmente.

Avisos observados durante la verificación, sin fallos: h3 recomienda `message`
en lugar de `statusMessage` para mensajes largos, y `pg` advierte llamadas a
`client.query()` simultáneas en un mismo cliente (se elimina en pg@9).

No se considera desplegado ni abierto a producción por esta verificación local.
