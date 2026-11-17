/** T03 checks for grants, RLS and append-only history.
 *
 * Every statement runs inside one transaction that is always rolled back, so
 * the script can run against any environment without leaving data behind.
 *
 *   ADMIN_DATABASE_URL  owner connection (migrations role, usually DIRECT_URL).
 *   APP_DATABASE_URL    optional; the runtime `heltifud_app` connection. When
 *                       present, its privileges are also exercised for real.
 *
 * Run: node --env-file=.env --import tsx scripts/verify-database-hardening.ts
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const adminUrl = process.env.ADMIN_DATABASE_URL ?? process.env.DIRECT_URL;
const appUrl = process.env.APP_DATABASE_URL;
assert.ok(adminUrl, 'ADMIN_DATABASE_URL or DIRECT_URL is required');

const APP_ROLE = 'heltifud_app';
const CLIENT_ROLES = ['anon', 'authenticated'];
const HISTORY_TABLES = ['order_payments', 'production_runs', 'order_status_events', 'delivery_activities', 'order_menu_changes'];
const checks: string[] = [];
const ok = (message: string) => { checks.push(message); };

type Client = pg.Client;

async function expectError(client: Client, sql: string, code: string, label: string, params: unknown[] = []) {
  await client.query('SAVEPOINT expect_error');
  let actual: string | undefined;
  try {
    await client.query(sql, params);
  } catch (error) {
    actual = (error as { code?: string }).code;
  }
  await client.query('ROLLBACK TO SAVEPOINT expect_error');
  assert.equal(actual, code, `${label}: expected SQLSTATE ${code}, got ${actual ?? 'success'}`);
}

async function catalogChecks(db: Client) {
  const { rows: [role] } = await db.query(
    `SELECT rolcanlogin, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolinherit,
            (SELECT count(*)::int FROM pg_auth_members m WHERE m.member = r.oid) AS memberships
     FROM pg_roles r WHERE rolname = $1`, [APP_ROLE]);
  assert.ok(role, `${APP_ROLE} must exist`);
  assert.equal(role.rolsuper, false, `${APP_ROLE} must not be superuser`);
  assert.equal(role.rolcreaterole, false, `${APP_ROLE} must not create roles`);
  assert.equal(role.rolcreatedb, false, `${APP_ROLE} must not create databases`);
  assert.equal(role.rolbypassrls, true, `${APP_ROLE} reads RLS-protected tables as the server`);
  assert.equal(role.memberships, 0, `${APP_ROLE} must not inherit other roles`);
  ok(`${APP_ROLE}: sin superusuario, CREATEROLE, CREATEDB ni membresías; login=${role.rolcanlogin}`);

  const { rows: tables } = await db.query(
    `SELECT c.oid, c.relname, c.relrowsecurity AS rls, pg_get_userbyid(c.relowner) AS owner
     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') ORDER BY c.relname`);
  assert.ok(tables.length > 20, 'expected the application tables');

  for (const table of tables) {
    assert.equal(table.rls, true, `${table.relname}: RLS must be enabled`);
    assert.notEqual(table.owner, APP_ROLE, `${table.relname}: runtime role must not own tables`);
    for (const role of CLIENT_ROLES) {
      const { rows: [access] } = await db.query(
        `SELECT has_table_privilege($1, $2::oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS table_access,
                has_any_column_privilege($1, $2::oid, 'SELECT,INSERT,UPDATE,REFERENCES') AS column_access`,
        [role, table.oid]);
      assert.equal(access.table_access, false, `${table.relname}: ${role} has table privileges`);
      assert.equal(access.column_access, false, `${table.relname}: ${role} has column privileges`);
    }

    const { rows: [app] } = await db.query(
      `SELECT has_table_privilege($1, $2::oid, 'SELECT') AS can_select,
              has_table_privilege($1, $2::oid, 'INSERT,UPDATE,DELETE') AS can_write,
              has_table_privilege($1, $2::oid, 'TRUNCATE') AS can_truncate,
              has_table_privilege($1, $2::oid, 'TRIGGER') AS can_trigger,
              has_table_privilege($1, $2::oid, 'REFERENCES') AS can_reference`,
      [APP_ROLE, table.oid]);
    assert.equal(app.can_truncate, false, `${table.relname}: ${APP_ROLE} must not TRUNCATE`);
    assert.equal(app.can_trigger, false, `${table.relname}: ${APP_ROLE} must not create triggers`);
    assert.equal(app.can_reference, false, `${table.relname}: ${APP_ROLE} must not add foreign keys`);
    if (table.relname === '_prisma_migrations') {
      assert.equal(app.can_select || app.can_write, false, `_prisma_migrations: ${APP_ROLE} must not access it`);
    } else {
      assert.equal(app.can_select && app.can_write, true, `${table.relname}: ${APP_ROLE} needs row access`);
    }
  }
  ok(`${tables.length} tablas: RLS activo, sin acceso de anon/authenticated, ${APP_ROLE} solo filas`);

  const { rows: [policies] } = await db.query(`SELECT count(*)::int AS n FROM pg_policies WHERE schemaname = 'public'`);
  assert.equal(policies.n, 0, 'no client policies are expected; access is server-only');

  const { rows: [schema] } = await db.query(
    `SELECT has_schema_privilege($1, 'public', 'CREATE') AS app_create,
            has_schema_privilege('anon', 'public', 'USAGE') AS anon_usage,
            has_schema_privilege('authenticated', 'public', 'USAGE') AS auth_usage,
            has_schema_privilege('anon', 'private', 'USAGE') AS anon_private,
            has_database_privilege($1, current_database(), 'CREATE') AS app_db_create`, [APP_ROLE]);
  assert.equal(schema.app_create, false, `${APP_ROLE} must not create objects in public`);
  assert.equal(schema.app_db_create, false, `${APP_ROLE} must not create schemas`);
  assert.equal(schema.anon_usage, false, 'anon must not use schema public');
  assert.equal(schema.auth_usage, false, 'authenticated must not use schema public');
  assert.equal(schema.anon_private, false, 'anon must not use schema private');
  ok('esquemas: sin CREATE para la app; anon/authenticated sin USAGE en public ni private');

  const { rows: sequences } = await db.query(
    `SELECT c.relname, has_sequence_privilege('anon', c.oid, 'USAGE') AS anon,
            has_sequence_privilege($1, c.oid, 'USAGE') AS app
     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'S'`, [APP_ROLE]);
  for (const sequence of sequences) {
    assert.equal(sequence.anon, false, `${sequence.relname}: anon has sequence access`);
    assert.equal(sequence.app, true, `${sequence.relname}: ${APP_ROLE} needs sequence access`);
  }
  ok(`${sequences.length} secuencias: solo ${APP_ROLE}`);

  const { rows: functions } = await db.query(
    `SELECT n.nspname || '.' || p.proname AS name
     FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname IN ('public', 'private')
       AND (has_function_privilege('anon', p.oid, 'EXECUTE') OR has_function_privilege('authenticated', p.oid, 'EXECUTE'))`);
  assert.deepEqual(functions.map(f => f.name), [], 'client roles must not execute app functions');
  ok('funciones de la app: sin EXECUTE para anon/authenticated');

  const { rows: defaults } = await db.query(
    `SELECT d.defaclobjtype AS type, d.defaclacl::text AS acl
     FROM pg_default_acl d JOIN pg_namespace n ON n.oid = d.defaclnamespace
     WHERE n.nspname = 'public' AND pg_get_userbyid(d.defaclrole) = 'postgres'`);
  const defaultAcl = defaults.map(d => `${d.type}:${d.acl}`).join(' ');
  assert.match(defaultAcl, /r:.*heltifud_app=arwd\//, 'future tables must be granted to the runtime role');
  assert.match(defaultAcl, /S:.*heltifud_app=rU\/|S:.*heltifud_app=Ur\//, 'future sequences must be granted to the runtime role');
  assert.doesNotMatch(defaultAcl, /\banon=|\bauthenticated=/, 'future objects must not be granted to client roles');
  ok('privilegios por defecto: tablas y secuencias futuras solo para la app');

  const { rows: triggers } = await db.query(
    `SELECT c.relname, t.tgtype
     FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
     WHERE NOT t.tgisinternal AND t.tgenabled <> 'D' AND c.relname = ANY($1)`, [HISTORY_TABLES]);
  for (const table of HISTORY_TABLES) {
    const types = triggers.filter(t => t.relname === table).map(t => Number(t.tgtype));
    // tgtype bits: 8 DELETE, 16 UPDATE, 32 TRUNCATE.
    assert.ok(types.some(t => t & 8) && types.some(t => t & 16), `${table}: UPDATE/DELETE trigger missing`);
    assert.ok(types.some(t => t & 32), `${table}: TRUNCATE trigger missing`);
  }
  ok(`${HISTORY_TABLES.length} tablas de historial con triggers activos para UPDATE, DELETE y TRUNCATE`);
}

async function behaviourChecks(db: Client, prefix = '', truncateCode = 'P0001') {
  const id = () => randomUUID();
  const [customer, cycle, order, delivery] = [id(), id(), id(), id()];
  await db.query(`INSERT INTO customers (id, nombre, telefono, ubicacion1, updated_at) VALUES ($1, 'Verificación T03', '0000000000', 'Sin dirección', now())`, [customer]);
  await db.query(`INSERT INTO weekly_cycles (id, week_start, order_cutoff_at, status) VALUES ($1, '2099-01-05', '2099-01-02', 'CLOSED')`, [cycle]);
  await db.query(`INSERT INTO orders (id, customer_id, cycle_id, plan_title_snapshot, plan_variant_title_snapshot, price_snapshot, updated_at, status) VALUES ($1, $2, $3, 'Prueba', 'Una', 100, now(), 'CONFIRMED')`, [order, customer, cycle]);
  await db.query(`INSERT INTO order_deliveries (id, order_id, sequence, scheduled_date, location_number, address_snapshot) VALUES ($1, $2, 1, '2099-01-06', 1, 'Sin dirección')`, [delivery, order]);
  await db.query(`INSERT INTO delivery_activities (delivery_id, details) VALUES ($1, '{"kind":"verify"}')`, [delivery]);
  await db.query(`INSERT INTO order_menu_changes (order_id, order_version, kind, day_of_week, slot_type, component_role, position, from_nombre, to_nombre) VALUES ($1, 1, 'SUSTITUCION', 'LUNES', 'COMIDA', 'PLATILLO_PRINCIPAL', 0, 'A', 'B')`, [order]);
  await db.query(`INSERT INTO order_status_events (order_id, version, to_status) VALUES ($1, 1, 'CONFIRMED')`, [order]);
  await db.query(`INSERT INTO order_payments (order_id, kind, amount, method, reference, reason, received_at, idempotency_key, fingerprint) VALUES ($1, 'PAYMENT', 10, 'CASH', '', '', '2099-01-05', $2, 'verify')`, [order, id()]);

  // reject_operational_history_change raises the default P0001; the
  // parent-aware functions raise 55000 (object not in prerequisite state).
  const cases = [
    { table: 'delivery_activities', set: 'details = details', where: 'delivery_id = $1', param: delivery, code: '55000' },
    { table: 'order_menu_changes', set: 'to_nombre = to_nombre', where: 'order_id = $1', param: order, code: '55000' },
    { table: 'order_status_events', set: 'version = version', where: 'order_id = $1', param: order, code: '55000' },
    { table: 'order_payments', set: 'reason = reason', where: 'order_id = $1', param: order, code: 'P0001' }
  ];
  for (const { table, set, where, param, code } of cases) {
    await expectError(db, `UPDATE ${table} SET ${set} WHERE ${where}`, code, `${table} UPDATE`, [param]);
    await expectError(db, `DELETE FROM ${table} WHERE ${where}`, code, `${table} DELETE`, [param]);
    await expectError(db, `TRUNCATE ${table} CASCADE`, truncateCode, `${table} TRUNCATE`);
  }
  ok(prefix + 'historial: UPDATE, DELETE y TRUNCATE rechazados con el padre vivo');

  // Editing an order replaces its deliveries; the activity history goes with them.
  await db.query('DELETE FROM order_deliveries WHERE id = $1', [delivery]);
  const { rows: [left] } = await db.query('SELECT count(*)::int AS n FROM delivery_activities WHERE delivery_id = $1', [delivery]);
  assert.equal(left.n, 0, 'delivery activities follow their delivery');
  ok(prefix + 'borrar una entrega elimina su actividad en cascada');

  // Without payments, deleting the order cascades its menu changes and status events.
  const second = id();
  await db.query(`INSERT INTO orders (id, customer_id, cycle_id, plan_title_snapshot, plan_variant_title_snapshot, price_snapshot, updated_at) VALUES ($1, $2, $3, 'Prueba', 'Una', 100, now())`, [second, customer, cycle]);
  await db.query(`INSERT INTO order_menu_changes (order_id, order_version, kind, day_of_week, slot_type, component_role, position, from_nombre, to_nombre) VALUES ($1, 1, 'SUSTITUCION', 'LUNES', 'COMIDA', 'PLATILLO_PRINCIPAL', 0, 'A', 'B')`, [second]);
  await db.query(`INSERT INTO order_status_events (order_id, version, to_status) VALUES ($1, 1, 'DRAFT')`, [second]);
  await db.query('DELETE FROM orders WHERE id = $1', [second]);
  const { rows: [orphans] } = await db.query(
    `SELECT (SELECT count(*) FROM order_menu_changes WHERE order_id = $1)::int + (SELECT count(*) FROM order_status_events WHERE order_id = $1)::int AS n`, [second]);
  assert.equal(orphans.n, 0, 'order history follows its order');
  ok(prefix + 'borrar un pedido sin cobros elimina su historial en cascada');
}

async function appRoleChecks(app: Client) {
  const { rows: [who] } = await app.query('SELECT current_user AS name');
  assert.equal(who.name, APP_ROLE, `APP_DATABASE_URL must connect as ${APP_ROLE}`);
  await app.query('BEGIN');
  try {
    await app.query('SELECT 1 FROM orders LIMIT 1');
    await app.query('SELECT 1 FROM customers LIMIT 1');
    await expectError(app, 'SELECT 1 FROM _prisma_migrations LIMIT 1', '42501', 'app reads _prisma_migrations');
    await expectError(app, 'TRUNCATE order_payments', '42501', 'app TRUNCATE');
    await expectError(app, 'CREATE TABLE public.t03_probe (id int)', '42501', 'app CREATE TABLE');
    await expectError(app, 'ALTER TABLE order_payments DISABLE TRIGGER order_payments_immutable', '42501', 'app disables trigger');
    await expectError(app, 'DROP TABLE order_payments', '42501', 'app DROP TABLE');
    await expectError(app, 'CREATE SCHEMA t03_probe', '42501', 'app CREATE SCHEMA');
    await expectError(app, 'SET ROLE postgres', '42501', 'app SET ROLE postgres');
    await app.query(`SELECT nextval('orders_folio_seq')`);
    ok(`${APP_ROLE} real: lee y escribe filas; sin TRUNCATE, DDL, desactivar triggers ni SET ROLE`);
    // Trigger functions live in `private`, where the runtime role has no USAGE;
    // they must still fire for its writes.
    // TRUNCATE is refused by privileges (42501) before the trigger runs.
    await behaviourChecks(app, `${APP_ROLE}: `, '42501');
  } finally {
    await app.query('ROLLBACK');
  }
}

const admin = new pg.Client({ connectionString: adminUrl, connectionTimeoutMillis: 10_000 });
const app = appUrl ? new pg.Client({ connectionString: appUrl, connectionTimeoutMillis: 10_000 }) : null;
try {
  await admin.connect();
  await admin.query('BEGIN');
  await admin.query("SET LOCAL statement_timeout = '30s'");
  await catalogChecks(admin);
  await behaviourChecks(admin);
  await admin.query('ROLLBACK');
  if (app) {
    await app.connect();
    await appRoleChecks(app);
  } else {
    checks.push('APP_DATABASE_URL ausente: privilegios reales de la app no ejercitados');
  }
  for (const check of checks) console.log(`✔ ${check}`);
} catch (error) {
  await admin.query('ROLLBACK').catch(() => {});
  for (const check of checks) console.log(`✔ ${check}`);
  throw error;
} finally {
  await admin.end();
  await app?.end();
}
