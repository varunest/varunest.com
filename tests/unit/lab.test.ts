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
