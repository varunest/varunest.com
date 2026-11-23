import { readFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", processEntities: true });
const oldIds = [
  "https://varunest.com/blog/reworking-website-and-setting-up-blog-using-jekyll",
  "https://varunest.com/blog/organizing-budget-and-systematic-investment-planning",
  "https://varunest.com/blog/when-universe-stands-still",
  "https://varunest.com/blog/a-biography-that-beautifully-captures-different-facets-of-jrd-tata's-life",
  "https://varunest.com/blog/a-professor's-reminisce-and-crux-of-his-teachings",
];
const arr = <T,>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

describe("atom.xml", () => {
  const feed = parser.parse(readFileSync("dist/atom.xml", "utf8")).feed;
  const entries = arr(feed.entry) as any[];
  it("keeps the original feed id and self link", () => {
    expect(feed.id).toBe("https://varunest.com");
    const self = arr(feed.link).find((l: any) => l["@_rel"] === "self");
    expect(self["@_href"]).toBe("https://www.varunest.com/atom.xml");
  });
  it("has 5 entries with exactly the old ids", () => {
    expect(entries).toHaveLength(5);
    expect(entries.map((e) => e.id).sort()).toEqual([...oldIds].sort());
  });
  it("links to www post urls and has content, summary, updated", () => {
    for (const e of entries) {
      const alt = arr(e.link).find((l: any) => l["@_rel"] === "alternate");
      expect(alt["@_href"]).toMatch(/^https:\/\/www\.varunest\.com\/(library|workshop|studio|vault|server-closet|living-room)\/[^/]+$/);
      expect(String(e.content["#text"]).length).toBeGreaterThan(50);
      expect(e.summary).toBeTruthy();
      expect(e.updated).toMatch(/^\d{4}-\d\d-\d\dT/);
    }
  });
  it("uses absolute image urls in content", () => {
    const html = entries.map((e) => String(e.content["#text"])).join("");
    expect(html).not.toMatch(/(src|href)="\/(?!\/)/);
    expect(html).not.toContain("__ASTRO_IMAGE_");
    expect(html).toMatch(/src="https:\/\/www\.varunest\.com\/_astro\/[^"]+\.webp"/);
  });
});

describe("rss.xml", () => {
  const channel = parser.parse(readFileSync("dist/rss.xml", "utf8")).rss.channel;
  const items = arr(channel.item) as any[];
  it("has 5 items with www links and no trailing slash", () => {
    expect(items).toHaveLength(5);
    for (const i of items) {
      expect(i.link).toMatch(/^https:\/\/www\.varunest\.com\/(library|workshop|studio|vault|server-closet|living-room)\/[^/]+$/);
      expect(i.link.endsWith("/")).toBe(false);
      expect(String(i["content:encoded"]).length).toBeGreaterThan(50);
    }
  });
});
