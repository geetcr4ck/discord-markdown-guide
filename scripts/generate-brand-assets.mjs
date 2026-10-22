import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const sourcePath = path.join(root, "apps/web/src/assets/dmdg.png");
const publicDir = path.join(root, "apps/web/public");

const site = {
  en: {
    title: "Discord Markdown Guide",
    tagline: "Every rule, with the result beside it.",
  },
  id: {
    title: "Panduan Markdown Discord",
    tagline: "Semua aturan, lengkap dengan hasilnya.",
  },
};
const url = "discord-markdown-guide.pages.dev";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ogSvg({ title, tagline }, logoSrc) {
  const titleSize = title.length > 22 ? 52 : 56;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F2EFE7"/>
  <image x="96" y="175" width="280" height="280" href="${logoSrc}"/>
  <text x="424" y="270" fill="#16171B" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="600">${escapeXml(title)}</text>
  <text x="424" y="330" fill="#3D3F47" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="400">${escapeXml(tagline)}</text>
  <rect x="424" y="380" width="120" height="6" fill="#1F4FD8"/>
  <text x="424" y="568" fill="#63656D" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="400">${escapeXml(url)}</text>
</svg>`;
}

async function main() {
  assert(fs.existsSync(sourcePath), `Source mark is missing: ${sourcePath}`);
  const metadata = await sharp(sourcePath).metadata();
  assert(metadata.width === 2048 && metadata.height === 2048, `Source must be 2048x2048, got ${metadata.width}x${metadata.height}`);
  if (metadata.hasAlpha) {
    const stats = await sharp(sourcePath).stats();
    const alpha = stats.channels[3];
    assert(alpha?.min === 255, `Source must be opaque; alpha min is ${alpha?.min}`);
  }

  const { data, info } = await sharp(sourcePath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * info.channels;
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  assert(maxX >= minX && maxY >= minY, "Could not find the white mark bounding box");
  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  console.log(`white bbox: x ${minX}..${maxX} (${boxWidth}), y ${minY}..${maxY} (${boxHeight})`);

  const side = Math.ceil(Math.max(boxWidth, boxHeight) * 1.16);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const left = Math.max(0, Math.min(info.width - side, Math.round(centerX - side / 2)));
  const top = Math.max(0, Math.min(info.height - side, Math.round(centerY - side / 2)));
  console.log(`crop: ${side}x${side} at (${left},${top})`);

  const crop = sharp(sourcePath).extract({ left, top, width: side, height: side });
  const logos = [
    ["favicon-32.png", 32],
    ["favicon-48.png", 48],
    ["apple-touch-icon.png", 180],
    ["logo-96.png", 96],
  ];
  for (const [name, size] of logos) {
    const out = path.join(publicDir, name);
    await crop.clone().resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(out);
    console.log(`wrote ${path.relative(root, out)} (${size}x${size})`);
  }

  const logo280 = await crop.clone().resize(280, 280, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
  const logoSrc = `data:image/png;base64,${logo280.toString("base64")}`;
  for (const lang of ["en", "id"]) {
    const name = lang === "en" ? "og.png" : "og-id.png";
    const out = path.join(publicDir, name);
    const svg = ogSvg(site[lang], logoSrc);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`wrote ${path.relative(root, out)} (${meta.width}x${meta.height})`);
  }

  for (const name of [...logos.map(([name]) => name), "og.png", "og-id.png"]) {
    const meta = await sharp(path.join(publicDir, name)).metadata();
    assert(meta.width && meta.height, `${name} has no dimensions`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
