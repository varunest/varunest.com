import { describe, expect, it } from "vitest";
import { resolveToy } from "../../src/lib/toy";

describe("resolveToy", () => {
  it("an explicit toy wins over the tags", () => {
    expect(resolveToy({ toy: "server-rack", tags: ["book-review"] })).toBe("server-rack");
  });
  it('"none" turns the toy off', () => {
    expect(resolveToy({ toy: "none", tags: ["book-review"] })).toBeNull();
  });
  it("book-review posts get the bookshelf", () => {
    expect(resolveToy({ tags: ["books", "book-review"] })).toBe("bookshelf");
  });
  it("homelab posts get the server rack", () => {
    expect(resolveToy({ tags: ["homelab"] })).toBe("server-rack");
  });
  it("everything else gets the pendulum", () => {
    expect(resolveToy({ tags: ["investing"] })).toBe("pendulum");
    expect(resolveToy({ tags: [] })).toBe("pendulum");
  });
});

import { stepPendulum } from "../../src/lib/toy";

describe("stepPendulum", () => {
  it("is pulled back toward straight down", () => {
    const next = stepPendulum({ angle: 0.8, velocity: 0 });
    expect(next.velocity).toBeLessThan(0);
    expect(next.angle).toBeLessThan(0.8);
  });
  it("loses energy and settles", () => {
    let s = { angle: 0.8, velocity: 0 };
    for (let i = 0; i < 20000; i++) s = stepPendulum(s);
    expect(Math.abs(s.angle)).toBeLessThan(0.05);
  });
});
