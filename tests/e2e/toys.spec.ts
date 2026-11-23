import { test, expect } from "@playwright/test";

test("bookshelf lifts one book at a time (keyboard and taps)", async ({ page }) => {
  await page.goto("/library");
  const books = page.locator(".scene .toy-bookshelf button.book");
  await books.nth(1).press("Enter");
  await books.nth(3).press("Enter");
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

test("piggy bank compounds: three coins make $35 (keyboard and taps)", async ({ page }) => {
  await page.goto("/vault");
  const pig = page.locator(".scene .toy-piggy button");
  for (let i = 0; i < 3; i++) await pig.press("Enter");
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

test("clicking a lit room's toy on home opens that room", async ({ page }) => {
  for (const id of ["library", "workshop", "studio", "vault"]) {
    await page.goto("/");
    const toy = page.locator(`#rooms .room[data-room="${id}"] .room-toy`);
    await expect(toy).toHaveAttribute("href", `/${id}`);
    // A drawing inside a link: nothing nested to press, and not a second tab stop beside "Go in".
    await expect(toy.locator("button, a, [tabindex]:not([tabindex='-1'])")).toHaveCount(0);
    await expect(toy).toHaveAttribute("tabindex", "-1");
    await toy.click();
    await expect(page).toHaveURL(new RegExp(`/${id}$`));
  }
});

test("toys on home still play when hovered", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const gears = page.locator('#rooms .room[data-room="workshop"] .room-toy');
  await gears.hover();
  await expect.poll(() => gears.locator(".g1").evaluate((g) => getComputedStyle(g).animationName)).toBe("gear-spin");
  const pig = page.locator('#rooms .room[data-room="vault"] .room-toy');
  await pig.hover();
  await expect.poll(() => pig.locator(".body").evaluate((g) => getComputedStyle(g).animationName)).not.toBe("none");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("piggy bank still counts", async ({ page }) => {
    await page.goto("/vault");
    await page.locator(".scene .toy-piggy button").press("Enter");
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

test.describe("dark theme", () => {
  test.use({ colorScheme: "dark" });
  test("paint by numbers keeps dark outlines on its white canvas", async ({ page }) => {
    await page.goto("/studio");
    const stroke = await page.locator(".scene .toy-paint .area").first().evaluate((e) => getComputedStyle(e).stroke);
    expect(stroke).toBe("rgb(15, 42, 46)");
  });
});

test.describe("toys react to a hovering mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });

  test("bookshelf lifts the book under the pointer, and a click keeps it up", async ({ page }) => {
    await page.goto("/library");
    const book = page.locator(".scene .toy-bookshelf button.book").nth(2);
    await book.hover();
    await expect(book).toHaveAttribute("aria-pressed", "true");
    await book.click();
    await expect(book).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(5, 5);
    await expect(book).toHaveAttribute("aria-pressed", "false");
  });

  test("gears spin while hovered and stop after", async ({ page }) => {
    await page.goto("/workshop");
    const btn = page.locator(".scene .toy-gears button");
    await btn.hover();
    await expect(btn).toHaveClass(/spinning/);
    const a = await page.locator(".scene .toy-gears .g1").evaluate((g) => getComputedStyle(g).transform);
    await page.waitForTimeout(300);
    const b = await page.locator(".scene .toy-gears .g1").evaluate((g) => getComputedStyle(g).transform);
    expect(b).not.toBe(a);
    await page.mouse.move(5, 5);
    await expect(btn).not.toHaveClass(/spinning/);
  });

  test("paint by numbers paints an area as the brush passes over it", async ({ page }) => {
    await page.goto("/studio");
    const toy = page.locator(".scene .toy-paint");
    const swatch = toy.locator(".swatch").nth(3);
    await swatch.click();
    const area = toy.locator(".area").nth(0);
    await area.hover({ position: { x: 10, y: 10 } });
    await expect(area).toHaveAttribute("fill", (await swatch.getAttribute("data-colour"))!);
  });

  test("piggy bank takes a coin each time the pointer arrives", async ({ page }) => {
    await page.goto("/vault");
    const pig = page.locator(".scene .toy-piggy button");
    await pig.hover();
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$11");
    await page.mouse.move(5, 5);
    await pig.hover();
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$22");
  });
});

test.describe("a tap on a touch screen counts once", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
  test("one tap, one coin", async ({ page }) => {
    await page.goto("/vault");
    await page.locator(".scene .toy-piggy button").tap();
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$11");
  });
});
