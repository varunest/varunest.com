import { test, expect } from "@playwright/test";

test("the gallery hangs the artwork with its placard", async ({ page }) => {
  await page.goto("/studio");
  const art = page.locator(".gallery .art");
  await expect(art).toHaveCount(1);
  await expect(art).toContainText("When universe stands still");
  await expect(art).toContainText("Digital painting, Procreate");
  await expect(art.getByRole("link", { name: /Read the story/ })).toHaveAttribute("href", "/studio/when-universe-stands-still");
});

test("clicking the frame opens the full image, Escape closes it", async ({ page }) => {
  await page.goto("/studio");
  await page.locator(".gallery .frame").click();
  await expect(page.locator("dialog.lightbox[open] img")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.lightbox[open]")).toHaveCount(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the frame links to the image", async ({ page }) => {
    await page.goto("/studio");
    const href = await page.locator(".gallery .frame").getAttribute("href");
    expect(href).toMatch(/\.(jpe?g|webp|png)/);
  });
});

test("the page behind the lightbox doesn't scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/studio");
  await page.locator(".gallery .frame").click();
  await expect(page.locator("dialog.lightbox[open]")).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(20, 300);
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});
