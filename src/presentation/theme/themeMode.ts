export type ThemeMode = "light" | "dark";

const DARK_MODE_CLASS = "dark";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function updateBrowserThemeColor() {
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const backgroundColor = getComputedStyle(document.body).backgroundColor;

  if (themeColor) themeColor.content = backgroundColor;
}

export function getSystemThemeMode(): ThemeMode {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

export function getCurrentThemeMode(): ThemeMode {
  return document.documentElement.classList.contains(DARK_MODE_CLASS) ? "dark" : "light";
}

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle(DARK_MODE_CLASS, mode === "dark");
  const statusBarStyle = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );

  if (statusBarStyle) {
    statusBarStyle.content = mode === "dark" ? "black-translucent" : "default";
  }

  updateBrowserThemeColor();
}
