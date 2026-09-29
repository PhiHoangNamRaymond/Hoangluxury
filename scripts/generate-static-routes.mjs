import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { journeys } from "../src/config/journeys.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(projectRoot, "dist");
const shell = await readFile(resolve(distDir, "index.html"), "utf8");
const origin = "https://hoangluxury.travel";

const routes = [
  {
    path: "/blog/",
    title: "Travel Blog | Hoang Luxury Travel",
    description: "Travel stories, practical guides and local insights for your private journey through Sapa, Ha Giang, Ha Long and Northern Vietnam.",
  },
  {
    path: "/about/",
    title: "About Us | Hoang Luxury Travel",
    description:
      "Learn about Hoang Luxury Travel and our private transfer services for international travelers across Northern Vietnam.",
  },
  {
    path: "/photo/",
    title: "Photo Gallery | Hoang Luxury Travel",
    description:
      "Real photographs from private journeys across Northern Vietnam with Hoang Luxury Travel.",
  },
  {
    path: "/booking/",
    title: "Book a Private Transfer | Hoang Luxury Travel",
    description:
      "Book your private car and professional driver with Hoang Luxury Travel. Share your route, schedule and travel requirements with our team.",
  },
  {
    path: "/catalog/",
    title: "Private Transfer Pricing Catalog | Hoang Luxury Travel",
    description: "View private transfer vehicles, routes and transparent pricing from Hoang Luxury Travel.",
  },
  {
    path: "/cruises/",
    title: "Ha Long Cruises | Hoang Luxury Travel",
    description:
      "Explore Ha Long cruise options and arrange a comfortable private transfer with Hoang Luxury Travel.",
  },
  {
    path: "/feedback/",
    title: "Guest Feedback | Hoang Luxury Travel",
    description:
      "Read feedback from international travelers and share your experience with Hoang Luxury Travel.",
  },
  {
    path: "/journeys/",
    title: "Private Transfer Routes | Hoang Luxury Travel",
    description:
      "Explore private transfer routes from Hanoi and Noi Bai Airport to destinations across Northern Vietnam.",
  },
];

const canonicalJourneySlugByKey = {
  sapa: "hanoi-to-sapa-private-transfer",
  "ha-long": "hanoi-to-ha-long-private-transfer",
  "ninh-binh": "hanoi-to-ninh-binh-private-transfer",
  "ha-giang": "hanoi-to-ha-giang-private-transfer",
  "cat-ba": "hanoi-to-cat-ba-private-transfer",
  "cao-bang": "hanoi-to-cao-bang-private-transfer",
  "mu-cang-chai": "hanoi-to-mu-cang-chai-private-transfer",
  "moc-chau": "hanoi-to-moc-chau-private-transfer",
  "ta-xua": "hanoi-to-ta-xua-private-transfer",
};

for (const [key, slug] of Object.entries(canonicalJourneySlugByKey)) {
  const journey = journeys[key];
  routes.push({
    path: `/journey/${slug}/`,
    title: journey.seoTitle,
    description: journey.metaDescription || journey.intro,
  });
}

const escapeAttribute = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

function renderRoute({ path, title, description }) {
  const url = `${origin}${path}`;
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);
  const safeUrl = escapeAttribute(url);

  return shell
    .replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/s,
      `<meta name="description" content="${safeDescription}" />`,
    )
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${safeUrl}" />`)
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s,
      `<meta property="og:description" content="${safeDescription}" />`,
    )
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${safeUrl}" />`);
}

for (const route of routes) {
  const outputPath = resolve(distDir, route.path.slice(1), "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderRoute(route), "utf8");
}

console.log(`Generated ${routes.length} route-specific HTML files.`);
