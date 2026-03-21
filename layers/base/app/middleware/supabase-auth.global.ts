export default defineNuxtRouteMiddleware((to) => {
  const session = useSupabaseSession()

  if (to.path === '/login' && session.value) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/admin'
    return navigateTo(redirect)
  }

  if (!to.path.startsWith('/admin')) {
    return
  }

  if (session.value) {
    return
  }

  return navigateTo({
    path: '/login',
    query: {
      redirect: to.fullPath
    }
  })
})
