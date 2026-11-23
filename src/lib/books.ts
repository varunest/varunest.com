export interface Book {
  /** Goodreads book id. */
  id: string;
  title: string;
  author: string;
  /** 0 = unrated, otherwise 1–5. */
  rating: number;
  /** "YYYY/MM/DD" as Goodreads exports it, or null. */
  dateRead: string | null;
  shelf: "read" | "currently-reading";
  /** Cover file name in src/assets/books, or null when none was found. */
  cover: string | null;
  /** Review paragraphs (plain text). */
  review: string[];
  /** Slug of the blog review in the Library, if there is one. */
  reviewPost: string | null;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };

/** Goodreads review HTML → plain paragraphs. Never returns markup. */
export function cleanReview(html: string): string[] {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
      const code = (n: number) => (Number.isInteger(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "");
      if (e.startsWith("#x")) return code(parseInt(e.slice(2), 16));
      if (e.startsWith("#")) return ENTITIES[e] ?? code(parseInt(e.slice(1), 10));
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .split(/\n\s*\n|\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Drop paragraphs that only point at the old blog review; the Library links to it properly. */
export function dropBlogLinks(paragraphs: string[]): string[] {
  return paragraphs.filter((p) => !/^read (my |the )?full review( here)?\s*:?\s*https?:\/\/\S+$/i.test(p.trim()));
}

/** Read books newest first; books without a date keep their order at the end. */
export function sortBooks(books: Book[]): Book[] {
  const dated = books.filter((b) => b.dateRead).sort((a, b) => b.dateRead!.localeCompare(a.dateRead!));
  return [...dated, ...books.filter((b) => !b.dateRead)];
}

/** Minimal RFC 4180 CSV parser: quoted fields, embedded commas, newlines and doubled quotes. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}
