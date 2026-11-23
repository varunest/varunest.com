import { test, expect, type Page } from "@playwright/test";

test.use({ colorScheme: "light" });


async function firstPostPath(page: Page): Promise<string> {
  await page.goto("/blog/");
  const href = await page.locator('a[href^="/blog/"]:not([href="/blog/"])').first().getAttribute("href");
  return href!;
}

async function stubGiscus(page: Page): Promise<string[]> {
  const hits: string[] = [];
  await page.route("https://giscus.app/**", (route) => {
    hits.push(route.request().url());
    return route.fulfill({
      contentType: "text/javascript",
      body: `
        const f = document.createElement("iframe");
        f.className = "giscus-frame";
        document.currentScript.parentElement.appendChild(f);
        window.__msgs = [];
        f.contentWindow.postMessage = (m, o) => window.__msgs.push([m, o]);
      `,
    });
  });
  return hits;
}

test("giscus loads only after scrolling to the comments", async ({ page }) => {
  const hits = await stubGiscus(page);
  const path = await firstPostPath(page);
  await page.goto(path);
  await expect(page.locator("#comments")).toHaveCount(1);
  await expect(page.locator("#comments h2")).toHaveText("Comments");
  await expect(page.locator("#comments")).toContainText("Sign in with GitHub to join in.");
  await page.waitForTimeout(500);
  expect(hits).toEqual([]);

  await page.locator("#comments").scrollIntoViewIfNeeded();
  await expect.poll(() => hits.length).toBe(1);
  expect(hits[0]).toBe("https://giscus.app/client.js");

  const attrs = await page.locator("#comments script[src]").evaluate((s) => ({ ...(s as HTMLElement).dataset, cross: s.getAttribute("crossorigin") }));
  expect(attrs).toMatchObject({
    repo: "varunest/varunest.com",
    repoId: "R_test",
    category: "Comments",
    categoryId: "DIC_test",
    mapping: "pathname",
    strict: "1",
    reactionsEnabled: "1",
    inputPosition: "top",
    lang: "en",
    loading: "lazy",
    theme: "light",
    cross: "anonymous",
  });
});

test("pulling the cord sends the theme to the giscus iframe", async ({ page }) => {
  await stubGiscus(page);
  await page.goto(await firstPostPath(page));
  await page.locator("#comments").scrollIntoViewIfNeeded();
  await expect(page.locator("iframe.giscus-frame")).toHaveCount(1);
  await page.evaluate(() => document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: "dark" } })));
  const msgs = await page.evaluate(() => (window as any).__msgs);
  expect(msgs.at(-1)).toEqual([{ giscus: { setConfig: { theme: "dark_dimmed" } } }, "https://giscus.app"]);
});

test("pages without a comments section stay clean", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#comments")).toHaveCount(0);
});
