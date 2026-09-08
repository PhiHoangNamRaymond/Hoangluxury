import React from "react";
import {
  bookingProcessBackgroundUrl,
  botanicalCornerGoldUrl,
  logoUrl,
  whyVehicleIconUrl,
} from "../../config/assets.js";
import { bookingRows, catalogPageUrl, whatsappUrl } from "../../data.js";

function BookingProcessIcon({ type }) {
  if (type === "car") {
    return <img src={whyVehicleIconUrl} alt="" className="hlt-process-car-icon-img" />;
  }

  const icons = {
    whatsapp: (
      <>
        <path d="M19.1 4.9A9.8 9.8 0 0 0 12 2C6.6 2 2.1 6.5 2.1 11.9c0 1.8.5 3.5 1.3 5L2.1 22l5.2-1.4a9.8 9.8 0 0 0 4.7 1.2h.1c5.4 0 9.9-4.4 9.9-9.9 0-2.6-1-5.1-2.9-7Z" />
        <path d="M8.7 7.9c.7 3.6 2.7 5.7 6.3 6.6l1.2-1.2 1.8.9c-.2 1.5-1.2 2.3-2.8 2.3-4.4-.5-7.2-3.2-7.7-7.5 0-1.5.8-2.4 2.2-2.6L10 8.1 8.7 7.9Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 3v5M16 3v5M4 10h16M8 14h2M13 14h2M8 17h2M13 17h2" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18M7 15h4" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

function BookingRowIcon({ label }) {
  const paths = {
    "Customer Name": (
      <>
        <circle cx="12" cy="7.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 19.5 v-1.5 a6 6 0 0 1 12 0 v1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    WhatsApp: (
      <>
        <path d="M17.5 6.5 A7.8 7.8 0 0 0 12 4.2 C7.7 4.2 4.2 7.7 4.2 12 c0 1.5.4 3 1.2 4.2 L4.2 20 l3.9-1.2 a7.7 7.7 0 0 0 3.9 1 c4.3 0 7.8-3.5 7.8-7.8 c0-2.1-.8-4-2.3-5.5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 9 c.2-.4.4-.4.6-.4h.5c.2 0 .3.1.4.3l.7 1.6c.1.2.1.4 0 .5l-.5.6c-.1.2-.1.3 0 .5.6 1 1.4 1.8 2.4 2.4.2.1.3.1.5 0l.6-.5c.1-.1.3-.1.5 0l1.6.7c.2.1.3.2.3.4 0 .3-.1 1.1-.6 1.6-.5.5-1.2.7-2 .5-1-.2-2.4-.8-3.9-2.2-1.3-1.2-2.1-2.6-2.4-3.5-.3-.9.1-1.7.6-2.3 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
    Flight: (
      <path d="M21 3 L10 14 M21 3 L14 21 L10 14 L3 10 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
    Route: (
      <>
        <path d="M12 21 C15.5 16.5 18 13.2 18 9.5 A6 6 0 1 0 6 9.5 C6 13.2 8.5 16.5 12 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
    Vehicle: (
      <>
        <path d="M5.5 11.5 L7.5 7 h9 l2 4.5 v5 a1 1 0 0 1-1 1 h-1 v-1 H7.5 v1 h-1 a1 1 0 0 1-1-1 v-5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.8 11 h10.4" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="8" cy="14" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="14" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
    Service: (
      <>
        <path d="M5 16 a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 18 h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 4.5 v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10.5 4.5 h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    "Total Price": (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14.2 9.5 c-.5-.6-1.3-.9-2.2-.9-1.5 0-2.5.8-2.5 1.8s.9 1.5 2.3 1.8c1.6.3 2.5.8 2.5 1.9 0 1.2-1.1 1.9-2.6 1.9-1.2 0-2.1-.4-2.7-1 M12 7 v10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[label]}</svg>;
}

export default function BookingProcess() {
  const steps = [
    ["whatsapp", "01. Contact Us", "Message us on WhatsApp.\nWe're here to answer your questions."],
    ["calendar", "02. Plan Your Trip", "Share your travel details and preferences.\nWe'll design the perfect journey for you."],
    ["card", "03. Confirm Booking", "Review your itinerary and price.\nConfirm your booking with ease."],
    ["car", "04. Enjoy Your Journey", "Our professional driver will be ready to welcome you for a safe and comfortable trip."],
  ];

  return (
    <section
      id="contact"
      className="hlt-booking-showcase"
      style={{ "--booking-process-bg": `url(${bookingProcessBackgroundUrl})` }}
      aria-labelledby="booking-process-title"
    >
      <div className="hlt-container hlt-booking-showcase-main">
        <div className="hlt-showcase-ticket-wrap">
          <div className="hlt-showcase-confirm-header">
            <div className="hlt-showcase-confirm-line-top">
              <span className="hlt-showcase-confirm-diamond" />
            </div>
            <h2>Journey Confirmed</h2>
            <div className="hlt-showcase-confirm-line-bottom">
              <span className="hlt-showcase-confirm-diamond" />
            </div>
            <p>
              Thank you for choosing Hoang Luxury Travel.
              <br />
              Your booking has been successfully confirmed.
            </p>
          </div>

          {/* Desktop Version: Confirmation Card as shown in screenshot */}
          <article className="hlt-desk-confirm-card" aria-label="Booking confirmation">
            <div className="hlt-desk-confirm-header">
              <div className="hlt-desk-confirm-brand">
                <img src={logoUrl} alt="" className="hlt-desk-confirm-logo" />
                <div className="hlt-desk-confirm-brand-text">
                  <span className="hlt-desk-brand-hoang">HOANG</span>
                  <span className="hlt-desk-brand-sub">LUXURY TRAVEL</span>
                </div>
              </div>

              <div className="hlt-desk-confirm-title-wrap">
                <h3 className="hlt-desk-confirm-title">
                  <span>BOOKING</span>
                  <span>CONFIRMATION</span>
                </h3>
              </div>

              <div className="hlt-desk-confirm-id-box">
                <span className="hlt-desk-confirm-id-label">CONFIRM ID</span>
                <div className="hlt-desk-confirm-id-line" />
                <strong className="hlt-desk-confirm-id-val"># HLT307-001</strong>
              </div>
            </div>

            <div className="hlt-desk-confirm-divider">
              <span className="hlt-desk-confirm-diamond" />
            </div>

            <div className="hlt-desk-confirm-body">
              <img src={logoUrl} alt="" className="hlt-desk-confirm-watermark" aria-hidden="true" />
              <div className="hlt-desk-confirm-rows">
                {bookingRows.map(([label, value]) => (
                  <div key={label} className="hlt-desk-confirm-row">
                    <div className="hlt-desk-row-label-col">
                      <span className="hlt-desk-row-icon" aria-hidden="true">
                        <BookingRowIcon label={label} />
                      </span>
                      <span className="hlt-desk-row-label">{label}</span>
                    </div>
                    <span className="hlt-desk-row-colon">:</span>
                    <div className="hlt-desk-row-value-col">
                      <span>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hlt-desk-confirm-signature">
                Hoang Luxury Travel
              </div>
            </div>
          </article>

          {/* Mobile Version: Refined Confirmation Ticket matching Image 1 & 2 */}
          <article className="hlt-mobile-confirm-ticket" aria-label="Booking confirmation">
            {/* Top Box: Logo, Booking ID, and Botanical Wildflower Corner Motifs */}
            <div className="hlt-mobile-card-top-box">
              <img
                src={botanicalCornerGoldUrl}
                alt=""
                className="hlt-mobile-botanical-ornament hlt-botanical-top-left"
                aria-hidden="true"
              />
              <img
                src={botanicalCornerGoldUrl}
                alt=""
                className="hlt-mobile-botanical-ornament hlt-botanical-top-right"
                aria-hidden="true"
              />

              <div className="hlt-mobile-top-brand">
                <img src={logoUrl} alt="" className="hlt-mobile-top-logo" />
                <div className="hlt-mobile-top-brand-text">
                  <span className="hlt-mobile-top-brand-hoang">HOANG</span>
                  <span className="hlt-mobile-top-brand-sub">LUXURY TRAVEL</span>
                </div>
              </div>

              <div className="hlt-mobile-top-divider" />

              <div className="hlt-mobile-top-id-wrap">
                <span className="hlt-mobile-top-id-label">BOOKING ID</span>
                <strong className="hlt-mobile-top-id-value">HLT307-001</strong>
              </div>
            </div>

            {/* Rows list */}
            <div className="hlt-mobile-card-rows">
              {bookingRows.map(([label, value]) => {
                const displayLabel = label === "Customer Name" ? "CUSTOMER" : label.toUpperCase();
                const displayValue = value
                  .replace(/\s*\|\s*/g, " • ")
                  .replace(/\s*-\s*Sapa/g, " → Sa Pa");
                const isPrice = label === "Total Price";

                return (
                  <div className={`hlt-mobile-card-row ${isPrice ? "hlt-mobile-row-price" : ""}`} key={label}>
                    <div className="hlt-mobile-row-icon-circle" aria-hidden="true">
                      <BookingRowIcon label={label} />
                    </div>
                    <div className="hlt-mobile-row-info">
                      <span className="hlt-mobile-row-label">{displayLabel}</span>
                      <strong className={`hlt-mobile-row-value ${isPrice ? "hlt-mobile-price-val" : ""}`}>
                        {displayValue}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        <div className="hlt-showcase-divider-horizontal-separate">
          <span className="hlt-showcase-divider-horizontal-separate-diamond" />
        </div>

        <div className="hlt-process-panel">
          <h2 id="booking-process-title">Booking Process</h2>
          <div className="hlt-process-ornament" />
          <div className="hlt-process-steps">
            <div className="hlt-process-connector-line" aria-hidden="true" />
            {steps.map(([icon, title, text]) => (
              <article className="hlt-process-step" key={title}>
                <div className="hlt-process-icon">
                  <BookingProcessIcon type={icon} />
                </div>
                <div className="hlt-process-step-content">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile Luxury Card directly inside the Booking Process panel */}
          <div className="hlt-journey-mobile-card">
            <img src={logoUrl} alt="" className="hlt-journey-watermark" aria-hidden="true" />

            <div className="hlt-journey-cta-header">
              <h3 id="journey-cta-title-mobile">
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
      </div>

    </section>
  );
}
