import books from "../data/books.json";
import projects from "../data/projects.json";
import { getPublishedPosts, type Post } from "./posts";
import { ROOMS, isLit, type Room, type RoomId } from "./rooms";

export interface RoomState extends Room {
  lit: boolean;
  posts: Post[];
  /** e.g. "43 books", "4 projects", "1 piece", "2 posts". */
  count: string;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function countLabel(id: RoomId, posts: number): string {
  if (id === "library" && books.length > 0) return plural(books.filter((b: { shelf?: string }) => b.shelf === "read").length, "book");
  if (id === "workshop" && projects.length > 0) return plural(projects.length, "project");
  if (id === "studio") return plural(posts, "piece");
  return plural(posts, "post");
}

/** Every room with what's in it, in house order. */
export async function getHouse(): Promise<RoomState[]> {
  const all = await getPublishedPosts();
  return ROOMS.map((room) => {
    const posts = all.filter((p) => p.data.room === room.id);
    const lit = isLit(room, { posts: posts.length, books: books.length, projects: projects.length });
    return { ...room, lit, posts, count: countLabel(room.id, posts.length) };
  });
}
