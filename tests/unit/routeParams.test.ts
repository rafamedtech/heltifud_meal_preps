import { createError, defineEventHandler } from "h3"
import { beforeEach, describe, expect, it, vi } from "vitest"

let params: Record<string, string | undefined> = {}
const { getOrderById, getPayments } = vi.hoisted(() => ({ getOrderById: vi.fn(), getPayments: vi.fn() }))
vi.mock("../../layers/menu/server/utils/orders", () => ({ getOrderById }))
vi.mock("../../layers/menu/server/utils/payments", () => ({ getPayments }))

vi.stubGlobal("defineEventHandler", defineEventHandler)
vi.stubGlobal("createError", createError)
vi.stubGlobal("getRouterParam", vi.fn((_event: unknown, name: string) => params[name]))

const { requireUuidParam } = await import("../../layers/menu/server/utils/routeParams")
const { default: getOrder } = await import("../../layers/menu/server/api/orders/[id]/index.get")
const { default: getAccount } = await import("../../layers/menu/server/api/operations/accounts/[id]/index.get")

const orderId = "6f1c1c2e-0000-4000-8000-000000000000"
const event = { context: {} } as never

beforeEach(() => {
  params = {}
  getOrderById.mockReset()
  getPayments.mockReset()
})

describe("requireUuidParam", () => {
  it("returns a valid UUID", () => {
    params.id = orderId
    expect(requireUuidParam(event, "id", "del pedido")).toBe(orderId)
  })

  it.each([undefined, "", "no-es-uuid", "123", `${orderId}x`, "%63ustomers"])("rejects %j with 400 and a readable message", (value) => {
    params.id = value
    expect(() => requireUuidParam(event, "id", "del pedido")).toThrowError(
      expect.objectContaining({ statusCode: 400, statusMessage: "El identificador del pedido no es válido." })
    )
  })
})

describe("route handlers", () => {
  it("answer 400 for a malformed id without reaching the database", async () => {
    params.id = "no-es-uuid"
    await expect(getOrder(event)).rejects.toMatchObject({ statusCode: 400 })
    await expect(getAccount(event)).rejects.toMatchObject({ statusCode: 400 })
    expect(getOrderById).not.toHaveBeenCalled()
    expect(getPayments).not.toHaveBeenCalled()
  })

  it("pass a valid id through", async () => {
    params.id = orderId
    getOrderById.mockResolvedValue({ id: orderId })
    await expect(getOrder(event)).resolves.toEqual({ id: orderId })
    expect(getOrderById).toHaveBeenCalledWith(orderId)
  })
})
