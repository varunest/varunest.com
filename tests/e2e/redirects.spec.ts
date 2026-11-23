import { test, expect } from "@playwright/test";
import http from "node:http";

const BASE = "http://localhost:8787";
const BIO = "a-biography-that-beautifully-captures-different-facets-of-jrd-tata";
const PROF = "a-professor";

// Sends the request path exactly as written (no client-side encoding).
function raw(path: string): Promise<{ status: number; location?: string; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(BASE + path, { method: "GET" }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, location: res.headers.location, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

const redirects: [string, string][] = [
  [`/blog/${BIO}'s-life`, "/blog/jrd-tata-biography-beyond-the-last-blue-mountain"],
  [`/blog/${BIO}%27s-life`, "/blog/jrd-tata-biography-beyond-the-last-blue-mountain"],
  [`/blog/${PROF}'s-reminisce-and-crux-of-his-teachings`, "/blog/the-last-lecture-review"],
  [`/blog/${PROF}%27s-reminisce-and-crux-of-his-teachings`, "/blog/the-last-lecture-review"],
  [`/blog/${BIO}'s-life.html`, "/blog/jrd-tata-biography-beyond-the-last-blue-mountain"],
  [`/blog/${BIO}%27s-life.html`, "/blog/jrd-tata-biography-beyond-the-last-blue-mountain"],
  [`/blog/${PROF}'s-reminisce-and-crux-of-his-teachings.html`, "/blog/the-last-lecture-review"],
  [`/blog/${PROF}%27s-reminisce-and-crux-of-his-teachings.html`, "/blog/the-last-lecture-review"],
  ["/blog/reworking-website-and-setting-up-blog-using-jekyll.html", "/blog/reworking-website-and-setting-up-blog-using-jekyll"],
  ["/blog/organizing-budget-and-systematic-investment-planning.html", "/blog/organizing-budget-and-systematic-investment-planning"],
  ["/blog/when-universe-stands-still.html", "/blog/when-universe-stands-still"],
  ["/404/", "/404"],
];

for (const [from, to] of redirects) {
  test(`301 ${from}`, async () => {
    const res = await raw(from);
    expect(res.status).toBe(301);
    expect(new URL(res.location!, BASE).pathname).toBe(to);
  });
}

for (const path of [
  "/blog/when-universe-stands-still",
  "/blog/jrd-tata-biography-beyond-the-last-blue-mountain",
  "/blog/the-last-lecture-review",
  "/tag/art/",
  "/atom.xml",
  "/resume.pdf",
  "/images/varun.jpg",
  "/images/posts/last_lecture.jpeg",
  "/favicon.ico",
  "/og.png",
  "/manifest.webmanifest",
]) {
  test(`200 ${path}`, async ({ request }) => {
    const res = await request.get(BASE + path, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
}

// html_handling auto-trailing-slash answers /x.html with a 307 to /x; a _redirects 200 rewrite
// does not override it. The verification file therefore resolves to 200 only after one hop.
test("google verification file resolves to 200 (one 307 hop)", async ({ request }) => {
  const first = await request.get(BASE + "/google66f372b7d00add35.html", { maxRedirects: 0 });
  expect(first.status()).toBe(307);
  const res = await request.get(BASE + "/google66f372b7d00add35.html");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("google-site-verification");
});

test("unknown path gives the 404 page", async ({ request }) => {
  const res = await request.get(BASE + "/nope", { maxRedirects: 0 });
  expect(res.status()).toBe(404);
  expect(await res.text()).toContain("That page isn't here");
});
