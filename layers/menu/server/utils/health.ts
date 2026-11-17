// Public healthcheck (T26). It must never reveal configuration, connection
// strings, error messages or row data: only whether each dependency answers
// and which build is serving the request.
export type HealthStatus = 'ok' | 'degraded';

export interface HealthReport {
  status: HealthStatus;
  checks: { database: 'ok' | 'error' };
  build: { commit: string | null; context: string | null };
  time: string;
}

const DATABASE_TIMEOUT_MS = 3_000;

function withTimeout<T>(promise: Promise<T>, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function buildHealthReport(
  pingDatabase: () => Promise<unknown>,
  build: { commit?: string; context?: string },
  now = new Date(),
): Promise<HealthReport> {
  let database: 'ok' | 'error' = 'ok';
  try {
    await withTimeout(pingDatabase(), DATABASE_TIMEOUT_MS);
  } catch {
    // The cause stays out of the response; the platform logs keep only the label.
    console.error('[health] database check failed');
    database = 'error';
  }

  return {
    status: database === 'ok' ? 'ok' : 'degraded',
    checks: { database },
    build: {
      commit: build.commit ? build.commit.slice(0, 7) : null,
      context: build.context || null,
    },
    time: now.toISOString(),
  };
}
