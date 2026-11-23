import { describe, it, expect } from "vitest";
import { readTheme, writeTheme } from "../../src/lib/theme";

const store = (v: string | null) => ({ getItem: () => v }) as unknown as Storage;
const throwing = {
  getItem() { throw new Error("blocked"); },
  setItem() { throw new Error("blocked"); },
} as unknown as Storage;

describe("readTheme", () => {
  it("stored value wins", () => expect(readTheme(store("dark"), false)).toBe("dark"));
  it("ignores invalid stored values", () => expect(readTheme(store("purple"), false)).toBe("light"));
  it("falls back to the device setting", () => {
    expect(readTheme(store(null), true)).toBe("dark");
    expect(readTheme(null, false)).toBe("light");
  });
  it("survives a throwing storage", () => expect(readTheme(throwing, true)).toBe("dark"));
});

describe("writeTheme", () => {
  it("does not throw with a throwing storage", () => expect(() => writeTheme(throwing, "dark")).not.toThrow());
  it("does not throw with null storage", () => expect(() => writeTheme(null, "dark")).not.toThrow());
});
