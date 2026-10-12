export type ThemeMode = "light" | "dark";

const DARK_MODE_CLASS = "dark";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function getSystemThemeMode(): ThemeMode {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

export function getCurrentThemeMode(): ThemeMode {
  return document.documentElement.classList.contains(DARK_MODE_CLASS) ? "dark" : "light";
}

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle(DARK_MODE_CLASS, mode === "dark");
}
