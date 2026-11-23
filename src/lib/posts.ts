import type { CollectionEntry } from "astro:content";
import type { RoomId } from "./rooms";

export type Post = CollectionEntry<"posts">;

export async function getPublishedPosts(): Promise<Post[]> {
  // Dynamic import keeps the pure helpers testable outside the Astro runtime.
  const { getCollection } = await import("astro:content");
  const posts = await getCollection("posts", (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postUrl(post: { id: string; data: { room: RoomId } }): string {
  return `/${post.data.room}/${post.id}`;
}

export function legacyId(entry: Pick<Post, "id" | "data">): string {
  return `https://varunest.com/blog/${entry.data.legacySlug ?? entry.id}`;
}

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export function formatDate(d: Date): string {
  return fmt.format(d);
}
