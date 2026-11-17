/** T26 smoke test for a deployed site (production or a Netlify deploy preview).
 *
 * Read-only: it only sends anonymous GET requests plus one POST with an empty
 * body that validation rejects before touching the database. It never signs
 * in, never stores data and never prints cookies or response bodies beyond the
 * fields it checks.
 *
 *   BASE_URL         site to check (default https://heltifud.com).
 *   EXPECT_COMMIT    optional; commit SHA the deploy must report in /api/health.
 *
 * Run: BASE_URL=https://deploy-preview-23--heltifud.netlify.app node --import tsx scripts/verify-deploy.ts
 */
import assert from 'node:assert/strict';

const baseUrl = (process.env.BASE_URL ?? 'https://heltifud.com').replace(/\/+$/, '');
const expectCommit = process.env.EXPECT_COMMIT?.trim();
const results: { label: string; ok: boolean; detail?: string }[] = [];

// Markers that must never appear in an error body served to the public.
const PRIVATE_MARKERS = [/"stack"/i, /prisma/i, /postgres(ql)?:\/\//i, /SQLSTATE|duplicate key|violates/i, /\bat .+\.(m?js|ts):\d+/];

async function check(label: string, run: () => Promise<void>) {
  try {
    await run();
    results.push({ label, ok: true });
  } catch (error) {
    results.push({ label, ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

function request(path: string, init: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, { redirect: 'manual', ...init, headers: { accept: 'application/json', ...init.headers } });
}

function assertNoPrivateData(body: string, label: string) {
  for (const marker of PRIVATE_MARKERS) assert.ok(!marker.test(body), `${label}: error body matches ${marker}`);
}

await check('healthcheck responde ok y sin caché', async () => {
  const response = await request('/api/health');
  assert.equal(response.status, 200, `status ${response.status}`);
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  const body = await response.json() as { status: string; checks: { database: string }; build: { commit: string | null; context: string | null } };
  assert.equal(body.status, 'ok');
  assert.equal(body.checks.database, 'ok');
  assert.deepEqual(Object.keys(body).sort(), ['build', 'checks', 'status', 'time']);
  if (expectCommit) assert.equal(body.build.commit, expectCommit.slice(0, 7), `commit ${body.build.commit}`);
});

for (const path of ['/', '/menu', '/pedido', '/login']) {
  await check(`página ${path} responde 200`, async () => {
    const response = await request(path, { headers: { accept: 'text/html' } });
    assert.equal(response.status, 200, `status ${response.status}`);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);
  });
}

for (const path of ['/api/menu', '/api/plans']) {
  await check(`API pública ${path} responde JSON`, async () => {
    const response = await request(path);
    assert.equal(response.status, 200, `status ${response.status}`);
    assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  });
}

for (const path of ['/api/customers', '/api/orders', '/api/expenses', '/api/operations/dashboard', '/api/operation-settings', '/api/plans/all', '/api/future-endpoint']) {
  await check(`API privada ${path} exige sesión`, async () => {
    const response = await request(path);
    assert.equal(response.status, 401, `status ${response.status}`);
    assertNoPrivateData(await response.text(), path);
  });
}

await check('ruta codificada /api/%63ustomers no evade la autorización', async () => {
  const response = await request('/api/%63ustomers');
  assert.ok([400, 401].includes(response.status), `status ${response.status}`);
});

await check('/admin redirige a /login con cookie Secure y SameSite', async () => {
  const response = await request('/admin', { headers: { accept: 'text/html' } });
  assert.ok([301, 302, 307].includes(response.status), `status ${response.status}`);
  assert.match(response.headers.get('location') ?? '', /\/login/);
  const cookies = response.headers.getSetCookie();
  for (const cookie of cookies) {
    const flags = cookie.split(';').slice(1).join(';');
    assert.match(flags, /Secure/i, 'cookie sin Secure');
    assert.match(flags, /SameSite=(Lax|Strict)/i, 'cookie sin SameSite');
  }
});

await check('consulta privada sin token responde 404 sin datos', async () => {
  const response = await request('/api/customer-order/private');
  assert.equal(response.status, 404, `status ${response.status}`);
  // Nitro forces `no-cache` on 404 error responses; either directive prevents reuse.
  assert.match(response.headers.get('cache-control') ?? '', /no-store|no-cache/);
  assertNoPrivateData(await response.text(), 'private');
});

await check('envío público inválido se rechaza sin detalles internos', async () => {
  const response = await request('/api/customer-order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  assert.ok(response.status >= 400 && response.status < 500, `status ${response.status}`);
  assertNoPrivateData(await response.text(), 'customer-order');
});

await check('HTTPS con HSTS', async () => {
  assert.ok(baseUrl.startsWith('https://'), 'BASE_URL no usa https');
  const response = await request('/', { headers: { accept: 'text/html' } });
  assert.match(response.headers.get('strict-transport-security') ?? '', /max-age=\d+/);
});

for (const result of results) {
  console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${result.label}${result.detail ? ` — ${result.detail}` : ''}`);
}
const failed = results.filter(result => !result.ok).length;
console.log(`\n${baseUrl}: ${results.length - failed}/${results.length} comprobaciones correctas`);
process.exitCode = failed ? 1 : 0;
