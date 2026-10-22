export interface CopyLabels {
  copy: string;
  copied: string;
  manual: string;
}

const STATUS_ID = "copy-status";

function statusRegion(): HTMLElement | null {
  return document.getElementById(STATUS_ID);
}

function announce(message: string): void {
  const region = statusRegion();
  if (!region) return;
  region.textContent = "";
  window.requestAnimationFrame(() => {
    region.textContent = message;
  });
}

function selectTarget(target: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(target);
  selection.removeAllRanges();
  selection.addRange(range);
}

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.tabIndex = -1;
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";

  const selection = document.getSelection();
  const saved =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    return typeof document.execCommand === "function"
      ? document.execCommand("copy")
      : false;
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (saved && selection) {
      selection.removeAllRanges();
      selection.addRange(saved);
    }
  }
}

export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // The clipboard API can reject on insecure origins or denied permission.
    }
  }
  return fallbackCopy(text);
}

export function initCopy(labels: CopyLabels): void {
  if (typeof document === "undefined") return;

  const timers = new WeakMap<HTMLElement, number>();

  document.addEventListener("click", (event) => {
    const origin = event.target;
    if (!(origin instanceof Element)) return;
    const button = origin.closest<HTMLElement>("button[data-copy]");
    if (!button) return;

    const scope =
      button.closest<HTMLElement>("[data-copy-scope]") ?? button.parentElement;
    const target = scope?.querySelector<HTMLElement>("[data-copy-target]");
    if (!scope || !target) return;

    const visual = button.querySelector<HTMLElement>(
      "[data-copy-label-visual]"
    );
    const original = visual?.textContent ?? labels.copy;
    const label =
      button.dataset.copyLabel?.trim() ||
      visual?.textContent?.trim() ||
      labels.copy;
    const text = target.textContent ?? "";

    const previous = timers.get(button);
    if (previous !== undefined) window.clearTimeout(previous);

    void copyText(text).then((copied) => {
      if (visual) visual.textContent = copied ? labels.copied : labels.manual;
      button.dataset.copyState = copied ? "copied" : "failed";

      if (copied) {
        announce(`${labels.copied}: ${label}`);
      } else {
        selectTarget(target);
        announce(labels.manual);
      }

      const timer = window.setTimeout(() => {
        if (visual) visual.textContent = original;
        delete button.dataset.copyState;
        timers.delete(button);
      }, 2000);
      timers.set(button, timer);
    });
  });
}
