import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import BookingPage from "./BookingPage.jsx";
import CatalogPage from "./CatalogPage.jsx";
import CruisesPage from "./CruisesPage.jsx";
import AboutPage from "./AboutPage.jsx";
import PhotoPage from "./PhotoPage.jsx";
import BlogPage from "./BlogPage.jsx";
import FeedbackPage from "./FeedbackPage.jsx";
import JourneyPage from "./JourneyPage.jsx";
import JourneysPage from "./JourneysPage.jsx";
import { journeys } from "./config/journeys.js";
import { captureBookingSource } from "./config/booking-source.js";
import "./styles/index.css";

// Nhớ nguồn khách (?src= / ?utm_source=) để ghép vào Booking ID khi đặt xe.
captureBookingSource();

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const pages = {
  "/about": AboutPage,
  "/photo": PhotoPage,
  "/blog": BlogPage,
  "/booking": BookingPage,
  "/catalog": CatalogPage,
  "/cruises": CruisesPage,
  "/ha-long-cruises": CruisesPage,
  "/feedback": FeedbackPage,
  "/journeys": JourneysPage,
  "/routes": JourneysPage,
};

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
};

const canonicalPath = journey
  ? `/journey/${canonicalJourneySlugByLegacy[journey]}/`
  : canonicalPathByAlias[normalizedPath] || (pages[normalizedPath] ? `${normalizedPath}/` : "/");
const seo = journey
  ? {
      title: journeys[journey].seoTitle,
      description: journeys[journey].metaDescription || journeys[journey].intro,
    }
  : routeSeo[canonicalPath.replace(/\/$/, "") || "/"] || routeSeo["/"];
const canonicalUrl = `https://hoangluxury.travel${canonicalPath}`;

document.title = seo.title;
document.querySelector('meta[name="description"]')?.setAttribute("content", seo.description);
document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
document.querySelector('meta[property="og:title"]')?.setAttribute("content", seo.title);
document.querySelector('meta[property="og:description"]')?.setAttribute("content", seo.description);
document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);

const RootPage = journey
  ? () => <JourneyPage slug={journey} />
  : pages[normalizedPath] || App;

// Catalog và Booking có animation riêng. Mọi trang còn lại dùng transition
// chung trong page-transition.css; toggle giúp trạng thái luôn đúng cả khi HMR.
const pagesWithOwnTransition = new Set([
  "/blog",
  "/about",
  "/photo",
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
  !journey && !pagesWithOwnTransition.has(normalizedPath),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootPage />
  </StrictMode>
);
