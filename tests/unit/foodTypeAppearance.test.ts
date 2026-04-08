import { describe, expect, it } from "vitest"
import { getFoodTypeAppearance } from "../../layers/base/app/utils/foodTypeAppearance"

describe("getFoodTypeAppearance", () => {
  it("normalizes known food types", () => {
    expect(getFoodTypeAppearance(" Desayuno ")).toMatchObject({
      icon: "i-lucide-sunrise",
      label: "Desayuno"
    })
  })

  it("falls back to a readable label for unknown food types", () => {
    expect(getFoodTypeAppearance("proteina")).toMatchObject({
      icon: "i-lucide-tag",
      label: "Proteina"
    })
  })

  it("handles missing food types", () => {
    expect(getFoodTypeAppearance("")).toMatchObject({
      icon: "i-lucide-tag",
      label: "Sin tipo"
    })
  })
})
