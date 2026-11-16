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
- [ ] **1.6 — Limpieza:** retirar `WeeklyMenu.isActive` y sus usos transitorios,
  consolidando el ciclo como fuente de vigencia; actualizar README y design system.
- [ ] **Idempotencia del alta (H13/T07):** usar una clave de idempotencia para que
  doble clic o reintento cree un solo pedido. La versión de edición ya está resuelta.

Detalle de 1.5: [preparación y resultado](preparacion-etapa-1.5.md).

Fuente: [plan de etapa 1](plan-etapa-1-cimientos.md) y H13–H16 del
[plan general](plan-pedidos-clientes.md).

## 2. Personalización e integridad de la oferta

- [ ] Implementar sustituciones limitadas a opciones del menú semanal y tiempos
  permitidos, con reglas de cantidad y precio validadas por servidor.
- [ ] Registrar procedencia y cambios de sustitución, aplicar preferencias del
  cliente y permitir restaurar el menú original. Los campos de origen ya se llenan
  al copiar el pedido; falta el flujo de intercambio.
- [ ] Versionar la oferta y comprobar su versión/disponibilidad al confirmar para
  detectar cambios de catálogo o menú durante la configuración (H19/T05).
- [ ] Completar las garantías de vigencia y concurrencia de publicación de menús por
  ciclo, tipo y cliente personalizado. Contrastar T05/H17/H18 con lo implementado en
  1.1 antes de determinar qué restricciones u operaciones faltan.

Fuentes: etapa 2 de la [auditoría semanal](auditoria-flujo-semanal.md) y
T04/T05 del [plan general](plan-pedidos-clientes.md).

## 3. Pedido del cliente

- [ ] Publicar un contrato de oferta con menú, versión, vigencia, planes, variantes,
  días, tiempos y sustituciones permitidas, sin recetas internas ni datos privados.
- [ ] Crear `/pedido` con selección real de plan/variante, días y comidas; conservar
  la selección desde PlanCard y mostrar cantidades, precio y resumen.
- [ ] Crear el personalizador con notas por comida, resumen de cambios,
  restauración, borrador recuperable y estados de error o falta de disponibilidad.
- [ ] Capturar contacto, direcciones y entregas; vincular clientes existentes de
  forma verificada sin exponer a otros clientes ni sobrescribirlos por teléfono.
- [ ] Implementar acceso privado al pedido, con ownership o token limitado,
  revocable y con vencimiento, conforme a la decisión de acceso pendiente.
- [ ] Crear el envío público atómico: recalcular total y validar oferta, comidas,
  corte y entregas; persistir el snapshot personalizado con idempotencia.
- [ ] Crear confirmación y consulta privada del pedido/estado; compartir por
  WhatsApp el resumen del pedido guardado y ajustar los textos de pago.

Fuente: T08–T13 del [plan general](plan-pedidos-clientes.md).

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
- [ ] Si el cliente puede repetir un platillo durante la semana y con qué límites.
- [ ] Acceso del cliente mediante enlace privado o cuenta propia.
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

1. Completar remanentes de 1.1, bloque 1.5, idempotencia y limpieza 1.6.
2. Cerrar decisiones de sustitución/acceso y completar personalización y oferta.
3. Implementar pedido del cliente y acceso privado.
4. Desarrollar compras, cocina y reparto; pueden avanzar desde pedidos de admin sin
   esperar el autoservicio del cliente.
5. Completar cobros, dashboard operativo y verificación de lanzamiento.

En todos los bloques se deben conservar los menús y platillos existentes.
