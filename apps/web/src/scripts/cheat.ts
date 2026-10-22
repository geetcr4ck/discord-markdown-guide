export function initCheat(): void {
  if (typeof document === "undefined") return;

  const root = document.querySelector<HTMLElement>("[data-cheat]");
  if (!root) return;

  const input = root.querySelector<HTMLInputElement>("[data-cheat-input]");
  const count = root.querySelector<HTMLElement>("[data-cheat-count]");
  const clear = root.querySelector<HTMLButtonElement>("[data-cheat-clear]");
  const empty = root.querySelector<HTMLElement>("[data-cheat-empty]");
  const reset = root.querySelector<HTMLButtonElement>("[data-cheat-reset]");
  const rows = Array.from(
    root.querySelectorAll<HTMLElement>("[data-cheat-row]")
  );
  const groups = Array.from(
    root.querySelectorAll<HTMLElement>("[data-cheat-group]")
  );

  if (!input || !count || rows.length === 0) return;

  const totalText =
    root.querySelector<HTMLElement>("[data-cheat-total]")?.textContent ?? "";
  const total = Number.parseInt(totalText, 10) || rows.length;
  const lang = document.documentElement.lang || "en";

  const normalize = (value: string): string =>
    value.normalize("NFKC").toLocaleLowerCase(lang);

  const apply = (): void => {
    const query = normalize(input.value).trim();
    const tokens = query.split(/\s+/u).filter(Boolean);

    let shown = 0;
    for (const row of rows) {
      const keywords = normalize(row.dataset.keywords ?? "");
      const matches =
        tokens.length === 0 ||
        tokens.every((token) => keywords.includes(token));
      row.hidden = !matches;
      if (matches) shown += 1;
    }

    for (const group of groups) {
      const visible = Array.from(
        group.querySelectorAll<HTMLElement>("[data-cheat-row]")
      ).some((row) => !row.hidden);
      group.hidden = !visible;
    }

    count.textContent = `${shown} / ${total}`;
    if (clear) clear.hidden = tokens.length === 0;
    if (empty) empty.hidden = shown > 0;
  };

  const showAll = (): void => {
    input.value = "";
    apply();
    input.focus();
  };

  input.addEventListener("input", apply);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      showAll();
    }
  });
  clear?.addEventListener("click", showAll);
  reset?.addEventListener("click", showAll);

  apply();
}
