import { createError, getMethod, getRequestURL } from "h3"
import { serverSupabaseUser } from "#supabase/server"

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

  const user = await serverSupabaseUser(event).catch(() => null)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    })
  }
})
