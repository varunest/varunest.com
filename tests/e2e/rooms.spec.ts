import { test, expect } from "@playwright/test";

const order = ["library", "workshop", "studio", "vault", "server-closet", "living-room"];
const lit = ["library", "workshop", "studio", "vault"];
const dim = ["server-closet", "living-room"];

test.describe("floor plan", () => {
  test("shows the six rooms in house order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("#rooms .room").evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.room));
    expect(ids).toEqual(order);
  });

  for (const id of lit) {
    test(`${id} is lit with a Go in link`, async ({ page }) => {
      await page.goto("/");
      const room = page.locator(`#rooms .room[data-room="${id}"]`);
      await expect(room.getByRole("link", { name: /Go in/ })).toHaveAttribute("href", `/${id}`);
    });
  }

  for (const id of dim) {
    test(`${id} is dim with nothing focusable`, async ({ page }) => {
      await page.goto("/");
      const room = page.locator(`#rooms .room[data-room="${id}"]`);
      await expect(room).toContainText("Lights off");
      await expect(room.locator("a, button, [tabindex]:not([tabindex='-1']), input, canvas")).toHaveCount(0);
    });
  }

  test("hovering a lit room walks footprints to it", async ({ page }) => {
    await page.goto("/");
    await page.locator('#rooms .room[data-room="workshop"]').hover();
    await expect(page.locator("#rooms .step").first()).toBeAttached();
  });

  test("Tab from Look around reaches each lit room's link in order and skips dim rooms", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Look around" }).focus();
    const reached: string[] = [];
    for (let i = 0; i < 40 && reached.length < 4; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        return { href: el.getAttribute("href"), room: el.closest<HTMLElement>("#rooms .room")?.dataset.room ?? null };
      });
      if (info.room && ["server-closet", "living-room"].includes(info.room)) throw new Error(`focus entered dim room ${info.room}`);
      if (info.href?.startsWith("/") && info.room) reached.push(info.href);
    }
    expect(reached).toEqual(lit.map((id) => `/${id}`));
  });
});

test.describe("floor plan with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no footprints", async ({ page }) => {
    await page.goto("/");
    await page.locator('#rooms .room[data-room="workshop"]').hover();
    await page.waitForTimeout(300);
    await expect(page.locator("#rooms .step")).toHaveCount(0);
  });
});

test.describe("floor plan on a phone", () => {
  test.use({ viewport: { width: 360, height: 800 } });
  test("rooms stack, hallway hidden, no sideways scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#rooms .hall")).toBeHidden();
    const tops = await page.locator("#rooms .room").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});

test("room scenes have no glow behind the toy", async ({ page }) => {
  for (const room of ["library", "workshop", "studio"]) {
    await page.goto(`/${room}`);
    await expect(page.locator("section.scene")).toBeVisible();
    await expect(page.locator(".glow")).toHaveCount(0);
  }
});
