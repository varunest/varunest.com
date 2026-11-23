import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function getPublishedPosts(): Promise<Post[]> {
  // Dynamic import keeps the pure helpers testable outside the Astro runtime.
  const { getCollection } = await import("astro:content");
  const posts = await getCollection("posts", (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postUrl(id: string): string {
  return `/blog/${id}`;
}

export function legacyId(entry: Pick<Post, "id" | "data">): string {
  return `https://varunest.com/blog/${entry.data.legacySlug ?? entry.id}`;
}

export function allTags(posts: Post[]): string[] {
  return [...new Set(posts.flatMap((p) => p.data.tags))].sort();
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, " ");
}

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export function formatDate(d: Date): string {
  return fmt.format(d);
}
