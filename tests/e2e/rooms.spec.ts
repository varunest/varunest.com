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


test("room header is a shopfront: awning, name on the fascia, count on an open sign, toy in the window", async ({ page }) => {
  const cases = [
    ["library", "The Library", "books"],
    ["workshop", "The Workshop", "4 projects"],
  ] as const;
  for (const [room, name, count] of cases) {
    await page.goto(`/${room}`);
    const scene = page.locator("section.scene");
    await expect(scene.locator(".awning")).toHaveCount(1);
    await expect(scene.locator(".fascia").getByRole("heading", { level: 1 })).toHaveText(name);
    await expect(scene.locator(".fascia .blurb")).not.toBeEmpty();
    await expect(scene.locator(".open-sign")).toContainText(count);
    await expect(scene.locator(".window .stand .on")).toHaveCount(1);
    await expect(scene.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/#rooms");
  }
});


for (const width of [1280, 375]) {
  test(`string lights hang under the awning across the whole shopfront at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/workshop");
    const scene = (await page.locator("section.scene").boundingBox())!;
    const awning = (await page.locator("section.scene .awning").boundingBox())!;
    await expect(page.locator("section.scene .lamp")).toHaveCount(0);
    const bulbs = await page.locator("section.scene .lights .bulb").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    expect(bulbs.length).toBeGreaterThanOrEqual(8);
    const xs = bulbs.map((b) => b.x + b.width / 2 - scene.x);
    expect(Math.min(...xs)).toBeLessThan(scene.width * 0.15);
    expect(Math.max(...xs)).toBeGreaterThan(scene.width * 0.85);
    const vp = await page.evaluate(() => window.scrollY);
    const front = (await page.locator("section.scene .fascia").boundingBox())!;
    const win = (await page.locator("section.scene .window").boundingBox())!;
    for (const b of bulbs) {
      expect(b.y + vp).toBeGreaterThanOrEqual(awning.y + awning.height - 2);
      expect(b.y + vp + b.height).toBeLessThanOrEqual(Math.min(front.y, win.y) + 1);
    }
  });
}

test("the lit window spills light onto the pavement", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/workshop");
  const win = (await page.locator("section.scene .window").boundingBox())!;
  const spill = (await page.locator("section.scene .spill").boundingBox())!;
  expect(spill.y).toBeGreaterThanOrEqual(win.y + win.height - 2);
  expect(Math.abs(spill.x + spill.width / 2 - (win.x + win.width / 2))).toBeLessThanOrEqual(3);
});

test("string lights hold still for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/workshop");
  const names = await page.locator("section.scene .lights .bulb").evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
  expect(names.length).toBeGreaterThanOrEqual(8);
  expect(names.every((n) => n === "none")).toBe(true);
});
