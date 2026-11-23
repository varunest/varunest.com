import { afterEach, describe, expect, it, vi } from "vitest";
import { getStars } from "../../src/lib/github";

const ok = (n: number) => (async () => new Response(JSON.stringify({ stargazers_count: n }), { status: 200 })) as typeof fetch;

afterEach(() => vi.useRealTimers());

describe("getStars", () => {
  it("returns the API value on 200 and asks the right URL", async () => {
    const f = vi.fn(ok(1234));
    expect(await getStars("a/b", 5, f as never)).toBe(1234);
    expect(String(f.mock.calls[0][0])).toBe("https://api.github.com/repos/a/b");
  });
  it("returns the fallback on 500", async () => {
    const f = (async () => new Response("no", { status: 500 })) as typeof fetch;
    expect(await getStars("a/b", 5, f)).toBe(5);
  });
  it("returns the fallback when fetch throws", async () => {
    const f = (async () => { throw new Error("offline"); }) as typeof fetch;
    expect(await getStars("a/b", 5, f)).toBe(5);
  });
  it("returns the fallback when the body is not usable", async () => {
    const f = (async () => new Response("{}", { status: 200 })) as typeof fetch;
    expect(await getStars("a/b", 5, f)).toBe(5);
  });
  it("returns the fallback when fetch never resolves (5s timeout)", async () => {
    vi.useFakeTimers();
    const f = (() => new Promise(() => {})) as typeof fetch;
    const p = getStars("a/b", 5, f);
    await vi.advanceTimersByTimeAsync(5001);
    expect(await p).toBe(5);
  });
});
