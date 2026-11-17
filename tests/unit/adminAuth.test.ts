import { IncomingMessage, ServerResponse } from "node:http"
import { Socket } from "node:net"
import { createEvent } from "h3"
import { beforeEach, describe, expect, it, vi } from "vitest"
import adminAuth from "../../layers/auth/server/middleware/admin-auth"

const { getUser, serverClient } = vi.hoisted(() => ({
  getUser: vi.fn(),
  serverClient: vi.fn()
}))

vi.mock("#supabase/server", () => ({ serverSupabaseClient: serverClient }))

function request(path = "/api/orders", method = "GET") {
  const req = new IncomingMessage(new Socket())
  req.url = path
  req.method = method
  req.headers.host = "localhost"
  return createEvent(req, new ServerResponse(req))
}

function authenticatedUser(app_metadata: unknown = { role: "admin" }) {
  return {
    id: "user-1",
    role: "authenticated",
    app_metadata,
    user_metadata: { role: "admin" }
  }
}

beforeEach(() => {
  getUser.mockReset()
  serverClient.mockReset()
  serverClient.mockResolvedValue({ auth: { getUser } })
  getUser.mockResolvedValue({ data: { user: authenticatedUser() }, error: null })
})

describe("administrative API authorization", () => {
  it("rejects a missing user with 401", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(adminAuth(request())).rejects.toMatchObject({ statusCode: 401 })
  })

  it("rejects authentication errors even when a user is returned", async () => {
    getUser.mockResolvedValue({ data: { user: authenticatedUser() }, error: new Error("Invalid token") })
    await expect(adminAuth(request())).rejects.toMatchObject({ statusCode: 401 })
  })

  it("fails closed when getUser throws", async () => {
    getUser.mockRejectedValue(new Error("Auth unavailable"))
    await expect(adminAuth(request())).rejects.toMatchObject({ statusCode: 401 })
  })

  it("fails closed when client initialization throws", async () => {
    serverClient.mockRejectedValue(new Error("Client unavailable"))
    await expect(adminAuth(request())).rejects.toMatchObject({ statusCode: 401 })
  })

  it.each([
    {}, null, { role: "customer" }, { role: "authenticated" },
    { role: "ADMIN" }, { role: ["admin"] }, { role: true }, "admin"
  ])("rejects untrusted or malformed roles: %j", async (metadata) => {
    getUser.mockResolvedValue({ data: { user: authenticatedUser(metadata) }, error: null })
    const event = request("/api/orders?role=admin")
    event.node.req.headers["x-role"] = "admin"
    await expect(adminAuth(event)).rejects.toMatchObject({ statusCode: 403 })
  })

  it("rejects missing app_metadata despite user_metadata claiming admin", async () => {
    const user = { id: "user-1", role: "authenticated", user_metadata: { role: "admin" } }
    getUser.mockResolvedValue({ data: { user }, error: null })
    await expect(adminAuth(request())).rejects.toMatchObject({ statusCode: 403 })
  })

  it("allows a verified administrator and passes the request to the server client", async () => {
    const event = request()
    await expect(adminAuth(event)).resolves.toBeUndefined()
    expect(serverClient).toHaveBeenCalledWith(event)
    expect(getUser).toHaveBeenCalledOnce()
    expect(getUser).toHaveBeenCalledWith()
  })

  it("uses the current user role after revocation rather than stale claims", async () => {
    const getClaims = vi.fn().mockResolvedValue({ data: { claims: { app_metadata: { role: "admin" } } }, error: null })
    serverClient.mockResolvedValue({ auth: { getUser, getClaims } })
    getUser.mockResolvedValue({ data: { user: authenticatedUser({}) }, error: null })
    await expect(adminAuth(request())).rejects.toMatchObject({ statusCode: 403 })
    expect(getClaims).not.toHaveBeenCalled()
  })

  it.each([
    ["/api/menu", "POST"], ["/api/menu/all", "GET"],
    ["/api/menu/menu-1", "GET"], ["/api/menu/menu-1", "PUT"],
    ["/api/menu/next", "POST"], ["/api/food-components", "GET"],
    ["/api/food-components/food-1", "PUT"], ["/api/customers", "GET"],
    ["/api/customers/customer-1", "DELETE"],
    ["/api/customers/customer-1/order-link", "POST"], ["/api/customers/customer-1/order-link", "DELETE"],
    ["/api/orders/order-1/private-link", "DELETE"], ["/api/expenses", "POST"],
    ["/api/expenses/vendors", "GET"], ["/api/plans", "POST"],
    ["/api/plans/all", "GET"], ["/api/plans/plan-1", "PUT"],
    ["/api/orders", "GET"], ["/api/orders/order-1", "PUT"],
    ["/api/cycles", "GET"], ["/api/cycles/cycle-1", "PUT"],
    ["/api/operations", "GET"], ["/api/operations/accounts", "GET"],
    ["/api/operations/accounts/order-1", "POST"], ["/api/operations/production/cycle-1", "POST"],
    ["/api/operations/shopping/run-1/item-1", "PUT"], ["/api/operations/deliveries/row-1", "PUT"],
    ["/api/operations/dashboard", "GET"],
    ["/api/operation-settings", "GET"], ["/api/operation-settings", "PUT"],
    ["/api/ingredients", "GET"], ["/api/ingredients", "POST"],
    ["/api/ingredients/", "GET"], ["/api/ingredients/?categoria=proteina", "POST"],
    ["/api/ingredients/ingredient-1", "PUT"], ["/api/ingredients/ingredient-1", "DELETE"]
  ])("protects %s %s", async (path, method) => {
    getUser.mockResolvedValue({ data: { user: authenticatedUser({ role: "customer" }) }, error: null })
    await expect(adminAuth(request(path, method))).rejects.toMatchObject({ statusCode: 403 })
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(adminAuth(request(path, method))).rejects.toMatchObject({ statusCode: 401 })
    getUser.mockResolvedValue({ data: { user: authenticatedUser() }, error: null })
    await expect(adminAuth(request(path, method))).resolves.toBeUndefined()
  })

  it.each(["/api/menu", "/api/menu/next", "/api/plans"])("keeps GET %s public without consulting Auth", async (path) => {
    await expect(adminAuth(request(path))).resolves.toBeUndefined()
    expect(serverClient).not.toHaveBeenCalled()
    expect(getUser).not.toHaveBeenCalled()
  })

  it("does not apply administrative authorization to unrelated routes", async () => {
    await expect(adminAuth(request("/"))).resolves.toBeUndefined()
    await expect(adminAuth(request("/admin/clientes"))).resolves.toBeUndefined()
    await expect(adminAuth(request("/apiary"))).resolves.toBeUndefined()
    expect(serverClient).not.toHaveBeenCalled()
  })

  it.each([
    ["/api/customer-order", "POST"],
    ["/api/customer-order/offer", "GET"],
    ["/api/customer-order/private", "GET"],
    ["/api/_nuxt_icon/lucide", "GET"],
    ["/api/plans", "HEAD"],
    ["/api/menu?week=next", "GET"]
  ])("keeps public route %s %s open without consulting Auth", async (path, method) => {
    await expect(adminAuth(request(path, method))).resolves.toBeUndefined()
    expect(serverClient).not.toHaveBeenCalled()
  })

  it.each([
    ["/api/customer-order", "GET"],
    ["/api/customer-order/private", "POST"],
    ["/api/plans/", "GET"],
    ["/api/menu/", "GET"],
    ["/api", "GET"],
    ["/api/future-endpoint", "GET"],
    ["/API/customers", "GET"],
    ["//api/customers", "GET"]
  ])("fails closed for unlisted API route %s %s", async (path, method) => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(adminAuth(request(path, method))).rejects.toMatchObject({ statusCode: 401 })
  })

  // Regression: Nitro decodes the path before routing, so `/api/%63ustomers`
  // reached `/api/customers` while the check compared the encoded string.
  it.each([
    ["/api/%63ustomers", "GET"],
    ["/%61pi/customers", "GET"],
    ["/api/%6Frders", "POST"],
    ["/api/%6Fperations/dashboard", "GET"],
    ["/api/menu%2Fall", "GET"],
    ["/api/menu%2fnext", "GET"],
    ["/api/plans%2F", "GET"],
    ["/api/%E0%A4%A", "GET"]
  ])("rejects percent-encoded API path %s %s before consulting Auth", async (path, method) => {
    await expect(adminAuth(request(path, method))).rejects.toMatchObject({ statusCode: 400 })
    expect(serverClient).not.toHaveBeenCalled()
  })

  it("requires an administrator when only the query string is encoded", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(adminAuth(request("/api/customers?search=%41na"))).rejects.toMatchObject({ statusCode: 401 })
  })
})
