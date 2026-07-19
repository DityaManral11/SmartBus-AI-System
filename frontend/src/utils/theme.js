export const THEME_STORAGE_KEY = "smartbus_dark_mode";

export function applyTheme(isDark) {
  document.documentElement.classList.toggle(
    "dark",
    Boolean(isDark)
  );

  localStorage.setItem(
    THEME_STORAGE_KEY,
    String(Boolean(isDark))
  );
}

export function getSavedTheme() {
  return (
    localStorage.getItem(THEME_STORAGE_KEY) ===
    "true"
  );
}