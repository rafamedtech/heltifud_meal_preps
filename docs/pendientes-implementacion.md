# Pendientes de implementación

Actualizado: 17 de noviembre de 2026.

Lista consolidada de los planes y auditorías de `docs`. Es una revisión documental:
no constituye una nueva auditoría del código ni una nueva ejecución de pruebas.
Cuando un hallazgo antiguo contradice una verificación posterior, se toma el alcance
de la verificación posterior y se conserva únicamente el trabajo restante.

## Base ya terminada

Los bloques **1.2 (entregas), 1.3 (alta administrativa) y 1.4 (estados y edición)**
están terminados y verificados según sus documentos de evidencia. No deben volver
a implementarse: entregas individuales, días elegidos, menú por cliente, folio,
direcciones congeladas, fechas civiles, historial de estados y control concurrente
de edición ya forman parte de esa base.

Referencias: [1.2](verificacion-etapa-1.2.md),
[1.3](verificacion-etapa-1.3.md) y [1.4](verificacion-etapa-1.4.md).

## 1. Cerrar los cimientos administrativos

- [x] **Remanente de 1.1:** editar el corte de una semana desde la interfaz
  (`admin/menu` → acciones de la fila → «Editar corte»). El servidor rechaza un
  corte que no sea anterior al lunes de la semana. Comprobado en navegador
  junto con 1.5.
- [x] **1.5 — Listado de pedidos:** paginación de 50 por página con acceso a
  todos los registros.
- [x] **1.5 — Filtros:** filtro por semana (`cycleId`) junto al de fecha de
  cualquiera de las entregas.
- [x] **1.5 — Clientes:** búsqueda remota al crear pedidos.
- [x] **1.5 — Borrado de cliente:** conflicto 409 con mensaje útil y opción de
  marcarlo inactivo.
- [x] **1.5 — Verificación:** PostgreSQL y navegador con sesión administrativa,
  el 16 de noviembre de 2026. [Evidencia](verificacion-etapa-1.5.md).
- [x] **1.6 — Limpieza:** retirado `WeeklyMenu.isActive` y sus usos transitorios
  (espejo en `updateCycle`, ruta `POST /api/menu/:id/activate`, botón «Publicar»
  del editor); el estado de la semana es la única fuente de vigencia. README y
  design system actualizados. Migración
  `20261116230000_drop_weekly_menu_is_active` aplicada el 16 de noviembre de 2026.
- [x] **Idempotencia del alta (H13/T07):** header `Idempotency-Key` obligatorio
  con índice único y huella del payload; doble clic, reintento o envíos
  simultáneos crean un solo pedido. Verificado en PostgreSQL el 16 de noviembre
  de 2026. [Evidencia](verificacion-idempotencia-alta.md).

Detalle de 1.5: [preparación y resultado](preparacion-etapa-1.5.md).

Fuente: [plan de etapa 1](plan-etapa-1-cimientos.md) y H13–H16 del
[plan general](plan-pedidos-clientes.md).

## 2. Personalización e integridad de la oferta

- [x] Sustituciones limitadas al menú de origen: cada lugar del pedido (día,
  tiempo, función, posición) es fijo y solo cambia su platillo por otro del menú
  de la misma familia (principal, guarnición, adicional), de cualquier día y de
  los tiempos que vende el plan. Repetir platillo es libre. El servidor copia los
  datos del platillo; el navegador solo envía ids. Precio sin cambios.
- [x] Procedencia (`sourceDayOfWeek`/`sourceSlotType`/`isSubstitution`), bitácora
  `order_menu_changes` (sustitución, restauración, cambio automático, con usuario),
  restaurar el platillo original de cada lugar y exclusiones del cliente
  (alergias e ingredientes por receta, platillos) aplicadas por el sistema.
- [x] Versión de oferta: `WeeklyMenu.version` sube al editar el menú o un platillo
  que ofrece; el pedido guarda `offerVersion`. Alta y edición con versión vieja
  responden 409 `OFFER_VERSION_CONFLICT`; la transacción bloquea la fila del menú
  (`FOR SHARE`) hasta escribir el pedido.
- Verificado el 16 de noviembre de 2026 en PostgreSQL y navegador.
  [Evidencia](verificacion-etapa-2-personalizacion.md).
- Límite conocido: 154 de 183 platillos no tienen receta; con alergias se marcan
  «Revisar alergias» y no se sustituyen solos. Capturar recetas mejora la cobertura.
- [x] Garantías de publicación: unicidad por semana/tipo/cliente, índice de una
  sola semana abierta, publicación serializada y validación transaccional de
  corte/oferta al enviar desde cliente. [Evidencia](verificacion-etapa-3-pedido-cliente.md).

Fuentes: etapa 2 de la [auditoría semanal](auditoria-flujo-semanal.md) y
T04/T05 del [plan general](plan-pedidos-clientes.md).

## 3. Pedido del cliente

- [x] Publicar un contrato de oferta con menú, versión, vigencia, planes, variantes,
  días, tiempos y sustituciones permitidas, sin recetas internas ni datos privados.
- [x] Crear `/pedido` con selección real de plan/variante, días y comidas; conservar
  la selección desde PlanCard y mostrar cantidades, precio y resumen.
- [x] Crear el personalizador con notas por comida, resumen de cambios,
  restauración, borrador recuperable y estados de error o falta de disponibilidad.
- [x] Capturar contacto, direcciones y entregas; vincular clientes existentes de
  forma verificada sin exponer a otros clientes ni sobrescribirlos por teléfono.
- [x] Implementar acceso privado al pedido, con ownership o token limitado,
  revocable y con vencimiento, mediante enlace privado.
- [x] Crear el envío público atómico: recalcular total y validar oferta, comidas,
  corte y entregas; persistir el snapshot personalizado con idempotencia.
- [x] Crear confirmación y consulta privada del pedido/estado; compartir por
  WhatsApp el resumen del pedido guardado y ajustar los textos de pago.

Fuente: T08–T13 del [plan general](plan-pedidos-clientes.md).

Implementado y verificado localmente el 16 de noviembre de 2026.
[Evidencia, alcance y límites](verificacion-etapa-3-pedido-cliente.md).
La aplicación ya está en producción (ver T03 y PR #16); falta el ensayo del
recorrido de cliente en ese entorno y la verificación de despliegue (T26).

## 4. Operación, compras, cocina y reparto

- [x] Registrar cobros manuales, método, referencia, anticipos, saldo y devoluciones;
  separar pago del estado de preparación y entrega (T17). Libro inmutable e
  idempotente; concurrencia verificada con PostgreSQL.
- [x] Completar el dashboard con pedidos por confirmar, entregas de hoy/atrasadas,
  fallidas, saldos y devoluciones pendientes (T18).
- [x] Archivar planes y variantes utilizados, traducir conflictos de base de datos a
  mensajes útiles y proteger la navegación con cambios sin guardar (T19/H24).
  Plan o variante con pedidos → 409 y «Pausar plan»/desactivar; FK
  `orders.plan_variant_id` en `RESTRICT`; `useLeaveGuard` en planes, gastos,
  platillos, pedido y editor de menú. Migración aplicada en producción el
  17 nov 2026.
  [Evidencia](verificacion-t19-archivo-planes.md).
- [x] Consolidar ingredientes con rendimiento y unidades compatibles, guardar
  cantidades históricas, marcar comprado y vincular gastos existentes (T22).
- [x] Consolidar producción por entrega, fecha, tiempo, platillo, porciones,
  contenedores y personalización desde comidas confirmadas (T20).
- [x] Implementar etiquetas por cliente, comida y entrega; bloquear impresión de
  versiones desactualizadas. Falta calibrar impresión física y ejecutar semana (T21).
- [x] Implementar tablero diario de reparto con direcciones históricas, responsable,
  incidencias, enlace de evidencia, saldo y transiciones individuales auditadas.
- [ ] Ensayar un ciclo real con cocina/reparto, completar rendimientos de recetas y
  validar una hoja impresa antes de declarar cierre operativo de T21.

Evidencia, límites y comandos: [verificación de operación](verificacion-operacion.md).

Fuentes: etapas 4–7 de la [auditoría semanal](auditoria-flujo-semanal.md),
T16–T22 del [plan general](plan-pedidos-clientes.md) y
[auditoría del dashboard](auditoria-admin-dashboard.md).

## 5. Seguridad, calidad y lanzamiento

- [x] Separación de permisos admin/operación/cliente (T02). El 17 nov 2026 se
  cerró un bypass crítico en producción (`/api/%63ustomers`, PR #16) y se añadió
  el rol `operations` (`app_metadata.role`): solo producción, lista de súper
  (marcar comprado, sin vincular gastos), etiquetas y reparto, con saldo visible.
  Reglas en `layers/auth/shared/utils/staffAccess.ts`; el servidor responde 403 al
  resto y la UI filtra navegación y redirige páginas. Usuario sin rol: 403 en
  `/admin`. Cliente A no accede a B: el token privado solo resuelve su pedido.
  Cuenta `operacion@heltifud.com` creada con el rol. Verificado en navegador
  (perfil aislado): el login lleva a Producción, la navegación muestra solo
  Producción, Lista de súper y Reparto, `/admin/pedidos` y `/admin/cobros`
  redirigen, y la API responde 403 a pedidos, clientes, gastos y dashboard.
- [x] Auditar grants/RLS de todas las tablas y el rol de conexión Prisma (T03).
  17 nov 2026: 27 tablas con RLS y sin acceso de anon/authenticated. Migración
  `database_hardening` aplicada en producción. La app conecta como `heltifud_app`
  (solo filas, sin DDL ni TRUNCATE); `postgres` queda para migraciones. Historial de
  entregas y cambios de menú inmutable, TRUNCATE bloqueado en el historial y RLS en
  `_prisma_migrations`. Verificado en producción con `verify-database-hardening.ts`
  (también como la app), en el preview y con lecturas admin. El CI ejecuta la
  verificación en PostgreSQL 17. [Runbook](runbook-base-de-datos.md).
- [x] Completar integración con PostgreSQL aislado para permisos, oferta,
  personalización, idempotencia y fallos transaccionales (T24). 17 nov 2026: los
  ocho scripts `verify-*` de servicios corren en el job de PostgreSQL 17 del CI
  (rama `feat/t24-integracion-ci`): cinco en transacción revertida y tres con
  conexiones concurrentes reales sobre una semana abierta que siembra
  `scripts/seed-ci-open-week.ts` (solo base desechable). Secuencia completa
  verificada en PostgreSQL local limpio (10/10, 33 s). Se corrigió además la
  resolución del alias `~~` (`TSX_TSCONFIG_PATH`), que impedía ejecutarlos.
  También pasaron 9/9 en el proyecto de preview de Supabase (PostgreSQL 17.6,
  26/26 migraciones, oferta real de la semana del 23 nov), sin sembrar, en
  295 s: clientes, pedidos, semanas, menús, planes, enlaces y cobros quedaron
  con los mismos conteos. Solo avanzó `orders_folio_seq` (4 → 27), porque las
  secuencias no se revierten. El hardening corrió sin `APP_DATABASE_URL`.
  Cerrada con el CI en verde del PR #28 (`134869b`): el job de PostgreSQL 17
  ejecutó hardening, los cinco scripts transaccionales, la siembra y los tres
  concurrentes.
- [ ] Completar E2E móvil/escritorio del recorrido cliente → admin → pago → dos
  entregas, incluyendo accesos ajenos y recuperación de errores (T25).
- [x] Verificar despliegue real: preset, API, variables, cookies, migraciones,
  healthcheck, errores sin datos privados y rollback probado (T26/H22). Cerrada
  el 17 nov 2026 (PR #23 y #24): `GET /api/health`, prueba de humo
  `scripts/verify-deploy.ts` 19/19 en preview y producción, rollback probado
  (15 s), `DIRECT_URL` fuera de Netlify, previews en un proyecto Free aparte y
  ensayo completo cliente → admin → cobro → dos entregas en preview.
  [Runbook y evidencia](runbook-despliegue.md). Los respaldos programados
  quedan para una versión posterior.
- [ ] Endurecer carga, errores y reintento en login/formularios; unificar validación
  de IDs y cursores, y evitar presentar errores como listas vacías (H24).
  Hallazgos del ensayo T26 resueltos el 17 nov 2026: al cambiar de variante
  los días se completan o recortan solos (`fitChosenDays`); el aviso «La oferta
  cambió» solo aparece al recuperar un borrador con la misma variante y tipo
  cuya oferta cambió (`offerChangedSinceDraft`); la consulta del cliente
  muestra el estado y el cobro desde el libro (`customerPaymentMessage`:
  pendiente, abono parcial, pagado, devolución). Verificado con pruebas
  unitarias y en navegador (`/pedido`, sin enviar).
  Validación de IDs unificada (17 nov 2026): `requireUuidParam` en
  `layers/menu/server/utils/routeParams.ts` valida los parámetros de ruta de
  las 31 rutas con id. Antes, un id mal formado en pedidos, clientes, semanas o
  gastos llegaba a PostgreSQL (Prisma `P2007`) y respondía 500; en menús y
  platillos, 404. Ahora responde 400 «El identificador … no es válido.» sin
  consultar la base. Todos los ids del esquema son UUID (comprobado en el
  catálogo del preview). El único cursor (clientes) ya respondía 400.
  Queda: carga, error y reintento en login y formularios, y errores mostrados
  como listas vacías.
- [ ] Actualizar tipos de base de datos, ejemplos de entorno y runbook; retirar
  helpers duplicados y dividir componentes grandes cuando aporte claridad (T27).

## Decisiones de negocio por cerrar

Estas decisiones condicionan las implementaciones correspondientes:

- [x] Corte: viernes a las 9:00 p.m. (Tijuana) (17 nov 2026). Es un ajuste
  editable (Menú → Ajustes y «Editar corte» por semana); no requiere código.
  Pendiente aplicarlo en producción: ajustes (`cutoffTime` 21:00) y la semana
  abierta.
- [x] Repetir platillo: libre; el mismo platillo puede ocupar todos los lugares
  contratados (16 nov 2026).
- [x] Preferencias: exclusiones y alergias que el sistema aplica solo (16 nov 2026).
- [x] Acceso mediante invitación y consulta privada con tokens limitados,
  revocables y con vencimiento (16 nov 2026).
- [x] Cobro manual, sin pago en línea, por transferencia, tarjeta (terminal
  externa) o efectivo (17 nov 2026). Coincide con los medios ya registrables en
  Cobros. Quedan por definir las reglas de anticipo y devolución (ver abajo).
- [x] Cobertura: toda la ciudad, sin zonas ni recargos por ahora (17 nov 2026).
  No requiere cambios: la app no limita direcciones ni suma cargos.
- [x] Políticas de cambios, cancelaciones, cobro, devoluciones y entregas
  fallidas (17 nov 2026): [políticas](politicas-pedidos.md). Implementado: pago
  completo antes de preparar con excepción auditada, saldo a favor, reprogramar
  una entrega fallida y cerrarla sin entregar (`LOST`), textos al cliente.
- [x] Cancelar la segunda entrega después del corte: a más tardar el martes a
  las 9:00 p.m. (17 nov 2026). Regla escrita para el cliente; se aplica a mano.

## Verificaciones pendientes de lo ya implementado

El avance de 1.1 aún señala pruebas contra la base real para cambio de estado de
semana, guardado de ajustes y creación de menú personalizado. La verificación 1.3
cubre pedidos con menú personalizado, pero no demuestra por sí sola todo el flujo
de creación de ese menú desde su interfaz. Cerrar esas comprobaciones con evidencia.

Las casillas T01–T27 del plan general se sincronizaron con las evidencias el
17 de noviembre de 2026. Siguen abiertas T21 (cierre operativo), T23 (falta E2E
con Chromium en CI), T25 y T27; T24 se cerró con el PR #28. Los errores, carga y reintento de T14 pasan
a H24.

## Orden sugerido

1. ~~Verificar el despliegue real (T26)~~ — cerrado el 17 nov 2026.
2. ~~Decisiones comerciales~~ — definidas e implementadas el 17 nov 2026
   ([políticas](politicas-pedidos.md)).
3. Ensayar un ciclo real con cocina y reparto, completar rendimientos y calibrar
   la impresión de etiquetas (cierre de T21).
4. ~~Integración (T24)~~ — cerrada el 17 nov 2026. Completar E2E (T25), robustez de formularios (H24) y
   limpieza (T27).

En todos los bloques se deben conservar los menús y platillos existentes.
