# Verificación de 1.2: entregas propias del pedido

Fecha: 16 de noviembre de 2026. Resultado: **1.2 terminado** en la base
configurada en el repositorio y en la aplicación local `http://localhost:3000`.
Esto no acredita un despliegue del sitio publicado.

## Migraciones y respaldo

Se aplicaron con `prisma migrate deploy`:

- `20261116120000_add_order_deliveries`: eliminó los 3 pedidos de prueba y sus
  copias; creó las entregas y quitó las columnas antiguas de `Order`.
- `20261116150000_add_order_cycle_folio`: aditiva, necesaria porque el código
  actual de pedidos ya usa las columnas de 1.3. Aplicarla no cierra por sí sola 1.3.

`prisma migrate status` confirmó las 17 migraciones aplicadas.

Respaldo local, excluido de Git:
`backups/antes-entregas-2026-11-16T21-10-47-435Z/`.
Incluye `database.dump` (archivo completo de PostgreSQL, 358248 bytes; índice
legible con `pg_restore --list`), `public-data.json`, `manifest.json` y el informe
final `verification.json`. No se realizó una restauración del archivo completo.

La comparación SHA-256 de todas las filas, ordenadas por ID, confirmó contenido
idéntico antes y después para:

| Datos | Registros conservados |
| --- | ---: |
| Menús | 8 |
| Días de menú | 56 |
| Tiempos de menú | 280 |
| Componentes del menú | 305 |
| Platillos del catálogo | 183 |
| Ingredientes | 68 |
| Relaciones de ingredientes y recetas | 133 |
| Clientes | 13 |
| Planes / variantes | 4 / 11 |
| Gastos | 47 |
| Ciclos / ajustes de operación | 8 / 1 |

## Verificación contra PostgreSQL real

Se ejecutaron las funciones reales `createOrder`, `updateOrder`, `getOrderOptions`
y `getOrders` con Prisma, dentro de una transacción revertida al terminar. Un
cliente temporal creado en esa transacción permitió probar direcciones sin
modificar los clientes existentes.

- Alta de lunes, martes y jueves: dos filas de entrega; lunes y martes en la
  primera, jueves en la segunda.
- Alta de lunes a miércoles: una sola entrega, con todas sus comidas asignadas.
- Filtro por la fecha de la segunda entrega: encuentra el pedido.
- Cambio de estado tras cambiar la dirección del cliente temporal: conserva
  los IDs de entrega y sus direcciones originales.
- Seleccionar la ubicación secundaria: cambia únicamente la dirección de esa
  entrega.
- Retirar la segunda entrega durante la edición: reasigna sus comidas a la
  entrega restante.
- Borrar el pedido: elimina entregas, tiempos y componentes copiados en cascada.

También se comprobó RLS activa y ausencia de permisos de lectura/escritura para
`anon` y `authenticated` en las cuatro tablas de pedidos. Ambos roles de
cliente recibieron denegación al intentar leerlas. Las columnas antiguas
`first_delivery_*` y `second_delivery_*` ya no existen.

## Navegador y comprobaciones automáticas

En la sesión autenticada por el usuario:

- La lista pasó del error 500 previo a la migración al estado vacío correcto.
- Se creó desde el formulario un pedido estándar de 3 días con dos entregas.
- El detalle mostró comidas, direcciones y fechas del 16 y 19 de noviembre.
- Se cambió a confirmado y se guardó; la API confirmó la persistencia y los
  mismos identificadores de entrega.
- Lista e historial mostraron el pedido y ambas entregas. El filtro de API por
  el 19 de noviembre lo encontró; por el 20 no lo incluyó.
- Se corrigió un desfase visible de un día en la lista: los formateadores
  compartidos conservan las fechas civiles `YYYY-MM-DD`, mientras los instantes
  siguen usando `America/Tijuana`. Verificación visual posterior: 16 y 19.

`pnpm lint` y `pnpm test:unit`: sin errores, 24 archivos y 176 pruebas pasadas.

El pedido temporal del navegador se eliminó. Al terminar, `orders`,
`order_deliveries`, `order_menu_slots` y `order_menu_components` quedaron vacías;
se repitió la comparación de todos los datos conservados con el respaldo.

## Alcance posterior

El estado de cada entrega ya existe en datos, con valor inicial `PENDING`.
Las transiciones, su interfaz y el estado global derivado pertenecen a 1.4;
el tablero operativo de entregas pertenece a la etapa 6. La validación completa
del alta por tipo de cliente sigue correspondiendo a 1.3.
