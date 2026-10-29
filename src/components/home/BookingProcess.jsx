import React from "react";
import useNearViewport from "../../hooks/useNearViewport.js";
import {
  bookingConfirmIconUrl,
  bookingContactIconUrl,
  bookingJourneyCarIconUrl,
  bookingPlanIconUrl,
  bookingProcessBackgroundUrl,
  botanicalCornerGoldUrl,
  logoUrl,
} from "../../config/assets.js";
import { bookingRows, catalogPageUrl, whatsappUrl } from "../../data.js";

// Icon 4 bước là file ảnh có tên riêng, alt rỗng vì chỉ để trang trí (khách yêu
// cầu 29/10/2026).
const processIcons = {
  whatsapp: bookingContactIconUrl,
  calendar: bookingPlanIconUrl,
  card: bookingConfirmIconUrl,
};

function BookingProcessIcon({ type }) {
  if (type === "car") {
    return <img src={bookingJourneyCarIconUrl} alt="" className="hlt-process-car-icon-img" />;
  }

  return <img src={processIcons[type]} alt="" className="hlt-process-icon-img" data-no-skeleton />;
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
  const [sectionRef, near] = useNearViewport();
  const steps = [
    ["whatsapp", "01. Contact Us", "Message us on WhatsApp or fill out the form."],
    ["calendar", "02. Plan Your Trip", "We'll help you choose the best vehicle and plan your journey."],
    ["card", "03. Confirm Booking", "We confirm your trip details, the price, and your booking."],
    ["car", "04. Enjoy Journey", "Our driver will be ready to welcome you for a safe and comfortable trip."],
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="hlt-booking-showcase"
      style={{ "--booking-process-bg": near ? `url(${bookingProcessBackgroundUrl})` : "none" }}
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
                {/* Chữ trang trí trên vé mẫu, không phải tiêu đề nội dung nên không dùng thẻ heading. */}
                <div className="hlt-desk-confirm-title">
                  <span>BOOKING</span>
                  <span>CONFIRMATION</span>
                </div>
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
                loading="lazy"
                className="hlt-mobile-botanical-ornament hlt-botanical-top-left"
                aria-hidden="true"
              />
              <img
                src={botanicalCornerGoldUrl}
                alt=""
                loading="lazy"
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

        </div>
      </div>

    </section>
  );
}
