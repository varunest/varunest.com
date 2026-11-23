import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { XMLParser } from "fast-xml-parser";

const lit: [string, string][] = [
  ["library", "The Library"],
  ["workshop", "The Workshop"],
  ["studio", "The Studio"],
  ["vault", "The Vault"],
];
const dim = ["server-closet", "living-room"];

describe("room pages", () => {
  it.each(lit)("builds %s.html with its canonical and name", (id, name) => {
    const html = readFileSync(`dist/${id}.html`, "utf8");
    expect(html).toContain(`<link rel="canonical" href="https://www.varunest.com/${id}"`);
    expect(html).toMatch(new RegExp(`<h1[^>]*>${name}</h1>`));
  });
  it.each(dim)("builds no page for the dim room %s", (id) => {
    expect(existsSync(`dist/${id}.html`)).toBe(false);
    expect(existsSync(`dist/${id}`)).toBe(false);
  });
  it("lists only home, lit rooms and posts in the sitemap", () => {
    const urls = new XMLParser().parse(readFileSync("dist/sitemap-0.xml", "utf8")).urlset.url;
    const paths = (Array.isArray(urls) ? urls : [urls]).map((u: { loc: string }) => new URL(u.loc).pathname).sort();
    expect(paths).toEqual(
      [
        "/",
        "/library",
        "/library/jrd-tata-biography-beyond-the-last-blue-mountain",
        "/library/the-last-lecture-review",
        "/studio",
        "/studio/when-universe-stands-still",
        "/vault",
        "/vault/organizing-budget-and-systematic-investment-planning",
        "/workshop",
        "/workshop/reworking-website-and-setting-up-blog-using-jekyll",
      ].sort(),
    );
  });
});
