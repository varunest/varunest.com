import type { CollectionEntry } from "astro:content";

export type LabEntry = CollectionEntry<"lab">;

export async function getPublishedLab(): Promise<LabEntry[]> {
  // Dynamic import keeps the pure helpers testable outside the Astro runtime.
  const { getCollection } = await import("astro:content");
  const entries = await getCollection("lab", (e) => !e.data.draft);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function hasLab(): Promise<boolean> {
  return (await getPublishedLab()).length > 0;
}

/** One `/lab/` path when there is something to show, none otherwise. */
export function labIndexPaths(entries: unknown[]): { params: { index: undefined } }[] {
  return entries.length > 0 ? [{ params: { index: undefined } }] : [];
}
