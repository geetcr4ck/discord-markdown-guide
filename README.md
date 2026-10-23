# Discord Markdown Guide by geetcr4ck

A reference and live playground for Discord-flavored Markdown. Discord's own
documentation is a set of static images, so you cannot search it, read it at
your own pace, or see what your own text will look like. This site pairs the
raw syntax with its exact rendered result: eight documented syntax areas, a
bilingual interface, and a split-pane playground that runs the visitor's text
through a real Discord-flavoured parser in the browser.

## Stack

- [Astro 4](https://astro.build) — static site generation and routing
- React — a single hydrated island for the playground
- Tailwind CSS 3 — styling, with IBM Plex Sans and IBM Plex Mono self-hosted
- MDX — the eight syntax articles, one per locale
- pnpm workspaces + [Turborepo](https://turbo.build) — install and build orchestration

## Local development

Requires Node.js 20 or later (see `.nvmrc`) and pnpm 8.15.6.

```sh
pnpm install
pnpm --filter ./apps/web dev
```

The dev server prints its local URL. `pnpm build` builds every workspace
package through Turbo.

## Production build

```sh
pnpm build
```

The output is fully static HTML, CSS, JS, and assets in `apps/web/dist`. There
is no server runtime, no adapter, and no environment-specific build step.

## Deploying to Cloudflare Pages

Create a Pages project connected to this repository and use:

| Setting | Value |
| --- | --- |
| Build command | `pnpm build` |
| Build output directory | `apps/web/dist` |
| Environment variable | `NODE_VERSION=20` |
| Environment variable | `PNPM_VERSION=8.15.6` |

Both locales are always prefixed: English pages live under `/en`, Indonesian
pages under `/id`, and `/` redirects to `/en`. Security and caching headers are
declared in `apps/web/public/_headers`; `apps/web/public/robots.txt` allows all
crawlers.

## License

The site is released under the MIT License; see [LICENSE](LICENSE). The Markdown
parser is derived from two upstream projects whose notices are reproduced in
[NOTICE](NOTICE).
