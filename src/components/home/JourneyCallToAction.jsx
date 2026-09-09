import React from "react";
import { catalogPageUrl, whatsappUrl } from "../../data.js";

export default function JourneyCallToAction() {
  return (
    <section
      className="hlt-booking-showcase-footer hlt-journey-cta"
      aria-labelledby="journey-cta-title"
    >
      <div className="hlt-container">
        {/* Desktop View */}
        <div className="hlt-journey-desktop-view">
          <div>
            <h3 id="journey-cta-title">Ready to start your journey?</h3>
            <p>We are here to make your trip comfortable, safe and unforgettable.</p>
          </div>
          <div className="hlt-showcase-actions">
            <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Book via WhatsApp
            </a>
            <a
              className="hlt-btn hlt-btn-outline"
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
