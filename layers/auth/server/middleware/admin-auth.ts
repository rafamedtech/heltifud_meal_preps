import { createError, defineEventHandler, getMethod } from "h3"
import { serverSupabaseClient } from "#supabase/server"
import { canAccessApi, staffRoleFrom } from "../../shared/utils/staffAccess"

// Every /api route requires staff unless it is listed here; operations staff
// only reach the routes allowed in `staffAccess.ts`, everything else is admin.
// New routes are therefore private by default (fail closed).
const publicApiRoutes: Record<string, readonly string[]> = {
  "/api/health": ["GET"],
  "/api/menu": ["GET"],
  "/api/menu/next": ["GET"],
  "/api/plans": ["GET"],
  "/api/customer-order": ["POST"],
  "/api/customer-order/offer": ["GET"],
  "/api/customer-order/private": ["GET"]
}

const publicApiPrefixes = ["/api/_nuxt_icon/"]

function rawPathname(path: string) {
  const end = path.search(/[?#]/)
  return end === -1 ? path : path.slice(0, end)
}

// Nitro's router decodes the path before matching (`/api/%63ustomers` reaches
// `/api/customers`), so the decision must be taken on the decoded path.
// Encoded API paths are never produced by the app; reject them instead of
// guessing how each layer will interpret them.
export function resolveApiPath(path: string) {
  const raw = rawPathname(path)
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return { isApi: true, invalid: true, path: raw }
  }

  const lower = decoded.toLowerCase()
  const isApi = lower === "/api" || lower.startsWith("/api/") || /^\/+api(\/|$)/.test(lower)
  return { isApi, invalid: isApi && decoded !== raw, path: decoded }
}

function isPublicApiRoute(path: string, method: string) {
  if (publicApiRoutes[path]?.includes(method)) return true
  return method === "GET" && publicApiPrefixes.some(prefix => path.startsWith(prefix))
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const { isApi, invalid, path } = resolveApiPath(event.path)

  if (!isApi) {
    return
  }

  if (invalid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request"
    })
  }

  if (isPublicApiRoute(path, method === "HEAD" ? "GET" : method)) {
    return
  }

  const user = await (async () => {
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.getUser()
    return error ? null : data.user
  })().catch(() => null)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    })
  }

  const role = staffRoleFrom(user.app_metadata)
  if (!role || !canAccessApi(role, path, method === "HEAD" ? "GET" : method)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden"
    })
  }
  event.context.staffRole = role
  event.context.orderActor = { id: user.id, label: user.email ?? user.id }
})
