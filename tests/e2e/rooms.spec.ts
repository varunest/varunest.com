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

  for (const [room, turn] of [["library", -90], ["workshop", 90]] as const) {
    test(`footprints are shoe prints that alternate feet and turn toward the ${room}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto("/");
      await page.locator(`#rooms .room[data-room="${room}"]`).hover();
      await expect(page.locator("#rooms .step").first()).toBeAttached();
      const steps = await page.locator("#rooms .step").evaluateAll((els) =>
        els.map((e) => {
          const before = getComputedStyle(e, "::before"), after = getComputedStyle(e, "::after");
          return { foot: (e as HTMLElement).dataset.foot, turn: Number((e as HTMLElement).dataset.turn), sole: before.content, heel: after.content };
        }),
      );
      expect(steps.length).toBeGreaterThan(6);
      // left, right, left, right...
      steps.forEach((s, i) => expect(s.foot).toBe(i % 2 ? "r" : "l"));
      // a sole and a separate heel
      steps.forEach((s) => { expect(s.sole).not.toBe("none"); expect(s.heel).not.toBe("none"); });
      // up the hallway first (toes up), then turned toward the room
      expect(steps[0].turn).toBe(0);
      expect(steps.at(-1)!.turn).toBe(turn);
    });
  }

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

for (const scheme of ["light", "dark"] as const) {
  test(`shopfront lights are ${scheme === "light" ? "off" : "on"} in the ${scheme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "no-preference" });
    await page.goto("/workshop");
    await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
    const look = await page.evaluate(() => {
      const q = (s: string) => document.querySelector(s)!;
      const bulbs = [...document.querySelectorAll(".scene .lights .bulb")].map((b) => getComputedStyle(b));
      return {
        bulbGlow: bulbs.map((b) => b.boxShadow),
        bulbAnim: bulbs.map((b) => b.animationName),
        windowLight: getComputedStyle(q(".scene .window")).backgroundImage,
        spill: getComputedStyle(q(".scene .spill")).opacity,
      };
    });
    expect(look.bulbGlow.length).toBeGreaterThanOrEqual(8);
    if (scheme === "light") {
      expect(new Set(look.bulbGlow)).toEqual(new Set(["none"]));
      expect(new Set(look.bulbAnim)).toEqual(new Set(["none"]));
      expect(look.windowLight).toBe("none");
      expect(look.spill).toBe("0");
    } else {
      expect(look.bulbGlow.every((s) => s !== "none")).toBe(true);
      expect(look.bulbAnim.every((a) => a === "twinkle")).toBe(true);
      expect(look.windowLight).toContain("gradient");
      expect(look.spill).not.toBe("0");
    }
  });
}

for (const scheme of ["dark", "light"] as const) {
  test(`every room has the same sign board and window frame, on a wall that stands apart (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const boxes = new Set<string>();
    for (const room of ["library", "workshop", "studio", "vault"]) {
      await page.goto(`/${room}`);
      const c = await page.evaluate(() => {
        // Relative luminance of a computed CSS colour (rgb() or color(srgb ...)).
        const lum = (css: string) => {
          const n = css.match(/[\d.]+/g)!.map(Number);
          const [r, g, b] = css.startsWith("color(") ? n.slice(0, 3) : n.slice(0, 3).map((v) => v / 255);
          const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        };
        const ratio = (a: string, b: string) => {
          const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
          return (x + 0.05) / (y + 0.05);
        };
        const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
        const wall = cs("section.scene").backgroundColor;
        const fascia = cs(".scene .fascia");
        const frame = cs(".scene .window");
        return {
          box: [fascia.backgroundColor, fascia.borderTopWidth, frame.borderTopColor, frame.borderTopWidth].join(" | "),
          frame: ratio(frame.borderTopColor, wall),
          sign: ratio(fascia.backgroundColor, wall),
        };
      });
      boxes.add(c.box);
      expect(c.frame, `${room} window frame vs wall`).toBeGreaterThanOrEqual(1.4);
      expect(c.sign, `${room} sign board vs wall`).toBeGreaterThanOrEqual(1.4);
    }
    expect([...boxes], "sign board and window frame look the same in every room").toHaveLength(1);
  });
}
