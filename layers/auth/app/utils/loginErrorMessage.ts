/**
 * Spanish message for a failed `signInWithPassword`. Supabase answers in
 * English ("Invalid login credentials") and a lost connection surfaces as a
 * retryable fetch error, or as a thrown exception, so the login page maps
 * both to something the user can act on.
 */
export function loginErrorMessage(error: unknown) {
  const failure = (error ?? {}) as { code?: unknown, status?: unknown, name?: unknown }
  const code = typeof failure.code === "string" ? failure.code : ""
  const status = typeof failure.status === "number" ? failure.status : undefined

  if (code === "invalid_credentials" || code === "invalid_grant") {
    return "Correo o contraseña incorrectos."
  }
  if (code === "email_not_confirmed") {
    return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada."
  }
  if (code === "user_banned") {
    return "Esta cuenta está suspendida. Contacta al administrador."
  }
  if (status === 429 || code.startsWith("over_") || code.endsWith("_rate_limit")) {
    return "Demasiados intentos. Espera un momento e intenta de nuevo."
  }
  if (
    failure.name === "AuthRetryableFetchError" ||
    error instanceof TypeError ||
    status === 0 ||
    (status !== undefined && status >= 500)
  ) {
    return "No fue posible conectar con el servidor. Revisa tu conexión e intenta de nuevo."
  }
  return "No fue posible iniciar sesión. Intenta de nuevo."
}
