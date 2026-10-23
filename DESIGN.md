# Design — The Message Blueprint

Contract for the rebuild of the Discord Markdown Guide. Every value here is decided; do not re-invent it. PRODUCT.md holds the product truth, this file holds the visual and structural truth.

## The direction

A Discord message, documented like a fabricated part. The home page gathers all 26 common rules into one grouped sheet; the eight articles give each family its own drawing. A numbered callout on every syntax mark. The rendered result is sealed into the sheet as a dark specimen pane — Discord's own chrome, quoted exactly. The page is the drawing; the preview is the proof.

Four rules that make it work:

1. **The sheet is paper, not chrome.** Bone stock, graphite ink, drafting grid on working surfaces, plain paper for reading.
2. **The specimen is the only dark surface.** `#313338` appears nowhere except inside a rendered-output pane. That contrast is the argument: syntax on paper, truth in the pane.
3. **State is line and label, never colour alone.** Solid = documented, dashed = unsupported, doubled = alias.
4. **Numbers behave like drawing numbers.** `01`–`08`, mono, tabular, deep-linkable. Not decorative badges.

Carried in from the challenger round, and non-negotiable:

- **Exploded pair** — source and result in one step, with a plain `↔` mapping between them. `1:1` may survive as decorative title-block metadata, never as the only explanation of a feature.
- **State without hue** — line pattern + label.
- **One ground, floating tools** — paper is the ground; nav and language switch float as detached capsules.
- **Named stops** — source → parsed → rendered are named and linkable.
- **The tape flag** — the last rule read is remembered and flagged.
- **The charge** — headings set in tight condensed caps, the way a drawing title is set.

## Tokens

### Colour

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#F2EFE7` | page ground |
| `paper-2` | `#E9E5DA` | recessed working surface, table headers |
| `ink` | `#16171B` | body, headings, heavy rules |
| `ink-2` | `#3D3F47` | secondary text |
| `ink-3` | `#63656D` | captions, metadata (≥4.5:1 on paper and paper-2) |
| `rule` | `rgba(22,23,27,0.16)` | hairlines, grid |
| `grid` | `rgba(22,23,27,0.03)` | drafting grid on working surfaces |
| `blue` | `#1F4FD8` | measured/active mark, focus ring, links |
| `blue-wash` | `rgba(31,79,216,0.08)` | link and active wash |
| `redline` | `#C63A1B` | the changed or unsupported part |
| `specimen` | `#313338` | Discord pane only |
| `specimen-ink` | `#DBDEE1` | text inside pane |
| `specimen-muted` | `#949BA4` | timestamps inside pane |
| `blurple` | `#5865F2` | mention chips inside pane only |

Dark theme is neutral, not blueprint-negative and not a Discord clone. It follows the system
by default; an explicit choice persists in `localStorage["dmg:theme"]`. The specimen pane keeps
Discord's `#313338` in both themes.

| Token | Light | Dark |
| --- | --- | --- |
| `paper` | `#F2EFE7` | `#1A1A1A` |
| `paper-2` | `#E9E5DA` | `#212121` |
| `ink` | `#16171B` | `#E8E8E8` |
| `ink-2` | `#3D3F47` | `#BCBCBC` |
| `ink-3` | `#63656D` | `#8E8E8E` |
| `rule` | `rgba(22,23,27,0.16)` | `rgba(232,232,232,0.16)` |
| `grid` | `rgba(22,23,27,0.03)` | `rgba(232,232,232,0.035)` |
| `blue` | `#1F4FD8` | `#6EA8FE` |
| `blue-wash` | `rgba(31,79,216,0.08)` | `rgba(110,168,254,0.12)` |
| `redline` | `#C63A1B` | `#F0795C` |

No gradients except the supplied mark. No glass. No second accent hue. The mark is the only
blurple outside the specimen pane.

### Type

Self-hosted via `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono`.

- Sans: IBM Plex Sans 400 / 500 / 600. Body 17px/1.65. Display 600.
- Mono: IBM Plex Mono 400 / 500. Labels, syntax, numbers, title block.

| Role | Size | Line | Tracking |
| --- | --- | --- | --- |
| Display XL (home h1) | `clamp(2.6rem, 6vw, 5rem)` | 0.94 | -0.03em |
| Display L (article h1) | `clamp(2rem, 4vw, 3.15rem)` | 1.0 | -0.025em |
| H2 | `1.5rem` | 1.15 | -0.015em |
| H3 | `1.125rem` | 1.3 | -0.005em |
| Body | `1.0625rem` | 1.65 | 0 |
| Small | `0.875rem` | 1.5 | 0 |
| Label | `0.6875rem` mono | 1.2 | 0.14em uppercase |
| Micro | `0.625rem` mono | 1.1 | 0.12em uppercase |

Headings use `text-wrap: balance`. Body copy max `68ch`. Uppercase only for mono labels and the display's short kicker lines — never for sentences.

### Space, grid, edge

4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
Sheet max width `1200px`; page padding `20px` mobile / `40px` desktop; rail `220px` + `48px` gap.
Radii: `0` for sheets and figures, `4px` for syntax chips, `6px` for the specimen pane, `999px` only for the floating nav and language switch.
Borders: `1px solid var(--rule)` for hairlines, `1px solid var(--ink)` for frames and the title block. No drop shadows except a single short one under the specimen pane.

Working surfaces (hero, playground, index header) carry a `24px` drafting grid at 3% ink. Reading surfaces stay plain.

### Motion

`120ms cubic-bezier(.2,0,0,1)` for colour and border; `180ms` for pane content. Hover states only. No scroll-triggered animation, no ambient motion. `prefers-reduced-motion: reduce` removes all transitions.

## Page anatomy

### Header (every page)

One floating capsule on a paper shelf: a `56px` band of `--paper`, flush to the viewport top, closed by a `1px --rule` hairline along its bottom edge, so scrolling content never shows through beside the pill. Inside it, the supplied 24 px mark plus the short name "Discord Markdown" / "Markdown Discord", then `Cheat sheet`, `Playground`, a 36 px theme toggle, then the language switch `EN · ID` as two small links. Current locale underlined with a 1px ink rule. The brand link's accessible name is the full site name; the mark is `alt=""`.

On a phone the capsule keeps the brand, toggle, and language switch; the nav text is hidden below 380 px and the brand text below 340 px, leaving the 24 px mark with the site-name label. The toggle sits between nav and language, has a dynamic action label ("Switch to dark mode" / "Switch to light mode"), and uses `--blue` on paper and `--specimen-ink` inside the specimen.

A skip link precedes everything: visible on focus, top-left, paper on ink.

### Home — Cheat sheet

The home page is the cheat sheet, not an index of drawings. Order inside `<main>`:

1. Intro block: kicker `Cheat sheet` / `Contekan`, display XL headline, one-paragraph lede, and a text link to the playground. No hero exploded pair.
2. Tape flag (`dmg:last`): "Pick up where you left off" plus the sheet number and title, with a `Resume` link. Hidden until a sheet has been read. It sits above the search row.
3. Search tools: visible label "Find a rule", `<input type="search">`, a language-neutral count (`shown / total`), a clear button shown only when the query is non-empty, and an empty state with a reset action.
4. Four groups in order — Text (6), Blocks (10), People & time (7), More (3), 26 rows total.
5. Footer: the title block.

A group is a `<dl>` with one `<dt>` label and two `<dd>` cells per row: the exact syntax in a mono chip with a copy button, and the rendered Discord result in a compact specimen strip. On desktop the three columns align under a per-group header (`label`, `You type`, `Discord shows`). On mobile each row stacks label → syntax → result with no horizontal page scroll.

Twenty-two rows copy. The four rows that require a live user, role, channel, or custom-emoji id have no copy button; their label links to the article section that explains where the id comes from. All 26 labels deep-link to the matching localized article anchor.

Search filters the 26 rows client-side: normalize with `toLowerCase().trim()`, split on whitespace, require every token to appear in the row's build-time keywords, hide non-matching rows and empty groups, and update the visual count. No URL state, no persistence, no debounce. Clear, reset, and Escape restore all rows and return focus to the input. The empty state is the only `role="status"` region, so typing does not announce every count.

Without JS, all 26 rows remain visible and readable; search, copy buttons, and the theme toggle are hidden rather than shown inert.

### Article — Sheet 01…08

Desktop: left rail (`220px`, sticky at 96px) + sheet.

Rail contents, in order: `DETAIL 0N` label, the eight-number index (current one marked with a filled 6px blue square and `aria-current="page"`), a hairline, `On this sheet` + the article's `h2` headings from `entry.render()`.

Sheet: kicker `DETAIL 03 / SHEET 03 OF 08`, display L title, plain `intro` lede, hairline, the "Common mistakes" / "Sering salah" callout, MDX body, then prev/next as two text links in a hairline-bounded row (`← Sheet 02` / `Sheet 04 →`).

Body prose: 17px on a `68ch` measure. H2 gets a `2px` ink rule above and `48px` top margin. H3 bare. Links: ink with a 2px blue underline at 3px offset; hover fills blue tint. Inline code: mono 0.9em, `paper-2` ground, 1px rule, 4px radius, no backticks shown. Inline code wraps with `overflow-wrap: anywhere` and `white-space: pre-wrap` so a long command cannot widen the page.

The callout is a `paper-2` frame with a `2px` redline left edge, a redline square plus the localized mono label, and list markers in `ink-3`; body text stays in ink. Inline code inside it uses paper chips and wraps. It holds 2-3 symptom → fix items and sits before the long-form "Watch out" section.

Example figure (`<Example>`): the core component.

```
FIG 03.1  YOU TYPE                                 DISCORD SHOWS
┌────────────────────────┐   ┌───────────────────────────────┐
│ **bold**               │ ↔ │  bold                         │
└────────────────────────┘   └───────────────────────────────┘
Asterisks mark the span. They never appear.
```

- Framed source block on paper, mono 14px, horizontal scroll if long, with a `Copy` / `Salin` button in its header. The button copies the exact source, including newlines.
- Decorative `↔` mapping between panes, hidden below 720px. No `1:1` label.
- Specimen: `#313338`, 6px radius, `16px` padding, sans, `#DBDEE1`; mention chips use `blurple` at 20% with full-strength text. In dark mode it gains a 1 px rule so it separates from `#1A1A1A`.
- Caption: 13px `ink-3`, max `60ch`.
- Multi-line sources stack vertically: source full width, then the mapping mark, then specimen. Long quote/code content inside the specimen scrolls inside its own pane rather than widening the page.

### Playground — Sheet 09

Header as an article: kicker, display L, lede, hairline.

Bench: two panes on `paper-2` working surface with drafting grid.

- Left `You type` / `Yang kamu ketik`: mono textarea, 16px, min-height 340px, resize vertical, line numbers in a `3ch` gutter (CSS counters or a mirrored plain-text column — no JS required). Label is a real `<label for>`.
- Right `Discord shows` / `Yang muncul di Discord`: the dark pane, live region `aria-live="polite"`, min-height 340px. Rendered by `toHTML`.
- Between them on desktop: a decorative mapping mark, not a `PARSE → RENDER / 1:1` label.

Toolbar under the bench, hairline-separated: `Copy source` (copies through the shared `copyText`, label flips to `Copied` for 2s), `Reset`, and three sample chips (`Formatting`, `Mentions`, `Code`). All 44px min height; focus ring `2px blue` at `2px` offset. If copying fails, focus and select the textarea and announce "Select and copy" through the shared status region.

Below: one line of small print — "Rendered live in your browser. Nothing leaves your browser."

### Reusable title block (footer)

A ruled 4-column block, mono micro, on every page:

```
DRAWN BY geetcr4ck   SCALE 1:1   REVISION 2026.10   SHEET 00 / 09
```

Right-most cell holds `EN` or `ID`. On mobile it becomes two rows. Above it, one small line: site name + link to `https://github.com/geetcr4ck/discord-markdown-guide` and a `NOTICE` mention. No social icons.

### 404

Kicker `SHEET —`, display L `Sheet not found`, one line of copy, link back to `/en/` (or `/id/`), same title block.

## Route contract

Static, `prefixDefaultLocale: true`, both locales always prefixed.

| Path | File |
| --- | --- |
| `/` | `src/pages/index.astro` — meta refresh + link to `/en/`, `noindex`, canonical `/en/` |
| `/en/`, `/id/` | `src/pages/[lang]/index.astro` |
| `/en/<slug>`, `/id/<slug>` | `src/pages/[lang]/[slug].astro` |
| `/en/play`, `/id/play` | `src/pages/[lang]/play.astro` (static wins over `[slug]`) |
| 404 | `src/pages/404.astro` |

`trailingSlash: 'never'`. Every internal link is built by a helper, never string-concatenated in a component:

```ts
// src/i18n/routes.ts
export type Lang = 'en' | 'id';
export const locales: Lang[] = ['en', 'id'];
export function home(lang: Lang) { return `/${lang}`; }
export function article(lang: Lang, slug: string) { return `/${lang}/${slug}`; }
export function play(lang: Lang) { return `/${lang}/play`; }
export function switchLocale(pathname: string, lang: Lang) {
  const parts = pathname.split('/').filter(Boolean);
  parts[0] = lang;
  return `/${parts.join('/')}`;
}
```

`Astro.currentLocale` is the locale source. Never read it from a prop when the URL has it.

SEO: `<html lang>` matches locale; `<link rel="canonical">` self; `<link rel="alternate" hreflang="en|id|x-default">` on every page; OG title/description/image; `og:locale` `en_US` / `id_ID`.

## Content contract

`src/content/feature/en/*.mdx` and `src/content/feature/id/*.mdx`. `entry.slug` is `en/<slug>`; split on `/`.

Frontmatter:

```yaml
title: Text formatting
description: Bold, italic, underline, strikethrough.
intro: "Make a few words stand out without changing the sentence around them."
mistakes:
  - "`*word` with no closing marker sends the asterisk."
  - "`** word **` with spaces inside the markers does not render."
order: 1
sample: "**bold** *italic* ~~struck~~"
```

`intro` is required and is the visible article lede; `description` remains the SEO/OG sentence. `mistakes` is a required array of 2–3 concrete items. `sample` is parsed with default callbacks and used by the sheet, not as a separate home index. Examples carry `data-copy-target` and a source-header copy button.

MDX components:

```mdx
import Example from '../../../components/example.astro'

<Example
  source="**bold**"
  caption="Asterisks mark the span. They never appear."
  discord={{ user: '@geetcr4ck' }}
/>
```

`Example` props: `source` (string, required), `caption` (string, optional), `discord` (record of callback name → string, optional). Everything else is derived. The component reads its own labels from `src/i18n/ui.ts`.

Playground island: `src/components/react/playground.tsx`, props `defaultValue`, `samples`, `labels`, and `lang`. Mounted with `client:load`, with the textarea server-rendered so it works before hydration. It is the only hydrated island; home and article pages remain static. Its spoilers are initialized in a `useEffect` after hydration so the global spoiler pass does not mutate the island before React hydrates.

## Copy deck

All UI copy lives in `src/i18n/ui.ts` as `{ en: {...}, id: {...} }`. These exact strings are approved; do not rewrite them.

The full final deck lives in `apps/web/src/i18n/ui.ts`; these are the load-bearing strings.

| Key | EN | ID |
| --- | --- | --- |
| `site.name` | Discord Markdown Guide | Panduan Markdown Discord |
| `site.tagline` | Every rule, with the result beside it. | Semua aturan, lengkap dengan hasilnya. |
| `site.description` | Every Discord Markdown rule, with your text rendered exactly as Discord renders it. | Setiap aturan Markdown Discord, dengan teks kamu dirender persis seperti di Discord. |
| `brand.short` | Discord Markdown | Markdown Discord |
| `nav.cheatsheet` | Cheat sheet | Contekan |
| `nav.playground` | Playground | Playground |
| `home.kicker` | Cheat sheet | Contekan |
| `home.title` | Discord Markdown, at a glance. | Markdown Discord, sekali lihat. |
| `home.lede` | Type this on the left; Discord shows this on the right. Copy what you need. | Ketik yang di kiri; Discord menampilkan yang di kanan. Salin yang kamu butuh. |
| `home.cta` | Want to test something? Open the playground. | Mau mencoba dulu? Buka playground. |
| `home.flag` | Pick up where you left off | Lanjutkan |
| `home.flagCta` | Resume | Lanjut |
| `play.kicker` | Sheet 09 — Playground | Lembar 09 — Playground |
| `play.title` | Playground | Playground |
| `play.lede` | Type on the left; the Discord result appears on the right. Try a sample or paste your own message. | Ketik di kiri; hasil Discord muncul di kanan. Coba contoh atau tempel pesanmu sendiri. |
| `play.source` | You type | Yang kamu ketik |
| `play.specimen` | Discord shows | Yang muncul di Discord |
| `play.copy` | Copy source | Salin sumber |
| `play.copied` | Copied | Tersalin |
| `play.reset` | Reset | Atur ulang |
| `play.samples` | Samples | Contoh |
| `play.note` | Rendered live in your browser. Nothing leaves your browser. | Dirender langsung di perambanmu. Tidak ada yang meninggalkan perambanmu. |
| `article.mistakes` | Common mistakes | Sering salah |
| `cheat.search` | Find a rule | Cari aturan |
| `cheat.placeholder` | Try “spoiler” or “quote” | Coba “spoiler” atau “kutipan” |
| `cheat.countLabel` | Rules shown | Aturan tampil |
| `cheat.empty` | No rule matches that search. | Tidak ada aturan yang cocok. |
| `cheat.reset` | Show all | Tampilkan semua |
| `cheat.clear` | Clear search | Hapus pencarian |
| `cheat.copy` | Copy | Salin |
| `cheat.copied` | Copied | Tersalin |
| `cheat.copyManual` | Select and copy | Pilih lalu salin |
| `cheat.youType` | You type | Yang kamu ketik |
| `cheat.discordShows` | Discord shows | Yang muncul di Discord |
| `cheat.group.text` | Text | Teks |
| `cheat.group.blocks` | Blocks | Blok |
| `cheat.group.people` | People & time | Orang & waktu |
| `cheat.group.more` | More | Lainnya |
| `theme.toDark` | Switch to dark mode | Ganti ke mode gelap |
| `theme.toLight` | Switch to light mode | Ganti ke mode terang |
| `titleBlock.scale` | Scale | Skala |
| `titleBlock.revision` | Revision | Revisi |
| `titleBlock.sheet` | Sheet | Lembar |

Indonesian uses **kamu**, not Anda. Never mix. EN copy avoids "simply", "just", and "obviously".

## Accessibility floor (WCAG 2.2 AA)

- Contrast: light ink/paper 15.59, ink-2 9.14, ink-3 5.06, blue 5.77; dark ink/paper 14.20, ink-2 9.16, ink-3 5.31, blue 7.21; specimen ink/pane 9.36, specimen muted 4.50. Never use light `--blue` as text or focus inside the specimen; use `--specimen-ink`.
- One `h1` per page. Discord-rendered headings are `<div class="discord-h1|h2|h3">`, never `<h1>`–`<h3>`; article exempt headings remain real headings.
- The sheet uses `<dl>` rows with one `<dt>` link and two `<dd>` cells. Every row keeps its localized anchor target; the four live-id rows are label-only. No empty links.
- Search has a visible `<label>`, `type="search"`, a labelled visual count, and exactly one `role="status"` region for the empty state.
- Copy buttons have an accessible name including the rule ("Copy: Bold" / "Salin: Tebal") and a shared live region that announces success once. Failure selects the nearest `[data-copy-target]` and announces "Select and copy".
- Spoilers in every specimen are keyboard-revealable: `tabindex="0"`, `role="button"`, `aria-expanded` toggled by click, Enter, and Space. Hover/focus remains a fallback.
- The playground textarea has a visible `<label>`; the preview is `aria-live="polite"` and named by `play.specimen`.
- Buttons and links: 44×44px minimum; copy buttons keep their size at 320 px. The theme toggle is 36×36.
- Keyboard: skip link first, then header, then main, then footer. No focus traps. The article rail is a `<nav aria-label>`.
- Theme: system preference by default; explicit choice persists; no flash. The toggle's accessible name states the action, not `aria-pressed`.
- Motion respects `prefers-reduced-motion`.

## Performance floor

- No hydrated islands on home and article pages; the only island is the playground. Home interactivity (search, copy, theme, tape flag) is vanilla TypeScript; the head boot script applies the stored theme before paint.
- Fonts self-hosted, `font-display: swap`, subset per weight.
- No analytics, no third-party requests at runtime.
- Images: the supplied mark and generated favicons/OG cards (`og.png`, `og-id.png`); no decorative hero image — the sheet is CSS and inline SVG.

## Do not

- Do not build a dark Discord clone. The neutral dark theme is a reading surface; the specimen pane keeps Discord's `#313338` and is the only Discord chrome.
- Do not use rounded cards, glass panels, gradient text, emoji icons, or purple-blue gradients. The supplied mark is the only gradient.
- Do not add a stats bar, testimonials, badges, or a "trusted by" row. We have no evidence.
- Do not add a text-only custom wordmark; the header is the supplied mark plus the short name "Discord Markdown" / "Markdown Discord".
- Do not use `1:1` as a functional label or as the only explanation of a feature; decorative title-block metadata may remain.
- Do not reference any other author, repository, or product identity in the UI, metadata, or code comments outside the licence notices.
