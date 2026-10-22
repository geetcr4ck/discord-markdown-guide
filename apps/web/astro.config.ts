import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { RehypePlugins } from "astro";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// Static output only: Cloudflare Pages serves apps/web/dist. No adapter.
export default defineConfig({
  site: "https://discord-markdown-guide.pages.dev",
  trailingSlash: "never",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "id"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { class: "anchor-link" },
        },
      ],
    ] as RehypePlugins,
  },
  integrations: [
    tailwind(),
    mdx(),
    react(),
    sitemap({
      // The root page is only a redirect to /en.
      filter: (page) => page !== "https://discord-markdown-guide.pages.dev/",
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", id: "id" },
      },
    }),
  ],
});
