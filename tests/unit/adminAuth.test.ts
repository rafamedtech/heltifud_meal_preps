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
    ["/api/menu/menu-1", "GET"], ["/api/menu/menu-1/activate", "POST"],
    ["/api/menu/next", "POST"], ["/api/food-components", "GET"],
    ["/api/food-components/food-1", "PUT"], ["/api/customers", "GET"],
    ["/api/customers/customer-1", "DELETE"], ["/api/expenses", "POST"],
    ["/api/expenses/vendors", "GET"], ["/api/plans", "POST"],
    ["/api/plans/all", "GET"], ["/api/plans/plan-1", "PUT"],
    ["/api/orders", "GET"], ["/api/orders/order-1", "PUT"],
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
    expect(serverClient).not.toHaveBeenCalled()
  })
})
