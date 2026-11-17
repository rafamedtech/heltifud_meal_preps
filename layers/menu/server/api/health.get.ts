import { buildHealthReport } from '../utils/health';
import { prisma } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  const { deployCommit, deployContext } = useRuntimeConfig(event);
  const report = await buildHealthReport(() => prisma.$queryRaw`SELECT 1`, {
    commit: deployCommit,
    context: deployContext,
  });

  setResponseHeader(event, 'Cache-Control', 'no-store');
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
  if (report.status !== 'ok') setResponseStatus(event, 503);
  return report;
});
