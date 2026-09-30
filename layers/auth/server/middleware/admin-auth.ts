import { createError, defineEventHandler, getMethod, getRequestURL } from "h3"
import { serverSupabaseClient } from "#supabase/server"

const publicMenuRoutes = new Set(["/api/menu", "/api/menu/next"])

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const method = getMethod(event)

  const isPublicMenuRoute = method === "GET" && publicMenuRoutes.has(path)
  const isProtectedMenuRoute = path === "/api/menu/all" || path.startsWith("/api/menu/")
  const isProtectedMenuMutation = path === "/api/menu" && method !== "GET"
  const isProtectedFoodRoute = path.startsWith("/api/food-components")
  const isProtectedCustomerRoute = path.startsWith("/api/customers")
  const isProtectedExpenseRoute = path.startsWith("/api/expenses")
  const isPublicPlansRoute = path === "/api/plans" && method === "GET"
  const isProtectedPlanRoute = path.startsWith("/api/plans") && !isPublicPlansRoute
  const isProtectedOrderRoute = path.startsWith("/api/orders")

  if (isPublicMenuRoute || isPublicPlansRoute || !(isProtectedMenuRoute || isProtectedMenuMutation || isProtectedFoodRoute || isProtectedCustomerRoute || isProtectedExpenseRoute || isProtectedPlanRoute || isProtectedOrderRoute)) {
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

  if (user.app_metadata?.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden"
    })
  }
})
