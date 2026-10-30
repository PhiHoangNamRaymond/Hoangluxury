import React, { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { journeys } from "./config/journeys.js";
import { cruisesPagePath, journeyKeyFromSlug, journeyPagePath } from "./config/journey-paths.js";
import {
  photoAlbumBySlug,
  photoAlbumsPath,
  photoAlbumUrl,
  photoCategoryFromSlug,
  photoCategoryPageDescription,
  photoCategoryPageTitle,
  photoCategoryPath,
  photoPagePath,
} from "./config/photo-albums.js";
import { captureBookingSource } from "./config/booking-source.js";
import { blogDestinationSlug, blogPagePath } from "./lib/blog-article.js";
import { blogDestinations } from "./config/blog-taxonomy.js";
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
  "/about-us": AboutPage,
  "/about": AboutPage,
  "/hoangphoto": PhotoPage,
  "/hoangphoto/albums": PhotoAlbumsPage,
  "/photo": PhotoPage,
  "/photo/albums": PhotoAlbumsPage,
  "/hoangphoto/blog": BlogPage,
  "/blog": BlogPage,
  "/booking": BookingPage,
  "/catalog": CatalogPage,
  "/routes/halong-bay-cruises": CruisesPage,
  "/cruises": CruisesPage,
  "/ha-long-cruises": CruisesPage,
  "/feedback": FeedbackPage,
  "/journeys": JourneysPage,
  "/routes": JourneysPage,
};

// Bài blog: /blog/<địa điểm>/<slug>/. Đường dẫn cũ một cấp (/blog/<slug>/,
// /hoangphoto/blog/<slug>/) vẫn mở đúng bài; BlogArticlePage đổi sang URL chuẩn khi
// đọc được địa điểm của bài. /blog/<địa điểm>/ không phải bài: về trang Blog.
// Blog resolve trực tiếp từ DB; bài không tồn tại có màn hình riêng, không về home.
const blogSectionSlugs = new Set(blogDestinations.map(blogDestinationSlug));
const blogPathMatch = normalizedPath.match(/^\/(?:hoangphoto\/)?blog\/([^/]+)(?:\/([^/]+))?$/);
const isBlogSectionPath = Boolean(blogPathMatch && !blogPathMatch[2] && blogSectionSlugs.has(blogPathMatch[1]));
const postSlug = blogPathMatch && !isBlogSectionPath ? blogPathMatch[2] || blogPathMatch[1] : null;
const isCanonicalPostPath = Boolean(postSlug && blogPathMatch[2] && normalizedPath.startsWith("/blog/"));

// Một album: /hoangphoto/<phong cách>/<album>/ (đường dẫn chuẩn theo photoAlbumUrl);
// nhận cả đường dẫn cũ /photo/albums/<album>/ và album đặt dưới phong cách khác.
// /hoangphoto/blog/… là bài blog, không phải album. Slug lạ thì rơi về trang chủ.
const requestedAlbumSlug = normalizedPath.match(/^\/(?:photo\/albums|hoangphoto\/albums|hoangphoto\/(?!blog\/)[a-z0-9-]+)\/([a-z0-9-]+)$/)?.[1];
const albumSlug = requestedAlbumSlug && photoAlbumBySlug[requestedAlbumSlug] ? requestedAlbumSlug : null;

// Lưới album lọc sẵn một phong cách: /hoangphoto/<phong cách>/.
const photoCategory = photoCategoryFromSlug(normalizedPath.match(/^\/hoangphoto\/([a-z0-9-]+)$/)?.[1]);

// Trang tuyến: /journey/<slug>/ hoặc /routes/<slug>/ (đường dẫn chuẩn từng tuyến ở
// config/journey-paths.js). Slug lạ thì rơi về trang chủ như mọi đường dẫn không khớp.
const requestedJourneySlug = normalizedPath.match(/^\/(?:journey|routes)\/([a-z0-9-]+)$/)?.[1];
const journeyKey = requestedJourneySlug ? journeyKeyFromSlug(requestedJourneySlug) : null;
const journey = journeyKey && journeys[journeyKey] ? journeyKey : null;

// Dev/preview servers do not apply hosting redirects; keep legacy URLs usable.
if (journey && `${normalizedPath}/` !== journeyPagePath(journey)) {
  window.history.replaceState(null, "", `${journeyPagePath(journey)}${window.location.search}${window.location.hash}`);
}

if (albumSlug && `${normalizedPath}/` !== photoAlbumUrl(albumSlug)) {
  window.history.replaceState(null, "", `${photoAlbumUrl(albumSlug)}${window.location.search}${window.location.hash}`);
}

const canonicalPathByAlias = {
  "/journeys": "/routes/",
  "/cruises": cruisesPagePath,
  "/ha-long-cruises": cruisesPagePath,
  "/photo": photoPagePath,
  "/photo/albums": photoAlbumsPath,
  "/hoangphoto/blog": blogPagePath,
  "/about": "/about-us/",
};

if (isBlogSectionPath) canonicalPathByAlias[normalizedPath] = blogPagePath;

if (canonicalPathByAlias[normalizedPath]) {
  window.history.replaceState(null, "", `${canonicalPathByAlias[normalizedPath]}${window.location.search}${window.location.hash}`);
}

const routeSeo = {
  "/blog": {
    title: "Travel Blog, Guides & Local Tips | Hoang Luxury Travel",
    description: "Travel stories, practical guides and local insights for your private journey through Sapa, Ha Giang, Ha Long and Northern Vietnam.",
  },
  "/": {
    title: "Private Car Transfer From Hanoi Or Noi Bai Airport | Hoang Luxury Travel",
    description:
      "Hoang Luxury Travel provides private transfer and car-with-driver services across Northern Vietnam. We specialize in long-distance journeys from Hanoi and Noi Bai International Airport to Sa Pa, Ha Long Bay, Ninh Binh, Ha Giang and other famous destinations.",
  },
  "/about-us": {
    title: "About Hoang Luxury Travel | Private Transfers in Vietnam",
    description:
      "Discover the story behind Hoang Luxury Travel, providing private transfers across Northern Vietnam with professional drivers and personalized journeys for international travelers.",
  },
  "/booking": {
    title: "Booking Private Transfer | Hoang Luxury Travel",
    description:
      "Book a 100% private transfer with Hoang Luxury Travel. Enjoy direct door-to-door service, no shared passengers, professional drivers and flexible pick-up times.",
  },
  "/catalog": {
    title: "Private Transfer Pricing Catalog | Hoang Luxury Travel",
    description:
      "View private transfer vehicles, routes and transparent pricing from Hoang Luxury Travel.",
  },
  "/routes/halong-bay-cruises": {
    title: "Halong Bay Cruise | Hoang Luxury Travel",
    description:
      "Discover Halong Bay cruises with Hoang Luxury Travel. Explore beautiful scenery, choose a cruise that suits your plans and get assistance with booking.",
  },
  "/feedback": {
    title: "Guest Feedback | Hoang Luxury Travel",
    description:
      "Read feedback from international travelers and share your experience with Hoang Luxury Travel.",
  },
  "/routes": {
    title: "Private Transfer Routes From Hanoi/Noi Bai Airport | Hoang Luxury Travel",
    description:
      "Hoang Luxury Travel provides private transfer and car-with-driver services across Northern Vietnam. We specialize in long-distance journeys from Hanoi and Noi Bai International Airport to Sa Pa, Ha Long Bay, Ninh Binh, Ha Giang and other famous destinations.",
  },
  "/hoangphoto": {
    title: "Private Photo Shoots | Hoang Luxury Travel",
    description:
      "Book a private photo shoot in Northern Vietnam with Hoang Luxury Travel. Explore a variety of creative concepts with convenient door-to-door private car service.",
  },
  "/hoangphoto/albums": {
    title: "Hoang Photo Gallery In VietNam | Hoang Luxury Travel",
    description:
      "Explore travel photo albums across Northern Vietnam with Hoang Luxury Travel, featuring stunning landscapes, couples, local culture and diverse creative concepts.",
  },
};

const canonicalPath = journey
  ? journeyPagePath(journey)
  : postSlug
    // Đường dẫn cũ: tạm trỏ canonical về trang Blog, bài tự sửa khi tải xong.
    ? isCanonicalPostPath ? `${normalizedPath}/` : blogPagePath
    : albumSlug
      ? photoAlbumUrl(albumSlug)
      : photoCategory
        ? photoCategoryPath(photoCategory)
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
      : photoCategory
        ? { title: photoCategoryPageTitle(photoCategory), description: photoCategoryPageDescription(photoCategory) }
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
        : photoCategory
          ? PhotoAlbumsPage
          : isBlogSectionPath
            ? BlogPage
            : pages[normalizedPath] || App;

// Home hiển thị ngay, không chạy hiệu ứng trượt nội dung khi vào trang.
// Các trang có transition riêng giữ nguyên; toggle cũng xóa class cũ khi HMR.
const pagesWithOwnTransition = new Set([
  "/hoangphoto/blog",
  "/blog",
  "/about-us",
  "/about",
  "/hoangphoto",
  "/hoangphoto/albums",
  "/photo",
  "/photo/albums",
  "/booking",
  "/catalog",
  "/routes/halong-bay-cruises",
  "/cruises",
  "/ha-long-cruises",
  "/feedback",
  "/journeys",
  "/routes",
]);
document.documentElement.classList.toggle(
  "hlt-page-anim",
  RootPage !== App && !journey && !albumSlug && !photoCategory && !postSlug && !isAdminRoute && !pagesWithOwnTransition.has(normalizedPath),
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
