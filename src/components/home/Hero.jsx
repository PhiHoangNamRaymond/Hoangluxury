import React from "react";
import { heroBannerUrl } from "../../config/assets.js";
import { catalogPageUrl, whatsappUrl } from "../../data.js";

export default function Hero() {
  return (
    <section id="home" className="hlt-hero" style={{ "--hero-img": `url(${heroBannerUrl})` }}>
      <div className="hlt-container">
        <div className="hlt-hero-content">
          <h1>
            <span className="hlt-hero-title-line">Private Luxury</span>
            <span>Car Transfer</span>
          </h1>
          <p>
            Luxury private car services for international travelers across Northern Vietnam, specializing
            in airport transfers, long-distance travel, and bespoke journeys.
          </p>
          <div className="hlt-actions">
            <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <span className="hlt-hero-whatsapp-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                </svg>
              </span>
              <span>Book via WhatsApp</span>
            </a>
            <a
              className="hlt-btn hlt-btn-outline"
              id="catalog"
              href={catalogPageUrl}
            >
              View Catalog
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
