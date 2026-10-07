import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import FoodRecipeFields from "../../layers/base/app/components/admin/FoodRecipeFields.vue"
import type { Ingredient } from "../../layers/menu/shared/types/types"

const { getIngredients } = vi.hoisted(() => ({ getIngredients: vi.fn() }))
mockNuxtImport("useIngredientCatalog", () => () => ({ getIngredients, createIngredient: vi.fn() }))

describe("FoodRecipeFields", () => {
  it("renders while the catalog is pending and fills the selector when it arrives", async () => {
    clearNuxtData("ingredient-catalog")
    let resolveCatalog!: (items: Ingredient[]) => void
    getIngredients.mockReturnValue(new Promise<Ingredient[]>((resolve) => { resolveCatalog = resolve }))

    const wrapper = await mountSuspended(FoodRecipeFields, {
      props: { ingredientes: [{ ingredientId: "", cantidad: 1, unidad: "g" }], preparacion: "" },
      global: { stubs: { UTooltip: { template: "<div><slot /></div>" } } }
    })

    expect(wrapper.text()).toContain("Proceso de preparación")
    const selector = wrapper.findComponent({ name: "USelectMenu" })
    expect(selector.props("loading")).toBe(true)
    expect(selector.props("createItem")).toBe(false)

    resolveCatalog([{ id: "ingredient-1", nombre: "Pollo", categoria: "Proteína" } as Ingredient])
    await flushPromises()

    expect(selector.props("loading")).toBe(false)
    expect(selector.props("items")).toEqual([{ label: "Pollo", value: "ingredient-1", categoria: "Proteína" }])
    expect(selector.props("createItem")).toBe(true)
    wrapper.unmount()
    clearNuxtData("ingredient-catalog")
  })
})
