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
    test("every book sits on a board and boards join up across a row", async ({ page }) => {
      await page.goto("/library");
      const row = page.locator(".shelves .row");
      expect(await row.evaluate((r) => getComputedStyle(r).columnGap)).toBe("0px");
      const boards = await page.locator(".shelves .bk").evaluateAll((els) => els.map((e) => getComputedStyle(e).borderBottomWidth));
      expect(new Set(boards)).toEqual(new Set(["12px"]));
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
