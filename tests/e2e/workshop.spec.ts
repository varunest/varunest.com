import { test, expect } from "@playwright/test";

test("four project cards, Videoder featured with three images", async ({ page }) => {
  await page.goto("/workshop");
  const cards = page.locator(".projects .project");
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toHaveClass(/feature/);
  await expect(cards.first()).toContainText("Videoder");
  await expect(cards.first().locator("img, video")).toHaveCount(3);
});

test("every project image has alt text", async ({ page }) => {
  await page.goto("/workshop");
  const alts = await page
    .locator(".projects img, .projects video")
    .evaluateAll((els) => els.map((e) => e.getAttribute(e.tagName === "VIDEO" ? "aria-label" : "alt") ?? ""));
  expect(alts.length).toBeGreaterThan(0);
  for (const a of alts) expect(a.trim()).not.toBe("");
});

test("open-source projects show their star counts and Uber is not a shipped project", async ({ page }) => {
  await page.goto("/workshop");
  await expect(page.locator(".project", { hasText: "Spark Button" })).toContainText("★");
  await expect(page.locator(".projects")).not.toContainText("Uber");
  await expect(page.locator("main")).toContainText("Earlier experiments: Crazy Driver, Movie Memo, Lazy Music and 9Facts.");
});

test("animated demos are small looping videos, not GIFs", async ({ page }) => {
  await page.goto("/workshop");
  const video = page.locator(".project", { hasText: "Spark Button" }).locator("video");
  await expect(video).toHaveCount(1);
  for (const attr of ["autoplay", "loop", "playsinline", "poster"]) await expect(video).toHaveAttribute(attr, /.*/);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  const types = await video.locator("source").evaluateAll((s) => s.map((e) => e.getAttribute("type")));
  expect(types).toEqual(["video/webm", "video/mp4"]);
  const html = await page.content();
  expect(html).not.toMatch(/\.gif\b/);
});

test("demo videos stay still for people who prefer reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/workshop");
  const paused = await page.locator(".projects video").evaluateAll((vs) => vs.map((v) => (v as HTMLVideoElement).paused));
  expect(paused.length).toBe(3);
  expect(paused.every(Boolean)).toBe(true);
});
