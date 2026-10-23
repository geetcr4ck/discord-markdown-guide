import { home, play, type Lang } from "../i18n/routes";
import { t } from "../i18n/ui";

const DEFAULT_SITE = "https://discord-markdown-guide.pages.dev";
const ACCENT_COLOR = 0x1f4fd8;
const LOGO_PATH = "/logo-96.png";

interface DiscordComponentPayload {
  component: {
    type: 17;
    accent_color: number;
    components: Array<Record<string, unknown>>;
  };
}

/**
 * Build the server-rendered Discord Components V2 link preview.
 *
 * The payload stays deliberately small: one container, one text section with
 * the mark as its accessory, a divider, and two link buttons. Keeping it
 * static means the crawler sees the same payload as a browser.
 */
export function buildDiscordComponentEmbed(lang: Lang, site?: URL): string {
  const translate = t(lang);
  const base = site ?? new URL(DEFAULT_SITE);
  const absolute = (path: string) => new URL(path, base).toString();

  const content = [
    `-# ${translate("discord.eyebrow")}`,
    `## ${translate("site.name")}`,
    translate("site.tagline"),
    "",
    translate("discord.sample"),
    "",
    `-# ${translate("discord.meta")}`,
  ].join("\n");

  const payload: DiscordComponentPayload = {
    component: {
      type: 17,
      accent_color: ACCENT_COLOR,
      components: [
        {
          type: 9,
          components: [{ type: 10, content }],
          accessory: {
            type: 11,
            media: { url: absolute(LOGO_PATH) },
          },
        },
        {
          type: 14,
          divider: true,
          spacing: 1,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: translate("discord.open"),
              url: absolute(`${home(lang)}/`),
            },
            {
              type: 2,
              style: 5,
              label: translate("nav.playground"),
              url: absolute(`${play(lang)}/`),
            },
          ],
        },
      ],
    },
  };

  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
