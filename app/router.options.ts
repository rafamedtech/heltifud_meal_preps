import type { RouterConfig } from "@nuxt/schema"

export default <RouterConfig>{
  scrollBehavior(to, _, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        top: 16,
        behavior: "smooth"
      }
    }

    return false
  }
}
