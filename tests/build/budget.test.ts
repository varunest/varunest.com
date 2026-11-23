import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const DIST = "dist";
const LIMIT = 15360;

function scriptBytes(): { total: number; parts: string[] } {
  const html = readFileSync(join(DIST, "index.html"), "utf8");
  const parts: string[] = [];
  let total = 0;
  const add = (label: string, body: string | Buffer) => {
    const n = gzipSync(body).length;
    total += n;
    parts.push(`${label}: ${n}`);
  };
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (/type=["']?(application\/ld\+json|application\/json)/i.test(attrs)) continue;
    const src = attrs.match(/\bsrc=["']([^"']+)["']/)?.[1];
    if (src) {
      if (/^https?:\/\//.test(src)) continue;
      add(src, readFileSync(join(DIST, src.replace(/^\//, ""))));
    } else if (m[2].trim()) {
      add("inline", m[2]);
    }
  }
  return { total, parts };
}

describe("JS budget", () => {
  it("home page ships under 15 KB of gzipped JavaScript", () => {
    const { total, parts } = scriptBytes();
    console.log(`Home JS gzipped total: ${total} bytes (${parts.join(", ")})`);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(LIMIT);
  });
});
