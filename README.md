# varunest.com

Source for [www.varunest.com](https://www.varunest.com), Varun Verma's site: home page, blog, and a lab for small projects. It is a static [Astro](https://astro.build) site served by Cloudflare Workers (static assets), with Giscus comments and Cloudflare Web Analytics.

## Requirements

- Node 24 (the `engines` field allows `>=22.23.4`)

## Run it

```bash
npm install
npm run dev        # dev server on http://localhost:4321
npm run build      # astro check + astro build, output in dist/
npm run preview    # serve dist/ locally
npm run cf:dev     # serve dist/ through wrangler dev (port 8787), applies _redirects
```

## Tests

```bash
npm test                                          # unit, build, then the main Playwright suite
npx playwright test -c playwright.cf.config.ts    # redirects, against wrangler dev (port 8787)
npx playwright test -c playwright.giscus.config.ts # comments, against a separate dist-giscus build (port 4323)
```

`npm test` runs `vitest` unit tests, a build, `vitest` build tests (feeds, pages, lab, scaffold, JS budget of 15 KB gzipped on the home page), and the Playwright suite in `tests/e2e` (including an axe accessibility sweep in light and dark). The redirect and Giscus suites use their own configs and are not part of `npm test`, so run all three before merging.

## Add a post

Create `src/content/posts/<slug>.md` (or `.mdx`). The file name is the URL: `/blog/<slug>`. Put images in `src/assets/posts/` and reference them relatively so Astro optimises them.

```md
---
title: My post title
date: 2026-11-22
summary: One sentence, used for the description and feeds.
tags:
- book-review
rating: 5/5            # optional
toy: pendulum          # optional: pendulum | bookshelf | server-rack | none
legacySlug: old-slug   # optional, only for posts that existed under another URL
draft: false           # optional, default false; true hides it from the build
---

Body in Markdown.
```

- `toy` picks the interactive toy beside the post. If omitted it is chosen by tag, else the pendulum. `none` turns it off.
- `legacySlug` records an old URL that now redirects here (the redirect itself lives in `public/_redirects`).
- `draft: true` keeps the post out of the site, tag pages, sitemap and feeds.
- Do not rename a published slug: Giscus ties comments to the path.

## Add a lab entry

Create `src/content/lab/<slug>.md`. It is listed at `/lab` and lives at `/lab/<slug>` (no trailing slash, matching the built `lab.html` and `lab/<slug>.html`). The home page shows the latest three. The Lab link only shows in the nav once at least one published entry exists.

```md
---
title: Project name
date: 2026-11-22
summary: One sentence.
tags:
- tools
repo: https://github.com/varunest/project   # optional; shown as a Source button
demo: https://example.com/demo              # optional
cover: ../../assets/lab/cover.png           # optional image, shown on the entry page
toy: none                                   # optional, same values as posts; default is the pendulum
draft: false                                # optional
---

Write-up in Markdown.
```

## Deploy

Pushing to `master` triggers Cloudflare Workers Builds: `npm run build`, then `npx wrangler deploy`. `wrangler.jsonc` names the Worker and serves `dist/` as static assets (`auto-trailing-slash`, `404-page`). Other branches get preview URLs. Redirects live in `public/_redirects`, copied into `dist/` at build.

### Comments (Giscus)

`src/lib/giscus.ts` has blank `repoId` and `categoryId`. While either is blank, no comments section is rendered. After enabling GitHub Discussions (see manual step 5), copy the two IDs from [giscus.app](https://giscus.app) into `GISCUS.repoId` and `GISCUS.categoryId`, and push. They are public values.

## Manual steps (Cloudflare, GitHub, DNS)

1. **Create the Worker:** Cloudflare dashboard → Workers & Pages → Create → Import a repository → `varunest/varunest.com`. Build command `npm run build`; deploy command `npx wrangler deploy`; root directory `/`; production branch `master`. The committed `wrangler.jsonc` supplies the name and assets directory. Open the preview URL for the `revamp-astro` branch and check home, a post, `/atom.xml`, a redirect.
2. **Before touching DNS:** DNS → Records → screenshot or export the current `A`/`AAAA`/`CNAME` records for `varunest.com` and `www` (they point at the old server), for rollback.
3. **Custom domain:** Worker → Settings → Domains & Routes → Add custom domain `www.varunest.com`. Then Rules → Redirect Rules → create: when hostname equals `varunest.com`, dynamic redirect to `concat("https://www.varunest.com", http.request.uri.path)`, status 301, preserve query string. Ensure the apex has a proxied DNS record (orange cloud) so the rule fires.
4. **Analytics:** Analytics & Logs → Web Analytics → add site `www.varunest.com` (automatic setup on a proxied domain).
5. **Comments:** GitHub repo Settings → enable Discussions, create category "Comments" (Announcement type), install the Giscus app, then copy `repoId` and `categoryId` from giscus.app into `src/lib/giscus.ts` and push.
6. **Résumé:** replace `public/resume.pdf` with the current one.
7. **After a week:** if traffic and Search Console look normal, shut down the old server.

## Old links and redirects

| Old URL | New behaviour |
|---|---|
| `varunest.com/*` | 301 to `https://www.varunest.com/*` (Cloudflare redirect rule) |
| `/blog/<slug>` | Same URL, served directly |
| `/blog/<slug>.html` | 301 to `/blog/<slug>` (explicit rule; the platform default would be a 307) |
| `/blog/a-biography-that-beautifully-captures-different-facets-of-jrd-tata's-life` (and the `%27` form) | 301 to `/blog/jrd-tata-biography-beyond-the-last-blue-mountain` |
| `/blog/a-professor's-reminisce-and-crux-of-his-teachings` (and the `%27` form) | 301 to `/blog/the-last-lecture-review` |
| `/tag/<tag>/` | Same URL, served directly (all 7 existing tags) |
| `/atom.xml` | Same URL, Atom feed |
| `/resume.pdf` | Same URL |
| `/404`, `/404/` | Not-found page |
| `/google66f372b7d00add35.html` | Kept, so Search Console verification survives |
| `/images/*` | Kept at the same paths (copied unchanged into `public/images/`); posts use optimised copies |
| Old favicons, `manifest.webmanifest`, `browserconfig.xml` | Replaced by new files at the same paths |
| `/client/bundle.js`, `/css/*`, `/images/fancybox/*` | Gone (404) |

## License

Copyright (c) Varun Verma.
