import React from "react";
import { bookingProcessBackgroundUrl, logoUrl } from "../../config/assets.js";
import { bookingRows } from "../../data.js";

function BookingProcessIcon({ type }) {
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
    car: (
      <>
        <path d="M5 13h14l-1.4-4A2.8 2.8 0 0 0 15 7H9a2.8 2.8 0 0 0-2.6 2L5 13Z" />
        <path d="M4 13v5h3m10 0h3v-5M7 13h10" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
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
    Vehicle: <><path d="M4 14h16l-2-5H6l-2 5Zm1 0v5m14-5v5M7 18h.01M17 18h.01" /></>,
    Service: <><path d="M4 15h16M6 15V9a6 6 0 0 1 12 0v6M3 19h18" /><path d="M12 3V1" /></>,
    "Total Price": <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.7-.7-1.7-1-3-1-1.7 0-3 .8-3 2s1.1 1.8 3 2.2 3 1 3 2.3-1.3 2.5-3 2.5c-1.2 0-2.4-.4-3.2-1.2M12 5v14" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[label]}</svg>;
}

export default function BookingProcess() {
  const steps = [
    ["whatsapp", "01. Contact Us", "Message us on WhatsApp. "],
    ["calendar", "02. Plan Your Trip", "We'll help you choose the best vehicle and plan your journey."],
    ["card", "03. Confirm Your Booking", "We confirm your trip details, the price, and your booking."],
    ["car", "04. Enjoy Your Journey", "Your driver will be ready to welcome you for a safe and comfortable trip."],
  ];

  return (
    <section
      id="contact"
      className="hlt-booking-showcase"
      style={{ "--booking-process-bg": `url(${bookingProcessBackgroundUrl})` }}
      aria-labelledby="booking-process-title"
    >
      <div className="hlt-container hlt-booking-showcase-main">
        <article className="hlt-showcase-ticket" aria-label="Booking confirmation">
          <header>
            <div className="hlt-showcase-brand">
              <img src={logoUrl} alt="" />
              <div>
                <strong>Hoang</strong>
                <span>Luxury Travel</span>
              </div>
            </div>
            <b>Booking Confirmation</b>
            <div className="hlt-showcase-confirmed">
              <span>Confirm ID</span>
              <strong># HLT307-001</strong>
            </div>
          </header>

          <div className="hlt-showcase-ticket-rows">
            <img className="hlt-showcase-watermark" src={logoUrl} alt="" aria-hidden="true" />
            {bookingRows.map(([label, value]) => (
              <div className="hlt-showcase-ticket-row" key={label}>
                <i aria-hidden="true"><BookingRowIcon label={label} /></i>
                <span>{label}</span>
                <b>:</b>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <footer>
            <em>Hoang Luxury Travel</em>
          </footer>
        </article>

        <div className="hlt-process-panel">
          <h2 id="booking-process-title">Booking Process</h2>
          <div className="hlt-process-ornament" />
          <div className="hlt-process-steps">
            {steps.map(([icon, title, text]) => (
              <article className="hlt-process-step" key={title}>
                <div className="hlt-process-icon">
                  <BookingProcessIcon type={icon} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
