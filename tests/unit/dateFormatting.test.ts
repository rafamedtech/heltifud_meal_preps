import { describe, expect, it } from "vitest"
import { formatShortDate } from "../../layers/base/app/utils/dateFormatting"

describe("formatShortDate", () => {
  it("formats dates with the Tijuana timezone used by the business", () => {
    expect(formatShortDate("2026-05-20T12:00:00.000Z")).toBe("20 may")
    expect(formatShortDate("2026-11-16T00:00:00.000Z")).toBe("15 nov")
    expect(formatShortDate(new Date("2026-11-16T00:00:00.000Z"))).toBe("15 nov")
  })

  it("preserves civil delivery dates across timezone and month boundaries", () => {
    expect(formatShortDate("2026-11-16")).toBe("16 nov")
    expect(formatShortDate("2026-11-19")).toBe("19 nov")
    expect(formatShortDate("2026-01-01")).toBe("1 ene")
  })
})
