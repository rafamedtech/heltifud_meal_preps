export default defineNuxtPlugin(() => {
  const route = useRoute()
  const session = useSupabaseSession()

  watch(session, async (value, previousValue) => {
    if (!previousValue || value || !route.path.startsWith('/admin')) {
      return
    }

    await navigateTo({
      path: '/login',
      query: {
        redirect: route.fullPath
      }
    }, { replace: true })
  })
})
