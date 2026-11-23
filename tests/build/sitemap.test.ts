import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { XMLParser } from "fast-xml-parser";

const locs: string[] = (() => {
  const xml = readFileSync("dist/sitemap-0.xml", "utf8");
  const urls = new XMLParser().parse(xml).urlset.url;
  return (Array.isArray(urls) ? urls : [urls]).map((u: { loc: string }) => u.loc);
})();

/** Cloudflare auto-trailing-slash: x.html serves /x, dir/index.html serves /dir/. */
function fileFor(pathname: string): { file: string; slash: boolean } | null {
  if (pathname === "/") return { file: "dist/index.html", slash: true };
  const bare = pathname.replace(/\/$/, "");
  if (existsSync(`dist${bare}.html`)) return { file: `dist${bare}.html`, slash: false };
  if (existsSync(`dist${bare}/index.html`)) return { file: `dist${bare}/index.html`, slash: true };
  return null;
}

describe("sitemap", () => {
  it("has entries", () => expect(locs.length).toBeGreaterThan(5));
  it.each(locs)("%s equals the canonical of its built page", (loc) => {
    const { pathname } = new URL(loc);
    const hit = fileFor(pathname);
    expect(hit, `no built file for ${pathname}`).not.toBeNull();
    expect(pathname.endsWith("/") || pathname === "/").toBe(hit!.slash);
    const html = readFileSync(hit!.file, "utf8");
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    expect(canonical).toBe(loc);
  });
  it("robots.txt points at the sitemap index", () => {
    expect(readFileSync("dist/robots.txt", "utf8")).toContain("Sitemap: https://www.varunest.com/sitemap-index.xml");
  });
});
