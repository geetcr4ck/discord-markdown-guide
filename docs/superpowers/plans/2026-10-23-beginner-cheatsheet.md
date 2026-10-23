# Beginner cheat sheet, dark mode, and brand — Implementation Plan

> **For agentic workers:** Read `docs/superpowers/specs/2026-10-23-beginner-cheatsheet-design.md` in full before starting. That spec is the source of truth for values, copy, anchors, tokens, and acceptance. This plan only sequences the work. Use `superpowers:subagent-driven-development` for the suggested lanes or `superpowers:executing-plans` for a single implementer.

> **No commits or pushes.** The user said "Not yet" to git. Every task ends with a build/check and `git status --short` only. Do not run `git commit`, `git push`, create a PR, or deploy. The final handoff asks the user before any of that.

**Goal:** Replace the home page with a complete, grouped Discord Markdown cheat sheet; add a neutral dark mode, the beginner layer to all eight articles, and the supplied logo as the site mark/favicon/OG — in EN and ID at full parity.

**Architecture:** Astro 4 static site. A typed data module (`cheatsheet.ts`) feeds one `CheatSheet.astro` component rendered at build. Four small vanilla scripts handle copy, search, theme, and spoilers. The playground stays the only hydrated React island. No new routes. The parser output is trusted and unchanged except for external-link `rel` hardening.

**Tech stack:** Astro 4.16.19, TypeScript, Tailwind + `style.css` custom properties, React only in `playground.tsx`, `sharp` as a dev-only asset generator. Build: `pnpm --filter ./apps/web build`; output `apps/web/dist`. Deploy target is Cloudflare Pages with `pnpm build`, output `apps/web/dist`, `NODE_VERSION=20`, `PNPM_VERSION=8.15.6`.

## Global constraints

- **Spec first.** Do not invent values; copy tokens, rows, anchors, and strings from the spec.
- **No git.** No commit/push/PR until the user explicitly says so.
- **No new runtime dependencies.** `sharp` is dev-only for `scripts/generate-brand-assets.mjs`; it is not imported by the site.
- **No new routes.** Home stays `/{lang}/`; 8 articles + play + 404 stay.
- **No new hydration.** The playground remains the only `client:*` island.
- **Copy exact.** `ui.ts` is the only source of UI strings; ID uses **kamu**, never **Anda**; no "simply/just/obviously".
- **Design intact.** Do not flatten the blueprint: bone/ink/blue/redline, 0 radii except chips/specimen/capsule, no gradients outside the supplied mark.
- **Anchors are per locale.** Use the real ID heading ids from the spec; never reuse EN ids under `/id/`.
- **Trusted HTML.** `toHTML` output is ours; do not introduce raw user HTML.
- **Widths.** Verify 320/390/1440; both themes; both locales; no horizontal scroll.
- **Keep old keys until their usage is gone.** Remove `home.index`, `home.indexNote`, `hero.caption`, `play.dimension` only in the task that deletes the last use.

## File map

New:

```text
apps/web/src/content/cheatsheet.ts
apps/web/src/components/cheat-sheet.astro
apps/web/src/scripts/copy.ts
apps/web/src/scripts/cheat.ts
apps/web/src/scripts/theme.ts
apps/web/src/scripts/spoiler.ts
apps/web/src/assets/dmdg.png
apps/web/public/favicon-48.png
apps/web/public/logo-96.png
apps/web/public/og-id.png
scripts/generate-brand-assets.mjs
scripts/audit-dist.mjs
docs/superpowers/plans/2026-10-23-beginner-cheatsheet.md
```

Changed:

```text
apps/web/src/pages/[lang]/index.astro
apps/web/src/pages/[lang]/[slug].astro
apps/web/src/pages/index.astro
apps/web/src/layouts/Sheet.astro
apps/web/src/components/sheet-header.astro
apps/web/src/components/sheet-index.astro
apps/web/src/components/title-block.astro
apps/web/src/components/example.astro
apps/web/src/components/react/playground.tsx
apps/web/src/style.css
apps/web/src/content/config.ts
apps/web/src/i18n/ui.ts
apps/web/src/constants.ts
apps/web/src/markdown.ts
apps/web/public/favicon-32.png
apps/web/public/apple-touch-icon.png
apps/web/public/og.png
package.json
pnpm-lock.yaml
all 16 apps/web/src/content/feature/{en,id}/*.mdx
DESIGN.md
PRODUCT.md
```

Deleted:

```text
apps/web/public/favicon.svg
the hardcoded "DM / GUIDE" markup
the home hero and home drawing-index usage
the home variant of sheet-index.astro
```

## Suggested lanes (for subagent-driven execution)

| Lane | Owner | Tasks | Writes | Depends on |
| --- | --- | --- | --- | --- |
| A. Audit + brand | fixer / orchestrator | 1, 4 | `scripts/audit-dist.mjs`, `scripts/generate-brand-assets.mjs`, `public/*`, `assets/dmdg.png`, root package/lock | none |
| B. Foundations + engine | fixer | 2, 5, 8, 6 (functional), 7 (cleanup) | `ui.ts`, `config.ts`, `constants.ts`, `title-block.astro`, `cheatsheet.ts`, `apps/web/src/scripts/*`, `Sheet.astro`, redirect, `example.astro`, `playground.tsx`, `markdown.ts` | A's audit; Task 2 before content; 7 cleanup after D's home |
| C. Content | fixer + orchestrator copy review | 3 | 16 MDX, `[slug].astro` | Task 2 schema |
| D. Design | designer | 6 (visual), 7, 8 (CSS) | `style.css`, `sheet-header.astro`, `cheat-sheet.astro`, `[lang]/index.astro`, `sheet-index.astro` | Task 2/5 contracts, brand assets |
| E. Integration | orchestrator | 9 | docs, fixes | all |

Rules for lanes: one writer per file; `style.css` belongs only to Lane D; `Sheet.astro` belongs only to Lane B; content MDX belongs only to Lane C. Lane D uses the class names fixed below; do not rename them without updating Lane B/C.

## Task 1: Write the failing dist audit

**Files:**
- Create: `scripts/audit-dist.mjs`

**Purpose:** Turn the spec's machine-checkable acceptance into one command that fails now and passes at the end. It is the regression test for every later task.

**Step 1: Write the audit.** Plain Node (`node:fs`, `node:path`); no dependencies. Read `apps/web/dist`. Print each check as `PASS`/`FAIL`; exit 1 if any fail. Define `pages` as all HTML files and `contentPages` as all pages except the root redirect `dist/index.html`; the root redirect has no header, toggle, OG, or `<main>`. Include:

- `dist` has 22 HTML files: root redirect, `404.html`, EN/ID home, 8 EN + 8 ID articles, EN/ID play.
- Root `index.html` redirects to `/en/`.
- Sitemap has 20 `<loc>` URLs.
- EN and ID home each: `data-cheat`, 26 `data-cheat-row`, 22 `button[data-copy]`, 4 `data-copy="false"` rows, group counts 6/10/7/3 via `data-group`, four group headings.
- Every row `href` resolves to a built HTML file and an existing `id`; collect ids with `id="..."` and strip hashes; check the 26 targets, including `misc#masked-links` and `misc#tautan-berteks`.
- The home has one `<h1>`, no empty `<a>`, a search input with a `<label>`, a count, a clear button, and exactly one `role="status"` (the empty state). The copy region is `aria-live` only, not `role="status"`.
- Titles: EN home ends `Discord Markdown cheat sheet — Discord Markdown Guide`; ID home ends `Contekan Markdown Discord — Panduan Markdown Discord` (em dash). `og:site_name` localized.
- `og:image` ends `/og.png` on EN and `/og-id.png` on ID. `meta[name=description]` matches §9.
- Icon links: 32, 48, apple-touch; no `favicon.svg`; `favicon.svg` absent from `dist`.
- PNG dimensions from the IHDR header: `favicon-32` 32×32, `favicon-48` 48×48, `apple-touch-icon` 180×180, `logo-96` 96×96, `og.png`/`og-id.png` 1200×630.
- `apps/web/src/assets/dmdg.png` is not in `dist`.
- `DM / GUIDE`, `hacksore`, `vercel` absent from `dist` and `apps/web/src`.
- Every content page has `[data-theme-toggle]`, two `theme-color` metas, and the boot script reference `dmg:theme`. The root redirect is exempt.
- 16 article pages (8 EN, 8 ID) each have `data-mistakes` and a non-empty intro lede; article 8 has `#masked-links` / `#tautan-berteks` and the new title.
- ID MDX source contains no `Anda`.
- Every `<figure class="detail">` in article pages contains at least one `[data-copy]` and one `[data-copy-target]`.
- Home, article, and play `<main>` contain no `1:1` (the footer title block may keep the decorative scale).

**Step 2: Run it against the current dist.**
Run: `node scripts/audit-dist.mjs`
Expected: FAIL with clear missing-feature lines (`data-cheat` missing, icons missing, etc.). Do not change app code in this task. Checkpoint: no commit.

## Task 2: Copy deck, schema, constants, footer brand

**Files:**
- Modify: `apps/web/src/i18n/ui.ts`
- Modify: `apps/web/src/content/config.ts`
- Modify: `apps/web/src/constants.ts`
- Modify: `apps/web/src/components/title-block.astro`

**Interfaces:**
- `UIKey` stays `keyof typeof ui.en`; add every key to both locales so `astro check` enforces parity.
- `CheatRow`/`Localized` types are added in Task 5.
- `SITE_IMAGE_ID = "/og-id.png"`.

**Step 1: Add the deck.** Transcribe §7 exactly. Change `site.tagline`; add `brand.short`, `nav.cheatsheet`, `home.title`, all `cheat.*`, `article.mistakes`, `theme.toDark`, `theme.toLight`. Change `home.kicker`, `home.lede`, `home.cta`, `play.source`, `play.specimen`, `play.kicker`, `titleBlock.sheet`. Keep `home.index`, `home.indexNote`, `hero.caption`, `play.dimension` for now with a `// remove with old home/playground` comment. Do not change `play.copy`/`play.copied`.

**Step 2: Schema.** Add required `intro: z.string().min(40).max(240)` and `mistakes: z.array(z.string().min(10).max(140)).min(2).max(3)` to `feature`.

**Step 3: Constants and footer.** Add `SITE_IMAGE_ID`; change `title-block.astro`'s brand line to `translate('site.name')` and drop the unused `SITE_NAME` import.

**Step 4: Expected failure.** Run: `pnpm --filter ./apps/web build`
Expected: exit 1 with `[InvalidContentEntryFrontmatterError]` on the first MDX entry; `intro` and `mistakes` both `Required`. All 16 entries lack both; the build fails fast at the first. `astro check` does not validate MDX frontmatter against the content schema, so it stays green and is not the schema gate. This is the failing test for Task 3; do not fill content or weaken the schema. Checkpoint: no commit.

## Task 3: Articles beginner layer (16 MDX + article page)

**Files:**
- Modify: all 16 `apps/web/src/content/feature/{en,id}/*.mdx`
- Modify: `apps/web/src/pages/[lang]/[slug].astro`

**Step 1: Author `intro` and `mistakes` for all 16.** For each article, read the body and write:

- `intro`: 1–2 plain sentences (40–240 chars) answering "what is this for?". It replaces the visible lede; `description` stays meta/OG.
- `mistakes`: 2–3 items (10–140 chars each), symptom → fix, verified against the article or parser. No theory.
- ID: **kamu**, never Anda; EN plain active voice; no "simply/just/obviously".
- Article 1 uses the spec's worked example verbatim.
- Keep the existing "Watch out" sections; the callout is the scan layer.

Suggested copy pattern, verify each sentence against the body:

| Slug | EN intro focus | ID intro focus |
| --- | --- | --- |
| `text-formatting` | Make a few words stand out without changing the sentence. | Buat beberapa kata menonjol tanpa mengubah kalimat. |
| `organizational-text-formatting` | Headings, lists, and small print that give a message structure. | Judul, daftar, dan teks kecil untuk memberi struktur pesan. |
| `block-quotes` | Set a line or a block apart as a quote. | Pisahkan satu baris atau satu blok sebagai kutipan. |
| `code-blocks` | Show code without Discord formatting it. | Tampilkan kode tanpa diformat Discord. |
| `syntax-highlighting` | Colour a fenced block by naming its language. | Beri warna blok berpagar dengan menyebut bahasanya. |
| `spoiler-tags` | Hide text until the reader chooses to reveal it. | Sembunyikan teks sampai pembaca memilih untuk membukanya. |
| `mentions` | Ping a person, role, channel, or custom emoji by id. | Panggil orang, role, channel, atau emoji khusus lewat id. |
| `misc` | Links, timestamps, commands, and other message extras. | Tautan, stempel waktu, perintah, dan tambahan pesan lain. |

The table is a direction, not final copy. Each intro must name the article's actual scope.

**Step 2: Article 8 (`misc`) changes.**
- EN title "Links, timestamps & commands"; ID title "Tautan, stempel waktu & perintah"; update both descriptions to mention links.
- Add `## Masked links` after "Message links" (ID `## Tautan berteks` after the ID "Message links" section), with the §4 content; do not claim embed suppression.
- Set `sample: "[text](https://example.com)"` in both files.
- Keep slug/order/URL `misc`.

**Step 3: Article page.** In `[slug].astro`:
- Visible lede = `entry.data.intro`; render it in an element with `data-article-intro={entry.data.intro}` so the dist audit can compare the built lede to the MDX `intro`; keep `description` for the `Sheet` meta.
- Add, directly after the lede/meta and before the MDX body:

```astro
<aside class="article-mistakes" data-mistakes aria-labelledby="mistakes-label">
  <p class="article-mistakes__label" id="mistakes-label">
    <span class="redline-square" aria-hidden="true"></span>
    {translate('article.mistakes')}
  </p>
  <ul class="article-mistakes__list">
    {entry.data.mistakes.map((mistake) => (
      <li class="article-mistakes__item">
        {mistake.split(/(`[^`]+`)/g).map((part) =>
          part.startsWith('`') ? <code>{part.slice(1, -1)}</code> : part
        )}
      </li>
    ))}
  </ul>
</aside>
```

Do not interpret HTML in the strings. The class names are the CSS contract for Lane D.

**Step 4: Verify.** Run `pnpm --filter ./apps/web build`.
Expected: green; 16 article pages; the schema errors are gone. Then:
- `grep -r "Anda" apps/web/src/content/feature/id` → no matches.
- Check the built `/en/misc/` has `id="masked-links"` and `/id/misc/` has `id="tautan-berteks"`; both have `data-mistakes`.
- Read the 16 intros/mistakes once as the copy owner; fix flat or unverified claims before handing to design. Checkpoint: no commit.

## Task 4: Brand assets

**Files:**
- Create: `apps/web/src/assets/dmdg.png` (copy of `C:\Users\geetcr4ck\Downloads\dmdg.png`)
- Create: `scripts/generate-brand-assets.mjs`
- Modify: `package.json`, `pnpm-lock.yaml` (`sharp` devDependency)
- Create/replace: `apps/web/public/favicon-32.png`, `favicon-48.png`, `apple-touch-icon.png`, `logo-96.png`, `og.png`, `og-id.png`
- Delete: `apps/web/public/favicon.svg`

**Step 1: Install dev tool.** Run `pnpm add -Dw sharp@0.33.5`. Confirm it is a root `devDependency`, not an app dependency.

**Step 2: Copy source.** Copy the supplied 2048×2048 PNG to `apps/web/src/assets/dmdg.png`; never serve it.

**Step 3: Write the generator.**
- Read the source; assert 2048×2048 and opaque.
- Compute the white bbox: scan raw RGB for pixels with R,G,B all > 240. Expect approximately x 344..1704, y 432..1696; log the result.
- Crop a square centered on the bbox: `side = ceil(max(bboxW, bboxH) * 1.16)`; expected 1578 at (235,275). Clamp to the source.
- Outputs: 32, 48, 180, 96 from the crop; `og.png` EN and `og-id.png` ID at 1200×630.
- OG base: `#F2EFE7`; logo 280×280 at (96,175); text x 424; title 56px/600 `#16171B`; tagline 28px/400 `#3D3F47`; blue rule 120×6 `#1F4FD8`; URL 18px `#63656D` at the bottom.
- Title = `site.name`; tagline = `site.tagline` from §7:
  - EN: "Discord Markdown Guide" / "Every rule, with the result beside it."
  - ID: "Panduan Markdown Discord" / "Semua aturan, lengkap dengan hasilnya."
  - URL `discord-markdown-guide.pages.dev`.
- Use `font-family="Arial, Helvetica, sans-serif"` in the OG SVG; do not add a font dependency. Keep all text inside 1200×630; if the ID title overflows 680 px, reduce to 52 px rather than clip.
- Write files with `sharp`; print paths and dimensions.

**Step 4: Run and inspect.**
Run: `node scripts/generate-brand-assets.mjs`
Check dimensions with a small Node PNG-header read, and view both OG images with the `read` tool. The mark must not be stretched; text must not touch edges; no old asterisk or "1:1".

**Step 5: Delete old icon.** Remove `apps/web/public/favicon.svg`. Checkpoint: no commit.

## Task 5: Sheet data and vanilla scripts

**Files:**
- Create: `apps/web/src/content/cheatsheet.ts`
- Create: `apps/web/src/scripts/copy.ts`, `cheat.ts`, `theme.ts`, `spoiler.ts`

**Interfaces (frozen for later lanes):**

```ts
// cheatsheet.ts
export type Localized = { en: string; id: string };
export type CheatGroupId = "text" | "blocks" | "people" | "more";
export type CheatRow = {
  group: CheatGroupId;
  label: Localized;
  keywords: string;
  syntax: Localized;
  render?: Localized;
  discord?: Record<string, string>;
  copy?: boolean;
  slug: string;
  anchor: Localized;
};
export const cheatRows: CheatRow[];
export const cheatGroups: { id: CheatGroupId; count: number }[];
export const cheatTotal: number;

// copy.ts
export interface CopyLabels { copy: string; copied: string; manual: string }
export async function copyText(text: string): Promise<boolean>;
export function initCopy(labels: CopyLabels): void;

// cheat.ts
export function initCheat(): void;

// theme.ts
export function initTheme(labels: { toDark: string; toLight: string }): void;

// spoiler.ts
export function initSpoilers(): void;
```

**Step 1: Data.** Transcribe the 26 rows from §3 exactly. Groups: 6/10/7/3. `copy: false` on user, role, channel, custom emoji; all others copy. `render` defaults to `syntax`. Use the exact multiline fences from §3. For custom emoji, use the article's real token `<:duck:1263836954789806154>` and `discord={{ emoji: "🦆" }}` so the result matches; no copy. Add both-language keywords: labels, common synonyms ("quote", "kutipan", "spoiler", "bold", "tebal", "code", "kode", …), and the syntax itself.

**Step 2: `copy.ts`.**
- `copyText`: Clipboard API first; on throw/false, hidden textarea + `document.execCommand("copy")`; remove textarea; return boolean. SSR-safe (no top-level `document`).
- `initCopy`: one delegated click listener on `document` for `[data-copy]`.
- Scope = `button.closest('[data-copy-scope]')`; target = `scope.querySelector('[data-copy-target]')`; label = `button.dataset.copyLabel` or the visible label; text = target `textContent` (preserve newlines).
- On success: visible label (inside `[data-copy-label-visual]`, `aria-hidden`) = `labels.copied`; live region text = `labels.copied + ": " + label`; restore after 2 s.
- On failure: select the target with `window.getSelection()`/`Range`; visible label = `labels.manual` for 2 s; live text = `labels.manual`. Keep the button's `aria-label` stable.
- One live region, id `copy-status`, `aria-live="polite"`, `aria-atomic="true"`; clear then set on the next frame.

**Step 3: `cheat.ts`.**
- If `[data-cheat]` is absent, return.
- Selectors: `[data-cheat-input]`, `[data-cheat-count]`, `[data-cheat-clear]`, `[data-cheat-empty]`, `[data-cheat-reset]`, `[data-cheat-total]`, `[data-cheat-row]`, `[data-cheat-group]`.
- Normalize input with `.normalize("NFKC").trim().toLocaleLowerCase(document.documentElement.lang)`; filter each row by `row.dataset.keywords.toLocaleLowerCase(...).includes(q)`.
- Show all rows when empty. Hide groups with zero visible rows. Update count `${shown} / ${total}`; toggle clear and empty `hidden`; no debounce; no URL state; no live count.
- Clear/reset/Escape: clear input, show all, focus input. Empty state is the only `role="status"`.

**Step 4: `theme.ts`.**
- Effective theme = `document.documentElement.dataset.theme` (set by boot) or `matchMedia`.
- Toggle click: set opposite `data-theme` on `<html>`, store `dmg:theme` `"light"`/`"dark"`, update both `meta[name=theme-color]` contents (`#F2EFE7`/`#1A1A1A`), update button `aria-label` and icon visibility.
- No `aria-pressed`. Listen to `matchMedia` changes only when no stored choice; then apply system and sync metas.
- The inline boot in `Sheet.astro` (Task 6) sets `data-theme`, adds `.js`, and syncs metas before paint; it must be wrapped in try/catch.

**Step 5: `spoiler.ts`.** For every `.discord-spoiler`: set `tabindex="0"`, `role="button"`, `aria-expanded="false"`; click/Enter/Space toggles `data-revealed="true|false"` and `aria-expanded`; Space preventDefault. Keep the CSS `:focus` reveal fallback.

**Step 6: Verify.** Run `pnpm --filter ./apps/web exec astro check`.
Expected: green after Task 3; no DOM access at module top level. The data count is verified by the audit after the component exists. Checkpoint: no commit.

## Task 6: Header, theme boot, layout head, redirect

**Files:**
- Modify: `apps/web/src/components/sheet-header.astro`
- Modify: `apps/web/src/layouts/Sheet.astro`
- Modify: `apps/web/src/pages/index.astro`
- Modify: `apps/web/src/style.css` (chrome tokens, brand, toggle only; Lane D)

**Step 1: Header.**
- Brand link: 24×24 `/logo-96.png` (import-free `<img>`), `alt=""`, `width="24"`, `height="24"`, `decoding="async"`, plus `brand.short`. Link `aria-label={translate('site.name')}`; 8 px gap; Plex Sans 600 14 px; sentence case; no tracking-wider.
- Nav: `nav.cheatsheet` → home.
- Add the theme toggle between nav and language group: `<button type="button" data-theme-toggle aria-label={translate('theme.toDark')}>` with two inline SVGs (`data-theme-icon="moon"`/`"sun"`), 36×36, focus ring. No `aria-pressed`.
- Media: ≤380 hide nav text; ≤340 hide brand text only if 320 still overflows, leaving the mark + label.

**Step 2: `Sheet.astro` head.** Replace icon links: 32, 48, apple-touch; remove SVG. Add two `theme-color` metas (light/dark media). Localize `pageTitle` and `og:site_name` with `translate('site.name')`; keep the em dash. Resolve the OG default after `currentLang`: EN `SITE_IMAGE`, ID `SITE_IMAGE_ID`; explicit prop wins. Drop unused `SITE_NAME`/`SITE_DESCRIPTION` imports.

**Step 3: Boot + labels + live region.** In `<head>`, an `is:inline` try/catch script (without `is:inline`, Astro bundles/hoists it and the no-flash guarantee is lost):
- read `localStorage["dmg:theme"]`; if absent use `matchMedia("(prefers-color-scheme: dark)")`;
- set `document.documentElement.dataset.theme = "light"|"dark"`;
- add `.js`;
- set both theme-color metas to `#F2EFE7`/`#1A1A1A`.
Add to `<html>` the data labels: `data-copy-copy`, `data-copy-copied`, `data-copy-manual`, `data-theme-to-dark`, `data-theme-to-light` (translated). Add `<div id="copy-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>`. At the end of body, one module script imports `initCopy`, `initTheme`, `initSpoilers`; pass labels from `document.documentElement.dataset`; call them. Import path `../scripts/...`.

**Step 4: Redirect.** `pages/index.astro`: remove inline `style` attributes; keep meta refresh/link; add a small `<style>` with light colors and `@media (prefers-color-scheme: dark)` colors. No toggle.

**Step 5: CSS tokens (Lane D).** Add the dark token block twice (media fallback + `[data-theme="dark"]`), change light `--ink3` to `#63656D`, add brand/toggle/no-JS rules (`html:not(.js) [data-theme-toggle] { display:none }`), `color-scheme`, and the header 380/340 rules.

**Step 6: Verify.**
Run: `pnpm --filter ./apps/web build` and `node scripts/audit-dist.mjs`.
Expected: icon/head/title/OG/toggle checks pass; sheet/content checks still fail. Start the dev server and check `/en/`/`/id/` header at 1440/390/320, toggle both ways, reload (no flash), and system-dark with no stored choice. Checkpoint: no commit.

## Task 7: Sheet component, home page, sheet styles

**Files:**
- Create: `apps/web/src/components/cheat-sheet.astro`
- Modify: `apps/web/src/pages/[lang]/index.astro`
- Modify: `apps/web/src/components/sheet-index.astro`
- Modify: `apps/web/src/i18n/ui.ts` (remove old home keys)
- Modify: `apps/web/src/style.css` (sheet/search/copy/empty; Lane D)

**Step 1: `CheatSheet.astro`.** Props `{ lang: Lang }`. Import `cheatRows`, `cheatGroups`, `cheatTotal`, `toHTML`, `t`. Render:

- `<section class="cheat" data-cheat data-cheat-total={cheatTotal}>`.
- Toolbar: visible `<label for="cheat-search">{cheat.search}</label>`, `<input id="cheat-search" type="search" data-cheat-input placeholder={cheat.placeholder} />`, count `<span data-cheat-count>{cheatTotal} / {cheatTotal}</span>` with visually hidden `cheat.countLabel`, clear `<button type="button" data-cheat-clear hidden>{cheat.clear}</button>`.
- Per group `<section class="cheat-group" data-cheat-group={group.id}>`; group `<h2>` label via a typed map `{ text: "cheat.group.text", blocks: "cheat.group.blocks", people: "cheat.group.people", more: "cheat.group.more" } satisfies Record<CheatGroupId, UIKey>` — do not build a key with template-literal interpolation, since `t()` takes literal `UIKey`. Column header row with `cheat.youType`/`cheat.discordShows` (aria-hidden; mobile hides); `<dl class="cheat-list">`.
- Per row `<div class="cheat-row" data-cheat-row data-group={row.group} data-keywords={row.keywords} data-copy={row.copy === false ? "false" : "true"}>`; `<dt><a href={`/${lang}/${row.slug}#${row.anchor[lang]}`}>{row.label[lang]}</a></dt>`; syntax `<dd><pre class="cheat-syntax"><code data-copy-target>{row.syntax[lang]}</code></pre>` plus a copy button when allowed; result `<dd class="cheat-result">{HTML from toHTML}</dd>`.
- Copy button markup: `data-copy-scope` on the row, `<button type="button" data-copy data-copy-label={row.label[lang]} aria-label={`${copy}: ${row.label[lang]}`}>`; visible `<span data-copy-label-visual aria-hidden="true">{copy}</span>`. The search toolbar gets `data-cheat-toolbar` so it can be hidden without JS.
- Result HTML: `toHTML(row.render?.[lang] ?? row.syntax[lang], { locale: lang, discordCallback })`; wrap `row.discord` values in `() => value` exactly as `example.astro` does. No `set:html` user data.
- Empty state: `<div class="cheat-empty" data-cheat-empty role="status" hidden><p>{cheat.empty}</p><button type="button" data-cheat-reset>{cheat.reset}</button></div>`.
- Initial count and all rows server-rendered; no React. Add a `<script>` importing `initCheat` and calling it.

**Step 2: Home.** Rebuild `[lang]/index.astro`: `<Sheet sheetNumber="00" lang={lang} tapeFlag={true} title={...} description={...}>`; intro with `home.kicker`, `<h1>{home.title}</h1>`, `home.lede`, CTA `home.cta` → `play(lang)`; keep the tape-flag markup/script; then `<CheatSheet lang={lang} />`. Remove the old hero, exploded pair, drawing index, `getCollection` sample data, and `SheetIndex` home usage. Meta title EN "Discord Markdown cheat sheet", ID "Contekan Markdown Discord"; descriptions §9.

**Step 3: `sheet-index.astro`.** Keep the rail variant only; remove the `home` variant and its now-unused props. Update `[slug].astro` if it passes home-only props; the rail keeps `nav.index` label.

**Step 4: Remove old keys.** Delete `home.index`, `home.indexNote`, `hero.caption` from `ui.ts` only after no usage remains.

**Step 5: CSS (Lane D).** Style the sheet: 3-column grid on desktop, stacked on mobile; per-group headers; mono syntax chip (radius 4, `pre-wrap`, max-height with scroll for multiline); result specimen strip (compact, `#313338`, clamped max-height); search toolbar; count; clear; empty; copy button 44 px touch target; dark variants; focus rings; `[hidden] { display: none !important; }` where needed. Hide only the interactive chrome without JS: `html:not(.js) [data-cheat-toolbar], html:not(.js) [data-copy] { display: none; }` (rows and examples remain visible). Keep the `<dl>` semantics; no table.

**Step 6: Verify.**
Run: `pnpm --filter ./apps/web build`; `node scripts/audit-dist.mjs`.
Expected: all home checks pass (26 rows, 22 copy, groups, anchors, one status, no empty links, count). Browser: 1440/390/320; search "spoiler"/"kutipan"; empty state/reset; copy one row; anchor jumps EN/ID; both themes. Checkpoint: no commit.

## Task 8: Examples, playground, parser links, spoilers

**Files:**
- Modify: `apps/web/src/components/example.astro`
- Modify: `apps/web/src/components/react/playground.tsx`
- Modify: `apps/web/src/markdown.ts`
- Modify: `apps/web/src/i18n/ui.ts` (remove `play.dimension`; plain playground copy)
- Modify: `apps/web/src/style.css` (copy-button styles; Lane D)

**Step 1: `example.astro`.** Add `data-copy-scope` on the `<figure>`. In the source pane header, add a copy button (replacing any `1:1` chip): `data-copy`, `data-copy-label={caption ?? translate('cheat.youType')}`, `aria-label={`${translate('cheat.copy')}: ${label}`}`, visible `[data-copy-label-visual]` with `cheat.copy`. Put `data-copy-target` on the source `<pre><code>`. Keep the dimension rule/arrows as unlabeled decoration; remove the `1:1` text only. Both single-line and multi-line layouts. Exact source, including newlines.

**Step 2: Playground.** Remove the hardcoded `DISCORD 1:1` line and the `play.dimension` key. Import `copyText` from `../../scripts/copy`; `handleCopy` calls it; on `true` set copied 2 s; on `false` focus/select the textarea (add a ref) so the user can copy. Keep `play.copy`/`play.copied`. Add the plain `play.lede`/`play.note` below to both locales (the §7 deck omitted them but §1's plain-language rule applies):
- EN lede: "Type on the left; the Discord result appears on the right. Try a sample or paste your own message." / note: "Rendered live in your browser. Nothing leaves your browser."
- ID lede: "Ketik di kiri; hasil Discord muncul di kanan. Coba contoh atau tempel pesanmu sendiri." / note: "Dirender langsung di perambanmu. Tidak ada yang meninggalkan perambanmu."
Keep the `play.kicker` "Sheet 09 — Playground" and the `Sheet`/`Specimen` blueprint motifs. If the user vetoes this copy, revert only these two strings.

**Step 3: Parser links.** In `markdown.ts`, every `<a>` with `target="_blank"` gets `rel="noopener noreferrer"` (link and autolink rules). Do not change text/URLs; keep the trusted HTML. This covers sheet result links and article links.

**Step 4: Spoilers.** Confirm `initSpoilers` is called from `Sheet.astro`; style `[data-revealed="true"]` and `[role="button"]` focus. No parser change needed.

**Step 5: CSS.** Shared `.copy-button` styles for the example button (44 px touch; visible label; `is-copied`/`is-copy-failed` states); remove the old 1:1 dimension style; dark variants.

**Step 6: Verify.**
Run build + audit. Expected: all copy-target checks pass; no `1:1` in article `<main>`; no `DISCORD 1:1`/`play.dimension` in src. Browser: copy on a multiline example (source exact), spoiler keyboard (Tab/Enter/Space), article links open safely, playground copy and reset. Checkpoint: no commit.

## Task 9: Docs, full build, audit, visual verification

**Files:**
- Modify: `DESIGN.md`, `PRODUCT.md`
- Fix only what the checks reveal.

**Step 1: Docs.**
- `DESIGN.md`: record the mark + short header name; the sheet anatomy/rows; dark mode (no more "no dark mode"); the search/copy contracts; the OG/brand assets; the localized title/OG; keep the blueprint tokens. Grep both docs for `no dark mode`, `DM / GUIDE`, `Index`, and `1:1`; update the stale ones, keeping the decorative title-block scale.
- `PRODUCT.md`: the lay reader, the quick-lookup job, the success measure (finds/copies a rule without leaving the page); the bilingual parity; the brand.

**Step 2: Full build + audit.**
Run: `pnpm --filter ./apps/web build`
Run: `node scripts/audit-dist.mjs`
Expected: every check PASS, 22 pages, 20 sitemap URLs. If a check fails, fix the cause, not the audit (unless the audit itself is wrong against the spec).

**Step 3: Visual pass (orchestrator).**
Run `pnpm --filter ./apps/web dev`; open `/en/`, `/id/`, `/en/misc`, `/id/misc`, `/en/play`, `/id/play`, `/404` in the browser panel. At 1440 and 390:
- Header: mark + short brand; toggle; language; no "DM / GUIDE"; at 320 no overflow.
- Home: tape flag, search, 26 rows, 22 copy, 4 label-only rows, anchors, multiline clamp, empty state.
- Both themes: contrast, focus rings, specimen `#313338`, no flash on reload, system default, persisted choice.
- Articles: intro lede, mistakes callout, copy on every example, spoilers by keyboard.
- Playground: labels, copy/reset, no 1:1.
- OG images: view `og.png`/`og-id.png`; correct text/locale, logo unstretched.
Capture screenshots at 1440/390 in both themes for the user's review. Do not commit.

**Step 4: Copy review (orchestrator).** Read EN/ID side by side; check "kamu", no Anda, no unexplained jargon, no "1:1" as a functional label, no "DM / GUIDE", article intros/mistakes verified. Fix only copy, preserving design/interaction.

**Step 5: Handoff.**
Run `git status --short`; list changed files; report audit/build results and screenshots. Ask the user whether to commit/push and then walk through Cloudflare Pages (project name, build `pnpm build`, output `apps/web/dist`, `NODE_VERSION=20`, `PNPM_VERSION=8.15.6`, no adapter). Do not commit before the answer.

## Spec coverage (self-review)

| Spec area | Plan |
| --- | --- |
| 26 rows / 22 copy / 4 label-only, groups 6/10/7/3 | Tasks 3, 5, 7; audit |
| Localized anchors and article links | Tasks 3, 5, 7; audit |
| Search/count/empty/focus | Tasks 5, 7; audit |
| Copy module + fallback + live region | Tasks 5, 7, 8; audit |
| Theme toggle/system/persist/no flash | Tasks 5, 6; visual |
| Dark tokens / AA / specimen | Task 6 (Lane D); visual |
| Articles intro/mistakes/masked links | Task 3; audit |
| Example copy / no 1:1 | Task 8 |
| Parser spoiler keyboard / external links | Tasks 5, 8 |
| Brand mark/favicon/apple/OG | Tasks 4, 6; audit |
| Localized title/og:site_name/footer | Tasks 2, 6; audit |
| Redirect dark | Task 6 |
| Docs | Task 9 |
| No JS | Tasks 5, 6; visual |
| No commits | Every task |

## Risks and review gates

1. **Copy quality** is the highest risk. Gate: Task 3 copy review; Task 9 side-by-side.
2. **Header at 320** with mark + short name + toggle + language. Gate: visual; hide brand text at ≤340 only if needed.
3. **OG raster text** may render differently on the build machine. Gate: view both PNGs; no clipping.
4. **Clipboard permissions** may block local verification. Gate: shared `copyText` fallback + select target; final test over HTTPS.
5. **Anchor drift** after article 8's section add. Gate: audit 26 targets; EN/ID.
6. **CSS ownership** — only Lane D edits `style.css`; class names frozen here.
7. **No commits** — the working tree stays dirty until the user says otherwise.
