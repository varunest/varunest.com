import { test, expect } from "@playwright/test";

test.describe("home without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("hero copy and buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("I build software people enjoy touching.");
    await expect(page.locator(".hero p").first()).toContainText("Staff Engineer at Uber");
    await expect(page.getByRole("link", { name: "Say hello" })).toHaveAttribute("href", "mailto:mailvarunest@gmail.com");
    await expect(page.locator(".hero .btn").nth(1)).toHaveText("Look around");
    await expect(page.locator(".hero .btn").nth(1)).toHaveAttribute("href", "#rooms");
  });

  test("lab is hidden", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header a", { hasText: "Lab" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "In the lab" })).toHaveCount(0);
  });

  test("shipped section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Things I've shipped" })).toBeVisible();
    const text = await page.locator("main").innerText();
    expect(text).toContain("Videoder");
    expect(text).toContain("Earlier experiments: Crazy Driver, Movie Memo, Lazy Music and 9Facts.");
    expect(text).not.toMatch(/zscaler/i);
  });

  test("portrait has alt text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByAltText("Illustrated portrait of Varun")).toBeVisible();
  });
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
