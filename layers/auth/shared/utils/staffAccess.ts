// Staff permissions shared by the server middleware (authoritative) and the
// admin UI (navigation and page guard only). The role comes exclusively from
// Supabase `app_metadata.role`, which users cannot edit themselves.

export type StaffRole = "admin" | "operations"

export function staffRoleFrom(appMetadata: unknown): StaffRole | null {
  if (!appMetadata || typeof appMetadata !== "object") return null
  const role = (appMetadata as { role?: unknown }).role
  return role === "admin" || role === "operations" ? role : null
}

// Kitchen, purchasing and delivery. Everything else under /api stays admin-only.
const operationsApiRoutes: ReadonlyArray<readonly [readonly string[], RegExp]> = [
  [["GET"], /^\/api\/cycles$/],
  [["GET", "POST"], /^\/api\/operations\/production\/[^/]+$/],
  [["GET"], /^\/api\/operations\/shopping\/[^/]+$/],
  [["PUT"], /^\/api\/operations\/shopping\/[^/]+\/[^/]+$/],
  [["GET"], /^\/api\/operations\/deliveries$/],
  [["PUT"], /^\/api\/operations\/deliveries\/[^/]+$/],
  [["POST"], /^\/api\/orders\/[^/]+\/deliveries\/[12]\/status$/]
]

export function canAccessApi(role: StaffRole, path: string, method: string) {
  if (role === "admin") return true
  return operationsApiRoutes.some(([methods, pattern]) => methods.includes(method) && pattern.test(path))
}

export const operationsAdminPages = ["/admin/produccion", "/admin/compras", "/admin/etiquetas", "/admin/reparto"] as const

function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/"
}

export function canAccessAdminPage(role: StaffRole, path: string) {
  if (role === "admin") return true
  const normalized = normalizePath(path)
  return operationsAdminPages.some(page => normalized === page)
}

export function staffHome(role: StaffRole) {
  return role === "admin" ? "/admin" : operationsAdminPages[0]
}
