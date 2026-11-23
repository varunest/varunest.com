import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lab hidden until used", () => {
  it("does not build /lab/ with zero entries", () => {
    expect(existsSync("dist/lab")).toBe(false);
  });
});

import { readFileSync } from "node:fs";

describe("lab links go through labUrl", () => {
  const files = [
    "src/components/Header.astro",
    "src/components/LabCards.astro",
    "src/pages/index.astro",
    "src/pages/lab/[...index].astro",
    "src/pages/lab/[slug].astro",
  ];
  it.each(files)("%s uses labUrl and has no hard-coded /lab/ URL", (f) => {
    const src = readFileSync(f, "utf8");
    expect(src).toContain("labUrl");
    expect(src).not.toMatch(/["'`]\/lab\/?["'`$]/);
    expect(src).not.toMatch(/\/lab\/\$\{/);
  });
  it("cards link with .card-link to labUrl(id)", () => {
    const src = readFileSync("src/components/LabCards.astro", "utf8");
    expect(src).toMatch(/class="card-link" href=\{labUrl\(e\.id\)\}/);
    expect(src).toContain('class="tag"');
  });
});
