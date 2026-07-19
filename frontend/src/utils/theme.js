export function applyTheme(isDark) {
  document.documentElement.classList.toggle(
    "dark",
    isDark
  );

  localStorage.setItem(
    "smartbus_dark_mode",
    String(isDark)
  );
}

export function getSavedTheme() {
  return (
    localStorage.getItem("smartbus_dark_mode") ===
    "true"
  );
}