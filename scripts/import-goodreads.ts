// Turns a Goodreads library export into the Library's data.
//
//   node scripts/import-goodreads.ts <path-to-goodreads_library_export.csv>
//
// Reads the CSV where it is (it is never copied into the repo), keeps only the "read" and
// "currently-reading" shelves, and writes src/data/books.json with these fields only:
// id, title, author, rating, dateRead, shelf, cover, review, reviewPost.
// Private notes, owned copies, shelves, ISBNs and to-read books are never written.
// Covers come from Open Library and are saved to src/assets/books/<id>.jpg; existing covers
// are kept, so re-running only fetches covers for new books.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanReview, parseCsv, sortBooks, type Book } from "../src/lib/books.ts";

const COVERS = "src/assets/books";
const OUT = "src/data/books.json";
const HEADERS = { "User-Agent": "books-import-script" };

/** Blog reviews in the Library, matched by the start of the Goodreads title. */
const BLOG_REVIEWS: [string, string][] = [
  ["the last lecture", "the-last-lecture-review"],
  ["beyond the last blue mountain", "jrd-tata-biography-beyond-the-last-blue-mountain"],
];

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-goodreads.ts <goodreads_library_export.csv>");
  process.exit(1);
}

const isbn = (v: string) => v.replace(/[="]/g, "").trim();

async function fetchCover(row: Record<string, string>, file: string): Promise<boolean> {
  const candidates: string[] = [];
  for (const i of [isbn(row.ISBN13), isbn(row.ISBN)].filter(Boolean)) {
    candidates.push(`https://covers.openlibrary.org/b/isbn/${i}-L.jpg?default=false`);
  }
  try {
    const q = new URLSearchParams({ title: row.Title.split(":")[0], author: row.Author, limit: "1", fields: "cover_i" });
    const res = await fetch(`https://openlibrary.org/search.json?${q}`, { headers: HEADERS });
    if (res.ok) {
      const id = (await res.json()).docs?.[0]?.cover_i;
      if (id) candidates.push(`https://covers.openlibrary.org/b/id/${id}-L.jpg?default=false`);
    }
  } catch {
    /* search is best effort */
  }
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !type.startsWith("image/")) continue;
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length < 1000) continue; // Open Library's 1×1 "no cover" image
      writeFileSync(file, bytes);
      return true;
    } catch {
      /* try the next candidate */
    }
  }
  return false;
}

const rows = parseCsv(readFileSync(csvPath, "utf8")).filter((r) =>
  ["read", "currently-reading"].includes(r["Exclusive Shelf"]),
);
mkdirSync(COVERS, { recursive: true });

const books: Book[] = [];
let fetched = 0;
for (const row of rows) {
  const id = row["Book Id"];
  const file = join(COVERS, `${id}.jpg`);
  let cover: string | null = existsSync(file) ? `${id}.jpg` : null;
  if (!cover && (await fetchCover(row, file))) {
    cover = `${id}.jpg`;
    fetched++;
  }
  const lower = row.Title.toLowerCase();
  books.push({
    id,
    title: row.Title,
    author: row.Author,
    rating: Math.round(Number(row["My Rating"]) || 0),
    dateRead: row["Date Read"] || null,
    shelf: row["Exclusive Shelf"] as Book["shelf"],
    cover,
    review: cleanReview(row["My Review"] ?? ""),
    reviewPost: BLOG_REVIEWS.find(([prefix]) => lower.startsWith(prefix))?.[1] ?? null,
  });
}

const reading = books.filter((b) => b.shelf === "currently-reading");
const read = sortBooks(books.filter((b) => b.shelf === "read"));
writeFileSync(OUT, `${JSON.stringify([...reading, ...read], null, 2)}\n`);

console.log(
  `${read.length} read, ${reading.length} currently reading, ` +
    `${books.filter((b) => b.review.length).length} with reviews, ` +
    `${books.filter((b) => b.cover).length} with covers (${fetched} new), ` +
    `${books.filter((b) => b.reviewPost).length} linked to blog reviews.`,
);
