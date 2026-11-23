export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

export function readTheme(storage: Storage | null, prefersDark: boolean): Theme {
  try {
    const stored = storage?.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage blocked: fall through to the device setting
  }
  return prefersDark ? "dark" : "light";
}

export function writeTheme(storage: Storage | null, t: Theme): void {
  try {
    storage?.setItem(THEME_KEY, t);
  } catch {
    // storage blocked: the choice lasts for this page only
  }
}

export function applyTheme(t: Theme): void {
  document.documentElement.dataset.theme = t;
}
