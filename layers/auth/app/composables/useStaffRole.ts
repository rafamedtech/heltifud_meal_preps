import { staffRoleFrom } from "../../shared/utils/staffAccess"

// UI-only view of the signed-in staff role (navigation and page guard).
// The server middleware re-checks the role on every API request.
export function useStaffRole() {
  const user = useSupabaseUser()
  const session = useSupabaseSession()
  // Right after signing in the module loads the claims asynchronously; the
  // client session already carries the same app_metadata, so use it meanwhile.
  // (The module types the session without `user` because SSR strips it.)
  const sessionUser = () => (session.value as { user?: { app_metadata?: unknown } } | null)?.user
  return computed(() => staffRoleFrom(user.value?.app_metadata ?? sessionUser()?.app_metadata))
}
