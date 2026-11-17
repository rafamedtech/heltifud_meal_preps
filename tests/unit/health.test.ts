import { describe, expect, it, vi } from "vitest"
import { buildHealthReport } from "../../layers/menu/server/utils/health"

const now = new Date("2026-11-17T12:00:00.000Z")

describe("healthcheck", () => {
  it("reports ok with the short commit and deploy context", async () => {
    const report = await buildHealthReport(async () => [{ "?column?": 1 }], {
      commit: "ddf36f1a2b3c4d5e",
      context: "production"
    }, now)

    expect(report).toEqual({
      status: "ok",
      checks: { database: "ok" },
      build: { commit: "ddf36f1", context: "production" },
      time: "2026-11-17T12:00:00.000Z"
    })
  })

  it("degrades without exposing the database error", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const secret = "postgresql://heltifud_app:secret@db.example.com:6543/postgres"
    const report = await buildHealthReport(async () => {
      throw new Error(`connect failed ${secret}`)
    }, {}, now)

    expect(report.status).toBe("degraded")
    expect(report.checks.database).toBe("error")
    expect(report.build).toEqual({ commit: null, context: null })
    expect(JSON.stringify(report)).not.toContain("secret")
    expect(log.mock.calls.flat().join(" ")).not.toContain("secret")
    log.mockRestore()
  })

  it("degrades when the database does not answer in time", async () => {
    vi.useFakeTimers()
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const pending = buildHealthReport(() => new Promise(() => {}), {}, now)
    await vi.advanceTimersByTimeAsync(3_000)
    await expect(pending).resolves.toMatchObject({ status: "degraded", checks: { database: "error" } })
    log.mockRestore()
    vi.useRealTimers()
  })
})
