// Optional asset-generation tool; not required for normal builds.
// Pass a local Sharp package path, or install Sharp in your tooling environment.
import { createRequire } from "node:module";
import { mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || "sharp");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "assets/opt/home-responsive");
await mkdir(output, { recursive: true });
const photos = [
  "noi-bai-airport-private-transfer-car", "long-distance-private-transfer",
  "custom-trip-private-car", "business-private-transfer-car",
  "limo-prime-private-transfer-front-view", "limo-lux-private-car-white-exterior", "hoang-luxury-travel-vf9-private-car",
];
const icons = ["airport-private-transfer-icon", "business-private-transfer-icon", "custom-private-trip-icon", "long-distance-private-transfer-icon"];
for (const name of [...photos, ...icons]) {
  const source = resolve(root, "assets", `${name}.webp`);
  const widths = icons.includes(name) ? [128, 192] : [320, 640, 960, 1280];
  const metadata = await sharp(source).metadata();
  for (const width of widths) {
    if (width >= metadata.width) continue;
    const target = resolve(output, `${name}-${width}.webp`);
    await sharp(source).resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6 }).toFile(target);
    console.log(`${name}-${width}.webp: ${Math.round((await stat(target)).size / 1024)} KiB`);
  }
}
