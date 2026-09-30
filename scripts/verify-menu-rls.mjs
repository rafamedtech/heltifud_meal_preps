import assert from 'node:assert/strict';
import pg from 'pg';

// Run against the same connection as Nuxt. All role/grant changes are rolled
// back. EXPLAIN (without ANALYZE) checks write permissions without writing data.
const tables = ['WeeklyMenu', 'MenuDay', 'DaySlot', 'FoodComponent', 'FoodCatalogItem'];
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});

assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required');
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query("SET LOCAL statement_timeout = '15s'");
  for (const table of tables) {
    const relation = `public."${table}"`;
    const { rows: [state] } = await client.query(`
      SELECT c.relrowsecurity AS rls,
        (r.rolbypassrls OR r.rolsuper OR c.relowner = r.oid) AS server_access
      FROM pg_class c JOIN pg_roles r ON r.rolname = current_user
      WHERE c.oid = $1::regclass
    `, [relation]);
    assert.equal(state.rls, true, `${table}: RLS must be enabled`);
    assert.equal(state.server_access, true, `${table}: server requires owner/BYPASSRLS access`);
    await client.query(`EXPLAIN SELECT * FROM ${relation}`);
    await client.query(`EXPLAIN INSERT INTO ${relation} DEFAULT VALUES`);
    await client.query(`EXPLAIN UPDATE ${relation} SET id = id WHERE false`);
    await client.query(`EXPLAIN DELETE FROM ${relation} WHERE false`);

    for (const role of ['anon', 'authenticated']) {
      const { rows } = await client.query(`
        SELECT privilege FROM unnest(ARRAY[
          'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
        ]) AS privilege WHERE has_table_privilege($1, $2, privilege)
      `, [role, relation]);
      assert.equal(rows.length, 0, `${table}: ${role} has table privileges`);
      const { rows: [columns] } = await client.query(`
        SELECT has_any_column_privilege($1, $2, 'SELECT,INSERT,UPDATE,REFERENCES') AS allowed
      `, [role, relation]);
      assert.equal(columns.allowed, false, `${table}: ${role} has column privileges`);

      await client.query(`SET LOCAL ROLE ${role}`);
      for (const sql of [
        `SELECT * FROM ${relation} LIMIT 1`,
        `EXPLAIN INSERT INTO ${relation} DEFAULT VALUES`,
        `EXPLAIN UPDATE ${relation} SET id = id WHERE false`,
        `EXPLAIN DELETE FROM ${relation} WHERE false`,
      ]) {
        await client.query('SAVEPOINT denied_operation');
        let code;
        try { await client.query(sql); } catch (error) { code = error.code; }
        await client.query('ROLLBACK TO SAVEPOINT denied_operation');
        assert.equal(code, '42501', `${table}: ${role} must be denied: ${sql}`);
      }
      await client.query('RESET ROLE');

      // Prove RLS independently of grants: even if SELECT is granted again,
      // neither client role can read rows. This grant never leaves the transaction.
      await client.query('SAVEPOINT rls_grant');
      await client.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
      await client.query(`GRANT SELECT ON TABLE ${relation} TO ${role}`);
      await client.query(`SET LOCAL ROLE ${role}`);
      const { rows: [result] } = await client.query(`SELECT count(*)::int AS count FROM ${relation}`);
      assert.equal(result.count, 0, `${table}: RLS must hide rows from ${role}`);
      await client.query('RESET ROLE');
      await client.query('ROLLBACK TO SAVEPOINT rls_grant');
    }
    console.log(`${table}: RLS, client denial and server access verified`);
  }
} finally {
  await client.query('ROLLBACK').catch(() => {});
  await client.end();
}
