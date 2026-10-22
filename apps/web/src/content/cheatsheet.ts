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

export const cheatRows: CheatRow[] = [
  {
    group: "text",
    label: { en: "Bold", id: "Tebal" },
    keywords: "bold tebal strong penekanan **bold** **tebal** text teks",
    syntax: { en: "**bold**", id: "**tebal**" },
    slug: "text-formatting",
    anchor: { en: "bold", id: "tebal" },
  },
  {
    group: "text",
    label: { en: "Italic", id: "Miring" },
    keywords: "italic miring emphasis *italic* *miring* text teks",
    syntax: { en: "*italic*", id: "*miring*" },
    slug: "text-formatting",
    anchor: { en: "italic", id: "miring" },
  },
  {
    group: "text",
    label: { en: "Underline", id: "Garis bawah" },
    keywords:
      "underline garis bawah __underline__ __garis bawah__ text teks",
    syntax: { en: "__underline__", id: "__garis bawah__" },
    slug: "text-formatting",
    anchor: {
      en: "underline-and-strikethrough",
      id: "garis-bawah-dan-coretan",
    },
  },
  {
    group: "text",
    label: { en: "Strikethrough", id: "Coret" },
    keywords:
      "strikethrough strike coret coretan ~~struck~~ ~~coret~~ text teks",
    syntax: { en: "~~struck~~", id: "~~coret~~" },
    slug: "text-formatting",
    anchor: {
      en: "underline-and-strikethrough",
      id: "garis-bawah-dan-coretan",
    },
  },
  {
    group: "text",
    label: { en: "Bold italic", id: "Tebal miring" },
    keywords:
      "bold italic tebal miring combined ***both*** ***tebal miring*** text teks",
    syntax: { en: "***both***", id: "***tebal miring***" },
    slug: "text-formatting",
    anchor: {
      en: "combining-markers",
      id: "menggabungkan-penanda",
    },
  },
  {
    group: "text",
    label: { en: "Escape a marker", id: "Netralkan penanda" },
    keywords:
      "escape a marker escape escaped marker netralkan penanda backslash \\*not italic\\* \\*bukan miring\\* text teks",
    syntax: { en: "\\*not italic\\*", id: "\\*bukan miring\\*" },
    slug: "text-formatting",
    anchor: { en: "escaping", id: "escape" },
  },
  {
    group: "blocks",
    label: { en: "Heading", id: "Judul" },
    keywords:
      "heading judul title h1 # Heading # Judul blocks blok",
    syntax: { en: "# Heading", id: "# Judul" },
    slug: "organizational-text-formatting",
    anchor: { en: "headings", id: "judul" },
  },
  {
    group: "blocks",
    label: { en: "Subheading", id: "Subjudul" },
    keywords:
      "subheading subjudul heading judul h2 ## Subheading ## Subjudul blocks blok",
    syntax: { en: "## Subheading", id: "## Subjudul" },
    slug: "organizational-text-formatting",
    anchor: { en: "headings", id: "judul" },
  },
  {
    group: "blocks",
    label: { en: "Subtext", id: "Teks kecil" },
    keywords:
      "subtext teks kecil small print -# small print -# teks kecil blocks blok",
    syntax: { en: "-# small print", id: "-# teks kecil" },
    slug: "organizational-text-formatting",
    anchor: { en: "subtext", id: "subteks" },
  },
  {
    group: "blocks",
    label: { en: "Bulleted list", id: "Daftar poin" },
    keywords:
      "bulleted list bullet daftar poin unordered - item - butir blocks blok",
    syntax: { en: "- item", id: "- butir" },
    slug: "organizational-text-formatting",
    anchor: { en: "lists", id: "daftar" },
  },
  {
    group: "blocks",
    label: { en: "Numbered list", id: "Daftar nomor" },
    keywords:
      "numbered list number daftar nomor ordered 1. item 1. butir blocks blok",
    syntax: { en: "1. item", id: "1. butir" },
    slug: "organizational-text-formatting",
    anchor: { en: "lists", id: "daftar" },
  },
  {
    group: "blocks",
    label: { en: "Quote", id: "Kutipan" },
    keywords:
      "quote kutipan blockquote > quoted line > baris kutipan blocks blok",
    syntax: { en: "> quoted line", id: "> baris kutipan" },
    slug: "block-quotes",
    anchor: { en: "one-line", id: "satu-baris" },
  },
  {
    group: "blocks",
    label: { en: "Multiline quote", id: "Kutipan panjang" },
    keywords:
      "multiline quote kutipan panjang blockquote >>> quoted lines >>> migrasi tertunda sampai Jumat blocks blok",
    syntax: {
      en: ">>> the migration is blocked\nuntil Friday",
      id: ">>> migrasi tertunda\nsampai Jumat",
    },
    slug: "block-quotes",
    anchor: { en: "several-lines", id: "beberapa-baris" },
  },
  {
    group: "blocks",
    label: { en: "Inline code", id: "Kode sisipan" },
    keywords:
      "inline code kode sisipan `code` `kode` blocks blok",
    syntax: { en: "`code`", id: "`kode`" },
    slug: "code-blocks",
    anchor: { en: "inline-code", id: "inline-code" },
  },
  {
    group: "blocks",
    label: { en: "Code block", id: "Blok kode" },
    keywords:
      "code block blok kode fence fenced ``` const total = price * quantity console.log(total) ``` blocks blok",
    syntax: {
      en: "```\nconst total = price * quantity\nconsole.log(total)\n```",
      id: "```\nconst total = price * quantity\nconsole.log(total)\n```",
    },
    slug: "code-blocks",
    anchor: { en: "fenced-blocks", id: "blok-berpagar" },
  },
  {
    group: "blocks",
    label: { en: "Code with language", id: "Blok kode berwarna" },
    keywords:
      "code with language blok kode berwarna syntax highlight js javascript ```js const total = price * quantity ``` blocks blok",
    syntax: {
      en: "```js\nconst total = price * quantity\n```",
      id: "```js\nconst total = price * quantity\n```",
    },
    slug: "syntax-highlighting",
    anchor: { en: "the-rule", id: "aturannya" },
  },
  {
    group: "people",
    label: { en: "User mention", id: "Sebut pengguna" },
    keywords:
      "user mention sebut pengguna ping <@123456789012345678> people orang waktu",
    syntax: {
      en: "<@123456789012345678>",
      id: "<@123456789012345678>",
    },
    discord: { user: "@geetcr4ck" },
    copy: false,
    slug: "mentions",
    anchor: { en: "users", id: "pengguna" },
  },
  {
    group: "people",
    label: { en: "Role mention", id: "Sebut role" },
    keywords:
      "role mention sebut role ping <@&123456789012345678> people orang waktu",
    syntax: {
      en: "<@&123456789012345678>",
      id: "<@&123456789012345678>",
    },
    discord: { role: "@Moderator" },
    copy: false,
    slug: "mentions",
    anchor: { en: "roles-and-channels", id: "role-dan-channel" },
  },
  {
    group: "people",
    label: { en: "Channel link", id: "Tautan channel" },
    keywords:
      "channel link tautan channel <#123456789012345678> people orang waktu",
    syntax: {
      en: "<#123456789012345678>",
      id: "<#123456789012345678>",
    },
    discord: { channel: "#general" },
    copy: false,
    slug: "mentions",
    anchor: { en: "roles-and-channels", id: "role-dan-channel" },
  },
  {
    group: "people",
    label: { en: "Custom emoji", id: "Emoji khusus" },
    keywords:
      "custom emoji emoji khusus <:duck:1263836954789806154> <:name:123456789012345678> people orang waktu",
    syntax: {
      en: "<:duck:1263836954789806154>",
      id: "<:duck:1263836954789806154>",
    },
    discord: { emoji: "🦆" },
    copy: false,
    slug: "mentions",
    anchor: { en: "custom-emoji", id: "emoji-khusus" },
  },
  {
    group: "people",
    label: { en: "Everyone", id: "Semua orang" },
    keywords:
      "everyone all semua orang ping @everyone people orang waktu",
    syntax: { en: "@everyone", id: "@everyone" },
    slug: "mentions",
    anchor: { en: "everyone-and-here", id: "everyone-dan-here" },
  },
  {
    group: "people",
    label: { en: "Here", id: "Yang sedang online" },
    keywords:
      "here online yang sedang online ping @here people orang waktu",
    syntax: { en: "@here", id: "@here" },
    slug: "mentions",
    anchor: { en: "everyone-and-here", id: "everyone-dan-here" },
  },
  {
    group: "people",
    label: { en: "Timestamp", id: "Stempel waktu" },
    keywords:
      "timestamp time stempel waktu date <t:1700000000:F> people orang waktu",
    syntax: { en: "<t:1700000000:F>", id: "<t:1700000000:F>" },
    slug: "misc",
    anchor: { en: "timestamps", id: "timestamp" },
  },
  {
    group: "more",
    label: { en: "Inline spoiler", id: "Spoiler sisipan" },
    keywords:
      "inline spoiler spoiler sisipan ||secret|| ||rahasia|| more lainnya",
    syntax: { en: "||secret||", id: "||rahasia||" },
    slug: "spoiler-tags",
    anchor: { en: "inline", id: "inline" },
  },
  {
    group: "more",
    label: { en: "Block spoiler", id: "Spoiler blok" },
    keywords:
      "block spoiler spoiler blok ||The guest arrives at eight.|| ||Tamunya datang pukul delapan.|| more lainnya",
    syntax: {
      en: "||The guest arrives\nat eight.||",
      id: "||Tamunya datang\npukul delapan.||",
    },
    slug: "spoiler-tags",
    anchor: { en: "a-whole-block", id: "satu-blok-penuh" },
  },
  {
    group: "more",
    label: { en: "Masked link", id: "Tautan berteks" },
    keywords:
      "masked link tautan berteks hidden [text](https://example.com) [teks](https://example.com) more lainnya",
    syntax: {
      en: "[text](https://example.com)",
      id: "[teks](https://example.com)",
    },
    slug: "misc",
    anchor: { en: "masked-links", id: "tautan-berteks" },
  },
];

export const cheatGroups: { id: CheatGroupId; count: number }[] = (
  ["text", "blocks", "people", "more"] as const
).map((id) => ({
  id,
  count: cheatRows.filter((row) => row.group === id).length,
}));

export const cheatTotal = cheatRows.length;
