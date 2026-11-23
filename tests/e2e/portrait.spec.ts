import { test, expect } from "@playwright/test";
import { GREETINGS } from "../../src/lib/greetings";

const portrait = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Varun. Say hello." });

test("portrait image has alt text", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByAltText("Illustrated portrait of Varun")).toBeVisible();
});

const greetingTexts = GREETINGS.map((g) => g.text);

test("focusing the portrait shows a greeting with its language", async ({ page }) => {
  await page.goto("/");
  const bubble = page.locator(".bubble");
  await expect(bubble).toBeHidden();
  await portrait(page).focus();
  await expect(bubble).toBeVisible();
  const text = (await bubble.textContent())!;
  expect(greetingTexts).toContain(text);
  await expect(bubble).toHaveAttribute("lang", GREETINGS.find((g) => g.text === text)!.lang);
});

test("each hover shows a different greeting than the last", async ({ page }) => {
  await page.goto("/");
  const box = (await portrait(page).boundingBox())!;
  const bubble = page.locator(".bubble");
  let previous: string | null = null;
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(bubble).toBeVisible();
    const text = await bubble.textContent();
    expect(greetingTexts).toContain(text);
    expect(text).not.toBe(previous);
    previous = text;
    await page.mouse.move(0, 0);
    await expect(bubble).toBeHidden();
  }
});

test("without JavaScript the bubble markup says Hello!", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(baseURL + "/");
  await expect(page.locator(".bubble")).toHaveText("Hello!");
  await ctx.close();
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

test("every greeting's bubble stays inside the viewport at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await portrait(page).focus();
  const bubble = page.locator(".bubble");
  for (const g of GREETINGS) {
    await bubble.evaluate((el, t) => (el.textContent = t), g.text);
    const b = (await bubble.boundingBox())!;
    expect(b.x, g.text).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width, g.text).toBeLessThanOrEqual(360);
  }
});
