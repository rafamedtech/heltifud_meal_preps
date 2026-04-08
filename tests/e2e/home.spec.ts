import { expect, type Page, test } from "@playwright/test"

async function gotoHydratedHome(page: Page) {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: /Comida lista para gente ocupada/i })).toBeVisible()
  await page.waitForFunction(() => !document.querySelector('[aria-label="Loading color mode"]'))
}

test.describe("home page", () => {
  test("renders the key home content", async ({ page }) => {
    await gotoHydratedHome(page)

    await expect(page.getByRole("link", { name: /Ver planes/i }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: /Ver Menú/i }).first()).toBeVisible()
  })

  test("keeps the layout inside the viewport", async ({ page }) => {
    await gotoHydratedHome(page)

    const viewport = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }))

    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth + 1)
  })

  test("exposes the desktop navigation", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 768, "Desktop navigation is hidden on mobile.")

    await gotoHydratedHome(page)

    await expect(page.getByRole("navigation").getByRole("link", { name: /Inicio/i })).toBeVisible()
    await expect(page.getByRole("navigation").getByRole("link", { name: /Planes/i })).toBeVisible()
    await expect(page.getByRole("navigation").getByRole("link", { name: /Menú/i })).toBeVisible()
  })

  test("opens the mobile navigation panel", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 768, "Mobile navigation is hidden on desktop.")

    await gotoHydratedHome(page)
    await page.getByRole("button", { name: /Abrir navegación/i }).click()

    await expect(page.getByRole("dialog", { name: /Navegación/i })).toBeVisible()
    await expect(page.getByRole("dialog").getByRole("link", { name: /Planes/i })).toBeVisible()
    await expect(page.getByRole("dialog").getByRole("link", { name: /Menú/i })).toBeVisible()
  })
})
