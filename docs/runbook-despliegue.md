# Runbook de despliegue (T26/H22)

Sitio Netlify `heltifud` (`https://heltifud.com`). Complementa el
[runbook de base de datos](runbook-base-de-datos.md).

## Cómo se construye

| Pieza | Valor |
| --- | --- |
| Build | `pnpm build` (`netlify.toml`), Node `22.23.5` |
| Preset | Nitro detecta Netlify durante el build: estáticos en `dist/` y SSR + `/api/*` como función `server` en `.netlify/functions-internal`. No hace falta fijar `preset`. |
| Contextos | `production` (rama `main`) y `deploy-preview` (cada PR). |
| Migraciones | **No** se aplican en el build. Se aplican a mano con `prisma migrate deploy` antes de publicar código que las necesite (ver abajo). |
| Versión servida | `GET /api/health` → `build.commit` (7 caracteres de `COMMIT_REF`) y `build.context` (`CONTEXT`). |

## Variables de entorno

| Variable | Uso | Contexto/scopes esperados |
| --- | --- | --- |
| `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY` | Auth en cliente y servidor | Todos |
| `DATABASE_URL` | Prisma en runtime; pooler 6543 con `heltifud_app` | `functions`/`runtime`, secreta |
| `DIRECT_URL` | Solo `prisma migrate` y scripts `verify-*` | No la usa la app en runtime |
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Autocompletado de direcciones (admin) | Opcional: sin ella el campo funciona como texto libre |
| `NUXT_PUBLIC_CLOUDINARY_BASE_URL` | Imágenes | Opcional: tiene valor por defecto |
| `NUXT_CORS_ALLOWED_ORIGINS` | Orígenes CORS | Opcional: incluye `heltifud.com` y `www` |

Listar nombres, scopes y contextos sin ver valores:

```bash
netlify api getEnvVars --data '{"account_id":"<account>","site_id":"035fa99a-15e6-45d7-92f1-3fada7495fa8"}' \
  | node -e 'for (const v of JSON.parse(require("fs").readFileSync(0))) console.log(v.key, v.scopes.join(","), v.values.map(x => x.context).join(","))'
```

## Antes de publicar

1. CI en verde (lint, typecheck, unit, build, migraciones y permisos en PostgreSQL).
2. Si el PR trae migraciones: revisar el SQL (sin `DROP`/`TRUNCATE` sobre datos
   reales sin respaldo), confirmar respaldo reciente en Supabase (Database →
   Backups) y aplicar con `pnpm exec prisma migrate deploy` usando `DIRECT_URL`
   de producción **antes** de fusionar. Las migraciones deben ser compatibles con
   el código anterior (aditivas), porque el deploy anterior sigue sirviendo hasta
   que termina el nuevo y es el destino del rollback.
3. Comprobar: `pnpm exec prisma migrate status` → «Database schema is up to date!».

## Verificar un deploy

Prueba de humo anónima y de solo lectura (no inicia sesión ni escribe datos):

```bash
BASE_URL=https://deploy-preview-<n>--heltifud.netlify.app EXPECT_COMMIT=<sha> \
  node --import tsx scripts/verify-deploy.ts
```

Comprueba: healthcheck con base de datos y commit esperado; páginas públicas;
APIs públicas en JSON; APIs privadas con 401 (incluida una ruta inexistente y la
ruta codificada `/api/%63ustomers`); redirección de `/admin` a `/login` con
cookies `Secure` y `SameSite`; errores sin pila, SQL, Prisma ni cadenas de
conexión; HSTS.

Después, en el navegador con la sesión del usuario: menú, `/pedido`, login
admin, listado y detalle de pedidos, cobros y reparto. En el preview esos
recorridos escriben en la **misma base de producción** (mismo `DATABASE_URL`),
así que el ensayo con datos sintéticos debe usar clientes y pedidos marcados
como prueba y cancelarlos al terminar.

Logs de funciones: Netlify → Logs → Functions → `server`. Buscar `[unhandled]`,
`42501` (permisos) y `[health]`.

## Rollback

El rollback de código no toca la base de datos y es inmediato:

1. Netlify → Deploys → deploy anterior en estado *Published* → **Publish deploy**,
   o por CLI: `netlify api restoreSiteDeploy --data '{"site_id":"035fa99a-15e6-45d7-92f1-3fada7495fa8","deploy_id":"<id>"}'`.
2. Confirmar con `scripts/verify-deploy.ts` y `EXPECT_COMMIT` del deploy restaurado.
3. Revisar si el auto-publish quedó bloqueado (`published_deploy.locked` en
   `netlify api getSite`). Publicar desde la interfaz puede bloquearlo; la
   restauración por API del ensayo no lo bloqueó. Desbloquear cuando `main`
   vuelva a estar sano.

Deploys recientes: `netlify api listSiteDeploys --data '{"site_id":"035fa99a-15e6-45d7-92f1-3fada7495fa8","per_page":5}'`.

Migraciones: no hay rollback automático. Por eso deben ser aditivas; si una
falla, corregir con una migración nueva o restaurar el respaldo (ver runbook de
base de datos).

## Respaldos

La API de Supabase del proyecto responde `walg_enabled: true`, `pitr_enabled:
false` y **ninguna copia en la lista** (17 nov 2026). Antes de una migración que
toque datos, generar una copia manual:

```bash
pg_dump "$DIRECT_URL" --format=custom --no-owner --file backups/heltifud-$(date +%Y%m%d-%H%M).dump
```

Guardarla fuera del repositorio o en `backups/` (ignorado por git) y probar que
`pg_restore --list` la lee.

## Estado del 17 nov 2026

- Producción sirve `ddf36f1` (`main`), contexto `production`, publicado.
- `prisma migrate status` contra producción: 25 migraciones, al día.
- `scripts/verify-deploy.ts` contra `https://heltifud.com`: 18/19; falla solo el
  healthcheck porque `/api/health` aún no está desplegado (responde 401 por la
  regla de rutas privadas por defecto).
- Preview del PR #23 (`b3bef7d`): prueba de humo 19/19, healthcheck con
  `database: ok` y contexto `deploy-preview`.
- Ensayo de rollback por API: producción pasó de `ddf36f1` a `ae1fc5e` y volvió
  en unos 20 s; humo 18/19 en ambos (sin healthcheck aún) y auto-publish sin
  bloquear.
- Observado: los errores 404 de Nitro llevan `Cache-Control: no-cache` aunque el
  middleware de privacidad ponga `no-store`; los cuerpos de error no llevan datos.

Pendiente para cerrar T26:

- [x] Desplegar `/api/health` y ejecutar la prueba de humo en preview.
- [x] Ensayo de rollback (publicar el deploy anterior y volver).
- [ ] Prueba de humo en producción con `EXPECT_COMMIT` tras el merge.
- [ ] Sin respaldos listados en Supabase: confirmar plan y activar respaldos
  diarios o PITR; mientras tanto, `pg_dump` manual antes de cada migración.
- [ ] **`DIRECT_URL` (rol `postgres`, dueño del esquema) está disponible en el
  runtime de las funciones** en todos los contextos. La app no la usa: quitar los
  scopes `functions`/`runtime` (o la variable de Netlify) para que una función
  comprometida no tenga credenciales con DDL. Requiere aprobación.
- [ ] Deploy previews comparten la base de producción. Decidir si basta con
  datos de prueba marcados o si se usa una rama de Supabase para previews.
- [ ] `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` no está en Netlify: el autocompletado de
  direcciones queda como texto libre en producción. Confirmar si es intencional.
- [ ] Ensayo del pedido de cliente en producción con datos sintéticos.
