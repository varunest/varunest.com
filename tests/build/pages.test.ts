import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const posts: [string, string][] = [
  ["workshop", "reworking-website-and-setting-up-blog-using-jekyll"],
  ["vault", "organizing-budget-and-systematic-investment-planning"],
  ["studio", "when-universe-stands-still"],
  ["library", "jrd-tata-biography-beyond-the-last-blue-mountain"],
  ["library", "the-last-lecture-review"],
];

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
}

describe("posts under their rooms", () => {
  it.each(posts)("builds %s/%s.html", (room, slug) => {
    expect(existsSync(`dist/${room}/${slug}.html`)).toBe(true);
  });
  it("builds no blog, tag or lab pages", () => {
    for (const d of ["dist/blog", "dist/tag", "dist/lab"]) expect(existsSync(d), d).toBe(false);
  });
  it("has no internal links to old blog or tag urls", () => {
    for (const f of htmlFiles("dist")) {
      const html = readFileSync(f, "utf8");
      expect(html, f).not.toMatch(/href="\/(blog|tag)\//);
    }
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
    for (const [room, s] of posts) {
      expect(readFileSync(`dist/${room}/${s}.html`, "utf8")).not.toContain('id="comments"');
    }
  });
});
