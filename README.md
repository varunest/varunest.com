# varunest.com

Source for [www.varunest.com](https://www.varunest.com), Varun Verma's site: a house of rooms (Library, Workshop, Studio, Vault, Server Closet, Living Room), each holding a kind of writing, with a small toy to play with in every room. It is a static [Astro](https://astro.build) site served by Cloudflare Workers (static assets), with Giscus comments and Cloudflare Web Analytics.

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

`npm test` runs `vitest` unit tests, a build, `vitest` build tests (feeds, pages, rooms, sitemap, scaffold, JS budget of 15 KB gzipped on the home page), and the Playwright suite in `tests/e2e` (including an axe accessibility sweep in light and dark). The redirect and Giscus suites use their own configs and are not part of `npm test`, so run all three before merging.

## Rooms

Rooms are defined once in `src/lib/rooms.ts` (id, name, blurb, colour, toy), in floor-plan order. A room is **lit** when it has something in it (the Library when it has books or posts, the Workshop when it has projects or posts, every other room when it has a post). Lit rooms get a page at `/<room>` and a "Go in" link on the home floor plan; dim rooms show "Lights off" and have no page.

To add a room, add an entry to `ROOMS`, give it a grid area in `src/components/rooms/FloorPlan.astro`, and pick or build a toy in `src/components/toys/`.

## Add a post

Create `src/content/posts/<slug>.md` (or `.mdx`). It lives at `/<room>/<slug>`. Put images in `src/assets/posts/` and reference them relatively so Astro optimises them.

```md
---
title: My post title
date: 2026-11-22
summary: One sentence, used for the description and feeds.
room: library          # library | workshop | studio | vault | server-closet | living-room
rating: 5/5            # optional (book reviews)
image: ../../assets/posts/art.jpg   # Studio posts: the artwork hung in the gallery
medium: Digital painting, Procreate # Studio posts: shown on the placard
tags:                  # optional metadata
- book-review
legacySlug: old-slug   # optional, only for posts that existed under another URL
draft: false           # optional, default false; true hides it
---

Body in Markdown.
```

- Publishing the first post in a dim room lights it: its page, floor-plan link and toy switch on.
- `legacySlug` keeps the post's original Atom id; the redirect itself lives in `public/_redirects`.
- `draft: true` keeps the post out of the site, the room's count, the sitemap and the feeds.
- Do not rename a published slug or move a post to another room without adding a redirect: Giscus ties comments to the path.

## Refresh the Library

The Library is built from a Goodreads export:

1. Goodreads → My Books → Import and export → Export library.
2. `node scripts/import-goodreads.ts <path-to-goodreads_library_export.csv>`

The script reads the CSV where it is (never copy it into the repo) and writes `src/data/books.json` with only: id, title, author, rating, date read, shelf (`read` or `currently-reading`), cover file, review text and the matching blog review. Private notes, owned copies, shelves, ISBNs and to-read books are never written. Covers come from Open Library into `src/assets/books/`; existing covers are kept, so re-running only fetches new ones. Books without a cover get a drawn one.

## Workshop projects

Edit `src/data/projects.json`: name, role, years, description, images (files in `src/assets/projects/`, each with alt text), chips, links, and optionally a GitHub `repo` whose star count is fetched at build time (`starsFallback` is used if GitHub is unreachable). `feature: true` makes a project the wide card at the top. Animated GIFs are served as-is so they keep moving.

## Deploy

Pushing to `master` triggers Cloudflare Workers Builds: `npm run build`, then `npx wrangler deploy`. `wrangler.jsonc` names the Worker and serves `dist/` as static assets (`auto-trailing-slash`, `404-page`). Other branches get preview URLs. Redirects live in `public/_redirects`, copied into `dist/` at build.

### Comments (Giscus)

`src/lib/giscus.ts` has blank `repoId` and `categoryId`. While either is blank, no comments section is rendered. After enabling GitHub Discussions (see manual step 5), copy the two IDs from [giscus.app](https://giscus.app) into `GISCUS.repoId` and `GISCUS.categoryId`, and push. They are public values.

## Manual steps (Cloudflare, GitHub, DNS)

1. **Create the Worker:** Cloudflare dashboard → Workers & Pages → Create → Import a repository → `varunest/varunest.com`. Build command `npm run build`; deploy command `npx wrangler deploy`; root directory `/`; production branch `master`. The committed `wrangler.jsonc` supplies the name and assets directory. Open the preview URL for the `revamp-astro` branch and check home, a room, a post, `/atom.xml`, a redirect.
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
| `/blog/<slug>` and `/blog/<slug>.html` | 301 to `/<room>/<slug>` |
| `/blog/a-biography-that-beautifully-captures-different-facets-of-jrd-tata's-life` (raw and `%27`, with or without `.html`) | 301 to `/library/jrd-tata-biography-beyond-the-last-blue-mountain` |
| `/blog/a-professor's-reminisce-and-crux-of-his-teachings` (raw and `%27`, with or without `.html`) | 301 to `/library/the-last-lecture-review` |
| `/blog`, `/blog/` | 301 to `/` |
| `/tag/book-review/` | 301 to `/library` |
| `/tag/art/`, `/tag/procreate/` | 301 to `/studio` |
| `/tag/investment/` | 301 to `/vault` |
| `/tag/website/`, `/tag/design/`, `/tag/jekyll/` | 301 to `/workshop` |
| `/tag/<tag>` without the slash | Same targets |
| `/atom.xml` | Same URL, Atom feed |
| `/resume.pdf` | Same URL |
| `/404`, `/404/` | Not-found page |
| `/google66f372b7d00add35.html` | Kept, so Search Console verification survives |
| `/images/*` | Kept at the same paths (copied unchanged into `public/images/`); posts use optimised copies |
| Old favicons, `manifest.webmanifest`, `browserconfig.xml` | Replaced by new files at the same paths |
| `/client/bundle.js`, `/css/*`, `/images/fancybox/*` | Gone (404) |

## License

Copyright (c) Varun Verma.
