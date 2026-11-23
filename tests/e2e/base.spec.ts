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

test("header has the brand and no Writing or Lab links", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header a", { hasText: "Varun," })).toHaveAttribute("href", "/");
  await expect(page.locator("header a[href^='/blog']")).toHaveCount(0);
  await expect(page.locator("header a[href^='/lab']")).toHaveCount(0);
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

for (const width of [360, 1280, 1920, 2560]) {
  test(`the garden's cat sleeps fully in view at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const garden = (await page.locator(".garden").boundingBox())!;
    const cat = (await page.locator(".garden .cat").boundingBox())!;
    expect(cat.y).toBeGreaterThanOrEqual(garden.y);
    expect(cat.y + cat.height).toBeLessThanOrEqual(garden.y + garden.height);
    expect(cat.x).toBeGreaterThanOrEqual(0);
    expect(cat.x + cat.width).toBeLessThanOrEqual(width);
  });
}

test("the cat's tail wags from its base instead of flying off", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const tail = page.locator(".garden .tail");
  // Where the tail joins the body (the path's first point), in screen pixels.
  const base = () =>
    tail.evaluate((el) => {
      const p = el as SVGPathElement;
      const pt = p.getPointAtLength(0);
      const m = p.getScreenCTM()!;
      return { x: pt.x * m.a + pt.y * m.c + m.e, y: pt.x * m.b + pt.y * m.d + m.f };
    });
  const centre = async () => {
    const b = (await tail.boundingBox())!;
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const restBase = await base();
  const restCentre = await centre();
  // Freeze the wag at its widest point (50% of the keyframes) and measure again.
  await tail.evaluate((el) => {
    (el as SVGElement).style.animation = "wag 1s linear -0.5s paused";
  });
  const midBase = await base();
  const midCentre = await centre();
  expect(Math.hypot(midBase.x - restBase.x, midBase.y - restBase.y)).toBeLessThan(4);
  expect(Math.hypot(midCentre.x - restCentre.x, midCentre.y - restCentre.y)).toBeLessThan(15);
  expect(Math.hypot(midCentre.x - restCentre.x, midCentre.y - restCentre.y)).toBeGreaterThan(1);
});
