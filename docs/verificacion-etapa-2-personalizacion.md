# Verificación: personalización e integridad de la oferta (etapa 2)

Fecha: 16 de noviembre de 2026. **Terminado** en la base configurada en el
repositorio. No se desplegó la aplicación.

## Decisiones aplicadas

- Repetición libre: el mismo platillo puede ocupar todos los lugares
  contratados.
- Preferencias = exclusiones y alergias que el sistema aplica solo.
- Mismo precio al cambiar entre tiempos (decisión 1 del 15 de noviembre).

## Diseño

- **Lugar fijo.** Un pedido tiene lugares: día, tiempo, función y posición.
  La edición no agrega, quita ni mueve lugares (400). Solo cambia qué platillo
  ocupa cada uno.
- **Opciones.** Cualquier componente del menú de origen, de cualquier día, en
  un tiempo que el pedido vende y de la misma familia de función: principal,
  guarnición (1 o 2) o adicional. El navegador envía `orderComponentId`
  (conservar) o `menuComponentId` (opción); el servidor copia nombre, calorías,
  imagen y procedencia desde la base.
- **Procedencia.** `sourceDayOfWeek`/`sourceSlotType` dicen de dónde viene el
  platillo actual; `isSubstitution` indica si difiere del que el menú pone en
  ese lugar. Restaurar elige ese original.
- **Bitácora.** `order_menu_changes` guarda versión del pedido, tipo
  (`SUSTITUCION`, `RESTAURACION`, `AUTOMATICA`), lugar, nombres anterior y
  nuevo, motivo y usuario. Se muestra en «Cambios en el menú».
- **Exclusiones.** `customer_exclusions`: `ALERGIA` e `INGREDIENTE` por
  ingrediente (se comparan con la receta), `PLATILLO` por platillo del catálogo.
  Al crear el pedido, un platillo excluido se cambia por la opción compatible
  más cercana (mismo tiempo y día, mismo tiempo, mismo día, cualquiera); sin
  alternativa responde 409 `NO_COMPATIBLE_DISH`. Al editar no se puede elegir
  ni conservar un platillo excluido (409 `EXCLUDED_DISH`).
- **Sin receta.** Si el cliente tiene alergias, un platillo sin receta se marca
  «Revisar alergias» y no se sustituye solo. Hoy 154 de 183 platillos no tienen
  receta.
- **Versión de oferta.** `WeeklyMenu.version` sube al guardar el menú o un
  platillo del catálogo que ofrece. Opciones de alta y editor la entregan; el
  pedido guarda `offerVersion`. Versión distinta → 409
  `OFFER_VERSION_CONFLICT`. La transacción del pedido toma `FOR SHARE` sobre la
  fila del menú, así una edición del menú espera a que termine.

## Migración

`20261117000000_order_personalization`, aditiva: `WeeklyMenu.version` y
`orders.offer_version` con default 1, tablas `order_menu_changes` y
`customer_exclusions` (con `CHECK` de destino coherente), RLS habilitado y sin
privilegios para `PUBLIC`, `anon` y `authenticated`. Se aplicó con
`prisma migrate deploy`. No se tomó respaldo previo: no modifica ni borra filas
existentes y la base no tenía pedidos.

## Pruebas

- `pnpm lint`: pasa. `pnpm test:unit`: 32 archivos y 226 pruebas pasan.
- `vue-tsc` sobre la app: solo los 7 errores previos de `FoodCatalogForm.vue` y
  `MenuForm.vue`, sin relación con este cambio; servidor sin errores.
- `node --import tsx --env-file=.env scripts/verify-order-personalization.ts`
  (PostgreSQL, transacción revertida con fixtures en 2098):
  - exclusiones validan ids y traslapes y reemplazan la lista;
  - el alta cambia un platillo con alergeno por el compatible más cercano y lo
    registra con el usuario;
  - opciones solo de tiempos vendidos, con excluidos e «sin receta» marcados y
    original conocido;
  - sustitución dentro del menú y familia, rechazo de excluidos, restauración y
    repetición, todo en bitácora;
  - editar un platillo del catálogo sube la versión; edición y alta con versión
    vieja reciben 409;
  - una exclusión agregada después bloquea guardar sin sustituir;
  - el `CHECK` rechaza una exclusión de platillo con ingrediente;
  - con `FOR SHARE` tomado, una escritura del menú espera (`55P03` con
    `lock_timeout` de 1 s; sin cambios).
- `verify-order-create`, `verify-order-workflow` y `verify-order-idempotency`
  pasan con el contrato nuevo. Al final la base quedó con 0 pedidos, 0
  exclusiones, 0 cambios y sin semanas de 2098.

## Navegador

Sesión administrativa existente (preview, perfil default) con un fixture
temporal: semana 2098, menú `PERSONALIZADO` de un cliente temporal (no afecta
menú público ni pedidos estándar), alergia a cacahuate. Comprobado:

- el pedido muestra la sustitución automática del lunes, la bitácora, las
  exclusiones y el aviso de un platillo sin receta;
- el selector ofrece solo principales del menú, con el excluido deshabilitado
  y su motivo;
- sustituir y guardar actualiza el pedido y registra la sustitución con el
  correo del administrador; restaurar devuelve el original y no se ofrece
  cuando el original está excluido;
- la ficha del cliente muestra «Alergias y exclusiones» y su modal de edición;
- 390 px sin desbordamiento horizontal.

El fixture se borró al terminar. El folio avanzó (pedido #0070), como en
verificaciones anteriores.

## Pendiente

- Garantías de publicación de menús por ciclo/tipo/cliente (T05/H17/H18) y la
  decisión de acceso del cliente, del bloque 2 y 3.
- Cobertura de recetas para que las alergias se revisen en todos los platillos.
