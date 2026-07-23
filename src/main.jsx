import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import BookingPage from "./BookingPage.jsx";
import CatalogPage from "./CatalogPage.jsx";
import "./App.css";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const pages = {
  "/booking": BookingPage,
  "/catalog": CatalogPage,
};
const RootPage = pages[normalizedPath] || App;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootPage />
  </StrictMode>
);
