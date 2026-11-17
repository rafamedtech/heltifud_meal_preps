/**
 * Message the server put in `statusMessage` for a failed `$fetch`, so the UI
 * shows "El plan tiene 3 pedidos…" instead of "[DELETE] /api/plans/…: 409".
 */
export function apiErrorMessage(error: unknown, fallback: string) {
  const failure = error as { data?: { statusMessage?: unknown } } | null;
  const message = failure?.data?.statusMessage;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

/** Machine-readable code the server sends in `data.code` (e.g. `PLAN_HAS_ORDERS`). */
export function apiErrorCode(error: unknown) {
  const failure = error as { data?: { data?: { code?: unknown } } } | null;
  const code = failure?.data?.data?.code;
  return typeof code === 'string' ? code : undefined;
}
