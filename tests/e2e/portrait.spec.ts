import { test, expect } from "@playwright/test";

const portrait = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Varun. Say hello." });

test("portrait image has alt text", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByAltText("Illustrated portrait of Varun")).toBeVisible();
});

test("focusing the portrait shows Hello!", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".bubble")).toBeHidden();
  await portrait(page).focus();
  await expect(page.locator(".bubble")).toBeVisible();
  await expect(page.locator(".bubble")).toHaveText("Hello!");
});

test("hover tilts the portrait toward the cursor", async ({ page }) => {
  await page.goto("/");
  const box = (await portrait(page).boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.5);
  await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.5);
  await expect(page.locator(".portrait-card")).not.toHaveCSS("transform", "none");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no tilt, bubble still shows", async ({ page }) => {
    await page.goto("/");
    const box = (await portrait(page).boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.5);
    await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.5);
    await expect(page.locator(".portrait-card")).toHaveCSS("transform", "none");
    await expect(page.locator(".bubble")).toBeVisible();
  });

  test("no sparks", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Say hello" }).dispatchEvent("click");
    await expect(page.locator(".spark")).toHaveCount(0);
  });
});

test("clicking Say hello makes sparks, then removes them", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Say hello" }).dispatchEvent("click");
  await expect(page.locator(".spark")).toHaveCount(14);
  await expect(page.locator(".spark").first()).toHaveCSS("pointer-events", "none");
  await expect(page.locator(".spark")).toHaveCount(0);
});

test("bubble stays inside the viewport at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await portrait(page).focus();
  const b = (await page.locator(".bubble").boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(360);
});
