import React from "react";
import { bookingProcessBackgroundUrl, logoUrl, whyVehicleIconUrl } from "../../config/assets.js";
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
    "Customer Name": <><circle cx="12" cy="7" r="3" /><path d="M6.5 20v-2.5a5.5 5.5 0 0 1 11 0V20M6.5 20h11" /></>,
    WhatsApp: (
      <>
        <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 20.6l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" />
        <path d="M8.1 7.6c.2-.4.4-.4.7-.4h.5c.2 0 .3.1.4.4l.8 1.8c.1.2.1.4-.1.6l-.6.8c-.1.2-.1.4 0 .6.7 1.2 1.7 2.1 2.8 2.8.2.1.4.2.6 0l.9-.9c.2-.2.4-.3.6-.2l1.7.8c.3.1.4.3.4.5 0 .4-.2 1.3-.8 1.9-.6.6-1.4.9-2.3.7-1.1-.2-2.8-.9-4.6-2.5-1.5-1.3-2.5-3-2.8-4-.3-1 .1-2 .7-2.7Z" />
      </>
    ),
    Flight: <><path d="m3 13 8-3 5-7 2 1-3 7 5 3-1 2-6-1-3 5-2-1 1-5-6 1Z" /></>,
    Route: <><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    Vehicle: (
      <>
        <path d="m5 12 1.7-4.3A2.7 2.7 0 0 1 9.2 6h5.6a2.7 2.7 0 0 1 2.5 1.7L19 12" />
        <rect x="4" y="11" width="16" height="8" rx="2" />
        <path d="M7 19v2M17 19v2M7 11l1-2h8l1 2" />
        <circle cx="8" cy="15.5" r="1" />
        <circle cx="16" cy="15.5" r="1" />
      </>
    ),
    Service: <><path d="M4 15h16M6 15V9a6 6 0 0 1 12 0v6M3 19h18" /><path d="M12 3V1" /></>,
    "Total Price": <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.7-.7-1.7-1-3-1-1.7 0-3 .8-3 2s1.1 1.8 3 2.2 3 1 3 2.3-1.3 2.5-3 2.5c-1.2 0-2.4-.4-3.2-1.2M12 5v14" /></>,
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
          <article className="hlt-showcase-ticket" aria-label="Booking confirmation">
            <div className="hlt-showcase-ticket-content">
              {/* Left Column: Brand & Booking ID */}
              <div className="hlt-showcase-left">
                {/* Royal Stepped Bracket Border Frame - Balanced & Refined */}
                <svg className="hlt-showcase-left-frame" viewBox="0 0 210 250" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M 23,10 H 187 A 5,5 0 0,1 192,15 H 195 A 5,5 0 0,1 200,20 V 230 A 5,5 0 0,1 195,235 H 192 A 5,5 0 0,1 187,240 H 23 A 5,5 0 0,1 18,235 H 15 A 5,5 0 0,1 10,230 V 20 A 5,5 0 0,1 15,15 H 18 A 5,5 0 0,1 23,10 Z"
                    fill="none"
                    stroke="rgba(197, 161, 90, 0.32)"
                    strokeWidth="0.85"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div className="hlt-showcase-left-inner">
                  <div className="hlt-showcase-crest-wrap">
                    <div className="hlt-showcase-crest-box">
                      {/* Faded Watermark centered directly behind the crest logo */}
                      <img className="hlt-showcase-watermark" src={logoUrl} alt="" aria-hidden="true" />
                      <img src={logoUrl} alt="" className="hlt-showcase-crest" />
                    </div>
                    <h4 className="hlt-showcase-brand-text">
                      <span className="hlt-brand-hoang">HOANG</span>
                      <span className="hlt-brand-sub">LUXURY TRAVEL</span>
                    </h4>
                  </div>
                  <div className="hlt-showcase-divider-line">
                    <span className="hlt-showcase-divider-diamond" />
                  </div>
                  <div className="hlt-showcase-id-wrap">
                    <span className="hlt-showcase-id-label">Booking ID</span>
                    <strong className="hlt-showcase-id-value">HLT307-001</strong>
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hlt-showcase-divider-vertical">
                <span className="hlt-showcase-divider-vertical-diamond" />
              </div>

              {/* Right Column: Rows list */}
              <div className="hlt-showcase-right">
                <div className="hlt-showcase-ticket-rows">
                  {bookingRows.map(([label, value]) => {
                    const displayLabel = label === "Customer Name" ? "Customer" : label;
                    // Replace pipe separator with dot and hyphen route with clean arrow
                    const displayValue = value
                      .replace(/\s*\|\s*/g, " • ")
                      .replace(/\s*-\s*Sapa/g, " → Sa Pa");
                    return (
                      <div className="hlt-showcase-ticket-row" key={label}>
                        <div className="hlt-showcase-row-icon-circle" aria-hidden="true">
                          <BookingRowIcon label={label} />
                        </div>
                        <div className="hlt-showcase-row-info">
                          <span className="hlt-showcase-row-label">{displayLabel}</span>
                          <strong className="hlt-showcase-row-value">{displayValue}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
