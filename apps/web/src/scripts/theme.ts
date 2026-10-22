export interface ThemeLabels {
  toDark: string;
  toLight: string;
}

const STORAGE_KEY = "dmg:theme";
const COLORS = {
  light: "#F2EFE7",
  dark: "#1A1A1A",
} as const;

function storedChoice(): "light" | "dark" | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(theme: "light" | "dark"): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // A blocked storage API must not stop the visual theme from changing.
  }
}

export function initTheme(labels: ThemeLabels): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const toggle = document.querySelector<HTMLButtonElement>(
    "[data-theme-toggle]"
  );
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const currentTheme = (): "light" | "dark" => {
    const value = root.dataset.theme;
    if (value === "light" || value === "dark") return value;
    return media.matches ? "dark" : "light";
  };

  const syncColors = (theme: "light" | "dark"): void => {
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.content = COLORS[theme];
      });
  };

  const syncToggle = (theme: "light" | "dark"): void => {
    if (!toggle) return;
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? labels.toLight : labels.toDark
    );
    toggle
      .querySelectorAll<Element>("[data-theme-icon]")
      .forEach((icon) => {
        const show =
          icon.getAttribute("data-theme-icon") ===
          (theme === "dark" ? "sun" : "moon");
        icon.toggleAttribute("hidden", !show);
      });
  };

  const apply = (theme: "light" | "dark", persist: boolean): void => {
    root.dataset.theme = theme;
    if (persist) saveChoice(theme);
    syncColors(theme);
    syncToggle(theme);
  };

  const initial = currentTheme();
  syncColors(initial);
  syncToggle(initial);

  toggle?.addEventListener("click", () => {
    apply(currentTheme() === "dark" ? "light" : "dark", true);
  });

  media.addEventListener("change", () => {
    if (storedChoice()) return;
    apply(media.matches ? "dark" : "light", false);
  });
}
