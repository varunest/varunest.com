import { test, expect } from "@playwright/test";
import { SITE } from "../../src/lib/site";

test.describe("home without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("hero copy and buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("I build software people enjoy touching.");
    await expect(page.locator(".hero p").first()).toContainText("Staff Engineer at Uber");
    await expect(page.getByRole("link", { name: "Say hello" })).toHaveAttribute("href", `mailto:${SITE.email}`);
    await expect(page.locator(".hero .btn").nth(1)).toHaveText("Look around");
    await expect(page.locator(".hero .btn").nth(1)).toHaveAttribute("href", "#rooms");
  });

  test("lab is hidden", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header a", { hasText: "Lab" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "In the lab" })).toHaveCount(0);
  });

  test("latest posts list every post newest first with its room", async ({ page }) => {
    await page.goto("/");
    const rows = page.locator("#latest .row");
    await expect(rows).toHaveCount(5);
    await expect(rows.first()).toContainText("A professor's reminisce");
    await expect(rows.last()).toContainText("Reworking website");
    await expect(rows.first().locator(".room-chip")).toHaveAttribute("href", "/library");
    await expect(rows.first().locator("a").first()).toHaveAttribute("href", "/library/the-last-lecture-review");
  });

  test("shipped section has moved off the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Things I've shipped" })).toHaveCount(0);
  });

  test("header is just the brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header nav")).toHaveCount(0);
    await expect(page.locator("header a")).toHaveCount(1);
  });

  test("garden footer groups its links", async ({ page }) => {
    await page.goto("/");
    const f = page.locator("footer");
    const group = (name: string) => f.locator(".group", { has: page.getByRole("heading", { name }) });
    await expect(group("Say hello").getByRole("link", { name: "Email" })).toHaveAttribute("href", `mailto:${SITE.email}`);
    await expect(group("Say hello").getByRole("link", { name: "Résumé" })).toHaveAttribute("href", "/resume.pdf");
    await expect(group("Find me").getByRole("link", { name: "GitHub" })).toHaveAttribute("href", SITE.social.github);
    await expect(group("Find me").getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", SITE.social.linkedin);
    await expect(group("Find me").getByRole("link", { name: "X" })).toHaveAttribute("href", SITE.social.x);
    await expect(group("Follow along").getByRole("link", { name: "RSS" })).toHaveAttribute("href", "/rss.xml");
    await expect(group("Follow along").getByRole("link", { name: "Atom" })).toHaveAttribute("href", "/atom.xml");
    await expect(f.locator(".garden")).toHaveAttribute("aria-hidden", "true");
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
