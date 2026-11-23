import { test, expect } from "@playwright/test";

test("skyline is decorative", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("svg.skyline")).toHaveAttribute("aria-hidden", "true");
});

test.describe("themes", () => {
  test.use({ colorScheme: "light" });

  test("windows are hidden by day and lit by night", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await expect(page.locator(".skyline .wins")).toHaveCSS("opacity", "0");
    await expect(page.locator(".skyline .sun")).not.toHaveCSS("opacity", "0");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await expect(page.locator(".skyline .wins")).toHaveCSS("opacity", "1");
    await expect(page.locator(".skyline .sun")).toHaveCSS("opacity", "0");
  });
});

test.describe("device is dark, no stored choice", () => {
  test.use({ colorScheme: "dark" });

  test("night skyline follows the device without data-theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
    await expect(page.locator(".skyline .wins")).toHaveCSS("opacity", "1");
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  for (const path of ["/"]) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }

  test("no horizontal overflow on a post", async ({ page }) => {
    await page.goto("/library/the-last-lecture-review");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce", colorScheme: "dark" });

  test("nothing animates in the skyline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".skyline")).toHaveCount(1);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await page.waitForTimeout(100);
    const n = await page.evaluate(() =>
      [...document.querySelectorAll(".skyline, .skyline *")].flatMap((e) => e.getAnimations()).length,
    );
    expect(n).toBe(0);
  });
});

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference", colorScheme: "dark" });

  test("bridge lights twinkle at night", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".skyline")).toHaveCount(1);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await page.waitForTimeout(100);
    const n = await page.evaluate(
      () =>
        [...document.querySelectorAll(".skyline *")]
          .flatMap((e) => e.getAnimations())
          .filter((a) => a instanceof CSSAnimation && a.animationName === "skyline-twinkle" && a.playState === "running").length,
    );
    expect(n).toBeGreaterThan(0);
  });
});

test("Sutro Tower is drawn", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".skyline .sutro")).toHaveCount(1);
});
