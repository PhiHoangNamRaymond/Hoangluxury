import React, { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { journeys } from "./config/journeys.js";
import { photoAlbumBySlug } from "./config/photo-albums.js";
import { captureBookingSource } from "./config/booking-source.js";
import { setupImageSkeletons } from "./lib/image-skeleton.js";
import "./styles/index.css";

// Chỉ tải mã trang phụ khi đường dẫn cần đến; giữ trang chủ và CSS chung
// trong entry để không đổi bố cục hay thứ tự cascade hiện tại.
const BookingPage = lazy(() => import("./BookingPage.jsx"));
const CatalogPage = lazy(() => import("./CatalogPage.jsx"));
const CruisesPage = lazy(() => import("./CruisesPage.jsx"));
const AboutPage = lazy(() => import("./AboutPage.jsx"));
const PhotoPage = lazy(() => import("./PhotoPage.jsx"));
const PhotoAlbumsPage = lazy(() => import("./PhotoAlbumsPage.jsx"));
const PhotoAlbumPage = lazy(() => import("./PhotoAlbumPage.jsx"));
const BlogPage = lazy(() => import("./BlogPage.jsx"));
const BlogArticlePage = lazy(() => import("./BlogArticlePage.jsx"));
const FeedbackPage = lazy(() => import("./FeedbackPage.jsx"));
const JourneyPage = lazy(() => import("./JourneyPage.jsx"));
const JourneysPage = lazy(() => import("./JourneysPage.jsx"));
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

// Nhớ nguồn khách (?src= / ?utm_source=) để ghép vào Booking ID khi đặt xe.
captureBookingSource();

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const pages = {
  "/about": AboutPage,
  "/photo": PhotoPage,
  "/photo/albums": PhotoAlbumsPage,
  "/blog": BlogPage,
  "/booking": BookingPage,
  "/catalog": CatalogPage,
  "/cruises": CruisesPage,
  "/ha-long-cruises": CruisesPage,
  "/feedback": FeedbackPage,
  "/journeys": JourneysPage,
  "/routes": JourneysPage,
};

// Blog resolve trực tiếp từ DB; bài không tồn tại có màn hình riêng, không về home.
const requestedPostSlug = normalizedPath.match(/^\/blog\/([^/]+)$/)?.[1];
const postSlug = requestedPostSlug || null;

// /photo/albums/<slug>/ - một album ảnh; slug lạ thì rơi về trang chủ.
const requestedAlbumSlug = normalizedPath.match(/^\/photo\/albums\/([a-z0-9-]+)$/)?.[1];

const albumSlug = requestedAlbumSlug && photoAlbumBySlug[requestedAlbumSlug] ? requestedAlbumSlug : null;

// /journey/<slug>/ - slug lạ thì rơi về trang chủ như mọi đường dẫn không khớp.
const requestedJourneySlug = normalizedPath.match(/^\/journey\/([a-z0-9-]+)$/)?.[1];
const canonicalJourneySlugByLegacy = {
  sapa: "hanoi-to-sapa-private-transfer",
  "ha-long": "hanoi-to-ha-long-private-transfer",
  "ninh-binh": "hanoi-to-ninh-binh-private-transfer",
  "ha-giang": "hanoi-to-ha-giang-private-transfer",
  "cat-ba": "hanoi-to-cat-ba-private-transfer",
  "cao-bang": "hanoi-to-cao-bang-private-transfer",
  "mu-cang-chai": "hanoi-to-mu-cang-chai-private-transfer",
  "moc-chau": "hanoi-to-moc-chau-private-transfer",
  "ta-xua": "hanoi-to-ta-xua-private-transfer",
  "pu-luong": "hanoi-to-pu-luong-private-transfer",
  "sapa-to-ha-long": "sapa-to-ha-long-private-transfer",
  "sapa-to-ninh-binh": "sapa-to-ninh-binh-private-transfer",
  "sapa-to-ha-giang": "sapa-to-ha-giang-private-transfer",
  "sapa-to-mu-cang-chai": "sapa-to-mu-cang-chai-private-transfer",
  "ha-long-to-sapa": "ha-long-to-sapa-private-transfer",
  "ninh-binh-to-sapa": "ninh-binh-to-sapa-private-transfer",
};
const legacyJourneySlugByCanonical = Object.fromEntries(
  Object.entries(canonicalJourneySlugByLegacy).map(([legacy, canonical]) => [canonical, legacy]),
);
const journeySlug = legacyJourneySlugByCanonical[requestedJourneySlug] || requestedJourneySlug;
const journey = journeySlug && journeys[journeySlug] ? journeySlug : null;

if (journey && canonicalJourneySlugByLegacy[journey] !== requestedJourneySlug) {
  window.history.replaceState(null, "", `/journey/${canonicalJourneySlugByLegacy[journey]}/`);
}

const canonicalPathByAlias = {
  "/routes": "/journeys/",
  "/ha-long-cruises": "/cruises/",
};

const routeSeo = {
  "/blog": {
    title: "Travel Blog | Hoang Luxury Travel",
    description: "Travel stories, practical guides and local insights for your private journey through Sapa, Ha Giang, Ha Long and Northern Vietnam.",
  },
  "/": {
    title: "PRIVATE TRANSFER | PRIVATE CAR TRANSFER | HOANG LUXURY TRAVEL",
    description:
      "Hoang Luxury Travel provides private airport transfers, long-distance travel and bespoke journeys across Northern Vietnam.",
  },
  "/about": {
    title: "About Us | Hoang Luxury Travel",
    description:
      "Learn about Hoang Luxury Travel and our private transfer services for international travelers across Northern Vietnam.",
  },
  "/booking": {
    title: "Book a Private Transfer | Hoang Luxury Travel",
    description:
      "Book your private car and professional driver with Hoang Luxury Travel. Share your route, schedule and travel requirements with our team.",
  },
  "/catalog": {
    title: "Private Transfer Pricing Catalog | Hoang Luxury Travel",
    description:
      "View private transfer vehicles, routes and transparent pricing from Hoang Luxury Travel.",
  },
  "/cruises": {
    title: "Ha Long Cruises | Hoang Luxury Travel",
    description:
      "Explore Ha Long cruise options and arrange a comfortable private transfer with Hoang Luxury Travel.",
  },
  "/feedback": {
    title: "Guest Feedback | Hoang Luxury Travel",
    description:
      "Read feedback from international travelers and share your experience with Hoang Luxury Travel.",
  },
  "/journeys": {
    title: "Private Transfer Routes | Hoang Luxury Travel",
    description:
      "Explore private transfer routes from Hanoi and Noi Bai Airport to destinations across Northern Vietnam.",
  },
  "/photo": {
    title: "Photo Experience | Hoang Luxury Travel",
    description:
      "Private travel photography across Northern Vietnam: six photo styles, half-day and full-day experiences with Hoang Luxury Travel.",
  },
  "/photo/albums": {
    title: "Photo Albums | Hoang Luxury Travel",
    description:
      "Real photographs from private journeys across Northern Vietnam with Hoang Luxury Travel.",
  },
};

const canonicalPath = journey
  ? `/journey/${canonicalJourneySlugByLegacy[journey]}/`
  : postSlug
    ? `/blog/${postSlug}/`
    : albumSlug
      ? `/photo/albums/${albumSlug}/`
      : normalizedPath === "/admin" ? "/admin/"
        : canonicalPathByAlias[normalizedPath] || (pages[normalizedPath] ? `${normalizedPath}/` : "/");
const album = albumSlug ? photoAlbumBySlug[albumSlug] : null;
const seo = journey
  ? {
      title: journeys[journey].seoTitle,
      description: journeys[journey].metaDescription || journeys[journey].intro,
    }
  : postSlug
    ? routeSeo["/blog"]
    : album
      ? {
          title: `${album.title} | Hoang Luxury Travel`,
          description: `${album.title} - ${album.category} photos from ${album.place}, by Hoang Luxury Travel.`,
        }
      : routeSeo[canonicalPath.replace(/\/$/, "") || "/"] || routeSeo["/"];
const canonicalUrl = `https://hoangluxury.travel${canonicalPath}`;

document.title = seo.title;
document.querySelector('meta[name="description"]')?.setAttribute("content", seo.description);
document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
document.querySelector('meta[property="og:title"]')?.setAttribute("content", seo.title);
document.querySelector('meta[property="og:description"]')?.setAttribute("content", seo.description);
document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);

const isAdminRoute = normalizedPath === "/admin";
const RootPage = isAdminRoute
  ? AdminApp
  : journey
    ? () => <JourneyPage slug={journey} />
    : postSlug
      ? () => <BlogArticlePage slug={postSlug} />
      : albumSlug
        ? () => <PhotoAlbumPage slug={albumSlug} />
        : pages[normalizedPath] || App;

// Home hiển thị ngay, không chạy hiệu ứng trượt nội dung khi vào trang.
// Các trang có transition riêng giữ nguyên; toggle cũng xóa class cũ khi HMR.
const pagesWithOwnTransition = new Set([
  "/blog",
  "/about",
  "/photo",
  "/photo/albums",
  "/booking",
  "/catalog",
  "/cruises",
  "/ha-long-cruises",
  "/feedback",
  "/journeys",
  "/routes",
]);
document.documentElement.classList.toggle(
  "hlt-page-anim",
  RootPage !== App && !journey && !albumSlug && !postSlug && !isAdminRoute && !pagesWithOwnTransition.has(normalizedPath),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={null}>
      <RootPage />
    </Suspense>
  </StrictMode>
);

// Ảnh chưa tải xong thì hiện khung xương thay vì ô trống.
setupImageSkeletons();
