// Fill repoId and categoryId (from https://giscus.app) after enabling GitHub
// Discussions. While either is blank, no comments section is rendered.
const TEST = import.meta.env.PUBLIC_GISCUS_TEST === "1";

export const GISCUS = {
  repo: "varunest/varunest.com",
  repoId: TEST ? "R_test" : "",
  category: "Comments",
  categoryId: TEST ? "DIC_test" : "",
  mapping: "pathname",
} as const;

export const giscusEnabled = (g: { repoId: string; categoryId: string } = GISCUS) =>
  Boolean(g.repoId && g.categoryId);

export const giscusTheme = (theme: string) => (theme === "dark" ? "dark_dimmed" : "light");
