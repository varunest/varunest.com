import { describe, expect, it } from "vitest";
import { GREETINGS, pickGreeting } from "../../src/lib/greetings";

describe("pickGreeting", () => {
  it("never repeats the greeting currently shown", () => {
    for (const g of GREETINGS) {
      for (const r of [0, 0.25, 0.5, 0.75, 0.9999]) {
        expect(pickGreeting(g.text, () => r).text).not.toBe(g.text);
      }
    }
  });

  it("can return every greeting other than the current one", () => {
    const seen = new Set<string>();
    const n = GREETINGS.length - 1;
    for (let i = 0; i < n; i++) seen.add(pickGreeting("Hello!", () => i / n).text);
    expect(seen.size).toBe(n);
    expect(seen.has("Hello!")).toBe(false);
  });

  it("every greeting has a language tag", () => {
    for (const g of GREETINGS) expect(g.lang).toMatch(/^[a-z]{2,3}$/);
  });
});
