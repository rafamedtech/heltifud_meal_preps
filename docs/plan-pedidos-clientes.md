# Plan de cierre: pedidos y personalización de Heltifud

Fecha de revisión: 29 de septiembre de 2026, America/Tijuana.

## Resultado esperado

El cliente elige un plan y variante, personaliza las comidas permitidas del menú activo, captura sus entregas y envía un pedido persistido. Administración recibe ese mismo pedido y controla confirmación, cobros, preparación y cada entrega, conservando historial.

La base administrativa existe. El flujo de autoservicio del cliente todavía no existe: el botón «Ordenar» abre un catálogo de WhatsApp y no registra la selección.

## Alcance y evidencia

Revisión de arquitectura Nuxt por capas, rutas públicas y administrativas, composables, API, validaciones Zod, modelos Prisma, migraciones, autenticación, pruebas y configuración de despliegue. Inventario: 167 archivos en app/layers/tests/prisma, excluyendo cliente Prisma generado. Se priorizó lectura del flujo de pedidos y dependencias; no se afirma que cada componente visual haya sido probado en navegador.

La revisión inicial no modificó lógica de aplicación ni consultó/escribió la base remota. La corrección posterior de H01 sí modifica el middleware de autorización, con evidencia abajo; no modifica la base remota. Había un cambio local previo en `layers/base/app/components/admin/MenuForm.vue`; queda preservado. La revisión usa el estado actual del checkout, incluido ese cambio.

| Verificación ejecutada | Resultado |
| --- | --- |
| `pnpm lint` | Pasa. |
| `pnpm test:unit` | 14 archivos, 49 pruebas pasan. Advertencia de deprecación Vitest/Nuxt. |
| `pnpm build` | Pasa; Nitro genera preset `node-server`. Advertencias de sourcemaps Tailwind. |
| `pnpm test:e2e` | No verifica producto: primer intento bloqueado al abrir puerto; segundo inicia servidor pero 8 casos fallan antes de navegar por ausencia del ejecutable Chromium requerido. |
| Reproducción de fecha con Node | `2026-09-30` se presenta como «29 de septiembre» al parsear como UTC y formatear en Tijuana. |
| Typecheck, migraciones aplicadas y permisos de DB real | Sin verificar. Build no sustituye typecheck. |

## Qué aprovechar

- CRUD de clientes con filtros/paginación, perfil e historial de pedidos.
- CRUD de planes y variantes con días, precios y tiempos incluidos; `/planes` ya consume DB.
- Catálogo de platillos, recetas e ingredientes; editor de menú semanal y activación manual.
- Creación administrativa de pedidos desde menú activo; copias de plan, precio, direcciones y componentes.
- Edición administrativa de componentes y estados; listado con búsqueda y filtros.
- Gastos con filtros, resumen y paginación. Este módulo no registra cobros de pedidos.

## Hallazgos y pendientes

P0 = cerrar antes de abrir autoservicio. P1 = necesario para operar pedidos. P2 = cierre complementario.

| ID | Prioridad | Hallazgo / pendiente | Evidencia | Consecuencia |
| --- | --- | --- | --- | --- |
| H01 | P0 | Corregido en código: autorización administrativa por `app_metadata.role === "admin"` | `layers/auth/server/middleware/admin-auth.ts` consulta `auth.getUser()`; `tests/unit/adminAuth.test.ts` cubre permisos y rutas | Sin usuario válido: 401; usuario sin rol admin: 403. Asignar rol a administradores existentes antes del despliegue y verificar en entorno real. |
| H02 | P0 | Ingredientes quedan fuera del middleware | `/api/ingredients` GET/POST y `admin-auth.ts:11-20` | Creación anónima alcanza DB; falta control explícito. |
| H03 | P0 | RLS incompleto en historial de migraciones | No aparecen habilitaciones para WeeklyMenu/MenuDay/DaySlot/FoodComponent/FoodCatalogItem | Riesgo de acceso directo según grants/configuración real. Verificar DB antes de afirmar exposición efectiva. |
| H04 | P0 | No existe compra ni personalización cliente | `layers/base/app/components/PlanCard.vue:7-22`; modal solo muestra títulos/precios | Variante no seleccionable ni transmitida; salida a WhatsApp, sin pedido persistido. |
| H05 | P0 | Pedido puede copiar tiempos vacíos | `orders.ts:125-149,269-272`; menú crea cinco slots por cada uno de siete días | Variantes permiten 6/7 días, fin de semana puede estar vacío. Verificar solo longitud de slots admite comidas sin componentes; después no pasan schema de edición. |
| H06 | P0 | Días elegidos y compatibilidad del plan no se validan | `buildMenuSlots` toma primeros N días; schema de update solo valida estructura/duplicados | No hay selección de días; update admite combinación distinta de días/tiempos contratados y metadatos de comida enviados por cliente. No reutilizarlo públicamente. |
| H07 | P1 | Fechas de entrega se muestran un día antes | `admin/pedidos/[id].vue:103-105`; helpers/dateFormatting parsean fechas como instantes | Fecha operativa equivocada; historial de cliente usa UTC y puede discrepar del detalle/listado. |
| H08 | P1 | Sin reglas de calendario comercial | create admite cualquier fecha ordenada; defaults mañana/+4 días | Entregas fuera de periodo del menú, días preferidos ignorados, sin fecha límite de compra/edición. |
| H09 | P1 | Guardar pedido reescribe direcciones históricas | `orders.ts:316-319` vuelve a resolver dirección actual del cliente | Cambiar solo estado después de editar cliente altera dirección previamente acordada. UI también muestra dirección actual. |
| H10 | P1 | Estados sin transiciones ni historial | `orders.ts:313`; UI ofrece todos los estados | Entregado puede volver a borrador; edición de pedidos cerrados; no queda quién cambió qué/cuándo. |
| H11 | P1 | Entregas sin estado individual | `Order` solo tiene dos fechas/direcciones y un estado global | No hay evidencia de primera/segunda entrega, responsable, incidencias o comidas asignadas a cada entrega. |
| H12 | P1 | Sin cobros/saldos asociados a pedido | Modelos Prisma y rutas | No se distingue pedido pagado, anticipo, deuda o devolución. |
| H13 | P1 | Sin idempotencia ni control de edición concurrente | create sin clave única de envío; update elimina/recrea todos los slots | Reintento puede duplicar pedidos; dos operadores sobrescriben cambios. |
| H14 | P1 | Listado y selector dejan registros fuera | `pedidos/index.vue:69` limit 150 sin paginación; `crear-nuevo.vue:20` carga primeros 100 clientes | Pedidos/clientes adicionales inaccesibles desde esos flujos. Historial cliente sí pagina. |
| H15 | P1 | Filtro de fechas solo considera primera entrega | `orders.ts:185-188` | Pedidos con segunda entrega en rango quedan fuera de agenda. |
| H16 | P1 | Borrado de cliente con pedidos produce error DB sin tratamiento | `customers.ts:141-149`; FK Order→Customer Restrict | Error genérico en vez de explicar/archivar cliente y mantener historial. |
| H17 | P1 | Menú activo sin garantía fuerte de vigencia/unicidad | `menu.ts:331-339,371-393,505-521`; schema solo indexa isActive | Menú vencido sigue vendible. Creaciones/activaciones concurrentes necesitan garantía DB; solapamiento se consulta fuera de escritura atómica. |
| H18 | P1 | Borrado activo elige fallback sin vigencia | `menu.ts:491-503` | Puede activar menú viejo/futuro automáticamente. |
| H19 | P1 | Cambiar catálogo actualiza menús existentes | `foodCatalog.ts:184-215` updateMany global | Menú mostrado al cliente cambia durante configuración; snapshots de pedidos se conservan, pero hace falta versión/validación al confirmar. |
| H20 | P1 | Operación central pendiente | `admin/index.vue:14` contiene «Admin dashboard»; no rutas de cocina/reparto | Faltan pendientes del día, producción consolidada, etiquetas y lista de entregas. |
| H21 | P1 | Pruebas críticas ausentes | E2E solo home; tests pedidos cubren schema, listado con mocks y UI | Sin validación real de create/update, permisos, snapshots, transacciones ni compra completa. |
| H22 | P1 | Despliegue necesita verificación | `netlify.toml` publica dist; build local genera node-server/.output; sin workflow CI en repo | No asumir que sitio desplegado ejecuta API, carga env o aplica migraciones correctamente. |
| H23 | P2 | Tipos/documentación y datos heredados | `app/types/database.types.ts` = unknown; `weeklyPlans.ts` y helpers estáticos; README inicial | Aclarar fuentes vigentes, agregar tipos y runbook; retirar duplicados tras verificar usos. |
| H24 | P2 | Manejo de errores/login y edición pendiente de endurecer | Login sin finally ante excepción; creación omite errores de fetch; IDs/cursors con validación desigual | Errores pueden parecer listas vacías; conflicto de planes/FK produce mensajes genéricos; riesgo de perder cambios sin guardar. |

### Evidencia de corrección H01

- Responsable: Codex. Fecha: 29 de septiembre de 2026, America/Tijuana. Implementación local, sin PR ni despliegue en esta sesión.
- El servidor consulta el usuario actual con `serverSupabaseClient(event).auth.getUser()` en cada petición protegida y exige `app_metadata.role === "admin"`. No confía en `user_metadata`, el rol PostgreSQL ni roles enviados en la petición; un error de autenticación o excepción rechaza acceso con 401.
- Se conserva la cobertura administrativa existente y el acceso público a GET `/api/menu`, `/api/menu/next` y `/api/plans`. H02, H03 y autorización visual del panel quedan pendientes.
- `pnpm lint`: pasa. `pnpm test:unit`: 15 archivos y 84 pruebas pasan, incluidas 35 nuevas de autorización. `pnpm build`: pasa con preset `node-server`. Persisten advertencias de deprecación Vitest/Nuxt y sourcemaps de Tailwind/module-preload-polyfill.
- Las pruebas cubren usuario ausente, error/excepción, roles ausentes o mal formados, rol falsificado en metadatos editables y petición, administrador autorizado, revocación frente a claims anteriores y todas las familias protegidas. Usan mocks de Supabase; no sustituyen la verificación de sesiones reales en preview.
- Asignación y revocación privilegiada del rol documentadas en `README.md`, conservando los demás campos de `app_metadata`. No se asignaron roles remotos. Pendiente operativo antes del despliegue: configurar administradores existentes y verificar 401/403/acceso autorizado con sesiones reales.
- T02 permanece pendiente: H01 resuelve solo autorización de las rutas ya protegidas; faltan ingredientes, separación de operación/cliente y ownership/token.

## Decisiones de producto propuestas

Son supuestos para ejecutar el plan; confirmar antes de implementar reglas dependientes.

1. Pedido semanal único; recurrencia automática queda fuera del primer lanzamiento.
2. Personalización inicial: elegir días de servicio y sustituir componentes por opciones publicadas para ese menú/tiempo. No abrir todo el catálogo ni permitir inventar precio/calorías desde navegador.
3. Mantener precio de variante para sustituciones incluidas. Extras solo cuando exista regla explícita de cantidad y precio calculada por servidor.
4. Cliente entra por enlace privado con token limitado a su pedido, revocable y con vencimiento. Alternativa: cuenta propia con asociación user→customer; nunca acceso administrativo por tener sesión.
5. Mantener dos entregas como configuración inicial existente, modeladas individualmente. Definir qué variantes admiten una entrega y cómo repartir comidas entre entregas.
6. Confirmación inicial por operador y cobro manual registrado. Pago en línea se integra después si se requiere; no bloquear compra por ausencia de proveedor.
7. Definir días/corte horario, zona de reparto, recargos, cambios después de confirmar, cancelaciones y política de sustituciones. Aplicar siempre en servidor.

## Ejecución y control

Cada tarea comienza en estado pendiente. Marcar checkbox solo con criterio de cierre comprobado. Registrar responsable, fecha, PR/evidencia y bloqueos en cada ID al ejecutarlo. No cerrar porque «pantalla ya existe».

### Fase 0 — Contrato de operación

- [ ] T01 · P0 · Acordar decisiones anteriores y ejemplos de planes 3/4/5/7 días. Definir disponibilidad, sustituciones, cobros y entregas. **Cierre:** matriz de reglas y ejemplos aprobados; dependencias posteriores claras.

### Fase 1 — Permisos e integridad

- [ ] T02 · P0 · Separar admin/operación/cliente; proteger todas las mutaciones, incluidos ingredientes, con autorización confiable del servidor. Validar ownership/token en futuras rutas cliente. **Cierre:** anónimo 401, cliente 403 en admin, cliente A no accede a B, admin autorizado opera. Dep.: T01.
- [ ] T03 · P0 · Auditar grants/RLS efectivos de todas las tablas y el rol de conexión Prisma; cerrar exposición no necesaria. **Cierre:** consultas directas anónimas no leen/escriben datos privados; API pública devuelve únicamente catálogo publicable. Dep.: T02.
- [ ] T04 · P0 · Unificar reglas de días/tiempos/componentes; rechazar plan incompatible, días vacíos y sustituciones no disponibles. Obtener nombres/precios/metadatos desde servidor. **Cierre:** cantidad exacta contratada, principal válido por tiempo y rechazos 400/409; caso fin de semana vacío cubierto. Dep.: T01.
- [ ] T05 · P0 · Asegurar un solo menú activo mediante restricción DB y operaciones atómicas; manejar solapamientos/concurrencia, vigencia y ausencia de menú. Versionar oferta al enviar pedido. **Cierre:** dos activaciones simultáneas no dejan dos activos; oferta cambiada genera conflicto comprensible. Dep.: T04.
- [ ] T06 · P1 · Separar fecha civil de timestamp. Corregir UI/defaults/calendario en zona Tijuana; preservar direcciones snapshot al cambiar estado. **Cierre:** misma fecha en formulario, listado, detalle e historial; cambiar cliente no mueve dirección de pedido confirmado. Dep.: T01.
- [ ] T07 · P1 · Añadir clave idempotente para envío y versión para update; reglas de transición y bloqueo de pedidos cerrados. **Cierre:** doble envío crea uno; editor desactualizado recibe 409; transición ilegal rechazada. Dep.: T04.

### Fase 2 — Compra y personalización cliente

- [ ] T08 · P0 · Crear contrato público de oferta: menú/version/vigencia, planes, variantes, días, tiempos y sustituciones permitidas. DTO sin recetas internas ni datos personales. **Cierre:** frontend tiene todo lo necesario para configurar sin consultar endpoints admin. Dep.: T02–T05.
- [ ] T09 · P0 · Crear `/pedido` con selección real de plan/variante, días y comidas. Conservar IDs al navegar desde PlanCard y mostrar unidades/precio total/resumen. **Cierre:** recorrido usable en móvil, sin selección perdida, muestra menú activo y restricciones. Dep.: T08.
- [ ] T10 · P0 · Construir personalizador reutilizable con resumen de cambios, restaurar menú original y notas por comida. Guardar borrador/reanudar; accesibilidad y estados de error/vacío. **Cierre:** sustituciones válidas persisten; inválidas no avanzan; sin menú disponible impide envío con explicación. Dep.: T09.
- [ ] T11 · P0 · Capturar identidad/contacto/direcciones/entregas; vincular cliente de forma verificada sin exponer existencia de otros clientes ni sobrescribirlos por teléfono enviado. **Cierre:** cliente nuevo y existente completan flujo; token solo permite su pedido. Dep.: T02, T06, T10.
- [ ] T12 · P0 · Crear endpoint de envío atómico: recalcular total, validar versión/disponibilidad, crear/vincular cliente y guardar snapshot personalizado con estado de recepción definido. **Cierre:** pedido enviado aparece una sola vez en admin con exactamente las comidas y entregas del resumen. Dep.: T07, T11.
- [ ] T13 · P1 · Crear confirmación y consulta privada de pedido/estado, folio humano y resumen compartible. Actualizar CTAs WhatsApp y textos que prometen pagar en línea. **Cierre:** enlace privado funciona sin conceder admin; WhatsApp usa resumen del pedido ya registrado. Dep.: T12.

### Fase 3 — Control administrativo

- [ ] T14 · P1 · Paginar listado completo; búsqueda remota de clientes; errores/carga/reintento; filtros por menú/semana y cualquiera de las entregas. **Cierre:** más de 150 pedidos y 100 clientes siguen accesibles; segunda entrega aparece en fecha correspondiente.
- [ ] T15 · P1 · Registrar historial de estados/cambios con operador, fecha y motivo; permitir corrección controlada y cancelación. **Cierre:** se reconstruye evolución del pedido sin alterar historial previo. Dep.: T07, T12.
- [ ] T16 · P1 · Modelar entregas individuales con comidas asignadas, estado, fecha efectiva, responsable e incidencias. Derivar estado global. **Cierre:** primera entrega no cierra segunda; no marcar entregado con pendientes. Dep.: T01, T15.
- [ ] T17 · P1 · Registrar cobros manuales, método/referencia, saldo, anticipos y devoluciones; separar estado de pago y preparación. **Cierre:** abonos suman correctamente; sobrepago/devolución siguen reglas y auditoría. Dep.: T01, T12.
- [ ] T18 · P1 · Sustituir dashboard vacío por pedidos por confirmar, entregas de hoy/atrasadas y saldos pendientes; accesos por rol. **Cierre:** métricas vienen de DB y coinciden con listados. Dep.: T14–T17.
- [ ] T19 · P1 · Archivar clientes/planes/variantes usados; traducir conflictos DB a 409/400 y mensajes útiles. Proteger salida con cambios pendientes. **Cierre:** historial conserva relaciones/snapshots y cliente con pedidos no dispara 500.

### Fase 4 — Cocina y reparto

- [ ] T20 · P1 · Consolidar cantidades por fecha, tiempo, platillo y personalización desde snapshots confirmados; excluir cancelados/borradores. **Cierre:** sumas coinciden con pedidos de prueba, sustituciones incluidas. Dep.: T15, T16.
- [ ] T21 · P1 · Crear etiquetas/lista imprimible por cliente/comida/entrega y lista de reparto con direcciones históricas e incidencias. **Cierre:** cocina y reparto ejecutan una semana sin copiar datos manualmente. Dep.: T20.
- [ ] T22 · P2 · Consolidar ingredientes desde recetas con unidades compatibles y versión histórica cuando corresponda. **Cierre:** no mezclar unidades incompatibles; cambios de receta no falsean compras históricas. Dep.: T20.

### Fase 5 — Verificación y lanzamiento

- [ ] T23 · P1 · Restaurar runtime Chromium y añadir typecheck reproducible; ejecutar lint/unit/build en CI. **Cierre:** checkout limpio ejecuta checks con versiones fijadas.
- [ ] T24 · P0 · Añadir integración con PostgreSQL aislado para permisos, crear/personalizar pedido, snapshots, rollback, vacío/incompatibilidad, idempotencia y concurrencia. **Cierre:** casos críticos pasan sin mocks de persistencia. Dep.: T02–T07, T12.
- [ ] T25 · P1 · E2E móvil/desktop: plan→personalización→envío→admin→confirmación→cobro→dos entregas; accesos ajenos y fallos recuperables. **Cierre:** flujo completo pasa y conserva datos tras recarga. Dep.: T13–T18, T23–T24.
- [ ] T26 · P1 · Validar deploy Netlify real, preset/API/env/cookies; migraciones revisadas y respaldo; healthcheck/errores sin datos privados; runbook y ensayo con datos sintéticos. **Cierre:** preview ejecuta flujo completo y existe rollback probado. Dep.: T25.
- [ ] T27 · P2 · Actualizar README/env examples/tipos, retirar duplicados sin uso y dividir componentes grandes donde facilite mantenimiento. Tratar advertencias de dependencias/sourcemaps después de flujo estable. **Cierre:** nuevo operador/desarrollador puede instalar, probar y operar con documentación vigente.

## Hitos y dependencias

| Hito | Tareas | Condición de avance |
| --- | --- | --- |
| A. Base confiable | T01–T07, T23 | Permisos, cantidades, menú, fechas y concurrencia correctos. |
| B. Cliente ordena | T08–T13, T24 | Pedido personalizado guardado y visible en admin; acceso privado. |
| C. Operación completa | T14–T21 | Cobros y dos entregas trazables; cocina/reparto reciben datos completos. |
| D. Lanzamiento | T25–T26 | Ensayo completo en preview + migraciones/rollback/observabilidad. |
| E. Complementos | T22, T27 | Compras de ingredientes y mantenimiento sin bloquear salida inicial. |

Trabajo grande: no asignar fecha cerrada antes de T01. Estimar tareas por PR después de acordar personalización, acceso cliente y calendario. Primer bloque recomendado: T02, T04, T06 y T14; T03/T05 requieren revisar DB/migraciones antes de ejecución.

## Criterio final de terminado

Un cliente puede elegir variante y comidas permitidas del menú vendible, confirmar total y entregas, enviar y consultar su pedido. Un operador puede encontrarlo sin límites artificiales, confirmar/cobrar/preparar y completar cada entrega. Cambios de catálogo, plan o cliente no alteran lo acordado. Acceso ajeno, pedido incompleto y doble envío se rechazan. El recorrido pasa con DB real de pruebas y en preview del despliegue.
