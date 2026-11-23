import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const slugs = [
  "reworking-website-and-setting-up-blog-using-jekyll",
  "organizing-budget-and-systematic-investment-planning",
  "when-universe-stands-still",
  "jrd-tata-biography-beyond-the-last-blue-mountain",
  "the-last-lecture-review",
];
const tags = ["website", "design", "jekyll", "investment", "art", "procreate", "book-review"];

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
}

describe("posts, blog and tag pages", () => {
  it.each(slugs)("builds blog/%s.html", (s) => {
    expect(existsSync(`dist/blog/${s}.html`)).toBe(true);
  });
  it.each(tags)("builds tag page for %s", (t) => {
    expect(existsSync(`dist/tag/${t}/index.html`)).toBe(true);
  });
  it("lists 5 posts newest first on the blog index", () => {
    const html = readFileSync("dist/blog/index.html", "utf8");
    const found = [...html.matchAll(/href="\/blog\/([^"\/]+)"/g)].map((m) => m[1]);
    const unique = found.filter((s, i) => found.indexOf(s) === i && slugs.includes(s));
    expect(unique).toEqual([...slugs].reverse());
  });
  it("leaves no Jekyll leftovers in built HTML", () => {
    for (const f of htmlFiles("dist")) {
      const html = readFileSync(f, "utf8");
      expect(html, f).not.toContain("{:target");
      expect(html, f).not.toContain("<!--break-->");
    }
  });
});

describe("comments", () => {
  it("renders no comments section until Giscus ids are filled in", () => {
    for (const s of slugs) {
      expect(readFileSync(`dist/blog/${s}.html`, "utf8")).not.toContain('id="comments"');
    }
  });
});
