import { mountSuspended } from "@nuxt/test-utils/runtime"
import { CalendarDate } from "@internationalized/date"
import { describe, expect, it } from "vitest"
import StartDate from "../../layers/menu/app/components/StartDate.vue"
import CalendarInput from "../../layers/base/app/components/CalendarInput.vue"

describe("calendar controls", () => {
  it("displays the controlled start date instead of a separate local date", async () => {
    const wrapper = await mountSuspended(StartDate, {
      props: { modelValue: new CalendarDate(2026, 11, 15) }
    })

    expect(wrapper.get("button").text()).toContain("15")
    expect(wrapper.get("button").text()).toContain("2026")
    await wrapper.setProps({ modelValue: new CalendarDate(2026, 12, 21) })
    expect(wrapper.get("button").text()).toContain("21")
    wrapper.unmount()
  })

  it("names an empty date trigger and inherits the project control size", async () => {
    const wrapper = await mountSuspended(CalendarInput, {
      props: { modelValue: "", label: "Fecha del gasto" }
    })

    expect(wrapper.get("button").text()).toBe("Fecha del gasto")
    expect(wrapper.get("button").attributes("aria-label")).toBe("Abrir calendario para fecha del gasto")
    expect(wrapper.get("button").classes()).toContain("py-2")
    wrapper.unmount()
  })
})
