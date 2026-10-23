# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Discord users who want a message formatted correctly but do not yet know the syntax — bold, italic, underline, strikethrough, spoiler, block quote, code, mention. They arrive mid-task, usually on a phone, with one question: "what do I type for this?" They are not developers by default; experienced users and developers who paste code into Discord are a secondary audience.

## Product Purpose

A quick-reference cheat sheet and live playground for Discord-flavored Markdown. The home page puts every common rule in one grouped sheet: the typed form, the Discord result, and a copy button, with the deeper article one click away. Discord's own documentation is a set of static images; this site lets a visitor search the rules and see their own text rendered.

Success means: a reader on a 390 px phone finds the matching row and copies the syntax without leaving the first flow, while a reader who wants the full explanation can reach it from the same row.

## Positioning

Most Discord Markdown resources are either prose (the support article), a set of screenshots (the official docs), or a generic Markdown tutorial that stops where Discord diverges. This site pairs the raw syntax with the visitor's own input rendered through a real Discord-flavoured parser, then puts the source directly beside the result. The parser is the mechanism; the documentation is the surface that makes it legible.

## Operating Context

Read in bursts, usually on a phone while composing a Discord message, or on a desktop while writing documentation. The reader is already inside Discord; this site is a side reference, not a destination they browse. The home page is a scannable sheet; the articles hold the depth. A neutral dark theme follows the system by default and remembers an explicit choice. Deployed as a fully static site on Cloudflare Pages; no server runtime, no database, no accounts. Two locales, English and Indonesian, with a visible language switch.

## Capabilities and Constraints

- A 26-row grouped cheat sheet (Text 6, Blocks 10, People & time 7, More 3): the typed form, the rendered result, and a deep link to the matching article section on every row. Twenty-two rows copy; the four rows that need a live user, role, channel, or custom-emoji id link to their article section instead.
- Client-side search over all 26 rows, with a visible count, clear action, empty state, and focus restoration. No URL state, no network request.
- Eight documented syntax areas: text formatting, organizational text formatting, block quotes, code blocks, syntax highlighting, spoiler tags, mentions, and links, timestamps and commands.
- A custom Markdown parser handling Discord divergences: spoiler tags, mention tokens (user, role, channel, custom emoji), block quotes, pseudo-mentions, message variables, and fenced code with syntax highlighting.
- A live split-pane playground: editable source on one side, exact rendered output on the other. It remains the only hydrated island.
- Bilingual: full UI chrome, the sheet, search, metadata, and every article in English and Indonesian. Indonesian uses **kamu**, never **Anda**.
- Light and neutral-dark themes. System preference is the default; an explicit choice persists. The specimen pane stays Discord's `#313338` in both themes.
- Beginner entry layer on all 16 articles: a plain `intro` lede and a 2–3 item "Common mistakes" / "Sering salah" callout, plus copy buttons on example sources.
- Static output only. Cloudflare Pages serves the built `dist/` directory; no Astro adapter is required for a static build.
- Constraints from the parser's own lineage: it derives from `brussell98/discord-markdown` (MIT) and `ItzDerock/discord-markdown-parser` (Apache-2.0). MIT and Apache-2.0 both require that the copyright and licence notices be retained in copies or substantial portions of the work. Those notices are a legal floor, not a branding choice, and are handled in LICENSE and NOTICE rather than in visible site chrome.
- No other author, repository, or product identity appears anywhere in the product, its copy, its metadata, or its source URLs. Upstream parser names appear only in licence notices, as required.

## Brand Commitments

- Name: **Discord Markdown Guide by geetcr4ck**. "Discord Markdown" is retained because it names the subject matter accurately and is nominative use of a third-party product name.
- Header: the supplied `dmdg.png` mark at 24 px plus the short name "Discord Markdown" / "Markdown Discord". No separate text-only wordmark. The mark is the only bitmap and the only blurple outside the specimen pane.
- Canonical repository: `https://github.com/geetcr4ck/discord-markdown-guide`.
- Canonical URL: `https://discord-markdown-guide.pages.dev`.
- The site presents itself as the work of geetcr4ck. No other author, repository, or product identity is referenced.

## Evidence on Hand

- Eight existing MDX articles with live examples (real content, real syntax samples), now with localized intros, mistake callouts, and copyable example sources.
- A 26-row cheat sheet with 22 exact-copy rows and four label-only live-id rows, all in both locales.
- A working parser and a working playground (real, already functional).
- Discord's official Markdown support article, used as a factual reference for syntax correctness.
- The upstream parser projects named in the licence constraint above.
- Absences that must not be fabricated: no testimonials, no user counts, no traffic or adoption claims, no comparative benchmark against any other Markdown site, no press or awards.

## Product Principles

1. **Show, don't describe.** Every rule pairs the typed form with the Discord result; prose is the fallback, not the first answer.
2. **Answer at a glance, depth one click away.** The sheet gives the reader one row; the article supplies the caveats and the full context.
3. **Faithful rendering.** The preview is the product's credibility. Anything that looks like Discord but is not Discord is a defect.
4. **Bilingual at the same depth.** Indonesian is a translation of the same product, not a reduced version. Use **kamu**, never **Anda**.
5. **Static and durable.** No runtime, no accounts, no tracking beyond first-party page metrics. The playground is the only hydrated island.

## Accessibility & Inclusion

Target WCAG 2.2 AA in both themes. Body text meets 4.5:1 contrast against its background; large text meets 3:1. Every interactive element is keyboard reachable with a visible focus indicator, and touch targets are at least 44×44px. Spoilers in every specimen are keyboard-revealable with Enter and Space. The playground's source field has a visible label and is operable by keyboard alone; the preview region is announced as a live region so changes are conveyed to assistive technology. Search has a real label and a single status announcement only when no rows match. Indonesian copy is translated, not machine-word-swapped, so that reading level and terminology stay natural in both languages.
