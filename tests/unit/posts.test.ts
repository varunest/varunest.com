import { describe, expect, it } from "vitest";
import { legacyId } from "../../src/lib/posts";

describe("posts helpers", () => {
  it("uses legacySlug for legacy ids when present", () => {
    expect(
      legacyId({
        id: "jrd-tata-biography-beyond-the-last-blue-mountain",
        data: { legacySlug: "a-biography-that-beautifully-captures-different-facets-of-jrd-tata's-life" },
      } as never),
    ).toBe("https://varunest.com/blog/a-biography-that-beautifully-captures-different-facets-of-jrd-tata's-life");
  });
  it("falls back to the id", () => {
    expect(legacyId({ id: "when-universe-stands-still", data: {} } as never)).toBe(
      "https://varunest.com/blog/when-universe-stands-still",
    );
  });
});
