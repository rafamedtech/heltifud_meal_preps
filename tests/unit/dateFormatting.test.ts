import { describe, expect, it } from "vitest"
import { formatShortDate } from "../../layers/base/app/utils/dateFormatting"

describe("formatShortDate", () => {
  it("formats dates with the Tijuana timezone used by the business", () => {
    expect(formatShortDate("2026-05-20T12:00:00.000Z")).toBe("20 may")
  })
})
