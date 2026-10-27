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
  "service-airport-2026", "service-long-distance-2026",
  "service-custom-trip-2026", "service-business-2026",
  "vehicle-limo-prime-2026", "vehicle-limo-lux-2026", "vehicle-vf9-2026",
];
const icons = ["service-icon-airport", "service-icon-business", "service-icon-custom-trip", "service-icon-long-distance"];
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
