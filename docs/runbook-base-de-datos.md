# Runbook de base de datos

## Roles

| Rol | Uso | Conexión |
| --- | --- | --- |
| `postgres` | Migraciones (`prisma migrate deploy`) y scripts de verificación que crean esquemas temporales. Dueño de todas las tablas. | `DIRECT_URL` (puerto 5432) |
| `heltifud_app` | Servidor de Nuxt en ejecución. Solo lee y escribe filas: sin DDL, `TRUNCATE`, triggers ni pertenencia a otros roles. Tiene `BYPASSRLS` porque las tablas tienen RLS sin políticas (la Data API de Supabase no ve nada). | `DATABASE_URL` (pooler, puerto 6543) |
| `anon`, `authenticated` | Data API de Supabase. Sin `USAGE` en `public` ni `private`, sin privilegios en tablas, secuencias ni funciones. | No se usan |

La migración `20261117120000_database_hardening` crea `heltifud_app` como
`NOLOGIN`, le concede los privilegios y fija los privilegios por defecto para que las
tablas creadas en migraciones futuras le sean accesibles. La contraseña nunca se
versiona.

## Verificar permisos

```bash
ADMIN_DATABASE_URL="<DIRECT_URL>" \
APP_DATABASE_URL="<DATABASE_URL con heltifud_app>" \
node --import tsx scripts/verify-database-hardening.ts
```

Todo se ejecuta en una transacción que se revierte: no deja datos. Sin
`APP_DATABASE_URL` solo revisa el catálogo y el comportamiento del historial. El
job `database` del CI ejecuta lo mismo sobre PostgreSQL 17 limpio tras aplicar
todas las migraciones.

## Activar `heltifud_app` en producción

Requiere aprobación explícita. Hacerlo fuera del horario de pedidos.

1. **Respaldo.** Confirmar en Supabase (Database → Backups) que existe un respaldo
   reciente, o crear uno.
2. **Migrar.** `pnpm exec prisma migrate deploy` con `DIRECT_URL` de producción.
   No cambia el comportamiento de la app: sigue conectada como `postgres`.
3. **Verificar sin la app.** Ejecutar el script con solo `ADMIN_DATABASE_URL`.
4. **Contraseña.** Generar una contraseña aleatoria larga (por ejemplo
   `openssl rand -base64 32 | tr -d '/+='`) y, en el SQL editor de Supabase:
   `ALTER ROLE heltifud_app LOGIN PASSWORD '<contraseña>';`
   Guardarla solo en el gestor de secretos y en Netlify.
5. **Probar la conexión.** Con el pooler, el usuario es
   `heltifud_app.<project-ref>`:
   `postgresql://heltifud_app.<project-ref>:<contraseña>@<host-pooler>:6543/postgres`
   con los mismos parámetros que la `DATABASE_URL` actual. Ejecutar el script con esa URL como `APP_DATABASE_URL`.
6. **Deploy preview.** Cambiar `DATABASE_URL` en Netlify solo para el contexto
   *Deploy Previews*, redeployar un preview y recorrer: menú público, `/pedido`,
   login admin, listado y detalle de pedidos, registrar cobro, tablero de reparto.
7. **Producción.** Cambiar `DATABASE_URL` en el contexto *Production* y redeployar.
   Repetir el recorrido y revisar los logs de funciones por `permission denied`
   (`42501`).

Los scripts `scripts/verify-*.ts` crean esquemas temporales: ejecutarlos con
`DATABASE_URL=<DIRECT_URL>`, no con `heltifud_app`.

## Rollback

- **App con errores de permisos tras el paso 6 o 7:** restaurar el valor anterior de
  `DATABASE_URL` en Netlify (conexión `postgres`) y redeployar. No requiere tocar la
  base de datos.
- **Bloquear el rol:** `ALTER ROLE heltifud_app NOLOGIN;` corta sus conexiones
  nuevas sin afectar a `postgres`.
- **Revertir la migración** (solo si un trigger de historial bloquea una operación
  legítima): `DROP TRIGGER <tabla>_immutable ON public.<tabla>;` para el trigger
  concreto y registrar el motivo. No borrar el rol mientras alguna `DATABASE_URL` lo
  use.
