import React from "react";
import { logoUrl } from "../../config/assets.js";
import { catalogPageUrl, whatsappUrl } from "../../data.js";

export default function JourneyCallToAction() {
  return (
    <section
      className="hlt-booking-showcase-footer hlt-journey-cta"
      aria-labelledby="journey-cta-title"
    >
      <div className="hlt-container">
        <div className="hlt-journey-cta-card">
          <img src={logoUrl} alt="" className="hlt-journey-watermark" aria-hidden="true" />

          <div className="hlt-journey-cta-header">
            <h3 id="journey-cta-title">
              Ready for your
              <br />
              journey?
            </h3>
            <div className="hlt-journey-divider">
              <span className="hlt-journey-diamond" />
            </div>
            <p>
              Let Hoang Luxury Travel take care of every detail.
              <br />
              Your comfort and satisfaction are our priority.
            </p>
          </div>

          <div className="hlt-journey-actions">
            <a
              className="hlt-journey-btn-whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hlt-journey-whatsapp-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zm-7.01 15.24h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.21 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
                </svg>
              </span>
              <span className="hlt-journey-btn-text">Book via WhatsApp</span>
              <span className="hlt-journey-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </a>

            <a className="hlt-journey-btn-catalog" href={catalogPageUrl}>
              <span className="hlt-journey-btn-text">View Catalog</span>
              <span className="hlt-journey-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
