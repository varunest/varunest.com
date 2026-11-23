import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["/", "/library/the-last-lecture-review", "/studio/when-universe-stands-still", "/404"];

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });
    for (const path of pages) {
      test(`${path} has no axe violations`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
        await page.goto(path);
        expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      });
    }
  });
}
