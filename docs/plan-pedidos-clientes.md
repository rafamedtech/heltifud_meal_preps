# Plan de cierre: pedidos y personalización de Heltifud

Fecha de revisión: 29 de septiembre de 2026, America/Tijuana.

Actualización del 16 de noviembre: T08–T13 implementadas y verificadas
localmente en la [etapa 3](verificacion-etapa-3-pedido-cliente.md). Los hallazgos
de la revisión inicial se conservan como contexto histórico; el
[consolidado vigente](pendientes-implementacion.md) define el trabajo restante.

## Resultado esperado

El cliente elige un plan y variante, personaliza las comidas permitidas del menú activo, captura sus entregas y envía un pedido persistido. Administración recibe ese mismo pedido y controla confirmación, cobros, preparación y cada entrega, conservando historial.

En la revisión inicial existía la base administrativa y faltaba el autoservicio. La etapa 3 añade `/pedido`, persistencia atómica y consulta privada; los CTAs ya conservan plan y variante. Véase la evidencia actualizada arriba.

## Alcance y evidencia

Revisión de arquitectura Nuxt por capas, rutas públicas y administrativas, composables, API, validaciones Zod, modelos Prisma, migraciones, autenticación, pruebas y configuración de despliegue. Inventario: 167 archivos en app/layers/tests/prisma, excluyendo cliente Prisma generado. Se priorizó lectura del flujo de pedidos y dependencias; no se afirma que cada componente visual haya sido probado en navegador.

La revisión inicial no modificó lógica de aplicación ni consultó/escribió la base remota. La corrección posterior de H01 modifica el middleware de autorización, con evidencia abajo. Tras autorización explícita del usuario, se asignó el rol administrativo únicamente a `admin@heltifud.com` en Supabase y se verificó su sesión existente. Había un cambio local previo en `layers/base/app/components/admin/MenuForm.vue`; quedó preservado y se incluyó en el commit `74dd61a`.

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
| H01 | P0 | Corregido: autorización administrativa por `app_metadata.role === "admin"` | `layers/auth/server/middleware/admin-auth.ts` consulta `auth.getUser()`; pruebas unitarias y sesión real local verificadas | Sin usuario válido: 401; usuario sin rol admin: 403. Rol asignado únicamente a `admin@heltifud.com`; acceso verificado en localhost. Preview/despliegue sigue sin verificar. |
| H02 | P0 | Corregido: ingredientes protegidos por autorización administrativa | `admin-auth.ts` cubre `/api/ingredients` y sus subrutas; seis casos nuevos en `adminAuth.test.ts` | GET/POST anónimos devuelven 401; usuario sin rol admin recibe 403; administrador autorizado continúa. Verificación local documentada abajo; despliegue pendiente. |
| H03 | P0 | Corregido: RLS y permisos directos de menú/catálogo | Migración `20260930010000_secure_menu_catalog_rls` aplicada y verificada en Supabase para WeeklyMenu/MenuDay/DaySlot/FoodComponent/FoodCatalogItem | RLS habilitado y sin permisos de tabla/columna para anon/authenticated; Prisma conserva acceso. APIs públicas locales verificadas. Auditoría integral T03 y despliegue de aplicación siguen pendientes. |
| H04 | P0 | No existe compra ni personalización cliente | `layers/base/app/components/PlanCard.vue:7-22`; modal solo muestra títulos/precios | Variante no seleccionable ni transmitida; salida a WhatsApp, sin pedido persistido. |
| H05 | P0 | Corregido en el alta: no se copian tiempos vacíos | Etapa 1.3: cada día necesita principal en todos los tiempos del plan; validado con PostgreSQL y navegador. [Evidencia](verificacion-etapa-1.3.md). | Si faltan días completos para la variante se rechaza con 409; si se envía un día incompleto, con 400. |
| H06 | P0 | Corregido: días elegidos y compatibilidad del plan en alta y edición | Etapas 1.3 y 1.4: días completos al crear; al editar se conservan días y tiempos contratados con principal. [Evidencia](verificacion-etapa-1.4.md). | El autoservicio sigue fuera del alcance de estas etapas. |
| H07 | P1 | Corregido: fechas civiles sin desfase | Formateadores compartidos desde 1.2 y opciones de fecha del ciclo en 1.4; API usa `YYYY-MM-DD`. [Evidencia](verificacion-etapa-1.4.md). | Lista, historial y detalle conservan el día de entrega. |
| H08 | P1 | Corregido en admin: calendario comercial en alta y edición | Ciclo, reparto, preferencias y fechas calculadas; edición limitada a fechas permitidas de esa entrega. [Evidencia](verificacion-etapa-1.4.md). | El corte del autoservicio público corresponde a la etapa 3. |
| H09 | P1 | Corregido: dirección histórica congelada | Verificado en 1.2 y 1.4: cambiar perfil, guardar contenido o cambiar estado no reescribe la dirección; otra ubicación la actualiza explícitamente. [Evidencia](verificacion-etapa-1.4.md). | La dirección acordada permanece hasta cambiar de ubicación. |
| H10 | P1 | Corregido: transiciones, historial y bloqueo de pedidos cerrados | Etapa 1.4: mapa explícito, eventos con usuario/motivo e inmutabilidad en PostgreSQL, reapertura con motivo. [Evidencia](verificacion-etapa-1.4.md). | Parcial/entregado se derivan de entregas, sin selector libre de estado. |
| H11 | P1 | Corregido: entregas propias y estado individual en admin | Modelo de 1.2 y controles de 1.4; comidas asignadas, fecha, dirección, estado y marca de entrega. [Evidencia](verificacion-etapa-1.4.md). | El tablero operativo y evidencia de reparto siguen en etapa 6. |
| H12 | P1 | Sin cobros/saldos asociados a pedido | Modelos Prisma y rutas | No se distingue pedido pagado, anticipo, deuda o devolución. |
| H13 | P1 | Corregido: control de edición e idempotencia del alta | Etapa 1.4: comparación e incremento atómicos de `version`; dos guardados simultáneos dejan exactamente un ganador y un conflicto 409. [Evidencia](verificacion-etapa-1.4.md). Alta: `Idempotency-Key` con índice único; 4 altas simultáneas con una clave dejan un pedido. [Evidencia](verificacion-idempotencia-alta.md). | El formulario conserva cambios locales ante conflicto y reutiliza su clave en cada reintento. |
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

- Responsable: Codex. Fecha: 29 de septiembre de 2026, America/Tijuana. Implementación en commit `74dd61a`, sin PR ni despliegue en esta sesión.
- El servidor consulta el usuario actual con `serverSupabaseClient(event).auth.getUser()` en cada petición protegida y exige `app_metadata.role === "admin"`. No confía en `user_metadata`, el rol PostgreSQL ni roles enviados en la petición; un error de autenticación o excepción rechaza acceso con 401.
- Se conserva la cobertura administrativa existente y el acceso público a GET `/api/menu`, `/api/menu/next` y `/api/plans`. Al cerrar H01, H02, H03 y autorización visual del panel quedaron pendientes; la corrección posterior de H02 se documenta abajo.
- `pnpm lint`: pasa. `pnpm test:unit`: 15 archivos y 84 pruebas pasan, incluidas 35 nuevas de autorización. `pnpm build`: pasa con preset `node-server`. Persisten advertencias de deprecación Vitest/Nuxt y sourcemaps de Tailwind/module-preload-polyfill.
- Las pruebas cubren usuario ausente, error/excepción, roles ausentes o mal formados, rol falsificado en metadatos editables y petición, administrador autorizado, revocación frente a claims anteriores y todas las familias protegidas. Usan mocks de Supabase; no sustituyen la verificación de sesiones reales en preview.
- Asignación y revocación privilegiada del rol documentadas en `README.md`, conservando los demás campos de `app_metadata`. Con autorización explícita del usuario, se actualizó únicamente el UUID verificado de `admin@heltifud.com`; consulta posterior confirmó su rol `admin` y las otras dos cuentas sin rol. No se modificaron contraseñas ni se crearon cuentas.
- Verificación HTTP local sin sesión: GET `/api/orders`, `/api/customers`, `/api/expenses`, `/api/plans/all`, `/api/menu/all` y `/api/food-components` devolvieron 401. La sesión existente de `admin@heltifud.com` en `http://localhost:3000/admin/clientes` mostró 403 antes de asignar el rol y cargó la lista de clientes al reintentar después, sin volver a iniciar sesión. Se verificó contra Supabase real desde la aplicación local; preview/despliegue continúa pendiente.
- T02 permanece pendiente: H01 resuelve solo autorización de las rutas ya protegidas; faltan ingredientes, separación de operación/cliente y ownership/token.

### Evidencia de corrección H02

- Responsable: Codex. Fecha: 29 de septiembre de 2026, America/Tijuana. Cambios locales en `layers/auth/server/middleware/admin-auth.ts` y `tests/unit/adminAuth.test.ts`, sin PR ni despliegue en esta sesión.
- `/api/ingredients` y cualquier subruta, incluida la barra final, pasan por el mismo control de H01 para todos los métodos: usuario actual verificado mediante `auth.getUser()` y `app_metadata.role === "admin"`. El rechazo ocurre en middleware, antes del handler que consulta o crea ingredientes. GET no se considera catálogo público.
- Se añadieron seis casos de regresión para GET/POST, barra final, query string y futuras subrutas PUT/DELETE. Cada caso comprueba anónimo 401, usuario con rol cliente 403 y administrador permitido, usando mocks de Supabase. La cobertura existente conserva públicos GET `/api/menu`, `/api/menu/next` y `/api/plans`.
- `pnpm lint`: pasa. `pnpm test:unit`: 15 archivos, 90 pruebas pasan. `pnpm build`: pasa con preset `node-server`. Persisten las advertencias existentes de deprecación Vitest/Nuxt y sourcemaps Tailwind/module-preload-polyfill.
- Verificación HTTP local contra `http://localhost:3000`: GET y POST `/api/ingredients` sin cookies devolvieron 401 (POST con cuerpo vacío `{}`, sin crear datos). En Chrome se reutilizó el perfil con la sesión administrativa activa de Heltifud; una pestaña adicional de GET `/api/ingredients` mostró el catálogo real. Se volvió a la pestaña original sin alterar la sesión, ediciones pendientes ni datos. La conexión CDP agotó el tiempo de espera; se verificó mediante la interfaz nativa de Chrome.
- El caso 403 y el permiso para POST administrativo se verificaron en pruebas unitarias; no se cambiaron roles ni se crearon ingredientes para probarlos. Preview/despliegue sigue sin verificar. T02 continúa pendiente por separación de operación/cliente y ownership/token; H03 no cambia.

### Evidencia de cierre T02

- Fecha: 17 de noviembre de 2026. Rol `operations` en `app_metadata.role` con permisos de cocina, compras y reparto definidos en `layers/auth/shared/utils/staffAccess.ts` y aplicados por `admin-auth` (403 fuera de esa lista). `PUT` de la lista de súper con `expenseId` responde 403 para operación. La UI filtra navegación, redirige páginas no permitidas a `/admin/produccion`, oculta enlaces a pedidos, cobros y gastos, y muestra 403 a usuarios sin rol.
- Cliente: el enlace privado solo resuelve el pedido ligado al hash del token; un token alterado o de invitación sin pedido responde 404 (`customerOrderOwnership.test.ts`).
- `pnpm lint`, `pnpm typecheck` y `pnpm test:unit` pasan. Local: anónimo 401 en `/api/cycles` y `/api/operations/deliveries`; sesión admin conserva navegación completa y dashboard. Cuenta `operacion@heltifud.com` creada con rol `operations` (SQL privilegiado, sin correos); en navegador con perfil aislado el login redirige a `/admin/produccion`, la navegación queda filtrada, las páginas admin redirigen y la API devuelve 200 en ciclos/reparto y 403 en pedidos, clientes, gastos y dashboard. Se corrigió la carrera tras el login: el guard usa el `app_metadata` de la sesión mientras el módulo carga los claims.

### Evidencia de corrección H03

- Responsable: Codex. Fecha: 29 de septiembre de 2026, America/Tijuana. Migración Prisma `20260930010000_secure_menu_catalog_rls` aplicada mediante `pnpm exec prisma migrate deploy` en la base Supabase configurada. Cambios locales sin commit, PR ni despliegue de aplicación en esta sesión.
- Auditoría previa de la base real: las cinco tablas tenían RLS desactivado; las demás tablas de aplicación ya tenían RLS habilitado y no había políticas en `public`. Las conexiones `DATABASE_URL` y `DIRECT_URL` usan `postgres`, propietario de estas tablas, con `rolbypassrls = true` y sin superusuario. No se modificó ese rol ni se utilizó `FORCE ROW LEVEL SECURITY`.
- No se afirma exposición efectiva previa: no se encontraron grants directos para `anon`, `authenticated` ni `PUBLIC`, y las consultas bajo roles cliente fueron rechazadas por falta de acceso al esquema `public`. La corrección protege las tablas también si en el futuro se habilita acceso al esquema.
- La migración habilita RLS en `WeeklyMenu`, `MenuDay`, `DaySlot`, `FoodComponent` y `FoodCatalogItem`, y revoca todos los privilegios de tabla para `PUBLIC`, `anon` y `authenticated`. No crea políticas cliente: el acceso al menú y los planes públicos continúa mediante los DTO de Nuxt; las operaciones administrativas pasan por autorización del servidor. No cambia filas, credenciales ni sesiones. Se ensayó primero dentro de una transacción revertida; la aplicación definitiva agrupa los cambios en una transacción.
- Verificación reproducible: `node --env-file=.env scripts/verify-menu-rls.mjs` pasa contra PostgreSQL real usando la conexión de Nuxt. Comprueba RLS en las cinco tablas, ausencia de privilegios efectivos de tabla/columna para ambos roles cliente, 40 rechazos con SQLSTATE `42501` para SELECT/INSERT/UPDATE/DELETE y acceso del servidor para las cuatro operaciones. Las escrituras se comprueban con `EXPLAIN` sin `ANALYZE`, sin modificar datos.
- El mismo script comprueba RLS independientemente de los grants: concede temporalmente USAGE del esquema y SELECT de cada tabla a cada rol cliente, y obtiene cero filas en las diez consultas. Cada concesión se revierte con savepoint y la transacción completa termina en rollback; no deja permisos adicionales.
- `pnpm lint`: pasa. `pnpm test:unit`: 15 archivos y 90 pruebas pasan, con la advertencia existente de deprecación Vitest/Nuxt. Verificación HTTP de la aplicación local conectada a Supabase: GET `/api/menu` y `/api/plans` devuelven 200; GET `/api/food-components` sin sesión devuelve 401. No se requirió prueba en navegador para este cambio de permisos DB.
- T03 permanece pendiente: H03 cierra las cinco omisiones del historial de migraciones; no sustituye la auditoría integral de esquemas expuestos, vistas, funciones, permisos por defecto, tablas auxiliares como `_prisma_migrations` ni revisión completa del contenido publicable del DTO. Otros entornos deben aplicar la migración y ejecutar la misma verificación; preview/despliegue de aplicación no verificados.

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

- [x] T02 · P0 · Separar admin/operación/cliente; proteger todas las mutaciones, incluidos ingredientes, con autorización confiable del servidor. Validar ownership/token en futuras rutas cliente. **Cierre:** anónimo 401, cliente 403 en admin, cliente A no accede a B, admin autorizado opera. Dep.: T01.
- [ ] T03 · P0 · Auditar grants/RLS efectivos de todas las tablas y el rol de conexión Prisma; cerrar exposición no necesaria. **Cierre:** consultas directas anónimas no leen/escriben datos privados; API pública devuelve únicamente catálogo publicable. Dep.: T02.
- [ ] T04 · P0 · Unificar reglas de días/tiempos/componentes; rechazar plan incompatible, días vacíos y sustituciones no disponibles. Obtener nombres/precios/metadatos desde servidor. **Cierre:** cantidad exacta contratada, principal válido por tiempo y rechazos 400/409; caso fin de semana vacío cubierto. Dep.: T01.
- [ ] T05 · P0 · Asegurar un solo menú activo mediante restricción DB y operaciones atómicas; manejar solapamientos/concurrencia, vigencia y ausencia de menú. Versionar oferta al enviar pedido. **Cierre:** dos activaciones simultáneas no dejan dos activos; oferta cambiada genera conflicto comprensible. Dep.: T04.
- [ ] T06 · P1 · Separar fecha civil de timestamp. Corregir UI/defaults/calendario en zona Tijuana; preservar direcciones snapshot al cambiar estado. **Cierre:** misma fecha en formulario, listado, detalle e historial; cambiar cliente no mueve dirección de pedido confirmado. Dep.: T01.
- [x] T07 · P1 · Añadir clave idempotente para envío y versión para update; reglas de transición y bloqueo de pedidos cerrados. **Cierre:** doble envío crea uno; editor desactualizado recibe 409; transición ilegal rechazada. Dep.: T04. [1.4](verificacion-etapa-1.4.md) y [alta](verificacion-idempotencia-alta.md).

### Fase 2 — Compra y personalización cliente

- [x] T08 · P0 · Crear contrato público de oferta: menú/version/vigencia, planes, variantes, días, tiempos y sustituciones permitidas. DTO sin recetas internas ni datos personales. **Cierre:** frontend tiene todo lo necesario para configurar sin consultar endpoints admin. Dep.: T02–T05.
- [x] T09 · P0 · Crear `/pedido` con selección real de plan/variante, días y comidas. Conservar IDs al navegar desde PlanCard y mostrar unidades/precio total/resumen. **Cierre:** recorrido usable en móvil, sin selección perdida, muestra menú activo y restricciones. Dep.: T08.
- [x] T10 · P0 · Construir personalizador reutilizable con resumen de cambios, restaurar menú original y notas por comida. Guardar borrador/reanudar; accesibilidad y estados de error/vacío. **Cierre:** sustituciones válidas persisten; inválidas no avanzan; sin menú disponible impide envío con explicación. Dep.: T09.
- [x] T11 · P0 · Capturar identidad/contacto/direcciones/entregas; vincular cliente de forma verificada sin exponer existencia de otros clientes ni sobrescribirlos por teléfono enviado. **Cierre:** cliente nuevo y existente completan flujo; token solo permite su pedido. Dep.: T02, T06, T10.
- [x] T12 · P0 · Crear endpoint de envío atómico: recalcular total, validar versión/disponibilidad, crear/vincular cliente y guardar snapshot personalizado con estado de recepción definido. **Cierre:** pedido enviado aparece una sola vez en admin con exactamente las comidas y entregas del resumen. Dep.: T07, T11.
- [x] T13 · P1 · Crear confirmación y consulta privada de pedido/estado, folio humano y resumen compartible. Actualizar CTAs WhatsApp y textos que prometen pagar en línea. **Cierre:** enlace privado funciona sin conceder admin; WhatsApp usa resumen del pedido ya registrado. Dep.: T12.

### Fase 3 — Control administrativo

- [ ] T14 · P1 · Paginar listado completo; búsqueda remota de clientes; errores/carga/reintento; filtros por menú/semana y cualquiera de las entregas. **Cierre:** más de 150 pedidos y 100 clientes siguen accesibles; segunda entrega aparece en fecha correspondiente.
- [ ] T15 · P1 · Registrar historial de estados/cambios con operador, fecha y motivo; permitir corrección controlada y cancelación. **Cierre:** se reconstruye evolución del pedido sin alterar historial previo. Dep.: T07, T12.
- [ ] T16 · P1 · Modelar entregas individuales con comidas asignadas, estado, fecha efectiva, responsable e incidencias. Derivar estado global. **Cierre:** primera entrega no cierra segunda; no marcar entregado con pendientes. Dep.: T01, T15.
- [x] T17 · P1 · Registrar cobros manuales, método/referencia, saldo, anticipos y devoluciones; separar estado de pago y preparación. **Cierre:** abonos suman correctamente; sobrepago/devolución siguen reglas y auditoría. Dep.: T01, T12.
- [x] T18 · P1 · Sustituir dashboard vacío por pedidos por confirmar, entregas de hoy/atrasadas y saldos pendientes; accesos por rol. **Cierre:** métricas vienen de DB y coinciden con listados. Dep.: T14–T17.
- [ ] T19 · P1 · Archivar clientes/planes/variantes usados; traducir conflictos DB a 409/400 y mensajes útiles. Proteger salida con cambios pendientes. **Cierre:** historial conserva relaciones/snapshots y cliente con pedidos no dispara 500.

### Fase 4 — Cocina y reparto

- [x] T20 · P1 · Consolidar cantidades por fecha, tiempo, platillo y personalización desde snapshots confirmados; excluir cancelados/borradores. **Cierre:** sumas coinciden con pedidos de prueba, sustituciones incluidas. Dep.: T15, T16.
- [ ] T21 · P1 · **Implementación disponible; cierre operativo pendiente:** etiquetas/lista imprimible por cliente/comida/entrega y lista de reparto con direcciones históricas e incidencias. **Cierre:** cocina y reparto ejecutan una semana sin copiar datos manualmente. Dep.: T20.
- [x] T22 · P2 · Consolidar ingredientes desde recetas con unidades compatibles y versión histórica cuando corresponda. **Cierre:** no mezclar unidades incompatibles; cambios de receta no falsean compras históricas. Dep.: T20.

Evidencia de T17/T18/T20/T22 y límites del ensayo T21: [verificación de operación](verificacion-operacion.md). T21 sigue abierto hasta validar impresión física y ejecutar una semana con cocina y reparto.

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
