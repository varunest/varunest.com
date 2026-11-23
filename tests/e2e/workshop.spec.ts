import { test, expect } from "@playwright/test";

test("four project cards, Videoder featured with three images", async ({ page }) => {
  await page.goto("/workshop");
  const cards = page.locator(".projects .project");
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toHaveClass(/feature/);
  await expect(cards.first()).toContainText("Videoder");
  await expect(cards.first().locator("img")).toHaveCount(3);
});

test("every project image has alt text", async ({ page }) => {
  await page.goto("/workshop");
  const alts = await page.locator(".projects img").evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt") ?? ""));
  expect(alts.length).toBeGreaterThan(0);
  for (const a of alts) expect(a.trim()).not.toBe("");
});

test("open-source projects show their star counts and Uber is not a shipped project", async ({ page }) => {
  await page.goto("/workshop");
  await expect(page.locator(".project", { hasText: "Spark Button" })).toContainText("★");
  await expect(page.locator(".projects")).not.toContainText("Uber");
  await expect(page.locator("main")).toContainText("Earlier experiments: Crazy Driver, Movie Memo, Lazy Music and 9Facts.");
});

test("animated demos stay GIFs so they keep moving", async ({ page }) => {
  await page.goto("/workshop");
  const src = await page.locator(".project", { hasText: "Spark Button" }).locator("img").getAttribute("src");
  expect(src).toMatch(/\.gif(\?|$)/);
});
