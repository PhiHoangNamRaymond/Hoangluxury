import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import BookingPage from "./BookingPage.jsx";
import CatalogPage from "./CatalogPage.jsx";
import CruisesPage from "./CruisesPage.jsx";
import FeedbackPage from "./FeedbackPage.jsx";
import JourneyPage from "./JourneyPage.jsx";
import JourneysPage from "./JourneysPage.jsx";
import { journeys } from "./config/journeys.js";
import "./styles/index.css";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const pages = {
  "/booking": BookingPage,
  "/catalog": CatalogPage,
  "/cruises": CruisesPage,
  "/ha-long-cruises": CruisesPage,
  "/feedback": FeedbackPage,
  "/journeys": JourneysPage,
  "/routes": JourneysPage,
};

// /journey/<slug>/ - slug lạ thì rơi về trang chủ như mọi đường dẫn không khớp.
const journeySlug = normalizedPath.match(/^\/journey\/([a-z0-9-]+)$/)?.[1];
const journey = journeySlug && journeys[journeySlug] ? journeySlug : null;

const RootPage = journey
  ? () => <JourneyPage slug={journey} />
  : pages[normalizedPath] || App;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootPage />
  </StrictMode>
);
