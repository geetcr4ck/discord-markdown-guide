import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2EFE7",
        paper2: "#E9E5DA",
        ink: "#16171B",
        ink2: "#3D3F47",
        ink3: "#6A6C75",
        rule: "rgba(22, 23, 27, 0.16)",
        blue: "#1F4FD8",
        redline: "#C63A1B",
        specimen: "#313338",
        specimenInk: "#DBDEE1",
        specimenMuted: "#949BA4",
        blurple: "#5865F2",
      },
      fontFamily: {
        sans: [
          '"IBM Plex Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"IBM Plex Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      maxWidth: {
        sheet: "1200px",
      },
      borderRadius: {
        chip: "4px",
        specimen: "6px",
        capsule: "999px",
      },
    },
  },
  plugins: [typography],
};
