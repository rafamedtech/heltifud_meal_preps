# Pendientes de implementación

Actualizado: 16 de noviembre de 2026.

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
La aplicación aún no se ha desplegado.

## 4. Operación, compras, cocina y reparto

- [ ] Registrar pagos manuales, método, referencia, anticipos, saldo y devoluciones;
  separar pago del estado de preparación y entrega (T17).
- [ ] Completar el dashboard con pedidos por confirmar, entregas de hoy/atrasadas y
  saldos pendientes (T18). La auditoría de dashboard ya documenta indicadores reales
  y pedidos recientes; falta el alcance operativo restante.
- [ ] Archivar planes y variantes utilizados, traducir conflictos de base de datos a
  mensajes útiles y proteger la navegación con cambios sin guardar (T19/H24).
- [ ] Consolidar ingredientes por ciclo con rendimiento, unidades compatibles y
  agrupación por categoría; guardar lista de súper, marcar comprado y vincular
  gastos. Definir la conservación histórica de recetas cuando corresponda (T22).
- [ ] Consolidar producción por entrega, fecha, tiempo, platillo, porciones,
  contenedores y personalización a partir de snapshots válidos (T20).
- [ ] Generar etiquetas y listas imprimibles por cliente, comida y entrega (T21).
- [ ] Crear tablero diario de reparto con direcciones históricas, responsable,
  incidencias, evidencia y cobros pendientes. Estados individuales y estado global
  derivado ya existen; queda la herramienta operativa (remanente de T16/T21).

Fuentes: etapas 4–7 de la [auditoría semanal](auditoria-flujo-semanal.md),
T16–T22 del [plan general](plan-pedidos-clientes.md) y
[auditoría del dashboard](auditoria-admin-dashboard.md).

## 5. Seguridad, calidad y lanzamiento

- [ ] Completar separación de permisos admin/operación/cliente y probar acceso
  ajeno en las futuras rutas de cliente (remanente de T02). La autorización admin
  y protección de ingredientes ya tienen correcciones documentadas.
- [ ] Auditar grants/RLS de todas las tablas y el rol de conexión Prisma (T03).
  La protección de menú/catálogo e historial de estados ya tiene evidencia parcial.
- [ ] Incorporar typecheck reproducible con versiones fijadas, resolver o contrastar
  los errores reportados y ejecutar lint, pruebas y build en CI (T23). Los informes
  registran resultados diferentes según la versión de vue-tsc; no asumir un fallo
  del producto a partir de un único checker temporal.
- [ ] Completar integración con PostgreSQL aislado para permisos, oferta,
  personalización, idempotencia y fallos transaccionales (T24). Las integraciones
  reales de alta y workflow de 1.3/1.4 ya cubren parte de este alcance.
- [ ] Completar E2E móvil/escritorio del recorrido cliente → admin → pago → dos
  entregas, incluyendo accesos ajenos y recuperación de errores (T25).
- [ ] Verificar despliegue real: preset, API, variables, cookies, migraciones,
  respaldo, healthcheck, errores sin datos privados y rollback probado (T26/H22).
- [ ] Endurecer carga, errores y reintento en login/formularios; unificar validación
  de IDs y cursores, y evitar presentar errores como listas vacías (H24).
- [ ] Actualizar tipos de base de datos, ejemplos de entorno y runbook; retirar
  helpers duplicados y dividir componentes grandes cuando aporte claridad (T27).

## Decisiones de negocio por cerrar

Estas decisiones condicionan las implementaciones correspondientes:

- [ ] Hora exacta del corte del viernes.
- [x] Repetir platillo: libre; el mismo platillo puede ocupar todos los lugares
  contratados (16 nov 2026).
- [x] Preferencias: exclusiones y alergias que el sistema aplica solo (16 nov 2026).
- [x] Acceso mediante invitación y consulta privada con tokens limitados,
  revocables y con vencimiento (16 nov 2026).
- [ ] Cobro manual inicial o pago en línea; reglas de anticipos y devoluciones.
- [ ] Zonas, recargos, extras y políticas de cambios/cancelaciones del autoservicio.

## Verificaciones pendientes de lo ya implementado

El avance de 1.1 aún señala pruebas contra la base real para cambio de estado de
semana, guardado de ajustes y creación de menú personalizado. La verificación 1.3
cubre pedidos con menú personalizado, pero no demuestra por sí sola todo el flujo
de creación de ese menú desde su interfaz. Cerrar esas comprobaciones con evidencia.

El plan general mantiene casillas T01–T27 abiertas y hallazgos antiguos que se
solapan con avances posteriores. Antes de cerrar cada tarea, ajustar su alcance
contra las evidencias de 1.1–1.4; una casilla antigua abierta no prueba que todo su
contenido siga sin implementar.

## Orden sugerido

1. Ensayar el pedido de cliente implementado en el entorno de despliegue.
2. Completar políticas comerciales de cobertura, cobro y cambios.
3. Desarrollar compras, cocina y reparto; pueden avanzar desde pedidos de admin sin
   esperar el autoservicio del cliente.
4. Completar cobros, dashboard operativo y verificación de lanzamiento.

En todos los bloques se deben conservar los menús y platillos existentes.
