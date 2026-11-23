import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  outDir: process.env.ASTRO_OUT_DIR ?? "dist",
  site: "https://www.varunest.com",
  build: { format: "preserve" },
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap({
      // Directory-index pages (dist/blog/index.html, dist/tag/<t>/index.html) are served at
      // "/dir/" on Cloudflare; "/dir" would 307. File pages (blog/<slug>.html) have no slash.
      serialize(item) {
        const u = new URL(item.url);
        if (/^\/(blog|tag\/[^/]+)$/.test(u.pathname)) item.url = `${item.url}/`;
        return item;
      },
    })],
});
