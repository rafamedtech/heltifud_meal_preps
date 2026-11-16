# Verificación: idempotencia del alta de pedidos (H13/T07)

Fecha: 16 de noviembre de 2026. **Terminado** en la base configurada en el
repositorio. No se desplegó la aplicación.

## Diseño

- `POST /api/orders` exige el header `Idempotency-Key` con un UUID; sin él o con
  otro formato responde 400.
- El formulario de alta genera una clave por formulario con
  `crypto.randomUUID()` y la reutiliza en cada reintento. Ignora un segundo
  envío mientras el primero está en curso.
- `orders.idempotency_key` (UUID, índice único) y
  `orders.idempotency_fingerprint` (SHA-256 del payload normalizado) se guardan
  con el pedido. Los pedidos anteriores conservan ambas columnas en `NULL`.
- Si la clave ya existe con la misma huella, el servidor devuelve el pedido
  original sin escribir. Si la huella es distinta, responde 422: ese formulario
  ya creó un pedido y se ofrece revisar el listado.
- En envíos simultáneos con la misma clave, el índice único deja ganar una sola
  transacción. Las demás se revierten (`P2002`) y responden con el pedido
  ganador.
- La huella ignora el orden de días y entregas y las mayúsculas de los UUID.
- Un intento rechazado (400/409) no guarda nada. El mismo formulario puede
  corregir los datos y reintentar con su clave.

## Migración y respaldo

Se aplicó `20261116233000_order_idempotency_key`, aditiva: dos columnas
nullable, un `CHECK` que exige ambas o ninguna y el índice único
`orders_idempotency_key_key`. La base ya tenía aplicada
`20261116230000_drop_weekly_menu_is_active` (PR #10, etapa 1.6). Por eso la
migración y las verificaciones se ejecutaron sobre esa rama más este cambio, en
un worktree temporal.

Respaldo local excluido de Git:
`backups/antes-idempotencia-2026-11-16T23-15-58-369Z/`. Contiene `database.dump`
(esquema `public`, 123133 bytes, índice validado con `pg_restore --list`), la
huella SHA-256 y el conteo por tabla en `manifest.json`, y la comparación
posterior en `verification.json`. Después de las pruebas, 18 tablas quedaron
idénticas al respaldo y solo `_prisma_migrations` pasó de 19 a 20 filas. No se
restauró el dump.

## Validación

```sh
node --import tsx --env-file=.env scripts/verify-order-idempotency.ts
```

Crea un cliente temporal y sus pedidos, y los elimina en `finally`. Resultado:
`passed`.

- 4 altas simultáneas con la misma clave devuelven el mismo pedido y guardan
  una sola fila con su clave y su huella.
- Un reintento posterior con la misma clave, en mayúsculas y con los días en
  otro orden, devuelve el pedido y el folio originales.
- La misma clave con otros datos responde 422 y no escribe.
- Un intento fallido no guarda nada, y una clave nueva crea un pedido distinto.
- PostgreSQL tiene el índice único `orders_idempotency_key_key`.

Prisma registra en consola el `P2002` de las transacciones perdedoras; es el
camino esperado. Los folios consumidos por las pruebas dejan huecos en la
secuencia.

En la misma base se volvieron a ejecutar `verify-order-create.ts`,
`verify-order-workflow.ts` y `verify-order-list.ts`; las tres pasaron.

`pnpm lint` pasa. `pnpm test:unit`: 205 pruebas pasadas, con 6 nuevas en
`orderCreate.test.ts` (clave y huella guardadas, reintento, 422, carrera
`P2002`, `P2002` ajeno y formato de clave). `vue-tsc` mantiene solo los siete
errores previos de `FoodCatalogForm.vue` y `MenuForm.vue`.

No se probó en el navegador: la interfaz no cambia y un alta real escribiría
pedidos en la base del usuario.
