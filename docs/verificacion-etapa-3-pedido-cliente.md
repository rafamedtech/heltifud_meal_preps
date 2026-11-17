# Verificación: pedido del cliente (etapa 3)

16 de noviembre de 2026, America/Tijuana. Implementado localmente; migración
aplicada en la base configurada. Aplicación sin desplegar.

## Comportamiento

- `/pedido`: plan y variante desde PlanCard, menú estándar o vegetariano,
  días completos, sustituciones por familia dentro de los tiempos del plan,
  restauración del menú compatible, notas por comida, contacto y direcciones
  independientes por entrega. El total se calcula desde el precio del servidor.
- El contrato de oferta contiene versión del menú y una revisión de plan,
  variante, ciclo y compatibilidad de opciones. Cambios requieren revisión antes
  de enviar. Los placeholders heredados «Sin menu asignado» no se venden.
- Borrador local con vencimiento lógico de 7 días, validación al recuperar y
  borrado explícito. Incluye contacto y direcciones; se informa en pantalla.
  No se sincroniza entre dispositivos. Si la respuesta de envío falla,
  conserva el payload exacto, clave y secreto para reintentar o consultar.
- El POST público valida toda la estructura y recalcula el precio; no acepta un
  `customerId` del navegador. Cliente, contacto snapshot, pedido, comidas,
  bitácora de sustituciones, entregas y enlace privado se guardan juntos.
  Un fallo revierte todo. Los platos se copian del menú, nunca del navegador.
- Cada solicitud enviada entra como `DRAFT` administrativo, con evento
  «Pedido recibido; pendiente de confirmación por Heltifud». El cliente lo ve
  como «Recibido · pendiente de confirmación».
- El contacto de un pedido web queda congelado; usar una invitación no modifica
  el perfil del cliente existente. Guardar desde administración conserva las
  instrucciones por comida y las direcciones pactadas.
- La consulta privada muestra únicamente el pedido autorizado, su estado,
  comidas, notas, entregas y folio. WhatsApp usa ese snapshot persistido.
  No se envían mensajes automáticamente ni se cobra al enviar la solicitud.

## Acceso

Decisión aceptada al autorizar la recomendación de esta sesión: enlaces privados
revocables y con vencimiento, sin cuenta de cliente.

- Invitación: desde la ficha administrativa del cliente, «Crear invitación de
  pedido». Vence a los 7 días, permite configurar para ese cliente y aplica su
  tipo de menú y exclusiones. Crear otra revoca la anterior. Se copia y comparte
  manualmente. No permite consultar pedidos ni buscar clientes.
- Sin invitación se crea un contacto nuevo. Coincidir en teléfono no identifica,
  revela ni sobrescribe un contacto anterior. Evitar duplicados para clientes
  conocidos requiere enviarles su invitación.
- Consulta: secreto de 256 bits generado antes del envío; vence a los 90 días,
  limitado a ese pedido. Administración lo revoca desde el detalle del pedido.
  No sirve como invitación ni da acceso a otro pedido o a administración.
- PostgreSQL guarda solo SHA-256 de los secretos. Enlaces con fragmento (`#`),
  solicitudes mediante headers, `Cache-Control: no-store`, `Referrer-Policy:
  no-referrer` y `noindex`. Nunca se usa la clave de idempotencia como acceso.
- `order_access_links` tiene RLS habilitado y carece de privilegios para
  `PUBLIC`, `anon` y `authenticated`; acceso únicamente por el servidor.

## Publicación y corte

Migración `20261117001359_customer_order_flow`: índice único parcial que impide
más de una semana `OPEN`, tabla protegida de enlaces, contacto JSON en el pedido
y notas por tiempo de comida. Aditiva respecto de los datos existentes.
La migración falla ante semanas abiertas duplicadas, sin cerrarlas en silencio.

`updateCycle` serializa cambios de publicación con un bloqueo asesor de
transacción antes de leer o cerrar semanas. La unicidad previa por
semana/tipo/cliente sigue vigente. El POST cliente bloquea ciclo, menú y precio,
relee después del bloqueo y comprueba el corte con el reloj de PostgreSQL al
finalizar. El alta administrativa mantiene su excepción de captura tardía.
`GET /api/menu/next` no publica semanas en borrador.

La hora de corte usa la configuración existente y se muestra en Tijuana; no se
ha inventado una hora de negocio nueva. Cobertura y forma de pago quedan sujetas
a revisión de Heltifud. Recargos, pago en línea y automatización de WhatsApp no
forman parte de esta implementación.

## Evidencia

- `pnpm lint`: pasa. `pnpm test:unit`: 33 archivos, 247 pruebas pasan.
  `pnpm build`: pasa. Verificación final con Node 22.23.5 compatible con el
  proyecto (binario ya instalado fuera del repositorio).
- Typecheck servidor y app pasan. En la corrección posterior de esta sesión se
  resolvió `MenuForm.vue:956`: el selector recibe `undefined` cuando no hay
  cliente y devuelve `null` al estado del formulario. Se usó el checker estable
  ya instalado en `/tmp`, sin cambiar dependencias del repositorio. Lint y las
  247 pruebas también pasan después de la corrección.
- `node --import tsx --env-file=.env scripts/verify-customer-order.ts`:
  integración PostgreSQL con fixtures en una transacción revertida y savepoints
  que reproducen cada transacción del endpoint. Comprueba oferta sin recetas,
  snapshots, notas, sustitución, ambas entregas, reintento, cambio de payload o
  secreto, teléfonos coincidentes sin sobrescritura, rollback por fallo al guardar
  comidas, precio/menú/variante desactualizados, invitación y su rotación,
  conservación al editar en admin, revocación, vencimiento y corte.
  El índice DB rechaza una segunda semana abierta.
- `scripts/verify-customer-order-concurrency.ts`: cuatro envíos concurrentes
  dejan exactamente un contacto, un pedido y un enlace privado. Comprueba
  exclusión mutua del bloqueo de publicación y lo libera mediante rollback.
  Elimina únicamente los fixtures propios al terminar.
- Regresión real: `verify-order-create.ts` y `verify-order-personalization.ts`
  pasan. Sus fixtures se adaptaron al índice de una sola semana abierta:
  cualquier cierre de semana ocurre sin commit y se revierte al terminar.
- HTTP local final: oferta 200 con revisión y `no-store`, sin placeholders;
  consulta sin secreto 404; emisión/revocación administrativa sin sesión 401.
- Consultas de catálogo PostgreSQL confirman RLS y ausencia de SELECT efectivo
  para `anon`/`authenticated` en la tabla de enlaces, y el índice parcial activo.

## Navegador

Se reutilizó el perfil default y la sesión administrativa existente en
`localhost:3000`, sin modificar autenticación ni menús. Pedido sintético
#0075: plan cenas 3 días, lunes/martes/jueves, sustitución del lunes por pescado
al vapor, «Salsa aparte · verificación» y dos direcciones diferentes.

Comprobado en 390 px: carga de oferta real, selección, borrador tras recarga,
POST, confirmación con folio, notas y dos entregas; el enlace WhatsApp contiene
el resumen guardado (sin enviarlo). En administración, el mismo pedido muestra
las comidas, procedencia de sustitución, instrucciones y direcciones. Revocar
la consulta desde admin hace que el enlace deje de mostrar el pedido.
Sin desbordamiento horizontal; vista inicial también inspeccionada en 1280 px.
Modo oscuro comprobado visualmente y restaurado al tema original.

El navegador compartido agotó tiempos al final; se completó la inspección de
apariencia mediante la UI nativa de T3 Code, conservando la sesión. No fue un
fallo del flujo de pedido. El pedido y contacto sintéticos se eliminaron; no se
alteraron datos de clientes existentes. Los folios avanzan incluso con rollback,
como en verificaciones anteriores.

## Límites y lanzamiento

Faltan ensayo del despliegue, CI/E2E automatizado completo, operación de cobros,
recetas faltantes para verificar todas las alergias, zonas/recargos y políticas
comerciales finales. Esas condiciones no se presentan al cliente como aprobadas:
la solicitud requiere confirmación de Heltifud. No se considera desplegado ni
abierto a producción por esta verificación local.
