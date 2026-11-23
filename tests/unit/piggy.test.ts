import { describe, expect, it } from "vitest";
import { formatMoney, nextBalance } from "../../src/lib/piggy";

describe("piggy bank", () => {
  it("adds a coin of 10 and compounds by 8%", () => {
    expect(nextBalance(0)).toBeCloseTo(10.8, 10);
  });
  it("reaches $35 after three coins", () => {
    let b = 0;
    for (let i = 0; i < 3; i++) b = nextBalance(b);
    expect(formatMoney(b)).toBe("$35");
  });
  it("formats thousands with commas", () => {
    expect(formatMoney(1234.4)).toBe("$1,234");
  });
});
