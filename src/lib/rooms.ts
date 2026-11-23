export type RoomId = "library" | "workshop" | "studio" | "vault" | "server-closet" | "living-room";
export type ToyName = "bookshelf" | "gears" | "splatter" | "piggy" | "packets" | "record";

export interface Room {
  id: RoomId;
  name: string;
  blurb: string;
  colour: string;
  toy: ToyName;
}

/** The house, in floor-plan and phone-stacking order. */
export const ROOMS: Room[] = [
  { id: "library", name: "The Library", blurb: "Books I've read", colour: "#0B7A75", toy: "bookshelf" },
  { id: "workshop", name: "The Workshop", blurb: "Things I've shipped", colour: "#FF6B4A", toy: "gears" },
  { id: "studio", name: "The Studio", blurb: "Art and drawing", colour: "#FFC857", toy: "splatter" },
  { id: "vault", name: "The Vault", blurb: "Money and investing", colour: "#8AB4FF", toy: "piggy" },
  { id: "server-closet", name: "Server Closet", blurb: "Home lab", colour: "#9AD1B9", toy: "packets" },
  { id: "living-room", name: "The Living Room", blurb: "Everyday writing", colour: "#E9A6C2", toy: "record" },
];

export const ROOM_IDS = ROOMS.map((r) => r.id) as [RoomId, ...RoomId[]];

export function roomById(id: RoomId): Room {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`Unknown room: ${id}`);
  return room;
}

export function roomUrl(id: RoomId): string {
  return `/${id}`;
}

export interface RoomCounts {
  posts: number;
  books: number;
  projects: number;
}

/** A room is lit when it has something in it. */
export function isLit(room: Room, c: RoomCounts): boolean {
  if (room.id === "library") return c.books > 0 || c.posts > 0;
  if (room.id === "workshop") return c.projects > 0 || c.posts > 0;
  return c.posts > 0;
}
