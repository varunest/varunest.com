import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const books: Array<{ id: string; title: string; shelf: string; cover: string | null; review: string[]; reviewPost: string | null }> = JSON.parse(readFileSync("src/data/books.json", "utf8"));

const read = books.filter((b) => b.shelf === "read");
const reading = books.filter((b) => b.shelf === "currently-reading");
const reviewed = read.find((b) => b.review.length > 0 && !b.reviewPost)!;
const lastLecture = books.find((b) => b.reviewPost === "the-last-lecture-review")!;
const noCover = books.find((b) => !b.cover)!;

test("the desk shows the books being read", async ({ page }) => {
  await page.goto("/library");
  await expect(page.locator(".desk .bk")).toHaveCount(reading.length);
});

test("the shelves show every read book", async ({ page }) => {
  await page.goto("/library");
  await expect(page.locator(".shelves .bk")).toHaveCount(read.length);
});

test("a book without a cover gets a drawn cover with its title", async ({ page }) => {
  test.skip(!noCover, "every book in books.json has a cover; nothing to draw");
  await page.goto("/library");
  const bk = page.locator(`.bk[data-book="${noCover.id}"]`);
  await expect(bk.locator(".drawn")).toContainText(noCover.title.split(":")[0].slice(0, 20));
});

test("a reviewed book is tagged and opens its review", async ({ page }) => {
  await page.goto("/library");
  const bk = page.locator(`.shelves .bk[data-book="${reviewed.id}"]`);
  await expect(bk.locator(".tag-review")).toBeVisible();
  await bk.click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toContainText(reviewed.title);
  await expect(dialog).toContainText(reviewed.review[0].slice(0, 40));
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("The Last Lecture links to its blog review too", async ({ page }) => {
  await page.goto("/library");
  await page.locator(`.shelves .bk[data-book="${lastLecture.id}"]`).click();
  await expect(page.locator("dialog[open] a[href='/library/the-last-lecture-review']")).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("covers link to details listed under the shelves", async ({ page }) => {
    await page.goto("/library");
    const bk = page.locator(`.shelves .bk[data-book="${reviewed.id}"]`);
    await expect(bk).toHaveAttribute("href", `#book-${reviewed.id}`);
    await expect(page.locator(`#book-${reviewed.id}`)).toContainText(reviewed.title);
  });
});

for (const width of [360, 1280]) {
  test.describe(`shelves at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test("every book's bottom lands exactly on a shelf board", async ({ page }) => {
      await page.goto("/library");
      const row = page.locator(".shelves .row");
      // Boards are painted every 236px (202px of books, 12px board, 22px gap).
      const offsets = await row.evaluate((r) => {
        const top = r.getBoundingClientRect().top;
        return [...r.querySelectorAll(".bk")].map((b) => Math.round(b.getBoundingClientRect().bottom - top) % 236);
      });
      expect(new Set(offsets)).toEqual(new Set([202]));
      expect(await row.evaluate((r) => getComputedStyle(r).gridAutoRows)).toBe("214px");
    });
    test("drawn covers keep their titles inside the cover", async ({ page }) => {
      await page.goto("/library");
      const overflow = await page.locator(".drawn").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
      expect(overflow).toEqual([]);
    });
  });
}

test("no review shows a raw link to the old blog", async ({ page }) => {
  await page.goto("/library");
  expect(await page.content()).not.toContain("varunest.com/blog");
});

for (const width of [1280, 900, 375]) {
  test(`shelf boards run the full width of the shelves at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/library");
    const row = page.locator(".shelves .row");
    const rowBox = (await row.boundingBox())!;
    const books = await row.locator(".bk").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    // Books are spread across the whole width: first starts near the left, the last in each line ends near the right.
    const lines = new Map<number, { left: number; right: number }>();
    for (const b of books) {
      const k = Math.round(b.top);
      const l = lines.get(k) ?? { left: Infinity, right: -Infinity };
      lines.set(k, { left: Math.min(l.left, b.left), right: Math.max(l.right, b.right) });
    }
    const full = [...lines.values()].slice(0, -1);
    expect(full.length).toBeGreaterThan(0);
    for (const l of full) {
      expect(l.left - rowBox.x).toBeLessThan(30);
      expect(rowBox.x + rowBox.width - l.right).toBeLessThan(30);
    }
    // Every line, including the last, sits on a board that spans the row.
    const boards = await row.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(boards).toContain("linear-gradient");
    expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  });
}

test("the page behind a book's popup doesn't scroll, and scrolls again once it closes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/library");
  const bk = page.locator(`.shelves .bk[data-book="${reviewed.id}"]`);
  await bk.scrollIntoViewIfNeeded();
  await bk.click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(40, 400); // over the backdrop, outside the popup
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await page.keyboard.press("Escape");
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
});
