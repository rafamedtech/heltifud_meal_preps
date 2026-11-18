import { createError, defineEventHandler } from "h3"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { updateShoppingItem, readBody } = vi.hoisted(() => ({ updateShoppingItem: vi.fn(), readBody: vi.fn() }))
vi.mock("~~/layers/menu/server/utils/production", () => ({ updateShoppingItem }))

vi.stubGlobal("defineEventHandler", defineEventHandler)
vi.stubGlobal("readBody", readBody)
const runId = "11111111-1111-4111-8111-111111111111"
const itemId = "22222222-2222-4222-8222-222222222222"
vi.stubGlobal("getRouterParam", vi.fn((_event: unknown, name: string) => (name === "runId" ? runId : itemId)))
vi.stubGlobal("createError", createError)

const { default: handler } = await import("../../layers/menu/server/api/operations/shopping/[runId]/[itemId].put")

function event(staffRole: string) {
  return { context: { staffRole, orderActor: { id: "user-1", label: "cocina@heltifud.com" } } } as never
}

beforeEach(() => {
  updateShoppingItem.mockReset()
  updateShoppingItem.mockResolvedValue({ id: "list-1" })
})

describe("shopping item update by role", () => {
  it("lets operations mark a purchase without touching the linked expense", async () => {
    readBody.mockResolvedValue({ version: 2, purchased: true })
    await expect(handler(event("operations"))).resolves.toEqual({ id: "list-1" })
    expect(updateShoppingItem).toHaveBeenCalledWith(runId, itemId, { version: 2, purchased: true }, { id: "user-1", label: "cocina@heltifud.com" })
  })

  it.each([null, "6f1c1c2e-0000-4000-8000-000000000000"])("rejects operations linking expense %s", async (expenseId) => {
    readBody.mockResolvedValue({ version: 2, purchased: true, expenseId })
    await expect(handler(event("operations"))).rejects.toMatchObject({ statusCode: 403 })
    expect(updateShoppingItem).not.toHaveBeenCalled()
  })

  it("lets administrators link an expense", async () => {
    readBody.mockResolvedValue({ version: 2, purchased: true, expenseId: null })
    await expect(handler(event("admin"))).resolves.toEqual({ id: "list-1" })
    expect(updateShoppingItem).toHaveBeenCalledOnce()
  })
})
