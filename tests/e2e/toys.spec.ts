import { test, expect } from "@playwright/test";

test("bookshelf lifts one book at a time", async ({ page }) => {
  await page.goto("/library");
  const books = page.locator(".scene .toy-bookshelf button.book");
  await books.nth(1).click();
  await books.nth(3).click();
  await expect(page.locator('.scene .toy-bookshelf button.book[aria-pressed="true"]')).toHaveCount(1);
  await expect(books.nth(3)).toHaveAttribute("aria-pressed", "true");
});

test("gears turn when pressed", async ({ page }) => {
  await page.goto("/workshop");
  const btn = page.locator(".scene .toy-gears button");
  await btn.press("Enter");
  await expect(page.locator(".scene .toy-gears .g1")).not.toHaveCSS("transform", "none");
});

test("paint by numbers fills the chosen area with the chosen colour", async ({ page }) => {
  await page.goto("/studio");
  const toy = page.locator(".scene .toy-paint");
  const swatch = toy.locator(".swatch").nth(2);
  await swatch.click();
  const colour = await swatch.getAttribute("data-colour");
  const area = toy.locator(".area").nth(1);
  await area.focus();
  await area.press("Enter");
  await expect(area).toHaveAttribute("fill", colour!);
});

test("piggy bank compounds: three coins make $35", async ({ page }) => {
  await page.goto("/vault");
  const pig = page.locator(".scene .toy-piggy button");
  for (let i = 0; i < 3; i++) await pig.click();
  await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$35");
});

test("dim rooms' toys on home have nothing to tab to", async ({ page }) => {
  await page.goto("/");
  for (const id of ["server-closet", "living-room"]) {
    const toy = page.locator(`#rooms .room[data-room="${id}"] .room-toy`);
    await expect(toy).toHaveAttribute("aria-hidden", "true");
    await expect(toy.locator("button, a, [tabindex]:not([tabindex='-1'])")).toHaveCount(0);
  }
});

test("every lit room's toy on home is interactive", async ({ page }) => {
  await page.goto("/");
  for (const id of ["library", "workshop", "studio", "vault"]) {
    await expect(page.locator(`#rooms .room[data-room="${id}"] .room-toy button`).first()).toBeEnabled();
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("piggy bank still counts", async ({ page }) => {
    await page.goto("/vault");
    await page.locator(".scene .toy-piggy button").click();
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$11");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("toys render as drawings with nothing to press", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#rooms .room-toy button:not([disabled])")).toHaveCount(0);
  });
});
