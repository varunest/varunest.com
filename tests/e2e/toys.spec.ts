import { test, expect } from "@playwright/test";

test("bookshelf lifts one book at a time (keyboard and taps)", async ({ page }) => {
  await page.goto("/library");
  const books = page.locator(".scene .toy-bookshelf button.book");
  await books.nth(1).press("Enter");
  await books.nth(3).press("Enter");
  await expect(page.locator('.scene .toy-bookshelf button.book[aria-pressed="true"]')).toHaveCount(1);
  await expect(books.nth(3)).toHaveAttribute("aria-pressed", "true");
});

test("gears turn when pressed", async ({ page }) => {
  await page.goto("/workshop");
  const btn = page.locator(".scene .toy-gears button");
  await btn.press("Enter");
  await expect(page.locator(".scene .toy-gears .g1")).not.toHaveCSS("transform", "none");
});


test("piggy bank compounds: three coins make $35 (keyboard and taps)", async ({ page }) => {
  await page.goto("/vault");
  const pig = page.locator(".scene .toy-piggy button");
  for (let i = 0; i < 3; i++) await pig.press("Enter");
  await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$35");
});

test("dim rooms' toys on home have nothing to tab to", async ({ page }) => {
  await page.goto("/");
  for (const id of ["server-closet", "living-room"]) {
    const toy = page.locator(`#rooms .room[data-room="${id}"] .room-toy`);
    await expect(toy).toHaveAttribute("aria-hidden", "true");
    await expect(toy.locator("button, a, [tabindex]:not([tabindex='-1'])")).toHaveCount(0);
  }
});

test("clicking a lit room's toy on home opens that room", async ({ page }) => {
  for (const id of ["library", "workshop", "studio", "vault"]) {
    await page.goto("/");
    const toy = page.locator(`#rooms .room[data-room="${id}"] .room-toy`);
    await expect(toy).toHaveAttribute("href", `/${id}`);
    // A drawing inside a link: nothing nested to press, and not a second tab stop beside "Go in".
    await expect(toy.locator("button, a, [tabindex]:not([tabindex='-1'])")).toHaveCount(0);
    await expect(toy).toHaveAttribute("tabindex", "-1");
    await toy.click();
    await expect(page).toHaveURL(new RegExp(`/${id}$`));
  }
});

test("toys on home still play when hovered", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const gears = page.locator('#rooms .room[data-room="workshop"] .room-toy');
  await gears.hover();
  await expect.poll(() => gears.locator(".g1").evaluate((g) => getComputedStyle(g).animationName)).toBe("gear-spin");
  const pig = page.locator('#rooms .room[data-room="vault"] .room-toy');
  await pig.hover();
  await expect.poll(() => pig.locator(".body").evaluate((g) => getComputedStyle(g).animationName)).not.toBe("none");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("piggy bank still counts", async ({ page }) => {
    await page.goto("/vault");
    await page.locator(".scene .toy-piggy button").press("Enter");
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$11");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("toys render as drawings with nothing to press", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#rooms .room-toy button:not([disabled])")).toHaveCount(0);
  });
});

test.describe("dark theme", () => {
  test.use({ colorScheme: "dark" });
  test("the flipbook keeps dark outlines on its paper", async ({ page }) => {
    await page.goto("/studio");
    const stroke = await page.locator(".scene .toy-flipbook .ball").evaluate((e) => getComputedStyle(e).stroke);
    expect(stroke).toBe("rgb(15, 42, 46)");
  });
});

test.describe("toys react to a hovering mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });

  test("bookshelf lifts the book under the pointer, and a click keeps it up", async ({ page }) => {
    await page.goto("/library");
    const book = page.locator(".scene .toy-bookshelf button.book").nth(2);
    await book.hover();
    await expect(book).toHaveAttribute("aria-pressed", "true");
    await book.click();
    await expect(book).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(5, 5);
    await expect(book).toHaveAttribute("aria-pressed", "false");
  });

  test("gears spin while hovered and stop after", async ({ page }) => {
    await page.goto("/workshop");
    const btn = page.locator(".scene .toy-gears button");
    await btn.hover();
    await expect(btn).toHaveClass(/spinning/);
    const a = await page.locator(".scene .toy-gears .g1").evaluate((g) => getComputedStyle(g).transform);
    await page.waitForTimeout(300);
    const b = await page.locator(".scene .toy-gears .g1").evaluate((g) => getComputedStyle(g).transform);
    expect(b).not.toBe(a);
    await page.mouse.move(5, 5);
    await expect(btn).not.toHaveClass(/spinning/);
  });



  test("piggy bank takes a coin each time the pointer arrives", async ({ page }) => {
    await page.goto("/vault");
    const pig = page.locator(".scene .toy-piggy button");
    await pig.hover();
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$11");
    await page.mouse.move(5, 5);
    await pig.hover();
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$22");
  });
});

test.describe("a tap on a touch screen counts once", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
  test("one tap, one coin", async ({ page }) => {
    await page.goto("/vault");
    await page.locator(".scene .toy-piggy button").tap();
    await expect(page.locator(".scene .toy-piggy .balance")).toHaveText("$11");
  });
});

test.describe("flipbook (Studio)", () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
  const ballAt = (page: import("@playwright/test").Page, scope = ".scene") =>
    page.locator(`${scope} .toy-flipbook .ball`).evaluate((b) => `${b.getAttribute("cx")},${b.getAttribute("cy")}`);

  test("a hovering mouse flips the pages so the doodle moves, and it rests when the mouse leaves", async ({ page }) => {
    await page.goto("/studio");
    const book = page.locator(".scene .toy-flipbook .book");
    const rest = await ballAt(page);
    await book.hover();
    await expect(book).toHaveAttribute("aria-pressed", "true");
    const seen = new Set<string>();
    for (let i = 0; i < 6; i++) { seen.add(await ballAt(page)); await page.waitForTimeout(120); }
    expect(seen.size).toBeGreaterThanOrEqual(3);
    await page.mouse.move(5, 5);
    await expect(book).toHaveAttribute("aria-pressed", "false");
    expect(await ballAt(page)).toBe(rest);
  });

  test("the keyboard starts and stops it", async ({ page }) => {
    await page.goto("/studio");
    const book = page.locator(".scene .toy-flipbook .book");
    await book.press("Enter");
    await expect(book).toHaveAttribute("aria-pressed", "true");
    await book.press("Enter");
    await expect(book).toHaveAttribute("aria-pressed", "false");
  });

  test("on home it plays on hover too, and clicking goes into the Studio", async ({ page }) => {
    await page.goto("/");
    const toy = page.locator('#rooms .room[data-room="studio"] .room-toy');
    const rest = await ballAt(page, '#rooms .room[data-room="studio"]');
    await toy.hover();
    await expect.poll(() => ballAt(page, '#rooms .room[data-room="studio"]')).not.toBe(rest);
    await toy.click();
    await expect(page).toHaveURL(/\/studio$/);
  });
});

test.describe("flipbook with reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  test("stays on its still drawing", async ({ page }) => {
    await page.goto("/studio");
    const ball = page.locator(".scene .toy-flipbook .ball");
    const rest = await ball.getAttribute("cy");
    await page.locator(".scene .toy-flipbook .book").hover();
    await page.waitForTimeout(400);
    expect(await ball.getAttribute("cy")).toBe(rest);
  });
});

test.describe("flipbook on a touch screen", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
  test("a tap starts it, another stops it", async ({ page }) => {
    await page.goto("/studio");
    const book = page.locator(".scene .toy-flipbook .book");
    await book.tap();
    await expect(book).toHaveAttribute("aria-pressed", "true");
    await book.tap();
    await expect(book).toHaveAttribute("aria-pressed", "false");
  });
});

test("hovering the piggy bank on home drops a coin and counts it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const pig = page.locator('#rooms .room[data-room="vault"] .room-toy');
  await pig.hover();
  await expect(pig.locator(".coin")).toHaveCount(1);
  await expect(pig.locator(".balance")).toHaveText("$11");
  await page.mouse.move(5, 5);
  await pig.hover();
  await expect(pig.locator(".balance")).toHaveText("$22");
});

for (const [where, url, scope] of [
  ["Library page", "/library", ".scene"],
  ["home floor plan", "/", '#rooms .room[data-room="library"]'],
] as const) {
  test(`hovering a book's bottom edge keeps it up instead of flickering (${where})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(url);
    const book = page.locator(`${scope} .toy-bookshelf .book`).nth(2);
    await book.scrollIntoViewIfNeeded();
    const box = (await book.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 2);
    // Sample the book's lift for a second: once up it must stay up, with no drops in between.
    const lifts: number[] = [];
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(80);
      // A real hand is never perfectly still: jiggle by a pixel.
      await page.mouse.move(box.x + box.width / 2 + (i % 2), box.y + box.height - 2);
      lifts.push(await book.evaluate((b) => {
        const art = (b.querySelector(".spine") ?? b) as HTMLElement;
        return Math.round(new DOMMatrix(getComputedStyle(art).transform).m42);
      }));
    }
    const settled = lifts.slice(4);
    expect(settled.every((y) => y === settled[0])).toBe(true);
    expect(settled[0]).toBeLessThan(-5);
  });
}
