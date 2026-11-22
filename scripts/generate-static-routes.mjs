import { mkdir, readFile, writeFile } from "node:fs/promises";
import { loadEnv } from "vite";
import { createClient } from "@supabase/supabase-js";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { journeys } from "../src/config/journeys.js";
import { cruisesPagePath, journeyPagePath, legacyJourneySlugByKey } from "../src/config/journey-paths.js";
import { cruiseData, cruiseLanding } from "../src/config/cruises.js";
import { cruiseCollection, cruiseTiers } from "../src/config/cruise-collection.js";
import { cruiseSeo } from "../src/config/cruise-seo.js";
import {
  ALL_PHOTO_CATEGORIES,
  photoAlbumRows,
  photoAlbumUrl,
  photoAlbumVideosBySlug,
  photoCategories,
  photoCategoryPageDescription,
  photoCategoryPageTitle,
  photoCategoryPath,
} from "../src/config/photo-album-list.js";
import { fetchPublicBlog } from "../src/lib/public-blog.js";
import { blogArticleUrl } from "../src/lib/blog-article.js";
import { renderRoute } from "./render-route.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(projectRoot, "dist");
const shell = await readFile(resolve(distDir, "index.html"), "utf8");
const origin = "https://hoangluxury.travel";

const routes = [
  { path: "/admin/", title: "Quản trị blog | Hoang Luxury Travel", description: "Private blog administration.", private: true },
  {
    path: "/blog/",
    title: "Travel Blog, Guides & Local Tips | Hoang Luxury Travel",
    description: "Travel stories, practical guides and local insights for your private journey through Sapa, Ha Giang, Ha Long and Northern Vietnam.",
  },
  {
    path: "/about-us/",
    title: "About Hoang Luxury Travel | Private Transfers in Vietnam",
    description:
      "Discover the story behind Hoang Luxury Travel, providing private transfers across Northern Vietnam with professional drivers and personalized journeys for international travelers.",
  },
  {
    path: "/hoangphoto/",
    title: "Private Photo Shoots | Hoang Luxury Travel",
    description:
      "Book a private photo shoot in Northern Vietnam with Hoang Luxury Travel. Explore a variety of creative concepts with convenient door-to-door private car service.",
  },
  {
    path: "/hoangphoto/albums/",
    title: "Hoang Photo Gallery In VietNam | Hoang Luxury Travel",
    description:
      "Explore travel photo albums across Northern Vietnam with Hoang Luxury Travel, featuring stunning landscapes, couples, local culture and diverse creative concepts.",
  },
  {
    path: "/booking/",
    title: "Booking Private Transfer | Hoang Luxury Travel",
    description:
      "Book a 100% private transfer with Hoang Luxury Travel. Enjoy direct door-to-door service, no shared passengers, professional drivers and flexible pick-up times.",
  },
  {
    path: "/catalog/",
    title: "Private Transfer Pricing Catalog | Hoang Luxury Travel",
    description: "View private transfer vehicles, routes and transparent pricing from Hoang Luxury Travel.",
  },
  {
    path: "/policies/",
    title: "Terms & Policies | Hoang Luxury Travel",
    description: "Preview Hoang Luxury Travel’s terms of service, privacy information, and cancellation and refund guidance.",
    private: true, // Draft: noindex and excluded from the sitemap until the policy text is approved.
  },
  {
    path: cruisesPagePath,
    ...cruiseSeo,
  },
  {
    path: "/feedback/",
    title: "Guest Feedback | Hoang Luxury Travel",
    description:
      "Read feedback from international travelers and share your experience with Hoang Luxury Travel.",
  },
  {
    path: "/routes/",
    title: "Private Transfer Routes From Hanoi/Noi Bai Airport | Hoang Luxury Travel",
    description:
      "Hoang Luxury Travel provides private transfer and car-with-driver services across Northern Vietnam. We specialize in long-distance journeys from Hanoi and Noi Bai International Airport to Sa Pa, Ha Long Bay, Ninh Binh, Ha Giang and other famous destinations.",
  },
];

for (const key of Object.keys(legacyJourneySlugByKey)) {
  const journey = journeys[key];
  routes.push({
    path: journeyPagePath(key),
    title: journey.seoTitle,
    description: journey.metaDescription || journey.intro,
  });
}

for (const category of photoCategories.filter((item) => item !== ALL_PHOTO_CATEGORIES)) {
  routes.push({
    path: photoCategoryPath(category),
    title: photoCategoryPageTitle(category),
    description: photoCategoryPageDescription(category),
  });
}

for (const album of photoAlbumRows) {
  routes.push({
    path: photoAlbumUrl(album.slug),
    title: `${album.title} | Hoang Luxury Travel`,
    description: `${album.title} - ${album.category} ${photoAlbumVideosBySlug[album.slug] ? "videos" : "photos"} from ${album.place}, by Hoang Luxury Travel.`,
  });
}


// Snapshot SEO tại lúc build: chỉ dùng publishable/anon key, không đọc nháp.
// Bài mới vẫn hiện runtime ngay; muốn cập nhật HTML SEO/sitemap cần build/upload.
const env = { ...loadEnv("production", projectRoot, "VITE_"), ...process.env };
let blogArticles = [];
if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
  const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  try {
    ({ articles: blogArticles } = await fetchPublicBlog(client, { signal: AbortSignal.timeout(30_000) }));
  } catch {
    throw new Error("Không đọc được blog công khai từ Supabase để build SEO. Kiểm tra cấu hình/schema/mạng; không upload dist của lần build lỗi.");
  }
}
for (const article of blogArticles) {
  routes.push({
    path: blogArticleUrl(article),
    title: `${article.title} | Hoang Luxury Travel`,
    description: article.metaDescription || article.excerpt,
  });
}

// Include the cruise guide in the initial HTML. React replaces this fallback
// with the interactive page; non-JS visitors can still read the same guide.
const cruiseMarkup = renderToStaticMarkup(h("main", { className: "hlt-cruise-static" },
  h("h1", null, cruiseLanding.heading),
  h("p", null, cruiseLanding.intro),
  h("h2", null, "Choose Your Cruise Experience"),
  ...cruiseLanding.types.map((type) => h("section", { key: type.id },
    h("h3", null, type.title), h("p", null, type.schedule + ". " + type.text))),
  h("h2", null, "Our Handpicked Cruise Collection"),
  ...cruiseCollection.map(({ bay, tiers }) => h("section", { key: bay },
    h("h3", null, bay),
    ...cruiseTiers.filter((tier) => tiers[tier].length > 0).map((tier) => h("section", { key: tier },
      h("h4", null, tier),
      h("ul", null, ...tiers[tier].map((name) => h("li", { key: name }, name))),
    )),
  )),
  h("h2", null, "Frequently Asked Questions"),
  ...cruiseData.faqs.map(({ q, a }) =>
    h("details", { key: q }, h("summary", null, q), h("p", null, a))),
  h("p", null, h("a", { href: "/catalog/" }, "View private transfer catalog")),
));
const cruiseRoot = '<div id="root"></div>';
if (!shell.includes(cruiseRoot)) throw new Error("Missing app root for the cruise guide");

for (const route of routes) {
  const outputPath = resolve(distDir, route.path.slice(1), "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  const pageShell = route.path === cruisesPagePath
    ? shell.replace(cruiseRoot, () => `<div id="root">${cruiseMarkup}</div>`)
    : shell;
  await writeFile(outputPath, renderRoute(pageShell, origin, route), "utf8");
}

console.log(`Generated ${routes.length} route-specific HTML files.`);

// Trang 404 cho đường dẫn không tồn tại: Vercel tự trả dist/404.html với mã 404,
// Hostinger qua ErrorDocument trong .htaccess. Không canonical, noindex; app vẫn
// chạy và hiện NotFoundPage (khách báo lỗi "soft 404" 11/11/2026).
const notFoundHtml = renderRoute(shell, origin, {
  path: "/",
  title: "Page Not Found | Hoang Luxury Travel",
  description: "The page you are looking for may have been moved, or the address may be incorrect.",
  private: true,
}).replace(/\s*<link rel="canonical" href="[^"]*"\s*\/>/, "");
await writeFile(resolve(distDir, "404.html"), notFoundHtml, "utf8");

// URL bài cũ (/hoangphoto/blog/<bài>/, /blog/<bài>/ — trước 29/10/2026) chuyển ngay
// sang /blog/<địa điểm>/<bài>/. Host tĩnh không biết địa điểm của từng bài nên dùng
// trang chuyển hướng tức thì (meta refresh + canonical, Google xử lý như 301).
const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
for (const article of blogArticles) {
  const target = `${origin}${blogArticleUrl(article)}`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeAttr(article.title)} | Hoang Luxury Travel</title>
<link rel="canonical" href="${escapeAttr(target)}">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${escapeAttr(blogArticleUrl(article))}">
</head><body><a href="${escapeAttr(blogArticleUrl(article))}">${escapeAttr(article.title)}</a></body></html>
`;
  for (const legacyPath of [`/hoangphoto/blog/${article.slug}/`, `/blog/${article.slug}/`]) {
    const outputPath = resolve(distDir, legacyPath.slice(1), "index.html");
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, "utf8");
  }
}

// Sitemap sinh cùng lúc với các trang tĩnh để không bao giờ lệch với routes ở trên.
// Ghi đè bản trong dist/ do Vite chép từ public/.
const sitemapUrls = ["/"].concat(routes.filter((route) => !route.private).map((route) => route.path));
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapUrls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n") +
  "\n</urlset>\n";
await writeFile(resolve(distDir, "sitemap.xml"), sitemap, "utf8");

console.log(`Generated sitemap.xml with ${sitemapUrls.length} URLs.`);

