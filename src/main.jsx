import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import BookingPage from "./BookingPage.jsx";
import "./App.css";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const RootPage = normalizedPath === "/booking" ? BookingPage : App;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootPage />
  </StrictMode>
);
