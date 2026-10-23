# Beginner cheat sheet and dark mode

Date: 2026-10-23
Status: Draft for approval
Amends: `DESIGN.md` (brand mark, home anatomy, labels, theme), `PRODUCT.md` (audience,
success measure)
Builds on: the existing Astro 4.16 static site, its parser, and the 8 × 2 articles

## Why

The reader this is for already uses Discord. He does not know the syntax. He types a
guess, gets plain text or the wrong shape, and cannot tell which marker failed. Today the
site is precise, but it speaks to people who already know the vocabulary: *specimen*,
*sheet*, *1:1*, *fenced code*. The home page is an index of drawings, not something he can
use while writing a message.

This change makes the home page the thing he needs at the moment of writing: one complete,
grouped cheat sheet where every rule shows the typed form, the Discord result, a link to
the deep explanation, and — where copying helps — a copy button. The eight articles keep
their depth and gain a plain-language entry layer. A neutral dark theme is added for
reading at night.

Success: on a 390 px phone, a reader who knows what he wants to write finds the matching
row and copies it (or reaches the id instructions) without leaving the first flow; a
first-time reader understands what the page is for before scrolling.

## Locked decisions

| Decision | Choice |
| --- | --- |
| Role of the site | Quick reference used while writing, not a course |
| Home page | The cheat sheet itself; no separate route |
| Coverage | Every syntax family a reader can type by hand; the 26-row table is authoritative |
| Row targets | Per-locale anchors, because Indonesian headings slugify in Indonesian |
| Labels | Plain functional words; blueprint look retained |
| Brand | Supplied `dmdg.png` mark + short header name "Discord Markdown" / "Markdown Discord"; the old "DM / GUIDE" is removed |
| Interaction | Per-row copy on 22 rows + client-side filter |
| Articles | Keep depth; add plain intro, "common mistakes", copy on examples |
| Dark mode | Neutral dark (chosen by the user), not blueprint-negative, not Discord-exact |
| Specimen pane | Stays Discord's `#313338` in both themes |
| Language | EN + ID at full parity, including the sheet and its search |
| Hydration | None added; the playground remains the only React island |
| Masked links | Add to article 8 and to the sheet; rename article 8 accordingly |

## 1. Information architecture

No routes change. Home stays `/{lang}/` and becomes the sheet. The eight articles stay at
`/{lang}/{slug}`, the playground at `/{lang}/play`, the root redirect and 404 stay.

- The sheet replaces the home index. There is no separate "all articles" page: each rule's
  label links to its section in the relevant article, and the article rail still lists all
  eight.
- Header nav: the existing "Index" link becomes "Cheat sheet" / "Contekan" and points home.
  The brand link keeps its home destination but becomes the mark + short name (§5.5). The
  article rail's aria label stays "Index" / "Indeks".
- The tape flag ("Last sheet you read") stays; it moves above the search row.

## 2. Home anatomy

Order inside `<main>`:

1. Skip link (unchanged).
2. Header shelf (see §5 and §5.5).
3. Intro block:
   - kicker: "Cheat sheet" / "Contekan"
   - `h1`: "Discord Markdown, at a glance." / "Markdown Discord, sekali lihat."
   - lede: "Type this on the left; Discord shows this on the right. Copy what you need."
     / "Ketik yang di kiri; Discord menampilkan yang di kanan. Salin yang kamu butuh."
   - one text link to the playground: "Want to test something? Open the playground."
     / "Mau mencoba dulu? Buka playground."
4. Tape flag (hidden until `dmg:last` exists), copy:
   "Pick up where you left off" / "Lanjutkan" + sheet number and title.
5. Sheet tools:
   - visible label "Find a rule" / "Cari aturan", `<input type="search">`
   - count `26 / 26` (shown / total; see §6)
   - clear button, shown only when the query is non-empty
   - empty state with a reset action
6. Four groups, in this order: Text, Blocks, People & time, More
   (Teks, Blok, Orang & waktu, Lainnya).
7. Footer (unchanged).

Removed from the home: the hero exploded pair, `DETAIL 00.1`, the 8-row drawing index,
`home.index`, `home.indexNote`, `hero.caption`, and the `home` variant of `sheet-index`.
The sheet's own rows are the exploded pairs; a second one is duplication.

### Row anatomy

Each rule is a `<div>` in a `<dl>` per group:

- `<dt>`: the rule label, itself the link to the article section.
- `<dd>` syntax: mono chip with the exact text, plus a copy button.
- `<dd>` result: the real parser output inside a compact specimen strip.

Desktop: three aligned columns with a per-group column header (label, "You type",
"Discord shows"). Mobile: each rule stacks label → syntax → result; no horizontal scroll.

The conceptual table is a glossary, so `<dl>` is correct. Do not use table semantics that
break when rows stack.

Rows whose syntax needs a live id (user, role, channel, custom emoji) have no copy button;
their label links to the article section that shows the syntax, and that article's
"Finding an id" / "Mencari id" section explains where the number comes from. Copying a
placeholder id would produce a dead token and teach the wrong thing. That leaves 22 copy
buttons and 4 label-only rows.

## 3. Sheet content model

New file `apps/web/src/content/cheatsheet.ts`:

```ts
type Localized = { en: string; id: string };

type CheatRow = {
  group: "text" | "blocks" | "people" | "more";
  label: Localized;
  keywords: string;          // both languages + synonyms + the syntax itself
  syntax: Localized;         // copied verbatim; placeholders where a real id is needed
  render?: Localized;        // defaults to syntax; fuller sentences where useful
  discord?: Record<string, string>; // strings; the component wraps each in () => value
  copy?: boolean;            // default true; false on the four live-id rows
  slug: string;              // article slug, e.g. "text-formatting"
  anchor: Localized;         // EN and ID heading ids
};
```

- Rendered at build with the site's `toHTML(render, { locale, discordCallback })`; the HTML
  is trusted output of our own parser.
- `discord` values are strings for authoring convenience. The component wraps each value in
  a function (`acc[key] = () => value`) exactly as `example.astro` does; passing the raw
  record would throw when the parser calls it.
- Href = `/${lang}/${slug}#${anchor[lang]}`. Every href is verified against built HTML: the
  EN and ID headings have different ids (`#bold` vs `#tebal`).
- Data is not hydrated. The Astro component renders all rows; a small vanilla script
  filters and copies (§6).
- Multi-line results are clamped by CSS (`max-height`, fade or scroll) so one code block
  cannot dominate the page.

### Rows (26)

† = no copy button (requires a live id). The Target column is `article#EN-anchor / #ID-anchor`;
the slug is shared.

**Text / Teks**

| EN | ID | Syntax (EN sample) | Target |
| --- | --- | --- | --- |
| Bold | Tebal | `**bold**` | `text-formatting#bold / #tebal` |
| Italic | Miring | `*italic*` | `text-formatting#italic / #miring` |
| Underline | Garis bawah | `__underline__` | `text-formatting#underline-and-strikethrough / #garis-bawah-dan-coretan` |
| Strikethrough | Coret | `~~struck~~` | `text-formatting#underline-and-strikethrough / #garis-bawah-dan-coretan` |
| Bold italic | Tebal miring | `***both***` | `text-formatting#combining-markers / #menggabungkan-penanda` |
| Escape a marker | Netralkan penanda | `\*not italic\*` | `text-formatting#escaping / #escape` |

**Blocks / Blok**

| EN | ID | Syntax (EN sample) | Target |
| --- | --- | --- | --- |
| Heading | Judul | `# Heading` | `organizational-text-formatting#headings / #judul` |
| Subheading | Subjudul | `## Subheading` | `organizational-text-formatting#headings / #judul` |
| Subtext | Teks kecil | `-# small print` | `organizational-text-formatting#subtext / #subteks` |
| Bulleted list | Daftar poin | `- item` | `organizational-text-formatting#lists / #daftar` |
| Numbered list | Daftar nomor | `1. item` | `organizational-text-formatting#lists / #daftar` |
| Quote | Kutipan | `> quoted line` | `block-quotes#one-line / #satu-baris` |
| Multiline quote | Kutipan panjang | `>>> quoted lines` | `block-quotes#several-lines / #beberapa-baris` |
| Inline code | Kode sisipan | `` `code` `` | `code-blocks#inline-code / #inline-code` |
| Code block | Blok kode | exact fence below | `code-blocks#fenced-blocks / #blok-berpagar` |
| Code with language | Blok kode berwarna | exact fence below | `syntax-highlighting#the-rule / #aturannya` |

**People & time / Orang & waktu**

| EN | ID | Syntax | Target |
| --- | --- | --- | --- |
| User mention † | Sebut pengguna | `<@123456789012345678>` | `mentions#users / #pengguna` |
| Role mention † | Sebut role | `<@&123456789012345678>` | `mentions#roles-and-channels / #role-dan-channel` |
| Channel link † | Tautan channel | `<#123456789012345678>` | `mentions#roles-and-channels / #role-dan-channel` |
| Custom emoji † | Emoji khusus | `<:name:123456789012345678>` | `mentions#custom-emoji / #emoji-khusus` |
| Everyone | Semua orang | `@everyone` | `mentions#everyone-and-here / #everyone-dan-here` |
| Here | Yang sedang online | `@here` | `mentions#everyone-and-here / #everyone-dan-here` |
| Timestamp | Stempel waktu | `<t:1700000000:F>` | `misc#timestamps / #timestamp` |

**More / Lainnya**

| EN | ID | Syntax | Target |
| --- | --- | --- | --- |
| Inline spoiler | Spoiler sisipan | `\|\|secret\|\|` | `spoiler-tags#inline / #inline` |
| Block spoiler | Spoiler blok | exact multiline below | `spoiler-tags#a-whole-block / #satu-blok-penuh` |
| Masked link | Tautan berteks | `[text](https://example.com)` | `misc#masked-links / #tautan-berteks` |

Exact multiline samples. Line breaks are real newlines; the copy button copies the whole
block. Code is language-neutral, so both locales use the same code.

**Code block**

````text
```
const total = price * quantity
console.log(total)
```
````

**Language-tagged block**

````text
```js
const total = price * quantity
```
````

**Block spoiler** — EN:

````text
||The guest arrives
at eight.||
````

ID:

````text
||Tamunya datang
pukul delapan.||
````

**Multiline quote** — EN:

````text
>>> the migration is blocked
until Friday
````

ID:

````text
>>> migrasi tertunda
sampai Jumat
````

Notes:

- ID samples translate the words (`**tebal**`, `# Judul`, `> baris kutipan`); markers are
  identical and the data carries both strings.
- Mention rows render with callbacks: user `@geetcr4ck`, role `@Moderator`, channel
  `#general`, emoji `🚀`.
- Timestamp uses `F` (absolute) so the rendered date is stable; the article explains the
  reader's locale.
- The escape row's result intentionally shows literal asterisks.
- The 26-row table is authoritative. Variants that compose an existing row (H3, nested
  lists, nested quotes) and forms that cannot be typed by hand (the slash picker, message
  links) stay in the articles. All eight articles are still one click away: the language row
  targets `syntax-highlighting`, not `code-blocks`.
- Pseudo-mentions (`<id:guide>`) are deliberately not a row: the parser renders
  "Server Guide" in English in both locales, which would leak English on `/id`. The misc
  article still documents them.
- The four † rows point at their syntax section; the same article contains "Finding an id" /
  "Mencari id", and the section's copy makes that clear.

## 4. Articles: beginner layer

All 16 article files gain two required frontmatter fields (schema required, not optional):

```ts
intro: z.string().min(40).max(240),
mistakes: z.array(z.string().min(10).max(140)).min(2).max(3),
```

- `intro` replaces nothing: `description` stays the SEO/OG sentence. The article header's
  visible lede switches from `description` to `intro`; `description` is no longer rendered
  as body text. The intro is 1–2 plain sentences, no jargon, answering "what is this for?".
- `mistakes` is a "Common mistakes" / "Sering salah" callout directly under the intro,
  before the body. Symptom → fix, concrete, no theory. A redline square marks it; the label
  comes from `article.mistakes`; the body text stays in ink (state without hue).
- The existing "Watch out" sections remain as the deeper explanation. The callout is the
  scan layer, not a replacement.
- Wording rules: EN plain, active; ID uses **kamu**, never Anda; no "simply", "just",
  "obviously"; no claims not verified against the article or parser.

Worked example, article 1:

EN intro: "Make a few words stand out without changing the sentence around them. Every
marker below works in a normal message."

ID intro: "Buat beberapa kata menonjol tanpa mengubah kalimat di sekitarnya. Semua penanda
di bawah berlaku di pesan biasa."

Mistakes (EN): "`*word` with no closing marker sends the asterisk.", "`** word **` with
spaces inside the markers does not render.", "`__word__` is underline, not italic."

The author verifies each mistake against the article or the parser before writing it.

### Copy on examples

Every `<Example>` source pane gets the same copy affordance as a sheet row:

- button in the source header, label "Copy" / "Salin", 44 px target on touch
- copies the raw source exactly, including newlines
- feedback "Copied" / "Tersalin" for 2 s, announced once via a shared live region
- failure order: Clipboard API → hidden-textarea `execCommand("copy")` → select the source
  text (`<pre><code>` for an example, the syntax `<code>` for a sheet row) and announce
  "Select and copy" / "Pilih lalu salin". The select target is the nearest
  `[data-copy-target]`; every copyable row and example carries one.

### Masked links

Article 8 (`misc`) gains `## Masked links` after "Message links"
(ID: `## Tautan berteks`, which produces the `#tautan-berteks` anchor):

- `[text](https://example.com)` renders as a link whose label is the text
- the URL must be `http(s)`; the label is what the reader sees
- do not claim embed suppression; that is a different rule and not covered here

Rename:

- EN title: "Links, timestamps & commands"
- ID title: "Tautan, stempel waktu & perintah"
- descriptions updated to mention links
- sample: `[text](https://example.com)`
- slug, order, and URL stay `misc`

## 5. Dark mode

Direction: **neutral dark**, chosen by the user from three options. Not blueprint-negative,
not a copy of Discord's chrome. The structure, type, rules, and blue accent remain; only the
surface values change. The specimen pane stays Discord's own surface so every result is
still honest.

### Tokens

Add the dark block twice (media fallback + explicit override), or define one shared block
if a no-duplication method is available without new dependencies. Values:

| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#F2EFE7` | `#1A1A1A` |
| `--paper-2` / `--paper2` | `#E9E5DA` | `#212121` |
| `--ink` | `#16171B` | `#E8E8E8` |
| `--ink-2` / `--ink2` | `#3D3F47` | `#BCBCBC` |
| `--ink-3` / `--ink3` | `#63656D` (darkened from `#6A6C75`) | `#8E8E8E` |
| `--rule` | `rgba(22,23,27,.16)` | `rgba(232,232,232,.16)` |
| `--blue` | `#1F4FD8` | `#6EA8FE` |
| `--redline` | `#C63A1B` | `#F0795C` |
| `--grid` (new) | `rgba(22,23,27,.03)` | `rgba(232,232,232,.035)` |
| `--blue-wash` (new) | `rgba(31,79,216,.08)` | `rgba(110,168,254,.12)` |
| `--specimen*` | unchanged | unchanged |

Contrast (computed, WCAG 2.2; normal text needs 4.5, UI 3.0):

Light theme:

- ink/paper 15.59, ink/paper2 14.23
- ink2/paper 9.14, ink2/paper2 8.34
- ink3/paper 5.06, ink3/paper2 4.62 (why `#63656D` replaces `#6A6C75`, which was 4.16)
- blue/paper 5.77, blue/paper2 5.27
- redline/paper 4.54, redline/paper2 4.15 (text only on paper; the square mark may sit on paper2)
- specimen ink/pane 9.36, specimen muted/pane 4.50

Dark theme:

- ink/paper 14.20, ink/paper2 13.14
- ink2/paper 9.16, ink2/paper2 8.48
- ink3/paper 5.31, ink3/paper2 4.91
- blue/paper 7.21, blue/paper2 6.67
- redline/paper 6.29, redline/paper2 5.82
- specimen ink/pane 9.36, specimen muted/pane 4.50

`--blue` (light) on the specimen is 1.91 and must never be the focus ring or text there;
use `--specimen-ink` for focus inside the pane.

### Mechanics

- Selectors:
  - `:root` = light tokens, `color-scheme: light`
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { …dark… } }`
  - `:root[data-theme="dark"] { …dark… }`
- A tiny inline script in `<head>` runs before paint:
  - reads `localStorage["dmg:theme"]` inside `try/catch`; if `light` or `dark`, sets
    `document.documentElement.dataset.theme`
  - adds `js` to `<html>` unconditionally, after the storage block, so a blocked
    localStorage cannot hide the controls
  - syncs the `theme-color` metas to the effective background
- No flash: system dark is handled by CSS before paint; an explicit stored choice is applied
  by the head script.
- No JS: system preference still applies through the media query; the toggle is hidden.
- `color-scheme` follows the effective theme so scrollbars and form controls match.
- `theme-color`: two metas, light and dark, each with the matching
  `media="(prefers-color-scheme: …)"` so no-JS dark gets a dark browser chrome. The boot and
  toggle scripts set both metas to the effective colour, so an explicit choice against the
  system still matches. When there is no stored choice, the media-change listener re-syncs
  them.
- Root redirect page (`src/pages/index.astro`): remove the inline `style` attributes (they
  beat a normal media rule) and use a small style block with the light values plus a
  `prefers-color-scheme: dark` override. It is a flash page, no toggle.

### Toggle

- In the 56 px header capsule, between the nav link and the language group.
- 36 × 36 px, inline SVG (moon when light, sun when dark), `currentColor`.
- Dynamic accessible name: "Switch to dark mode" / "Ganti ke mode gelap", and the inverse
  when dark. No `aria-pressed`; the label states the action.
- Click: compute effective theme, set the opposite explicitly in `data-theme`, persist to
  `dmg:theme`, update the icon, label, and theme-color.
- When there is no stored choice, a change in `prefers-color-scheme` updates the page live.
- At ≤380 px, hide the textual nav link so brand + toggle + language fit. The brand link
  stays; at ≤340 px, if 320 px still overflows, hide the short brand text and keep the 24 px
  mark with `aria-label` = site name. Test 320/360/390.
- Focus ring: `--blue` on paper surfaces; inside `.specimen-pane` use `--specimen-ink`
  (9.36) because light blue is 1.91 there.

### Exceptions

- `.specimen-pane` and all Discord-rendered content keep their own dark values; in dark mode
  add a 1 px light rule or border so the pane separates from `#1A1A1A`.
- Audit `.specimen-pane` descendants for site tokens. `.discord-subtext` currently uses
  `var(--ink3)`, which is ~2.45:1 on `#313338`; switch it to `--specimen-muted` (4.50). Any
  other descendant that resolves to `--ink`, `--paper`, `--blue`, or `--redline` gets the
  matching specimen token.
- Replace the hardcoded `rgba(22,23,27,.03)` drafting grid with `--grid`; the blue link wash
  with `--blue-wash`.
- Blurple tints, spoiler fill, inline-code fill, and highlight.js colours inside specimens
  stay as they are: they simulate Discord, not the site.
- Shadows: a black shadow is invisible on `#1A1A1A`; pair the specimen shadow with a border
  (above). Do not add new glow or gradient.

## 5.5 Brand assets (mark, favicon, OG)

The supplied mark is `dmdg.png`: 2048×2048, opaque (alpha 255 everywhere sampled), a
blurple ground (~#5B62EE with subtle variation) and a white speech bubble with "M↓". It is
the one place a gradient is allowed; do not recolor it or add gradients elsewhere.

Commit the source at `apps/web/src/assets/dmdg.png` (not served; keeps 3.5 MB out of
`dist`). Generate every derivative from a square crop around the white mark: the sampled
bbox is x 344..1704, y 432..1696; a 1578×1578 crop at (235,275) leaves ~8% horizontal
padding. Recompute the bbox in the script; these numbers describe the current source.

Outputs in `apps/web/public/`:

| File | Size | Use |
| --- | --- | --- |
| `favicon-32.png` | 32×32 | tab icon |
| `favicon-48.png` | 48×48 | tab icon on 2× displays; keeps the outline legible |
| `apple-touch-icon.png` | 180×180 | iOS home screen; opaque |
| `logo-96.png` | 96×96 | header mark, displayed 24×24 |
| `og.png` | 1200×630 | EN social card (replaces the old file) |
| `og-id.png` | 1200×630 | ID social card |

Delete `favicon.svg` (old asterisk). Head links: `favicon-32.png` (32), `favicon-48.png`
(48), `apple-touch-icon.png` (180); no SVG link.

Header:

- Replace the hardcoded "DM / GUIDE" with the 24×24 mark plus `brand.short` ("Discord
  Markdown" / "Markdown Discord").
- Text: Plex Sans 600, 14px, `--ink`; sentence case, no tracking-wider. The mark is
  `alt=""`; the link's `aria-label` is `site.name` (the full name). 8px gap; no border or
  shadow; 4px radius at most.
- The mark is the only bitmap and the only blurple outside the specimen pane; use it as-is
  in both themes, with no dark-mode ring.
- Width: the mark + short name fits at 390. At ≤380 hide the nav text; at ≤340 hide the
  brand text only if 320 still overflows, leaving the mark with the site-name label.

OG (same layout, localized text; title = `site.name`, sub = `site.tagline` from §7):

- 1200×630, bone `#F2EFE7`; logo 280×280 at (96, 175); text starts at x = 424.
- Title 56px/600 `--ink`; sub 28px/400 `--ink2`; blue rule 120×6; URL
  `discord-markdown-guide.pages.dev` 18px `--ink3`.
- No old asterisk, no "1:1", no gradient outside the mark. A system sans fallback is fine
  for raster text; do not add a font dependency for the OG.

Implementation:

- New `scripts/generate-brand-assets.mjs` generates all six outputs with `sharp`; add
  `sharp` to the root devDependencies (already in the pnpm store via Astro; dev-only, not
  part of `pnpm build`). Commit the outputs.
- `constants.ts`: add `SITE_IMAGE_ID = "/og-id.png"`.
- `Sheet.astro`: resolve the default OG after `currentLang` (EN uses `SITE_IMAGE`, ID uses
  `SITE_IMAGE_ID`); an explicit `ogImage` prop still wins. Drop the now-unused
  `SITE_NAME`/`SITE_DESCRIPTION` imports.

## 6. Client behaviour (no React)

One shared module `src/scripts/copy.ts`:

- `copyText(text): Promise<boolean>`: Clipboard API, then a hidden-textarea
  `execCommand("copy")` fallback; returns false if both fail.
- Delegated `[data-copy]` handler for the sheet and examples; the button keeps a stable
  `aria-label` ("Copy: Bold" / "Salin: Tebal") and its visible label sits in an
  `aria-hidden` span, so changing it to "Copied" does not rename the button.
- On success: clear the shared `[data-copy-status]` live region, set it on the next frame to
  `Copied: {label}` / `Tersalin: {label}` (one announcement), and restore the visible label
  after 2 s.
- On failure: return false, select the nearest `[data-copy-target]`, and announce
  `Select and copy` / `Pilih lalu salin` through the same region.

One module `src/scripts/cheat.ts`, only active when `[data-cheat]` exists:

- filter on `input`; normalize with `toLowerCase().trim()`; split on whitespace; every token
  must appear in the row's `data-keywords` (localized label + EN/ID synonyms + syntax +
  group label, lowercased at build)
- hide non-matching rows with the `hidden` attribute; hide a group when no row matches;
  update the visual count `shown / total` (e.g. `3 / 26`, language-neutral; a static
  visually hidden "Rules shown" / "Aturan tampil" labels it)
- the empty state is the only live region here (`role="status"`), so typing does not produce
  a stream of count announcements; it contains the reset action
- clear button, the empty state's reset action, and Escape reset the query, restore all 26
  rows, and keep or return focus to the input
- do not update the URL, do not persist the query
- no debounce; 26 rows

One module `src/scripts/theme.ts`: boot/toggle logic from §5, attached to
`[data-theme-toggle]`.

`src/scripts/example-copy` is not a separate module; `copy.ts` is imported once from the
layout script and handles all buttons.

Without JS:

- all 26 rows and every example remain visible and readable
- search, count, copy buttons, and theme toggle are hidden via `html:not(.js)`
- no inert controls are shown

## 7. Labels and copy deck

All new strings go in `src/i18n/ui.ts`, both locales. No inline literals in components.

Full deck (changed and new keys, both locales):

| Key | EN | ID |
| --- | --- | --- |
| `site.tagline` | "Every rule, with the result beside it." | "Semua aturan, lengkap dengan hasilnya." |
| `brand.short` | "Discord Markdown" | "Markdown Discord" |
| `nav.cheatsheet` | "Cheat sheet" | "Contekan" |
| `nav.index` (rail only) | "Index" | "Indeks" |
| `home.kicker` | "Cheat sheet" | "Contekan" |
| `home.title` | "Discord Markdown, at a glance." | "Markdown Discord, sekali lihat." |
| `home.lede` | "Type this on the left; Discord shows this on the right. Copy what you need." | "Ketik yang di kiri; Discord menampilkan yang di kanan. Salin yang kamu butuh." |
| `home.cta` | "Want to test something? Open the playground." | "Mau mencoba dulu? Buka playground." |
| `home.flag` | "Pick up where you left off" | "Lanjutkan" |
| `home.flagCta` | "Resume" | "Lanjut" |
| `play.source` | "You type" | "Yang kamu ketik" |
| `play.specimen` | "Discord shows" | "Yang muncul di Discord" |
| `play.kicker` | "Sheet 09 — Playground" | "Lembar 09 — Playground" |
| `titleBlock.sheet` | "Sheet" | "Lembar" |
| `article.mistakes` | "Common mistakes" | "Sering salah" |
| `cheat.search` | "Find a rule" | "Cari aturan" |
| `cheat.placeholder` | "Try “spoiler” or “quote”" | "Coba “spoiler” atau “kutipan”" |
| `cheat.countLabel` | "Rules shown" | "Aturan tampil" |
| `cheat.empty` | "No rule matches that search." | "Tidak ada aturan yang cocok." |
| `cheat.reset` | "Show all" | "Tampilkan semua" |
| `cheat.clear` | "Clear search" | "Hapus pencarian" |
| `cheat.copy` | "Copy" | "Salin" |
| `cheat.copied` | "Copied" | "Tersalin" |
| `cheat.copyManual` | "Select and copy" | "Pilih lalu salin" |
| `cheat.youType` | "You type" | "Yang kamu ketik" |
| `cheat.discordShows` | "Discord shows" | "Yang muncul di Discord" |
| `cheat.group.text` | "Text" | "Teks" |
| `cheat.group.blocks` | "Blocks" | "Blok" |
| `cheat.group.people` | "People & time" | "Orang & waktu" |
| `cheat.group.more` | "More" | "Lainnya" |
| `theme.toDark` | "Switch to dark mode" | "Ganti ke mode gelap" |
| `theme.toLight` | "Switch to light mode" | "Ganti ke mode terang" |

Removed keys: `home.index`, `home.indexNote`, `hero.caption`, `play.dimension`.

- `t()` keeps returning a string; no plural or `{label}` mechanism is added. The count is
  the language-neutral `shown / total`; the live-region text is built by concatenation
  (`cheat.copied + ": " + label`).
- `play.copy` / `play.copied` stay for the playground's own button; `cheat.copy` /
  `cheat.copied` are the sheet's.
- No "1:1" remains as a functional label. Decorative title-block metadata may stay; it must
  not be the only explanation of a feature.

## 8. Accessibility

- Search: visible `<label>`, `type="search"`, no placeholder-only labeling; the visual count
  is labelled by a static hidden string; the empty state is the `role="status"` region; the
  clear and reset buttons have names.
- Copy: each button has an accessible name including the rule ("Copy: Bold" / "Salin:
  Tebal"); one shared live region announces the result once; feedback is not colour-only.
- Toggle: 36 px target, dynamic action label, visible focus.
- Rows: `<dl>` with `<dt>` links; no empty links.
- Spoilers in any result become keyboard-revealable site-wide: `tabindex="0"`,
  `role="button"`, `aria-expanded` toggled by click, Enter, and Space; the existing
  `:focus` reveal remains as a fallback. This fixes current article examples too.
- Result links are real links and stay tabbable; if the parser opens them in a new tab, keep
  `rel="noopener noreferrer"`. They are included in the keyboard pass.
- Contrast: table in §5; verify both themes with the audit script.
- Focus: visible ring on paper, paper2, dark ground, and the specimen pane; tab order is
  skip → header → main → footer.
- Reduced motion: no new animation; the existing rule still applies.
- No-JS path from §6.
- 200 % zoom and 320 px width: no horizontal scrolling; no clipped text.

## 9. SEO and metadata

- Home `title` prop. The layout appends ` — {localized site name}` (em dash, as the current
  code does), so these are not the final tags. `Sheet.astro` currently suffixes with the
  `SITE_NAME` constant; switch it to `translate('site.name')` so `/id` gets "Panduan
  Markdown Discord", not the English name:
  - EN: "Discord Markdown cheat sheet" → final
    "Discord Markdown cheat sheet — Discord Markdown Guide"
  - ID: "Contekan Markdown Discord" → final
    "Contekan Markdown Discord — Panduan Markdown Discord"
- Home descriptions:
  - EN: "Every Discord Markdown rule, the typed form and the Discord result side by side, ready to copy."
  - ID: "Semua aturan Markdown Discord, bentuk yang diketik dan hasilnya berdampingan, siap disalin."
- Article 8 title/description changes as in §4.
- `og:image` follows the page language: EN `/og.png`, ID `/og-id.png`; both 1200×630 and
  generated from the mark in §5.5. `og:locale` already follows the language; `og:site_name`
  switches from the `SITE_NAME` constant to `translate('site.name')` for the same reason as
  the title. The footer title block's brand line does the same, so `/id` does not leak the
  English name.
- Canonical + hreflang untouched; sitemap stays 20 URLs; no new route.
- The sheet's rendered results are real HTML in the source, so the page is useful without
  JS and indexable.
- Do not add structured data for the sheet in this change.

## 10. Files and deletions

New:

- `apps/web/src/content/cheatsheet.ts`
- `apps/web/src/components/cheat-sheet.astro`
- `apps/web/src/scripts/copy.ts`, `cheat.ts`, `theme.ts`, `spoiler.ts`
- `apps/web/src/assets/dmdg.png` (source mark; not served)
- `scripts/generate-brand-assets.mjs`
- `apps/web/public/favicon-48.png`, `logo-96.png`, `og-id.png` (generated)
- `docs/superpowers/specs/2026-10-23-beginner-cheatsheet-design.md` (this file)

Changed:

- `apps/web/src/pages/[lang]/index.astro` (rebuild around the sheet)
- `apps/web/src/layouts/Sheet.astro` (boot script, theme-color, live region, copy script;
  localized title suffix and OG default; icon links; remove unused imports)
- `apps/web/src/components/sheet-header.astro` (mark + short brand, toggle, nav label,
  narrow-width rule)
- `apps/web/src/components/title-block.astro` (brand line uses `translate('site.name')`)
- `apps/web/src/components/sheet-index.astro` (remove the `home` variant; rail only)
- `apps/web/src/components/react/playground.tsx` (remove the hardcoded `DISCORD 1:1`
  dimension; use the shared `copyText` for its copy button)
- `apps/web/src/style.css` (dark tokens, `--ink3` light value, grid/wash tokens, sheet
  styles, brand, toggle, specimen focus, subtext)
- `apps/web/src/content/config.ts` (intro, mistakes)
- `apps/web/src/pages/[lang]/[slug].astro` (intro + mistakes callout; header lede = intro)
- `apps/web/src/components/example.astro` (copy button, `data-copy-target`)
- `apps/web/src/i18n/ui.ts` (copy deck, `brand.short`)
- `apps/web/src/constants.ts` (`SITE_IMAGE_ID`)
- `apps/web/public/favicon-32.png`, `apple-touch-icon.png`, `og.png` (regenerated)
- `package.json`, `pnpm-lock.yaml` (`sharp` devDependency for the asset script)
- all 16 `src/content/feature/{en,id}/*.mdx` (frontmatter; misc gets the section)
- `apps/web/src/pages/index.astro` (redirect page: remove inline styles, add dark media)
- `DESIGN.md`, `PRODUCT.md`

Deleted:

- `apps/web/public/favicon.svg`
- the hardcoded "DM / GUIDE" brand markup
- the home hero markup and the drawings index usage
- the `home` variant of `sheet-index.astro` and its now-unused props
- `home.index`, `home.indexNote`, `hero.caption`, `play.dimension`
- hardcoded `1:1` chips in the home and playground chrome (the playground's `DISCORD 1:1`
  line is removed; the pane label already says "Yang muncul di Discord")

## 11. Acceptance criteria

Build and content:

1. `pnpm --filter ./apps/web build` exits 0; 22 pages; no warnings that fail the build.
2. `/en` and `/id` each show 26 rows in groups 6 / 10 / 7 / 3 (text / blocks / people /
   more); row targets may repeat, but the built HTML has no duplicate `id` attributes.
3. A node audit resolves every row's `href` in `dist` (localized `#anchor`) and finds the
   target `id`; zero dead links. All eight articles are reachable from the sheet.
4. Every rendered result is non-empty and contains no `undefined`; the escape row shows
   literal asterisks; the multiline samples copy real newlines.
5. All 16 articles have non-empty `intro` and 2–3 `mistakes`; the article lede renders
   `intro`, not `description`; ID uses "kamu"; no English leak in new ID UI (parser output
   excepted).
6. Article 8 has the masked-link section (`#masked-links` / `#tautan-berteks`), new title,
   and working example.

Behaviour:

7. Search: "spoiler" → the two spoiler rows; "kode" → inline, block, language rows;
   "everyone" and "here" → one row each; nonsense → empty state + reset; clearing restores
   26 and returns focus to the input.
8. Copy: exact text including newlines; "Copied"/"Tersalin" for 2 s; the live region
   announces exactly once; on denial the flow is `execCommand` then select + "Select and
   copy" (the select target is `[data-copy-target]`).
9. Keyboard only: skip link, toggle, search, clear, 22 copy buttons, 26 detail links, 2
   spoiler results, the masked-link result, playground, footer; focus ring visible in both
   themes.
10. 390 px: rows stack, no horizontal scroll, copy reachable; 320 px: header fits with the
    nav text hidden and the brand mark still visible.
11. No JS: all rows visible, no search/copy/toggle controls, system dark still applies, and
    the browser chrome is dark via the media `theme-color`.

Theme:

12. First visit follows `prefers-color-scheme`; toggling persists across reloads; no flash of
    the wrong theme on reload.
13. Both themes pass the contrast values in §5; screenshots at 1440 and 390 in both themes
    show no invisible borders or text.
14. The specimen pane remains `#313338` and the Discord result is unchanged in both themes.
15. The toggle exists and works on home, all 16 articles, play, and 404.

Hygiene:

16. `grep -ri "hacksore\|vercel"` over `apps/web` is clean; identity unchanged.
17. One `<h1>` per page; no empty links; sitemap still lists 20 URLs.
18. `DESIGN.md` no longer says "no dark mode" and records the mark + short header name;
    `PRODUCT.md` names the new reader and the quick-lookup job; both describe the sheet home.
19. Home `<title>` is the §9 value, including the localized site-name suffix with the em
    dash (EN " — Discord Markdown Guide", ID " — Panduan Markdown Discord"); the meta
    description is the new one; article 8's title and description are updated.
20. The light `--ink3` is `#63656D`; no `--ink3` text on `paper2` sits below 4.5.
21. The header shows the 24 px mark + `brand.short`; "DM / GUIDE" appears in neither `src`
    nor the built HTML; the home link's accessible name is `site.name`; 320 px has no
    overflow.
22. `favicon-32.png` is 32×32, `favicon-48.png` 48×48, `apple-touch-icon.png` 180×180,
    `logo-96.png` 96×96, and both OG files 1200×630; `favicon.svg` is gone; the 3.5 MB
    source is not in `dist`; `og:image` ends with `/og.png` on EN and `/og-id.png` on ID.
23. Both OG cards contain the new mark and no old asterisk or "1:1"; the ID card says
    "Panduan Markdown Discord".
24. `/id` shows "Panduan Markdown Discord" in the footer brand line and `og:site_name`; no
    English site-name leak in header or footer.

## 12. Out of scope

- A guided course, lessons, progress, or accounts.
- Full-text search across articles (only 26 rows are filtered here).
- Print stylesheet or PDF export.
- New articles beyond the masked-link section.
- Route, slug, or locale changes.
- Hydrating the home with React.
- A separate dark-mode mark or favicon; the supplied mark is used as-is in both themes.
- Recoloring, redrawing, or vectorizing the supplied mark.
- A separate OG image per article (only the two locale cards).
- A three-state theme control ("system / light / dark"); the first toggle stores an explicit
  choice.

## 13. Calls made (veto if wrong)

1. The sheet lives at the existing home; no `/cheat-sheet` route.
2. `<dl>` rows, not a `<table>`.
3. Vanilla scripts, no new React on the home.
4. Copy is omitted on the four rows that require a live id; 22 rows copy.
5. The eight-article index disappears; the sheet is the map.
6. Masked links fold into article 8, which is renamed, rather than becoming a ninth article.
7. The neutral dark palette is exact; the specimen pane does not change.
8. The toggle is in the header capsule and uses an action label, not a pressed state.
9. Search is client-side over 26 rows; no search service.
10. The tape flag survives, above the sheet.
11. `@everyone` and `@here` are two rows; the pseudo-mention row is dropped so `/id` does not
    ship English parser output.
12. Row targets are localized; the Indonesian anchors are the real heading ids
    (`#tebal`, `#everyone-dan-here`, `#tautan-berteks`, …).
13. The header's "DM / GUIDE" becomes the supplied mark + the short plain name; the full
    site name stays in titles, aria, and metadata.
14. The mark fills favicon 32/48, apple-touch, the header, and two locale OG cards; no dark
    variant, no recolor.
