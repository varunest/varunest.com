import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { feedHtml } from "../lib/feed";
import { getPublishedPosts, postUrl } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = (await getPublishedPosts()).slice(0, 20);
  const items = await Promise.all(
    posts.map(async (p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: postUrl(p),
      content: await feedHtml(p),
      categories: p.data.tags,
    })),
  );
  return rss({
    title: "Varun Verma",
    description: "Varun's portfolio, work and writing.",
    site: context.site!,
    trailingSlash: false,
    items,
  });
}
