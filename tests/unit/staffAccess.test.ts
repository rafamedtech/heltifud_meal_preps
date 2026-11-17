import { describe, expect, it } from "vitest"
import { canAccessAdminPage, staffHome, staffRoleFrom } from "../../layers/auth/shared/utils/staffAccess"

describe("staff access", () => {
  it.each([
    [{ role: "admin" }, "admin"], [{ role: "operations" }, "operations"],
    [{ role: "customer" }, null], [{ role: "ADMIN" }, null], [{}, null], [null, null], ["admin", null]
  ])("reads role from app_metadata %j", (metadata, role) => {
    expect(staffRoleFrom(metadata)).toBe(role)
  })

  it("gives administrators every admin page", () => {
    expect(canAccessAdminPage("admin", "/admin")).toBe(true)
    expect(canAccessAdminPage("admin", "/admin/cobros")).toBe(true)
    expect(staffHome("admin")).toBe("/admin")
  })

  it.each(["/admin/produccion", "/admin/compras/", "/admin/etiquetas", "/admin/reparto"])("lets operations open %s", (path) => {
    expect(canAccessAdminPage("operations", path)).toBe(true)
  })

  it.each(["/admin", "/admin/pedidos", "/admin/pedidos/order-1", "/admin/cobros", "/admin/clientes", "/admin/gastos", "/admin/menu", "/admin/planes", "/admin/platillos", "/admin/reparto-extra", "/admin/produccion/otra"])("keeps %s away from operations", (path) => {
    expect(canAccessAdminPage("operations", path)).toBe(false)
  })

  it("sends operations to an allowed page", () => {
    expect(canAccessAdminPage("operations", staffHome("operations"))).toBe(true)
  })
})
