// In dev, Nuxt forwards server logs to the browser using devalue. Libraries such as
// @supabase/auth-js log Error instances (e.g. "Refresh token is not valid"), which devalue
// cannot serialize, causing "[nuxt] Failed to stringify dev server logs".
// Payload plugins run before Nuxt's dev-server-logs plugin, so the reviver is ready on the client.
export default definePayloadPlugin(() => {
  if (!import.meta.dev) return

  definePayloadReducer(
    "DevLogError",
    (value) =>
      value instanceof Error &&
      !isNuxtError(value) && { name: value.name, message: value.message, stack: value.stack }
  )
  definePayloadReviver("DevLogError", (data: { name: string; message: string; stack?: string }) =>
    Object.assign(new Error(data.message), data)
  )
})
