import { describe, expect, it } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import BaseButton from "../../layers/base/app/components/base/Button.vue"

describe("BaseButton", () => {
  it("renders the label and routes internal links through Nuxt", async () => {
    const wrapper = await mountSuspended(BaseButton, {
      props: {
        label: "Ver planes",
        to: "/planes",
        icon: "i-heroicons-list-bullet-20-solid"
      }
    })

    expect(wrapper.text()).toContain("Ver planes")
    expect(wrapper.find("a").attributes("href")).toBe("/planes")
    expect(wrapper.findComponent({ name: "NuxtLink" }).props("prefetch")).toBeUndefined()
    wrapper.unmount()
  })

  it("inherits the project size and preserves explicit link prefetch settings", async () => {
    const wrapper = await mountSuspended(BaseButton, {
      props: { label: "Ver planes", to: "/planes", prefetch: false }
    })

    expect(wrapper.find("a").classes()).toContain("py-2")
    expect(wrapper.findComponent({ name: "NuxtLink" }).props("prefetch")).toBe(false)

    await wrapper.setProps({ prefetch: true })
    expect(wrapper.findComponent({ name: "NuxtLink" }).props("prefetch")).toBe(true)
    wrapper.unmount()
  })
})
