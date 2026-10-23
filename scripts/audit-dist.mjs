#!/usr/bin/env node
/**
 * Global acceptance audit for the bilingual Discord Markdown guide.
 *
 * Run from the repository root:
 *   node scripts/audit-dist.mjs
 *
 * Plain Node only (node:fs + node:path). The audit reads apps/web/dist and
 * apps/web/src; it never writes. It exits 1 if any check fails.
 *
 * This is deliberately a regression gate, not a smoke test: exact spec values
 * (row targets, copy counts, titles, PNG dimensions, copy deck) are asserted.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "apps", "web", "dist");
const SRC = path.join(ROOT, "apps", "web", "src");

const LOCALES = ["en", "id"];
const SLUGS = [
  "block-quotes",
  "code-blocks",
  "mentions",
  "misc",
  "organizational-text-formatting",
  "spoiler-tags",
  "syntax-highlighting",
  "text-formatting",
];

const ARTICLE_PAGES = LOCALES.flatMap((lang) =>
  SLUGS.map((slug) => ({ lang, slug, rel: `${lang}/${slug}/index.html` }))
);

const EXPECTED_PAGES = [
  "404.html",
  "index.html",
  ...LOCALES.flatMap((lang) => [
    `${lang}/index.html`,
    `${lang}/play/index.html`,
    ...SLUGS.map((slug) => `${lang}/${slug}/index.html`),
  ]),
].sort();

const GROUP_IDS = ["text", "blocks", "people", "more"];
const GROUP_COUNTS = { text: 6, blocks: 10, people: 7, more: 3 };

// Spec §3, in order. [slug, EN anchor, ID anchor]
const ROW_TARGETS = [
  ["text-formatting", "bold", "tebal"],
  ["text-formatting", "italic", "miring"],
  ["text-formatting", "underline-and-strikethrough", "garis-bawah-dan-coretan"],
  ["text-formatting", "underline-and-strikethrough", "garis-bawah-dan-coretan"],
  ["text-formatting", "combining-markers", "menggabungkan-penanda"],
  ["text-formatting", "escaping", "escape"],
  ["organizational-text-formatting", "headings", "judul"],
  ["organizational-text-formatting", "headings", "judul"],
  ["organizational-text-formatting", "subtext", "subteks"],
  ["organizational-text-formatting", "lists", "daftar"],
  ["organizational-text-formatting", "lists", "daftar"],
  ["block-quotes", "one-line", "satu-baris"],
  ["block-quotes", "several-lines", "beberapa-baris"],
  ["code-blocks", "inline-code", "inline-code"],
  ["code-blocks", "fenced-blocks", "blok-berpagar"],
  ["syntax-highlighting", "the-rule", "aturannya"],
  ["mentions", "users", "pengguna"],
  ["mentions", "roles-and-channels", "role-dan-channel"],
  ["mentions", "roles-and-channels", "role-dan-channel"],
  ["mentions", "custom-emoji", "emoji-khusus"],
  ["mentions", "everyone-and-here", "everyone-dan-here"],
  ["mentions", "everyone-and-here", "everyone-dan-here"],
  ["misc", "timestamps", "timestamp"],
  ["spoiler-tags", "inline", "inline"],
  ["spoiler-tags", "a-whole-block", "satu-blok-penuh"],
  ["misc", "masked-links", "tautan-berteks"],
];

const HOME_META = {
  en: {
    title: "Discord Markdown cheat sheet — Discord Markdown Guide",
    siteName: "Discord Markdown Guide",
    description:
      "Every Discord Markdown rule, the typed form and the Discord result side by side, ready to copy.",
    ogImage: "/og.png",
  },
  id: {
    title: "Contekan Markdown Discord — Panduan Markdown Discord",
    siteName: "Panduan Markdown Discord",
    description:
      "Semua aturan Markdown Discord, bentuk yang diketik dan hasilnya berdampingan, siap disalin.",
    ogImage: "/og-id.png",
  },
};

const MISC_TITLES = {
  en: "Links, timestamps & commands",
  id: "Tautan, stempel waktu & perintah",
};

const DISCORD_EMBED = {
  en: {
    accent: 2052056,
    eyebrow: "00 / Cheat sheet",
    title: "Discord Markdown Guide",
    tagline: "Every rule, with the result beside it.",
    sample: "`**bold**` → **bold**  ·  `*italic*` → *italic*",
    meta: "26 rules · 8 sheets · EN / ID",
    open: "Open cheat sheet",
    play: "Playground",
    home: "https://discord-markdown-guide.pages.dev/en/",
    playUrl: "https://discord-markdown-guide.pages.dev/en/play/",
    logo: "https://discord-markdown-guide.pages.dev/logo-96.png",
  },
  id: {
    accent: 2052056,
    eyebrow: "00 / Contekan",
    title: "Panduan Markdown Discord",
    tagline: "Semua aturan, lengkap dengan hasilnya.",
    sample: "`**tebal**` → **tebal**  ·  `*miring*` → *miring*",
    meta: "26 aturan · 8 lembar · EN / ID",
    open: "Buka contekan",
    play: "Playground",
    home: "https://discord-markdown-guide.pages.dev/id/",
    playUrl: "https://discord-markdown-guide.pages.dev/id/play/",
    logo: "https://discord-markdown-guide.pages.dev/logo-96.png",
  },
};

const ALLOWED_COMPONENT_TYPES = new Set([1, 2, 9, 10, 11, 12, 14, 17]);
const BUTTON_KEYS = new Set(["type", "url", "style", "label", "emoji", "disabled"]);

const BRAND_SHORT = {
  en: "Discord Markdown",
  id: "Markdown Discord",
};

// Spec §7. These are rendered strings, not keys: the implementation must
// transcribe the deck exactly.
const HOME_COPY = {
  en: {
    kicker: "Cheat sheet",
    title: "Discord Markdown, at a glance.",
    lede: "Type this on the left; Discord shows this on the right. Copy what you need.",
    cta: "Want to test something? Open the playground.",
    groups: {
      text: "Text",
      blocks: "Blocks",
      people: "People & time",
      more: "More",
    },
    youType: "You type",
    discordShows: "Discord shows",
    search: "Find a rule",
    countLabel: "Rules shown",
    empty: "No rule matches that search.",
  },
  id: {
    kicker: "Contekan",
    title: "Markdown Discord, sekali lihat.",
    lede: "Ketik yang di kiri; Discord menampilkan yang di kanan. Salin yang kamu butuh.",
    cta: "Mau mencoba dulu? Buka playground.",
    groups: {
      text: "Teks",
      blocks: "Blok",
      people: "Orang & waktu",
      more: "Lainnya",
    },
    youType: "Yang kamu ketik",
    // §7's ID column value. The phrase "Discord menampilkan" belongs to the
    // ID home lede, which is checked separately.
    discordShows: "Yang muncul di Discord",
    search: "Cari aturan",
    countLabel: "Aturan tampil",
    empty: "Tidak ada aturan yang cocok.",
  },
};

// §3: the only rows without copy are the four that need a live id.
const LIVE_ID_TARGETS = {
  en: [
    "mentions#users",
    "mentions#roles-and-channels",
    "mentions#roles-and-channels",
    "mentions#custom-emoji",
  ],
  id: [
    "mentions#pengguna",
    "mentions#role-dan-channel",
    "mentions#role-dan-channel",
    "mentions#emoji-khusus",
  ],
};

const DARK_TOKEN_CHECKS = [
  ["--paper", /--paper\s*:\s*#1A1A1A\b/i],
  ["--ink", /--ink\s*:\s*#E8E8E8\b/i],
  ["--ink2 / --ink-2", /--ink(?:2|-2)\s*:\s*#BCBCBC\b/i],
  ["--ink3 / --ink-3", /--ink(?:3|-3)\s*:\s*#8E8E8E\b/i],
  ["--blue", /--blue\s*:\s*#6EA8FE\b/i],
  ["--redline", /--redline\s*:\s*#F0795C\b/i],
];

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".pdf",
  ".zip",
  ".gz",
  ".mp4",
  ".webm",
]);

// ---------------------------------------------------------------------------
// Small filesystem / HTML helpers
// ---------------------------------------------------------------------------

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function walk(dir) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.isFile()) found.push(full);
  }
  return found;
}

function readText(fullPath, label) {
  if (!fs.existsSync(fullPath)) throw new Error(`missing ${label}`);
  return fs.readFileSync(fullPath, "utf8");
}

function sampleList(items, limit = 4) {
  if (items.length === 0) return "none";
  const shown = items.slice(0, limit).join(", ");
  return items.length > limit ? `${shown} (+${items.length - limit} more)` : shown;
}

function multisetDifference(left, right) {
  const counts = new Map();
  for (const item of right) counts.set(item, (counts.get(item) ?? 0) + 1);
  const difference = [];
  for (const item of left) {
    const count = counts.get(item) ?? 0;
    if (count > 0) counts.set(item, count - 1);
    else difference.push(item);
  }
  return difference;
}

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rarr: "→",
  larr: "←",
  times: "×",
};

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, body) => {
    if (body[0] === "#") {
      const hexadecimal = body[1]?.toLowerCase() === "x";
      const code = Number.parseInt(body.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/**
 * Strip comments, scripts and styles before structural parsing. Inline scripts
 * can contain template strings with "<", so they must not become fake tags.
 */
function parseable(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

function textOf(html) {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Parse attributes from one opening tag. Values stay quoted-aware while the
 * parser still accepts bare attributes such as `data-cheat-row`.
 */
function parseAttrs(tagText) {
  const attrs = Object.create(null);
  const body = tagText.replace(/^<\s*[^\s/>]+/, "");
  const re = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(body)) !== null) {
    const name = match[1].toLowerCase();
    const raw = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[name] = decodeEntities(raw);
  }
  return attrs;
}

function makeTag(name, text, index) {
  return {
    name: name.toLowerCase(),
    text,
    attrs: parseAttrs(text),
    index,
    end: index + text.length,
  };
}

function allOpeningTags(html) {
  const tags = [];
  const re = /<([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*>/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    tags.push(makeTag(match[1], match[0], match.index));
  }
  return tags;
}

function tagsNamed(doc, name) {
  return doc.tags.filter((tag) => tag.name === name);
}

function hasAttr(tag, name) {
  return Object.prototype.hasOwnProperty.call(tag.attrs, name.toLowerCase());
}

function getAttr(tag, name) {
  return Object.prototype.hasOwnProperty.call(tag.attrs, name.toLowerCase())
    ? tag.attrs[name.toLowerCase()]
    : null;
}

/** Inner HTML of one element, nesting-aware for the same tag name. */
function elementInner(html, tag) {
  const openRe = new RegExp(`<${tag.name}\\b[^>]*>`, "gi");
  const closeRe = new RegExp(`</${tag.name}>`, "gi");
  let depth = 1;
  let cursor = tag.end;
  while (depth > 0) {
    openRe.lastIndex = cursor;
    closeRe.lastIndex = cursor;
    const nextOpen = openRe.exec(html);
    const nextClose = closeRe.exec(html);
    if (!nextClose) return null;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      cursor = nextOpen.index + nextOpen[0].length;
    } else {
      depth -= 1;
      if (depth === 0) return html.slice(tag.end, nextClose.index);
      cursor = nextClose.index + nextClose[0].length;
    }
  }
  return null;
}

const rawPageCache = new Map();
const docPageCache = new Map();

function readPage(rel) {
  if (!rawPageCache.has(rel)) {
    const full = path.join(DIST, rel);
    rawPageCache.set(rel, readText(full, `page ${rel}`));
  }
  return rawPageCache.get(rel);
}

function docFor(rel) {
  if (!docPageCache.has(rel)) {
    const raw = readPage(rel);
    const html = parseable(raw);
    docPageCache.set(rel, { raw, html, tags: allOpeningTags(html) });
  }
  return docPageCache.get(rel);
}

function titleOf(doc) {
  const match = doc.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? textOf(match[1]) : null;
}

function metaContent(doc, key) {
  const lower = key.toLowerCase();
  const tag = tagsNamed(doc, "meta").find(
    (candidate) =>
      (candidate.attrs.property ?? "").toLowerCase() === lower ||
      (candidate.attrs.name ?? "").toLowerCase() === lower
  );
  return tag ? tag.attrs.content ?? null : null;
}

function discordEmbedFor(rel) {
  const raw = readPage(rel);
  const match = raw.match(
    /<script\b[^>]*\bid="discord:component-embed"[^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match) return null;
  const opening = match[0].slice(0, match[0].indexOf(">") + 1);
  const tag = makeTag("script", opening, match.index);
  const body = match[1];
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid component embed JSON: ${message}`);
  }
  return {
    tag,
    body,
    payload,
    bytes: Buffer.byteLength(body, "utf8"),
  };
}

function collectComponentNodes(node, result = []) {
  if (!node || typeof node !== "object") return result;
  if (Array.isArray(node)) {
    for (const child of node) collectComponentNodes(child, result);
    return result;
  }
  if (typeof node.type === "number") result.push(node);
  if (Array.isArray(node.components)) collectComponentNodes(node.components, result);
  if (node.accessory) collectComponentNodes(node.accessory, result);
  return result;
}

function collectIds(doc) {
  const ids = new Set();
  for (const tag of doc.tags) {
    const id = tag.attrs.id;
    if (id) ids.add(id.replace(/^#/, ""));
  }
  return ids;
}

function homeRows(rel) {
  return docFor(rel).tags.filter((tag) => hasAttr(tag, "data-cheat-row"));
}

function findEmptyLinks(doc) {
  const empty = [];
  const re = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(doc.html)) !== null) {
    const open = match[0].match(/^<a\b[^>]*>/i)?.[0] ?? "";
    const tag = makeTag("a", open, match.index);
    // The tape-flag link starts empty and hidden, then the script fills it.
    // A hidden link is not in the accessibility tree, so only visible empty
    // anchors are a failure.
    if (hasAttr(tag, "hidden")) continue;
    const altText = [...match[1].matchAll(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)]
      .map((alt) => alt[1] ?? alt[2] ?? "")
      .join(" ");
    const named =
      textOf(match[1]).length > 0 ||
      (tag.attrs["aria-label"] ?? "").trim().length > 0 ||
      altText.trim().length > 0;
    if (!named) empty.push(`<a href="${tag.attrs.href ?? ""}">`);
  }
  return empty;
}

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function brief(value, limit = 90) {
  const text = normalizeWhitespace(value);
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

/** Text content plus image alt text, for results such as custom emoji. */
function contentText(html) {
  const alt = [...String(html).matchAll(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)]
    .map((match) => match[1] ?? match[2] ?? "")
    .join(" ");
  return normalizeWhitespace(`${textOf(html)} ${alt}`);
}

/** Index of the closing quote, skipping YAML escapes and doubled single quotes. */
function findClosingQuote(text, quote) {
  for (let index = 1; index < text.length; index += 1) {
    if (quote === '"' && text[index] === "\\") {
      index += 1;
      continue;
    }
    if (text[index] !== quote) continue;
    if (quote === "'" && text[index + 1] === "'") {
      index += 1;
      continue;
    }
    return index;
  }
  return -1;
}

/** A small YAML scalar reader for the frontmatter fields this site uses. */
function parseYamlScalar(lines, startIndex, inlineValue) {
  const value = inlineValue.trim();
  if (value.startsWith('"') || value.startsWith("'")) {
    const quote = value[0];
    let text = value;
    let index = startIndex;
    while (findClosingQuote(text, quote) === -1 && index + 1 < lines.length) {
      index += 1;
      text += ` ${lines[index].trim()}`;
    }
    const close = findClosingQuote(text, quote);
    if (close === -1) throw new Error(`unterminated ${quote} scalar`);
    const content = text.slice(1, close);
    if (quote === "'") return content.replace(/''/g, "'");
    try {
      return JSON.parse(`"${content}"`);
    } catch {
      return content
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\");
    }
  }

  if (/^[|>][+-]?$/.test(value)) {
    const style = value[0];
    const block = [];
    for (let index = startIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.trim() === "") {
        block.push("");
        continue;
      }
      if (!/^\s+/.test(line)) break;
      block.push(line);
    }
    const indents = block
      .filter((line) => line.trim())
      .map((line) => line.match(/^\s*/)[0].length);
    const indent = indents.length > 0 ? Math.min(...indents) : 0;
    const stripped = block.map((line) =>
      line.slice(Math.min(indent, line.match(/^\s*/)[0].length))
    );
    return style === "|"
      ? stripped.join("\n")
      : stripped.join("\n").replace(/([^\n])\n(?=[^\n])/g, "$1 ");
  }

  let text = value;
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (!/^\s+\S/.test(lines[index])) break;
    text += ` ${lines[index].trim()}`;
  }
  return text;
}

function frontmatterIntro(text) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  if (lines[0]?.trim() !== "---") throw new Error("no YAML frontmatter");
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (end === -1) throw new Error("unterminated YAML frontmatter");
  const frontmatter = lines.slice(1, end);
  const index = frontmatter.findIndex((line) => /^intro\s*:/.test(line));
  if (index === -1) return null;
  const inline = frontmatter[index].replace(/^intro\s*:\s*/, "");
  return parseYamlScalar(frontmatter, index, inline).trim();
}

function rowHrefs(rel, rows) {
  const doc = docFor(rel);
  return rows.map((row) => {
    const inner = elementInner(doc.html, row);
    if (inner === null) return null;
    const anchor = allOpeningTags(inner).find((tag) => tag.name === "a");
    return anchor?.attrs.href ?? null;
  });
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function findCssBlockEnd(text, openIndex) {
  let depth = 0;
  let quote = null;
  for (let index = openIndex; index < text.length; index += 1) {
    const character = text[index];
    if (quote !== null) {
      if (character === "\\") {
        index += 1;
        continue;
      }
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

/** Parse flat declaration rules, carrying @media/@supports ancestors with them. */
function parseCssRules(css) {
  const rules = [];

  function parse(text, parents) {
    let cursor = 0;
    while (cursor < text.length) {
      let open = text.indexOf("{", cursor);
      let semicolon = text.indexOf(";", cursor);
      while (semicolon !== -1 && (open === -1 || semicolon < open)) {
        cursor = semicolon + 1;
        open = text.indexOf("{", cursor);
        semicolon = text.indexOf(";", cursor);
      }
      if (open === -1) break;
      const prelude = text.slice(cursor, open).trim().replace(/\s+/g, " ");
      const close = findCssBlockEnd(text, open);
      if (close === -1) break;
      const body = text.slice(open + 1, close);
      if (body.includes("{")) parse(body, [...parents, prelude]);
      else rules.push({ selector: prelude, body, parents });
      cursor = close + 1;
    }
  }

  parse(css, []);
  return rules;
}

let styleRulesCache = null;

function getStyleRules() {
  if (styleRulesCache === null) {
    const css = stripCssComments(readText(path.join(SRC, "style.css"), "apps/web/src/style.css"));
    styleRulesCache = parseCssRules(css);
  }
  return styleRulesCache;
}

function isDarkContext(rule) {
  const context = [rule.selector, ...rule.parents].join(" ");
  return (
    /prefers-color-scheme\s*:\s*dark/i.test(context) ||
    /data-theme\s*=\s*["']?dark/i.test(context)
  );
}

function isNoJsRule(rule) {
  return [rule.selector, ...rule.parents].some((part) => /html:not\(\.js\)/i.test(part));
}

function detailFigures(doc) {
  const figures = [];
  for (const tag of tagsNamed(doc, "figure")) {
    const classes = (tag.attrs.class ?? "").split(/\s+/);
    if (!classes.includes("detail")) continue;
    figures.push({ tag, inner: elementInner(doc.html, tag) ?? "" });
  }
  return figures;
}

function pngDimensions(relName) {
  const full = path.join(DIST, relName);
  if (!fs.existsSync(full)) throw new Error(`missing ${relName}`);
  const buffer = fs.readFileSync(full);
  if (buffer.length < 24) throw new Error(`${relName} is too short for a PNG IHDR`);
  const signature =
    buffer.readUInt32BE(0) === 0x89504e47 && buffer.readUInt32BE(4) === 0x0d0a1a0a;
  if (!signature) throw new Error(`${relName} has no PNG signature`);
  const chunkType = buffer.subarray(12, 16).toString("ascii");
  if (chunkType !== "IHDR") throw new Error(`${relName} has no IHDR chunk (found ${chunkType})`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function isTextFile(file) {
  return !BINARY_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function scanTrees(needle, caseInsensitive) {
  const hits = [];
  for (const root of [DIST, SRC]) {
    for (const file of walk(root)) {
      if (!isTextFile(file)) continue;
      let text;
      try {
        text = fs.readFileSync(file, "utf8");
      } catch {
        continue;
      }
      const haystack = caseInsensitive ? text.toLowerCase() : text;
      const pin = caseInsensitive ? needle.toLowerCase() : needle;
      if (haystack.includes(pin)) hits.push(toPosix(path.relative(ROOT, file)));
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Check runner
// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ name, message });
    console.log(`FAIL  ${name} -- ${message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pageFiles = walk(DIST)
  .filter((file) => file.toLowerCase().endsWith(".html"))
  .map((file) => toPosix(path.relative(DIST, file)))
  .sort();

// The root redirect is a flash page: it has no header, toggle, OG or <main>.
const contentPages = pageFiles.filter((rel) => rel !== "index.html");

function requireContentPages() {
  if (contentPages.length === 0) {
    throw new Error("no content pages found in apps/web/dist (only the root redirect?)");
  }
  return contentPages;
}

const PNG_EXPECTATIONS = [
  ["favicon-32.png", 32, 32],
  ["favicon-48.png", 48, 48],
  ["apple-touch-icon.png", 180, 180],
  ["logo-96.png", 96, 96],
  ["og.png", 1200, 630],
  ["og-id.png", 1200, 630],
];

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

console.log("Discord Markdown dist audit");
console.log(`Repo: ${toPosix(ROOT)}`);
console.log(`Dist: ${toPosix(path.relative(ROOT, DIST))}`);
console.log("");

check("build: apps/web/dist exists", () => {
  assert(fs.existsSync(DIST), `missing directory: ${toPosix(path.relative(ROOT, DIST))}`);
});

check("build: 22 HTML pages at the expected routes", () => {
  const actual = [...pageFiles].sort();
  const expected = [...EXPECTED_PAGES].sort();
  const missing = expected.filter((rel) => !actual.includes(rel));
  const unexpected = actual.filter((rel) => !expected.includes(rel));
  assert(
    actual.length === 22 && missing.length === 0 && unexpected.length === 0,
    `found ${actual.length} HTML file(s); missing: ${
      missing.length > 0 ? sampleList(missing) : "none"
    }; unexpected: ${unexpected.length > 0 ? sampleList(unexpected) : "none"}`
  );
});

check("redirect: root index.html points at /en/", () => {
  const doc = docFor("index.html");
  const refresh = tagsNamed(doc, "meta").find(
    (tag) => (tag.attrs["http-equiv"] ?? "").toLowerCase() === "refresh"
  );
  assert(refresh, 'no <meta http-equiv="refresh"> in index.html');
  const content = refresh.attrs.content ?? "";
  const match = content.match(/url\s*=\s*(.+?)\s*$/i);
  assert(match, `meta refresh has no url: "${content}"`);
  const target = match[1].replace(/^["']|["']$/g, "");
  // "/en" and "/en/" address the same built page; accept both forms.
  assert(target.replace(/\/+$/, "") === "/en", `redirect target is "${target}", expected "/en/"`);
});

check("sitemap: sitemap-0.xml lists 20 URLs", () => {
  const xml = readText(path.join(DIST, "sitemap-0.xml"), "dist/sitemap-0.xml");
  const locs = xml.match(/<loc\b[^>]*>/gi) ?? [];
  assert(locs.length === 20, `found ${locs.length} <loc> entries`);
});

// ---------------------------------------------------------------------------
// Home: the cheat sheet
// ---------------------------------------------------------------------------

function checkHome(lang) {
  const label = lang.toUpperCase();
  const rel = `${lang}/index.html`;
  const meta = HOME_META[lang];

  check(`home ${label}: [data-cheat] hook is present`, () => {
    const doc = docFor(rel);
    assert(doc.tags.some((tag) => hasAttr(tag, "data-cheat")), "no element with [data-cheat]");
  });

  check(`home ${label}: [data-cheat-toolbar] hook is present`, () => {
    const toolbars = docFor(rel).tags.filter((tag) => hasAttr(tag, "data-cheat-toolbar"));
    assert(toolbars.length === 1, `found ${toolbars.length} [data-cheat-toolbar] element(s)`);
  });

  check(`home ${label}: 26 data-cheat rows`, () => {
    const rows = homeRows(rel);
    assert(rows.length === 26, `found ${rows.length}`);
  });

  check(`home ${label}: 22 button[data-copy] controls`, () => {
    const buttons = tagsNamed(docFor(rel), "button").filter((tag) => hasAttr(tag, "data-copy"));
    assert(buttons.length === 22, `found ${buttons.length}`);
  });

  check(`home ${label}: 4 rows carry data-copy="false"`, () => {
    const rows = homeRows(rel);
    const falseRows = rows.filter((tag) => (tag.attrs["data-copy"] ?? "").toLowerCase() === "false");
    assert(falseRows.length === 4, `found ${falseRows.length}`);
  });

  check(`home ${label}: groups hold 6 / 10 / 7 / 3 rows`, () => {
    const rows = homeRows(rel);
    const actual = GROUP_IDS.map(
      (group) => rows.filter((tag) => tag.attrs["data-group"] === group).length
    );
    const expected = GROUP_IDS.map((group) => GROUP_COUNTS[group]);
    assert(
      actual.every((count, index) => count === expected[index]),
      `expected ${expected.join(" / ")}, found ${actual.join(" / ")}`
    );
  });

  check(`home ${label}: four group headings in spec order`, () => {
    const doc = docFor(rel);
    const groups = doc.tags.filter((tag) => hasAttr(tag, "data-cheat-group"));
    assert(groups.length === 4, `found ${groups.length} [data-cheat-group] sections`);
    const ids = groups.map((tag) => tag.attrs["data-cheat-group"] ?? "");
    assert(ids.join("|") === GROUP_IDS.join("|"), `order is ${ids.join(" / ") || "none"}`);
    for (let index = 0; index < groups.length; index += 1) {
      const end = groups[index + 1]?.index ?? doc.html.length;
      const segment = doc.html.slice(groups[index].index, end);
      const headings = allOpeningTags(segment).filter((tag) => tag.name === "h2");
      const hasHeading = headings.some((heading) => {
        const inner = elementInner(segment, heading);
        return inner !== null && textOf(inner).length > 0;
      });
      assert(hasHeading, `group "${ids[index]}" has no non-empty <h2>`);
    }
  });

  check(`home ${label}: group headings are the exact §7 labels`, () => {
    const doc = docFor(rel);
    const groups = doc.tags.filter((tag) => hasAttr(tag, "data-cheat-group"));
    assert(groups.length === 4, `found ${groups.length} [data-cheat-group] sections`);
    const problems = [];
    for (const group of groups) {
      const id = group.attrs["data-cheat-group"] ?? "";
      const expected = HOME_COPY[lang].groups[id];
      if (!expected) {
        problems.push(`${id || "(no id)"} (unknown group)`);
        continue;
      }
      const inner = elementInner(doc.html, group);
      if (inner === null) {
        problems.push(`${id} (unclosed group)`);
        continue;
      }
      const headings = allOpeningTags(inner).filter((tag) => tag.name === "h2");
      const actual =
        headings.length === 1 ? normalizeWhitespace(textOf(elementInner(inner, headings[0]) ?? "")) : "";
      if (actual !== expected) problems.push(`${id} is "${actual || "(missing)"}", expected "${expected}"`);
    }
    assert(problems.length === 0, `${problems.length}/4 group(s): ${sampleList(problems)}`);
  });

  check(`home ${label}: every row href resolves to a page and id`, () => {
    const rows = homeRows(rel);
    assert(rows.length === 26, `expected 26 rows, found ${rows.length}`);
    const hrefs = rowHrefs(rel, rows);
    const withoutHref = hrefs.filter((href) => !href).length;
    assert(withoutHref === 0, `${withoutHref} row(s) have no <a href>`);
    const problems = [];
    for (const href of hrefs) {
      if (!href) continue;
      const match = href.match(new RegExp(`^/${lang}/([a-z0-9-]+)#([^#]+)$`));
      if (!match) {
        problems.push(`${href} (not /${lang}/slug#anchor)`);
        continue;
      }
      const [, slug, anchor] = match;
      const targetRel = `${lang}/${slug}/index.html`;
      if (!fs.existsSync(path.join(DIST, targetRel))) {
        problems.push(`${href} (missing ${targetRel})`);
        continue;
      }
      const targetIds = collectIds(docFor(targetRel));
      const id = anchor.replace(/^#/, "");
      if (!targetIds.has(id)) problems.push(`${href} (no id="${id}")`);
    }
    assert(problems.length === 0, `${problems.length} dead row href(s): ${sampleList(problems)}`);
  });

  check(`home ${label}: row targets match the 26 spec targets`, () => {
    const rows = homeRows(rel);
    const actual = rowHrefs(rel, rows).filter(Boolean).sort();
    const expected = ROW_TARGETS.map(
      ([slug, enAnchor, idAnchor]) =>
        `/${lang}/${slug}#${lang === "en" ? enAnchor : idAnchor}`
    ).sort();
    const missing = multisetDifference(expected, actual);
    const unexpected = multisetDifference(actual, expected);
    assert(
      missing.length === 0 && unexpected.length === 0,
      `missing: ${missing.length > 0 ? sampleList(missing) : "none"}; unexpected: ${
        unexpected.length > 0 ? sampleList(unexpected) : "none"
      }`
    );
  });

  check(`home ${label}: row anatomy and copy/result contract`, () => {
    const doc = docFor(rel);
    const rows = homeRows(rel);
    assert(rows.length === 26, `expected 26 rows, found ${rows.length}`);
    const problems = [];
    rows.forEach((row, index) => {
      const where = `row ${index + 1}`;
      if (row.name !== "div") {
        problems.push(`${where} is <${row.name}>, expected <div>`);
        return;
      }
      const copyValue = (row.attrs["data-copy"] ?? "").toLowerCase();
      if (copyValue !== "true" && copyValue !== "false") {
        problems.push(`${where} data-copy="${row.attrs["data-copy"] ?? ""}"`);
        return;
      }
      const inner = elementInner(doc.html, row);
      if (inner === null) {
        problems.push(`${where} (unclosed row)`);
        return;
      }
      const tags = allOpeningTags(inner);
      const dts = tags.filter((tag) => tag.name === "dt");
      const dds = tags.filter((tag) => tag.name === "dd");
      if (dts.length !== 1) problems.push(`${where} has ${dts.length} <dt>`);
      if (dds.length !== 2) problems.push(`${where} has ${dds.length} <dd>`);
      if (dts.length !== 1 || dds.length !== 2) return;

      const dtInner = elementInner(inner, dts[0]) ?? "";
      const anchor = allOpeningTags(dtInner).find((tag) => tag.name === "a");
      const label = anchor
        ? normalizeWhitespace(textOf(elementInner(dtInner, anchor) ?? ""))
        : "";
      if (!anchor) problems.push(`${where} <dt> has no <a>`);
      else if (label.length === 0) problems.push(`${where} <dt><a> has no label`);

      const syntaxInner = elementInner(inner, dds[0]) ?? "";
      const codeTags = allOpeningTags(syntaxInner).filter((tag) => tag.name === "code");
      const syntax = codeTags
        .map((tag) => normalizeWhitespace(textOf(elementInner(syntaxInner, tag) ?? "")))
        .find((text) => text.length > 0);
      if (!syntax) problems.push(`${where} has no non-empty syntax <code>`);

      const resultInner = elementInner(inner, dds[1]) ?? "";
      const result = contentText(resultInner);
      if (result.length === 0) problems.push(`${where} has no non-empty result`);

      const buttons = tags.filter((tag) => tag.name === "button" && hasAttr(tag, "data-copy"));
      const targets = tags.filter((tag) => hasAttr(tag, "data-copy-target"));
      if (copyValue === "true") {
        if (buttons.length !== 1) problems.push(`${where} has ${buttons.length} copy button(s)`);
        if (targets.length !== 1) problems.push(`${where} has ${targets.length} copy target(s)`);
        const syntaxTargets = allOpeningTags(syntaxInner).filter((tag) =>
          hasAttr(tag, "data-copy-target")
        );
        if (syntaxTargets.length !== 1) {
          problems.push(`${where} has ${syntaxTargets.length} copy target(s) in the syntax cell`);
        }
        const syntaxButtons = allOpeningTags(syntaxInner).filter(
          (tag) => tag.name === "button" && hasAttr(tag, "data-copy")
        );
        if (syntaxButtons.length !== 1) {
          problems.push(`${where} has ${syntaxButtons.length} copy button(s) in the syntax cell`);
        }
        if (buttons.length === 1) {
          const aria = normalizeWhitespace(buttons[0].attrs["aria-label"] ?? "");
          if (aria.length === 0) problems.push(`${where} copy button has no aria-label`);
          else if (label.length > 0 && !aria.toLowerCase().includes(label.toLowerCase())) {
            problems.push(`${where} copy button aria-label "${brief(aria, 60)}" omits "${label}"`);
          }
        }
        if (targets.length === 1) {
          const targetText = normalizeWhitespace(
            textOf(elementInner(inner, targets[0]) ?? "")
          );
          if (targetText.length === 0) problems.push(`${where} copy target is empty`);
        }
      } else {
        // The plan renders data-copy-target on every row; only the button is
        // conditional. A target is allowed here, but not required.
        if (buttons.length > 0) problems.push(`${where} is label-only but has a copy button`);
      }
    });
    assert(problems.length === 0, `${problems.length} row problem(s): ${sampleList(problems)}`);
  });

  check(`home ${label}: four live-id rows are the exact label-only rows`, () => {
    const rows = homeRows(rel);
    const falseRows = rows.filter(
      (row) => (row.attrs["data-copy"] ?? "").toLowerCase() === "false"
    );
    assert(falseRows.length === 4, `found ${falseRows.length} data-copy="false" row(s)`);
    const expected = LIVE_ID_TARGETS[lang].map((target) => `/${lang}/${target}`).sort();
    const actual = rowHrefs(rel, falseRows).filter(Boolean).sort();
    const missing = multisetDifference(expected, actual);
    const unexpected = multisetDifference(actual, expected);
    const problems = [];
    for (const [index, row] of falseRows.entries()) {
      const inner = elementInner(docFor(rel).html, row) ?? "";
      const tags = allOpeningTags(inner);
      if (tags.some((tag) => tag.name === "button" && hasAttr(tag, "data-copy"))) {
        problems.push(`row ${index + 1} has a copy button`);
      }
      // data-copy-target is allowed on label-only rows and is not required.
    }
    assert(
      missing.length === 0 && unexpected.length === 0 && problems.length === 0,
      `missing: ${missing.length > 0 ? sampleList(missing) : "none"}; unexpected: ${
        unexpected.length > 0 ? sampleList(unexpected) : "none"
      }; controls: ${problems.length > 0 ? sampleList(problems) : "none"}`
    );
  });

  check(`home ${label}: exactly one <h1>`, () => {
    const count = tagsNamed(docFor(rel), "h1").length;
    assert(count === 1, `found ${count}`);
  });

  check(`home ${label}: <h1> is the exact §7 title`, () => {
    const doc = docFor(rel);
    const h1s = tagsNamed(doc, "h1");
    assert(h1s.length === 1, `found ${h1s.length} <h1>`);
    const actual = normalizeWhitespace(textOf(elementInner(doc.html, h1s[0]) ?? ""));
    const expected = HOME_COPY[lang].title;
    assert(actual === expected, `found "${actual}", expected "${expected}"`);
  });

  check(`home ${label}: §7 visible copy is rendered`, () => {
    const doc = docFor(rel);
    const copy = HOME_COPY[lang];
    const main = tagsNamed(doc, "main")[0];
    assert(main, "no <main>");
    const mainInner = elementInner(doc.html, main);
    assert(mainInner !== null, "unclosed <main>");
    const text = normalizeWhitespace(textOf(mainInner));
    const missing = [];
    for (const [key, value] of Object.entries({
      kicker: copy.kicker,
      lede: copy.lede,
      cta: copy.cta,
      youType: copy.youType,
      discordShows: copy.discordShows,
      search: copy.search,
      countLabel: copy.countLabel,
      empty: copy.empty,
    })) {
      if (!text.includes(value)) missing.push(`${key}: "${value}"`);
    }

    const inputs = tagsNamed(doc, "input").filter(
      (tag) => (tag.attrs.type ?? "").toLowerCase() === "search"
    );
    if (inputs.length !== 1) {
      missing.push(`search input: found ${inputs.length}`);
    } else {
      const inputId = inputs[0].attrs.id ?? "";
      const label = tagsNamed(doc, "label").find((tag) => {
        const inner = elementInner(doc.html, tag);
        if (inner === null) return false;
        return (tag.attrs.for ?? "") === inputId || inner.includes(`id="${inputId}"`);
      });
      const labelText = label
        ? normalizeWhitespace(textOf(elementInner(doc.html, label) ?? ""))
        : "";
      if (labelText !== copy.search) {
        missing.push(`search label: "${labelText || "(missing)"}"`);
      }
    }

    const empty = doc.tags.find((tag) => hasAttr(tag, "data-cheat-empty"));
    const emptyText = empty
      ? normalizeWhitespace(textOf(elementInner(doc.html, empty) ?? ""))
      : "";
    if (!emptyText.includes(copy.empty)) {
      missing.push(`empty state: "${emptyText || "(missing)"}"`);
    }

    assert(missing.length === 0, `missing: ${sampleList(missing, 6)}`);
  });

  check(`home ${label}: no visible empty <a>`, () => {
    const empty = findEmptyLinks(docFor(rel));
    assert(empty.length === 0, `${empty.length} empty link(s): ${sampleList(empty)}`);
  });

  check(`home ${label}: search input has a non-empty <label>`, () => {
    const doc = docFor(rel);
    const inputs = tagsNamed(doc, "input").filter(
      (tag) => (tag.attrs.type ?? "").toLowerCase() === "search"
    );
    assert(inputs.length === 1, `found ${inputs.length} input[type="search"]`);
    const input = inputs[0];
    const inputId = input.attrs.id ?? "";
    assert(inputId, "search input has no id");
    const labeled = tagsNamed(doc, "label").some((labelTag) => {
      const inner = elementInner(doc.html, labelTag);
      if (inner === null) return false;
      const targets =
        (labelTag.attrs.for ?? "") === inputId || inner.includes(`id="${inputId}"`);
      return targets && textOf(inner).length > 0;
    });
    assert(labeled, `no non-empty <label> targets #${inputId}`);
  });

  check(`home ${label}: count reads 26 / 26`, () => {
    const doc = docFor(rel);
    const counts = doc.tags.filter((tag) => hasAttr(tag, "data-cheat-count"));
    assert(counts.length === 1, `found ${counts.length} [data-cheat-count] element(s)`);
    const inner = elementInner(doc.html, counts[0]);
    const text = inner === null ? "" : textOf(inner);
    assert(/\b26\s*\/\s*26\b/.test(text), `count reads "${text.slice(0, 80)}"`);
  });

  check(`home ${label}: clear button is present and named`, () => {
    const doc = docFor(rel);
    const button = tagsNamed(doc, "button").find((tag) => hasAttr(tag, "data-cheat-clear"));
    assert(button, "no button[data-cheat-clear]");
    const inner = elementInner(doc.html, button);
    const name =
      (inner === null ? "" : textOf(inner)) || (button.attrs["aria-label"] ?? "").trim();
    assert(name.length > 0, "clear button has no accessible name");
  });

  check(`home ${label}: exactly one role="status", the empty state`, () => {
    const doc = docFor(rel);
    const statuses = doc.tags.filter((tag) => (tag.attrs.role ?? "").toLowerCase() === "status");
    assert(statuses.length === 1, `found ${statuses.length} role="status" element(s)`);
    assert(
      hasAttr(statuses[0], "data-cheat-empty"),
      `the only role="status" is <${statuses[0].name}> without [data-cheat-empty]`
    );
  });

  check(`home ${label}: copy live region is aria-live only`, () => {
    const doc = docFor(rel);
    const region = doc.tags.find((tag) => tag.attrs.id === "copy-status");
    assert(region, 'no element with id="copy-status"');
    assert(hasAttr(region, "aria-live"), 'id="copy-status" has no aria-live');
    assert(
      (region.attrs.role ?? "").toLowerCase() !== "status",
      'id="copy-status" must not be role="status"'
    );
  });

  check(`home ${label}: <title> has the spec suffix`, () => {
    const title = titleOf(docFor(rel));
    assert(title, "missing <title>");
    assert(title.endsWith(meta.title), `title is "${title}"`);
  });

  check(`home ${label}: og:site_name is localized`, () => {
    const actual = metaContent(docFor(rel), "og:site_name");
    assert(
      actual === meta.siteName,
      `expected "${meta.siteName}", found "${actual ?? "(missing)"}"`
    );
  });

  check(`home ${label}: og:image ends with ${meta.ogImage}`, () => {
    const actual = metaContent(docFor(rel), "og:image");
    assert(
      actual !== null && actual.endsWith(meta.ogImage),
      `expected a URL ending "${meta.ogImage}", found "${actual ?? "(missing)"}"`
    );
  });

  check(`home ${label}: Discord component embed is valid and localized`, () => {
    const embed = discordEmbedFor(rel);
    const expected = DISCORD_EMBED[lang];
    assert(embed, 'no <script id="discord:component-embed">');
    assert(
      (embed.tag.attrs.type ?? "").toLowerCase() === "application/json",
      `script type is "${embed.tag.attrs.type ?? "(missing)"}"`
    );
    assert(embed.bytes <= 3000, `payload is ${embed.bytes} bytes, expected <= 3000`);

    const payload = embed.payload;
    assert(
      payload !== null && typeof payload === "object" && !Array.isArray(payload),
      "payload is not a JSON object"
    );
    assert(
      Object.keys(payload).length === 1 && Object.prototype.hasOwnProperty.call(payload, "component"),
      `root keys are ${Object.keys(payload).join(", ") || "none"}`
    );

    const root = payload.component;
    assert(root !== null && typeof root === "object" && !Array.isArray(root), "component is missing");
    assert(root.type === 17, `root type is ${root.type ?? "(missing)"}, expected 17`);
    assert(
      root.accent_color === expected.accent,
      `accent_color is ${root.accent_color ?? "(missing)"}, expected ${expected.accent}`
    );

    const nodes = collectComponentNodes(root);
    assert(nodes.length <= 40, `found ${nodes.length} components, max is 40`);
    assert(nodes.filter((node) => node.type === 17).length === 1, "expected one Container");
    const invalidTypes = nodes
      .filter((node) => !ALLOWED_COMPONENT_TYPES.has(node.type))
      .map((node) => node.type);
    assert(invalidTypes.length === 0, `invalid component types: ${sampleList(invalidTypes)}`);

    const textDisplays = nodes.filter((node) => node.type === 10);
    assert(textDisplays.length === 1, `found ${textDisplays.length} Text Display component(s)`);
    const expectedContent = [
      `-# ${expected.eyebrow}`,
      `## ${expected.title}`,
      expected.tagline,
      "",
      expected.sample,
      "",
      `-# ${expected.meta}`,
    ].join("\n");
    assert(
      textDisplays[0].content === expectedContent,
      `Text Display content is "${brief(textDisplays[0].content, 120)}"`
    );

    const thumbnails = nodes.filter((node) => node.type === 11);
    assert(thumbnails.length === 1, `found ${thumbnails.length} Thumbnail component(s)`);
    const thumbnail = thumbnails[0];
    assert(
      thumbnail.media !== null &&
        typeof thumbnail.media === "object" &&
        !Array.isArray(thumbnail.media),
      "Thumbnail media is missing"
    );
    assert(
      Object.keys(thumbnail.media).length === 1 &&
        Object.prototype.hasOwnProperty.call(thumbnail.media, "url"),
      `Thumbnail media keys are ${Object.keys(thumbnail.media).join(", ") || "none"}`
    );
    assert(
      thumbnail.media.url === expected.logo,
      `Thumbnail URL is "${thumbnail.media.url ?? "(missing)"}"`
    );

    const buttons = nodes.filter((node) => node.type === 2);
    assert(buttons.length === 2, `found ${buttons.length} link button(s)`);
    const buttonProblems = [];
    for (const button of buttons) {
      if (button.style !== 5) buttonProblems.push(`style ${button.style ?? "(missing)"}`);
      const extra = Object.keys(button).filter((key) => !BUTTON_KEYS.has(key));
      if (extra.length > 0) buttonProblems.push(`keys ${extra.join(",")}`);
      if (typeof button.label !== "string" || button.label.length === 0) {
        buttonProblems.push("empty label");
      }
      if (typeof button.url !== "string" || !button.url.startsWith("https://")) {
        buttonProblems.push("invalid URL");
      }
    }
    assert(buttonProblems.length === 0, `button problems: ${sampleList(buttonProblems)}`);

    const actualButtons = buttons.map(({ label, url }) => ({ label, url }));
    const expectedButtons = [
      { label: expected.open, url: expected.home },
      { label: expected.play, url: expected.playUrl },
    ];
    assert(
      JSON.stringify(actualButtons) === JSON.stringify(expectedButtons),
      `buttons are ${JSON.stringify(actualButtons)}`
    );
  });

  check(`home ${label}: meta description matches §9`, () => {
    const actual = metaContent(docFor(rel), "description");
    assert(actual === meta.description, `found "${actual ?? "(missing)"}"`);
  });
}

for (const lang of LOCALES) checkHome(lang);

// ---------------------------------------------------------------------------
// Social previews
// ---------------------------------------------------------------------------

check("social: OG image dimensions and alt text are complete on every content page", () => {
  const pages = requireContentPages();
  const problems = [];
  for (const rel of pages) {
    const doc = docFor(rel);
    const lang = rel.startsWith("id/") ? "id" : "en";
    const expectedAlt = `${HOME_META[lang].siteName} — ${DISCORD_EMBED[lang].tagline}`;
    const width = metaContent(doc, "og:image:width");
    const height = metaContent(doc, "og:image:height");
    const type = metaContent(doc, "og:image:type");
    const alt = metaContent(doc, "og:image:alt");
    const twitterAlt = metaContent(doc, "twitter:image:alt");
    if (width !== "1200") problems.push(`${rel} width "${width ?? "(missing)"}"`);
    if (height !== "630") problems.push(`${rel} height "${height ?? "(missing)"}"`);
    if (type !== "image/png") problems.push(`${rel} type "${type ?? "(missing)"}"`);
    if (alt !== expectedAlt) problems.push(`${rel} alt "${alt ?? "(missing)"}"`);
    if (twitterAlt !== expectedAlt) {
      problems.push(`${rel} twitter alt "${twitterAlt ?? "(missing)"}"`);
    }
  }
  assert(
    problems.length === 0,
    `${problems.length}/${pages.length} page(s): ${sampleList(problems, 5)}`
  );
});

check("social: Discord component embed is scoped to localized home pages", () => {
  const pages = requireContentPages().filter(
    (rel) => rel !== "en/index.html" && rel !== "id/index.html"
  );
  const offenders = pages.filter((rel) => /id="discord:component-embed"/.test(readPage(rel)));
  assert(
    offenders.length === 0,
    `${offenders.length} non-home page(s) carry it: ${sampleList(offenders)}`
  );
});

// ---------------------------------------------------------------------------
// Icons, brand assets, hygiene
// ---------------------------------------------------------------------------

check("icons: every content page links 32, 48 and apple-touch icons", () => {
  const pages = requireContentPages();
  const incomplete = [];
  for (const rel of pages) {
    const links = tagsNamed(docFor(rel), "link");
    const relTokens = (tag) => (tag.attrs.rel ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    const href = (tag) => tag.attrs.href ?? "";
    const sizes = (tag) => (tag.attrs.sizes ?? "").toLowerCase().replace(/×/g, "x");
    const has32 = links.some(
      (tag) =>
        relTokens(tag).includes("icon") &&
        sizes(tag) === "32x32" &&
        /\/favicon-32\.png$/.test(href(tag))
    );
    const has48 = links.some(
      (tag) =>
        relTokens(tag).includes("icon") &&
        sizes(tag) === "48x48" &&
        /\/favicon-48\.png$/.test(href(tag))
    );
    const hasApple = links.some(
      (tag) =>
        relTokens(tag).includes("apple-touch-icon") &&
        /\/apple-touch-icon\.png$/.test(href(tag))
    );
    if (!has32 || !has48 || !hasApple) {
      const missing = [!has32 && "32", !has48 && "48", !hasApple && "apple-touch"]
        .filter(Boolean)
        .join("+");
      incomplete.push(`${rel} (${missing})`);
    }
  }
  assert(
    incomplete.length === 0,
    `${incomplete.length}/${pages.length} page(s) missing icon links: ${sampleList(incomplete)}`
  );
});

check("icons: no content page links favicon.svg", () => {
  const pages = requireContentPages();
  const offenders = pages.filter((rel) =>
    tagsNamed(docFor(rel), "link").some((tag) =>
      /(?:^|\/)favicon\.svg(?:[?#]|$)/i.test(tag.attrs.href ?? "")
    )
  );
  assert(
    offenders.length === 0,
    `${offenders.length} page(s) still link favicon.svg: ${sampleList(offenders)}`
  );
});

check("icons: favicon.svg is absent from dist", () => {
  const offenders = walk(DIST).filter(
    (file) => path.basename(file).toLowerCase() === "favicon.svg"
  );
  assert(
    offenders.length === 0,
    `found: ${sampleList(offenders.map((file) => toPosix(path.relative(ROOT, file))))}`
  );
});

for (const [file, width, height] of PNG_EXPECTATIONS) {
  check(`assets: ${file} is ${width}x${height}`, () => {
    const dimensions = pngDimensions(file);
    assert(
      dimensions.width === width && dimensions.height === height,
      `found ${dimensions.width}x${dimensions.height}`
    );
  });
}

check("assets: source mark dmdg.png is not served in dist", () => {
  const offenders = walk(DIST).filter((file) =>
    /^dmdg(?:[.-].*)?\.png$/i.test(path.basename(file))
  );
  assert(
    offenders.length === 0,
    `found: ${sampleList(offenders.map((file) => toPosix(path.relative(ROOT, file))))}`
  );
});

check('hygiene: "DM / GUIDE" is absent from dist and apps/web/src', () => {
  assert(fs.existsSync(DIST), "apps/web/dist is missing");
  assert(fs.existsSync(SRC), "apps/web/src is missing");
  const hits = scanTrees("DM / GUIDE", false);
  assert(hits.length === 0, `${hits.length} file(s) contain it: ${sampleList(hits)}`);
});

check('hygiene: "hacksore" is absent from dist and apps/web/src', () => {
  assert(fs.existsSync(DIST), "apps/web/dist is missing");
  assert(fs.existsSync(SRC), "apps/web/src is missing");
  const hits = scanTrees("hacksore", true);
  assert(hits.length === 0, `${hits.length} file(s) contain it: ${sampleList(hits)}`);
});

check('hygiene: "vercel" is absent from dist and apps/web/src', () => {
  assert(fs.existsSync(DIST), "apps/web/dist is missing");
  assert(fs.existsSync(SRC), "apps/web/src is missing");
  const hits = scanTrees("vercel", true);
  assert(hits.length === 0, `${hits.length} file(s) contain it: ${sampleList(hits)}`);
});

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

check("theme: every content page has [data-theme-toggle]", () => {
  const pages = requireContentPages();
  const missing = pages.filter(
    (rel) => !docFor(rel).tags.some((tag) => hasAttr(tag, "data-theme-toggle"))
  );
  assert(
    missing.length === 0,
    `${missing.length}/${pages.length} page(s) missing it: ${sampleList(missing)}`
  );
});

check("theme: every content page has two theme-color metas", () => {
  const pages = requireContentPages();
  const bad = [];
  for (const rel of pages) {
    const metas = tagsNamed(docFor(rel), "meta").filter(
      (tag) => (tag.attrs.name ?? "").toLowerCase() === "theme-color"
    );
    if (metas.length !== 2) bad.push(`${rel} (${metas.length})`);
  }
  assert(
    bad.length === 0,
    `${bad.length}/${pages.length} page(s) without exactly two: ${sampleList(bad)}`
  );
});

check("theme: every content page references the dmg:theme boot script", () => {
  const pages = requireContentPages();
  const missing = pages.filter((rel) => !docFor(rel).raw.includes("dmg:theme"));
  assert(
    missing.length === 0,
    `${missing.length}/${pages.length} page(s) missing it: ${sampleList(missing)}`
  );
});

check("theme: light --ink3 token is #63656D", () => {
  const rules = getStyleRules();
  const root = rules.find(
    (rule) =>
      /^:root\b/i.test(rule.selector) &&
      !isDarkContext(rule) &&
      /--ink3\s*:/i.test(rule.body)
  );
  assert(root, "no light :root rule defines --ink3");
  assert(
    /--ink3\s*:\s*#63656D\b/i.test(root.body),
    `found "${root.body.match(/--ink3\s*:\s*([^;]+)/i)?.[1]?.trim() ?? "(unknown)"}"`
  );
});

check("theme: dark token block has the §5 values", () => {
  const rules = getStyleRules();
  const darkRules = rules.filter(isDarkContext);
  assert(darkRules.length > 0, "no dark-theme CSS block");
  const darkCss = darkRules.map((rule) => rule.body).join("\n");
  const missing = DARK_TOKEN_CHECKS.filter(([, pattern]) => !pattern.test(darkCss)).map(
    ([label]) => label
  );

  const css = stripCssComments(
    readText(path.join(SRC, "style.css"), "apps/web/src/style.css")
  );
  if (!/--specimen\s*:\s*#313338\b/i.test(css)) missing.push("--specimen: #313338");

  assert(missing.length === 0, `missing: ${sampleList(missing, 7)}`);
});

check("theme: no-JS CSS hides toolbar, copy buttons and toggle", () => {
  const rules = getStyleRules().filter(isNoJsRule);
  assert(rules.length > 0, "no html:not(.js) rules");
  const hiddenSelectors = rules
    .filter((rule) => /display\s*:\s*none/i.test(rule.body))
    .map((rule) => rule.selector)
    .join(" ");
  const required = ["[data-theme-toggle]", "[data-cheat-toolbar]", "[data-copy]"];
  const missing = required.filter((token) => !hiddenSelectors.includes(token));
  assert(missing.length === 0, `not hidden: ${sampleList(missing)}`);
});

check("theme: no-JS CSS keeps the 26 rows visible", () => {
  const hiddenSelectors = getStyleRules()
    .filter((rule) => isNoJsRule(rule) && /display\s*:\s*none/i.test(rule.body))
    .map((rule) => rule.selector)
    .join(" ");
  const forbidden = [
    "[data-cheat]",
    "[data-cheat-row]",
    "[data-cheat-group]",
    ".cheat-row",
    ".cheat-group",
    ".cheat-list",
  ];
  const offenders = forbidden.filter((token) => hiddenSelectors.includes(token));
  const hiddenRows = LOCALES.flatMap((lang) =>
    homeRows(`${lang}/index.html`).filter((row) => hasAttr(row, "hidden"))
  );
  assert(
    offenders.length === 0 && hiddenRows.length === 0,
    `hidden by no-JS CSS: ${sampleList(offenders)}; rows with hidden: ${hiddenRows.length}`
  );
});

check("header: mark, brand link and short name are correct on every content page", () => {
  const pages = requireContentPages();
  const problems = [];
  for (const rel of pages) {
    const lang = rel.startsWith("id/") ? "id" : "en";
    const doc = docFor(rel);
    const header = tagsNamed(doc, "header")[0];
    if (!header) {
      problems.push(`${rel} (no <header>)`);
      continue;
    }
    const inner = elementInner(doc.html, header);
    if (inner === null) {
      problems.push(`${rel} (unclosed <header>)`);
      continue;
    }
    const tags = allOpeningTags(inner);
    const logos = tags.filter(
      (tag) => tag.name === "img" && (tag.attrs.src ?? "") === "/logo-96.png"
    );
    if (logos.length !== 1) {
      problems.push(`${rel} (${logos.length} logo-96 <img>)`);
      continue;
    }
    const logo = logos[0];
    if (logo.attrs.width !== "24" || logo.attrs.height !== "24") {
      problems.push(`${rel} (logo is ${logo.attrs.width ?? "?"}x${logo.attrs.height ?? "?"})`);
    }
    if (!hasAttr(logo, "alt") || logo.attrs.alt !== "") {
      problems.push(`${rel} (logo alt is not empty)`);
    }

    const brandLinks = tags.filter((tag) => {
      if (tag.name !== "a") return false;
      const linkInner = elementInner(inner, tag);
      return (
        linkInner !== null &&
        allOpeningTags(linkInner).some(
          (candidate) =>
            candidate.name === "img" && (candidate.attrs.src ?? "") === "/logo-96.png"
        )
      );
    });
    if (brandLinks.length !== 1) {
      problems.push(`${rel} (${brandLinks.length} brand links)`);
      continue;
    }
    const brandLink = brandLinks[0];
    const aria = normalizeWhitespace(brandLink.attrs["aria-label"] ?? "");
    if (aria !== HOME_META[lang].siteName) {
      problems.push(`${rel} (aria-label "${aria || "(missing)"}")`);
    }
    const brandText = normalizeWhitespace(
      textOf(elementInner(inner, brandLink) ?? "")
    );
    if (brandText !== BRAND_SHORT[lang]) {
      problems.push(`${rel} (brand text "${brandText || "(missing)"}")`);
    }
  }
  assert(
    problems.length === 0,
    `${problems.length}/${pages.length} page(s): ${sampleList(problems)}`
  );
});

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

check("articles: 16 article pages exist (8 EN + 8 ID)", () => {
  const missing = ARTICLE_PAGES.filter(
    (article) => !fs.existsSync(path.join(DIST, article.rel))
  ).map((article) => article.rel);
  assert(missing.length === 0, `missing: ${sampleList(missing)}`);
});

check("articles: every article page has [data-mistakes]", () => {
  const missing = ARTICLE_PAGES.filter(
    (article) => !docFor(article.rel).tags.some((tag) => hasAttr(tag, "data-mistakes"))
  ).map((article) => article.rel);
  assert(
    missing.length === 0,
    `${missing.length}/${ARTICLE_PAGES.length} article page(s) missing it: ${sampleList(missing)}`
  );
});

check("articles: [data-article-intro] matches each MDX intro (40-240)", () => {
  const problems = [];
  for (const article of ARTICLE_PAGES) {
    const mdxRel = `${article.lang}/${article.slug}.mdx`;
    const mdxPath = path.join(
      SRC,
      "content",
      "feature",
      article.lang,
      `${article.slug}.mdx`
    );
    try {
      const intro = frontmatterIntro(readText(mdxPath, `MDX ${mdxRel}`));
      if (intro === null) {
        problems.push(`${mdxRel} (no intro)`);
        continue;
      }
      const normalizedIntro = normalizeWhitespace(intro);
      if (normalizedIntro.length === 0) {
        problems.push(`${mdxRel} (empty intro)`);
        continue;
      }
      if (intro.length < 40 || intro.length > 240) {
        problems.push(`${mdxRel} (intro length ${intro.length}, expected 40-240)`);
        continue;
      }
      const doc = docFor(article.rel);
      const hooks = doc.tags.filter((tag) => hasAttr(tag, "data-article-intro"));
      if (hooks.length !== 1) {
        problems.push(`${article.rel} (${hooks.length} [data-article-intro] elements)`);
        continue;
      }
      const rendered = normalizeWhitespace(
        textOf(elementInner(doc.html, hooks[0]) ?? "")
      );
      if (rendered.length === 0) {
        problems.push(`${article.rel} (empty [data-article-intro])`);
      } else if (rendered !== normalizedIntro) {
        problems.push(
          `${article.rel} (intro mismatch: "${brief(rendered)}" != "${brief(normalizedIntro)}")`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      problems.push(`${mdxRel} (${message})`);
    }
  }
  assert(
    problems.length === 0,
    `${problems.length}/${ARTICLE_PAGES.length} article(s): ${sampleList(problems)}`
  );
});

check("article misc: masked-link section exists in EN and ID", () => {
  const enIds = collectIds(docFor("en/misc/index.html"));
  const idIds = collectIds(docFor("id/misc/index.html"));
  assert(enIds.has("masked-links"), 'en/misc/index.html has no id="masked-links"');
  assert(idIds.has("tautan-berteks"), 'id/misc/index.html has no id="tautan-berteks"');
});

check("article misc: new localized titles are rendered", () => {
  const enTitle = titleOf(docFor("en/misc/index.html"));
  const idTitle = titleOf(docFor("id/misc/index.html"));
  assert(
    enTitle !== null && enTitle.includes(MISC_TITLES.en),
    `EN title is "${enTitle ?? "(missing)"}"`
  );
  assert(
    idTitle !== null && idTitle.includes(MISC_TITLES.id),
    `ID title is "${idTitle ?? "(missing)"}"`
  );
});

check('content: ID MDX contains no "Anda"', () => {
  const dir = path.join(SRC, "content", "feature", "id");
  const files = walk(dir).filter((file) => file.toLowerCase().endsWith(".mdx"));
  assert(files.length === 8, `found ${files.length} ID MDX files, expected 8`);
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const re = /\bAnda\b/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      hits.push(`${toPosix(path.relative(ROOT, file))}:${line}`);
    }
  }
  assert(hits.length === 0, `${hits.length} occurrence(s): ${sampleList(hits)}`);
});

check('content: no "Anda" in ui.ts or built /id/ pages', () => {
  const hits = [];
  const scan = (text, label) => {
    const re = /\bAnda\b/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      hits.push(`${label}:${line}`);
    }
  };

  const uiPath = path.join(SRC, "i18n", "ui.ts");
  scan(readText(uiPath, "apps/web/src/i18n/ui.ts"), toPosix(path.relative(ROOT, uiPath)));

  const idPages = walk(path.join(DIST, "id")).filter((file) =>
    file.toLowerCase().endsWith(".html")
  );
  assert(idPages.length > 0, "no built /id/ HTML pages found");
  for (const file of idPages) {
    scan(readText(file, toPosix(path.relative(ROOT, file))), toPosix(path.relative(ROOT, file)));
  }

  assert(hits.length === 0, `${hits.length} occurrence(s): ${sampleList(hits)}`);
});

check("articles: every figure.detail has data-copy and data-copy-target", () => {
  let total = 0;
  const missingCopy = [];
  const missingTarget = [];
  for (const article of ARTICLE_PAGES) {
    const figures = detailFigures(docFor(article.rel));
    figures.forEach((figure, index) => {
      total += 1;
      const innerTags = allOpeningTags(figure.inner);
      if (!innerTags.some((tag) => hasAttr(tag, "data-copy"))) {
        missingCopy.push(`${article.rel} figure ${index + 1}`);
      }
      if (!innerTags.some((tag) => hasAttr(tag, "data-copy-target"))) {
        missingTarget.push(`${article.rel} figure ${index + 1}`);
      }
    });
  }
  assert(total > 0, 'no <figure class="detail"> found in the 16 article pages');
  const problems = [
    ...missingCopy.map((item) => `${item} (copy)`),
    ...missingTarget.map((item) => `${item} (target)`),
  ];
  assert(
    missingCopy.length === 0 && missingTarget.length === 0,
    `${missingCopy.length}/${total} missing data-copy; ${missingTarget.length}/${total} missing data-copy-target; ${sampleList(
      problems
    )}`
  );
});

// ---------------------------------------------------------------------------
// Layout: no functional 1:1 label inside the main column
// ---------------------------------------------------------------------------

check('layout: home, article and play <main> contain no "1:1"', () => {
  const pages = [
    ...LOCALES.map((lang) => `${lang}/index.html`),
    ...ARTICLE_PAGES.map((article) => article.rel),
    ...LOCALES.map((lang) => `${lang}/play/index.html`),
  ];
  const offenders = [];
  for (const rel of pages) {
    const doc = docFor(rel);
    const mains = tagsNamed(doc, "main");
    if (mains.length !== 1) {
      offenders.push(`${rel} (${mains.length} <main>)`);
      continue;
    }
    const inner = elementInner(doc.html, mains[0]);
    if (inner === null) {
      offenders.push(`${rel} (unclosed <main>)`);
      continue;
    }
    const count = (inner.match(/\b1:1\b/g) ?? []).length;
    if (count > 0) offenders.push(`${rel} (${count})`);
  }
  assert(
    offenders.length === 0,
    `${offenders.length}/${pages.length} page(s) contain it in <main>: ${sampleList(offenders)}`
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const totalChecks = passed + failures.length;
console.log("");
console.log(`Summary: ${passed} passed, ${failures.length} failed (${totalChecks} checks)`);
if (failures.length > 0) {
  console.log("Result: FAIL -- fix the failed checks above.");
  process.exitCode = 1;
} else {
  console.log("Result: PASS -- every dist acceptance check passed.");
}
