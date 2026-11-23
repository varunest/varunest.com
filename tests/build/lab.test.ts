import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lab hidden until used", () => {
  it("does not build /lab/ with zero entries", () => {
    expect(existsSync("dist/lab")).toBe(false);
  });
});
