import { describe, expect, it } from "vitest";
import { ROOMS, isLit, roomById, roomUrl } from "../../src/lib/rooms";
import { postUrl } from "../../src/lib/posts";

describe("rooms", () => {
  it("lists the rooms in house order", () => {
    expect(ROOMS.map((r) => r.id)).toEqual(["library", "workshop", "studio", "vault", "server-closet", "living-room"]);
  });
  it("builds room urls", () => {
    expect(roomUrl("library")).toBe("/library");
    expect(roomById("vault").name).toBe("The Vault");
  });
  it("builds post urls under the post's room", () => {
    expect(postUrl({ id: "x", data: { room: "vault" } })).toBe("/vault/x");
  });
  it("lights the library with books only", () => {
    expect(isLit(roomById("library"), { posts: 0, books: 3, projects: 0 })).toBe(true);
  });
  it("lights the workshop with projects only", () => {
    expect(isLit(roomById("workshop"), { posts: 0, books: 0, projects: 4 })).toBe(true);
  });
  it("keeps a room with nothing in it dim", () => {
    expect(isLit(roomById("vault"), { posts: 0, books: 10, projects: 4 })).toBe(false);
  });
});
