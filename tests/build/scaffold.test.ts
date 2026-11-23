import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("scaffold", () => {
  it("builds the home page", () => {
    expect(existsSync("dist/index.html")).toBe(true);
  });
  it("does not ship dead server or client code", () => {
    expect(existsSync("dist/_server")).toBe(false);
    expect(existsSync("dist/client")).toBe(false);
  });
  it("keeps old image paths", () => {
    expect(existsSync("dist/images/varun.jpg")).toBe(true);
  });
});
