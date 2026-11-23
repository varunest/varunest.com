import { describe, expect, it } from "vitest";
import { labIndexPaths } from "../../src/lib/lab";

describe("labIndexPaths", () => {
  it("is empty with no entries", () => {
    expect(labIndexPaths([])).toEqual([]);
  });
  it("is one path with entries", () => {
    expect(labIndexPaths([{ id: "x" }] as never)).toHaveLength(1);
  });
});

import { labUrl } from "../../src/lib/lab";

describe("labUrl", () => {
  it("is /lab for the index, no trailing slash", () => {
    expect(labUrl()).toBe("/lab");
  });
  it("is /lab/<id> for an entry, no trailing slash", () => {
    expect(labUrl("sparkles")).toBe("/lab/sparkles");
  });
});
