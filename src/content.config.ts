import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { ROOM_IDS } from "./lib/rooms";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      summary: z.string(),
      room: z.enum(ROOM_IDS),
      tags: z.array(z.string()).default([]),
      rating: z.string().optional(),
      /** Studio posts: the artwork shown in the gallery. */
      image: image().optional(),
      /** Studio posts: e.g. "Digital painting, Procreate". */
      medium: z.string().optional(),
      legacySlug: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
