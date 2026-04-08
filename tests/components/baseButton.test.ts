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
  })
})
