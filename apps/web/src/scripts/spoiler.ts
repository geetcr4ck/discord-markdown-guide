export interface SpoilerOptions {
  /** Leave elements inside hydrated islands to their own component. */
  skipIslands?: boolean;
}

export function initSpoilers(
  root: ParentNode = document,
  options: SpoilerOptions = {}
): void {
  if (typeof document === "undefined") return;

  for (const spoiler of root.querySelectorAll<HTMLElement>(
    ".discord-spoiler"
  )) {
    if (options.skipIslands && spoiler.closest("astro-island")) continue;
    if (spoiler.dataset.spoilerReady === "true") continue;
    spoiler.dataset.spoilerReady = "true";

    spoiler.tabIndex = 0;
    spoiler.setAttribute("role", "button");
    spoiler.setAttribute("aria-expanded", "false");

    const toggle = (): void => {
      const revealed = spoiler.dataset.revealed === "true";
      spoiler.dataset.revealed = revealed ? "false" : "true";
      spoiler.setAttribute("aria-expanded", String(!revealed));
    };

    spoiler.addEventListener("click", toggle);
    spoiler.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  }
}
