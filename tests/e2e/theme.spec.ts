import { test, expect, type Page } from "@playwright/test";

test.use({ colorScheme: "light" });

const theme = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme);

async function pull(page: Page, dy: number) {
  const box = (await page.locator(".cord").boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height - 16;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + dy / 2);
  await page.mouse.move(x, y + dy);
  await page.mouse.up();
}

test("a plain click does not change the theme", async ({ page }) => {
  await page.goto("/");
  expect(await theme(page)).toBe("light");
  await pull(page, 0);
  expect(await theme(page)).toBe("light");
  await pull(page, 5);
  expect(await theme(page)).toBe("light");
});

test("dragging 40px down toggles, and the choice survives reload", async ({ page }) => {
  await page.goto("/");
  await pull(page, 40);
  expect(await theme(page)).toBe("dark");
  await page.reload();
  expect(await theme(page)).toBe("dark");
  await pull(page, 40);
  expect(await theme(page)).toBe("light");
});

test("Enter and Space toggle, and a themechange event fires", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    (window as any).seen = [];
    document.addEventListener("themechange", (e) => (window as any).seen.push((e as CustomEvent).detail.theme));
  });
  await page.locator(".cord").focus();
  await page.keyboard.press("Enter");
  expect(await theme(page)).toBe("dark");
  await page.keyboard.press("Space");
  expect(await theme(page)).toBe("light");
  expect(await page.evaluate(() => (window as any).seen)).toEqual(["dark", "light"]);
});

test("handle icon follows the theme", async ({ page }) => {
  await page.goto("/");
  const icon = () => page.locator(".cord").evaluate((el) => getComputedStyle(el, "::after").content);
  expect(await icon()).toContain("☾");
  await page.locator(".cord").focus();
  await page.keyboard.press("Enter");
  expect(await icon()).toContain("☀");
});

test("blocked localStorage still works and logs no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new DOMException("blocked", "SecurityError"); },
    });
  });
  await page.goto("/");
  await pull(page, 40);
  expect(await theme(page)).toBe("dark");
  expect(errors).toEqual([]);
});

test("cord does not overlap nav links at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 700 });
  await page.goto("/");
  const cord = (await page.locator(".cord").boundingBox())!;
  for (const a of await page.locator("header nav a").all()) {
    const b = (await a.boundingBox())!;
    expect(b.x + b.width).toBeLessThanOrEqual(cord.x);
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("cord is hidden", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".cord")).toBeHidden();
  });
});
