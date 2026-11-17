import { canAccessAdminPage, staffHome } from "../../shared/utils/staffAccess"

export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== "/admin" && !to.path.startsWith("/admin/")) return

  // Without a session the Supabase module redirects to /login.
  if (!useSupabaseUser().value && !useSupabaseSession().value) return

  const role = useStaffRole().value
  if (!role) {
    return abortNavigation(createError({ statusCode: 403, statusMessage: "Forbidden", fatal: true }))
  }
  if (!canAccessAdminPage(role, to.path)) {
    return navigateTo(staffHome(role), { replace: true })
  }
})
