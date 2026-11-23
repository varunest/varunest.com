import { describe, expect, it } from "vitest";
import { cleanReview, parseCsv, sortBooks, type Book } from "../../src/lib/books";

const book = (over: Partial<Book>): Book => ({
  id: "1", title: "T", author: "A", rating: 0, dateRead: null, shelf: "read", cover: null, review: [], reviewPost: null, ...over,
});

describe("cleanReview", () => {
  it("turns Goodreads HTML into plain paragraphs", () => {
    expect(cleanReview("Good<br/><br/>Great &amp; <b>bold</b><script>x</script>")).toEqual(["Good", "Great & bold"]);
  });
  it("returns no paragraphs for an empty review", () => {
    expect(cleanReview("  ")).toEqual([]);
  });
});

describe("sortBooks", () => {
  it("puts newer reads first and undated books last in their original order", () => {
    const sorted = sortBooks([
      book({ id: "a", dateRead: null }),
      book({ id: "b", dateRead: "2025/11/14" }),
      book({ id: "c", dateRead: "2026/07/12" }),
      book({ id: "d", dateRead: null }),
    ]);
    expect(sorted.map((b) => b.id)).toEqual(["c", "b", "a", "d"]);
  });
});

describe("parseCsv", () => {
  it("handles quoted fields with commas, doubled quotes and newlines", () => {
    const rows = parseCsv('Title,Review\n"A, B","He said ""hi""\nthen left"\nPlain,x\n');
    expect(rows).toEqual([
      { Title: "A, B", Review: 'He said "hi"\nthen left' },
      { Title: "Plain", Review: "x" },
    ]);
  });
});
