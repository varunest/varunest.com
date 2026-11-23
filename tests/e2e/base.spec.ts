import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home has the canonical URL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.varunest.com/");
});

test("home keeps the Google site verification meta tag", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute("content", "FZuwNujwyxt3ri-debC9SRIUo1rTda-I9G384-govWY");
});

test.describe("theme without JavaScript", () => {
  test.use({ javaScriptEnabled: false, colorScheme: "dark" });
  test("dark OS theme gives the Slate background", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(21, 23, 28)");
  });
});

test.describe("light theme without JavaScript", () => {
  test.use({ javaScriptEnabled: false, colorScheme: "light" });
  test("light OS theme gives the Tide background", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(241, 247, 245)");
  });
});

test("footer links", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator("footer a").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")));
  expect(hrefs).toContain("mailto:mailvarunest@gmail.com");
  expect(hrefs).toContain("https://github.com/varunest");
  expect(hrefs).toContain("https://www.linkedin.com/in/varunest");
  expect(hrefs).toContain("https://x.com/varunest");
  expect(hrefs.join(" ")).not.toMatch(/facebook|stackoverflow/i);
});

test("header has brand and nav, and no Lab link when showLab is false", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header a", { hasText: "Varun," })).toHaveAttribute("href", "/");
  await expect(page.locator("header nav a[href='/blog/']")).toHaveText("Writing");
  await expect(page.locator("header nav a[href='/resume.pdf']")).toHaveText("Résumé");
  await expect(page.locator("header nav a[href='/lab/']")).toHaveCount(0);
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe ${scheme}`, () => {
    test.use({ colorScheme: scheme });
    test(`no violations in ${scheme}`, async ({ page }) => {
      await page.goto("/");
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
