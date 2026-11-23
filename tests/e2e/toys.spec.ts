import { test, expect } from "@playwright/test";

const reviews = [
  "jrd-tata-biography-beyond-the-last-blue-mountain",
  "the-last-lecture-review",
];

for (const slug of reviews) {
  test(`${slug} has a bookshelf; pressing a book shows its label`, async ({ page }) => {
    await page.goto(`/blog/${slug}/`);
    const toy = page.getByRole("complementary", { name: "A small toy to play with" });
    await expect(toy).toBeVisible();
    const book = toy.locator("button.book").first();
    await book.click();
    await expect(book).toHaveAttribute("aria-pressed", "true");
    const title = await page.locator("h1").innerText();
    await expect(toy.locator("[aria-live=polite]")).toContainText(title);
    await expect(toy.locator("[aria-live=polite]")).toContainText("5/5");
  });
}

test("only one book is lifted at a time", async ({ page }) => {
  await page.goto(`/blog/${reviews[0]}/`);
  const books = page.locator(".toy button.book");
  await expect(books).toHaveCount(2);
  await books.nth(0).click();
  await books.nth(1).click();
  await expect(books.nth(0)).toHaveAttribute("aria-pressed", "false");
  await expect(books.nth(1)).toHaveAttribute("aria-pressed", "true");
});

test("the shelf has four books, the extras are decorative", async ({ page }) => {
  await page.goto(`/blog/${reviews[0]}/`);
  await expect(page.locator(".toy .shelf > *")).toHaveCount(4);
  await expect(page.locator(".toy .shelf [aria-hidden=true]")).toHaveCount(2);
});

test("an ordinary post gets the pendulum", async ({ page }) => {
  await page.goto("/blog/when-universe-stands-still/");
  const canvas = page.locator(".toy canvas");
  await expect(canvas).toHaveAccessibleName(/pendulum/i);
  await expect(page.locator(".toy .shelf")).toHaveCount(0);
});

test("the pendulum is nudged by arrow keys and redraws on themechange", async ({ page }) => {
  await page.goto("/blog/when-universe-stands-still/");
  const canvas = page.locator(".toy canvas");
  await canvas.focus();
  const snap = () => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await canvas.focus();
  const before = await snap();
  await page.keyboard.press("ArrowRight");
  expect(await snap()).not.toBe(before);
  const light = await snap();
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: "dark" } }));
  });
  expect(await snap()).not.toBe(light);
});

test("the pendulum is static under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/when-universe-stands-still/");
  const canvas = page.locator(".toy canvas");
  const a = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(400);
  expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(a);
});

test("the pendulum swings by default", async ({ page }) => {
  await page.goto("/blog/when-universe-stands-still/");
  const canvas = page.locator(".toy canvas");
  const a = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(500);
  expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).not.toBe(a);
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const slug of [...reviews, "when-universe-stands-still"]) {
    await page.goto(`/blog/${slug}/`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(over, slug).toBe(false);
  }
});

test("without JavaScript the toy is a drawing with nothing focusable", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await ctx.newPage();
  await page.goto(`/blog/${reviews[0]}/`);
  await expect(page.locator(".toy .shelf")).toBeVisible();
  const focusable = await page.locator(".toy").evaluate((el) =>
    [...el.querySelectorAll<HTMLElement>("button, canvas, a, input, [tabindex]")].filter((n) => {
      const disabled = (n as HTMLButtonElement).disabled;
      return !disabled && (n.tabIndex >= 0) && getComputedStyle(n).display !== "none";
    }).length,
  );
  expect(focusable).toBe(0);
  await page.goto("/blog/when-universe-stands-still/");
  await expect(page.locator(".toy .static")).toBeVisible();
  await ctx.close();
});

test("the post column lines up with the header brand at 1280px", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const slug of [...reviews, "when-universe-stands-still"]) {
    await page.goto(`/blog/${slug}/`);
    const brand = (await page.locator("a.brand").boundingBox())!;
    const h1 = (await page.locator("h1").boundingBox())!;
    expect(Math.abs(brand.x - h1.x), slug).toBeLessThanOrEqual(1);
  }
});
