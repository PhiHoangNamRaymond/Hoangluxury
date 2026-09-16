import React from "react";
import { journeyCtaMountainsUrl, logoUrl } from "../../config/assets.js";
import { catalogPageUrl, whatsappUrl } from "../../data.js";

// Ba bước đặt xe cho bản "route" (trang /journey/<slug>/): số, tiêu đề PC,
// phụ đề PC, nhãn ngắn cho mobile.
const bookingSteps = [
  ["01", "Send Trip Details", "WhatsApp / Form", "Send Details"],
  ["02", "Get Your Final Quote", "Vehicle · Schedule · Final price", "Get Final Quote"],
  ["03", "Confirm & Enjoy", "Driver ready for pick-up", "Confirm & Enjoy"],
];

function WhatsAppIcon() {
  return (
    <svg className="hlt-journey-cta-route-wa" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.8 21.3l4.7-1.2A9.3 9.3 0 1 0 12 2.6Z" />
      <path d="M8.9 7.6c.3-.3.7-.3.9 0l1.1 1.6c.2.3.2.7-.1 1l-.6.6c.6 1.3 1.7 2.4 3 3l.6-.6c.3-.3.7-.3 1-.1l1.6 1.1c.3.2.3.6 0 .9l-.8.9c-.5.5-1.3.7-2 .4a9.6 9.6 0 0 1-5.1-5.1c-.3-.7-.1-1.5.4-2l1-.8Z" />
    </svg>
  );
}

// variant="route": thiết kế riêng cho trang tuyến (PC) — nền núi xanh,
// 3 bước 01 → 02 → 03 và 2 nút WhatsApp / Request Availability.
// Mặc định giữ nguyên thiết kế cũ cho Home, Catalog, /journeys/.
export default function JourneyCallToAction({ variant }) {
  if (variant === "route") {
    return (
      <section
        className="hlt-booking-showcase-footer hlt-journey-cta hlt-journey-cta-route"
        aria-labelledby="journey-cta-title"
        style={{ "--journey-cta-bg": `url(${journeyCtaMountainsUrl})` }}
      >
        <div className="hlt-container">
          <div className="hlt-journey-cta-route-inner">
            <header className="hlt-journey-cta-route-head">
              <h3 id="journey-cta-title">Ready to start your journey?</h3>
              <p>We are here to make your trip comfortable, safe, and unforgettable.</p>
            </header>

            <ol className="hlt-journey-cta-steps">
              {bookingSteps.map(([num, title, text, shortTitle], index) => (
                <React.Fragment key={num}>
                  {index > 0 && (
                    <li className="hlt-journey-cta-arrow" aria-hidden="true">
                      <svg viewBox="0 0 32 12">
                        <path d="M1 6h29M24 1l6 5-6 5" />
                      </svg>
                    </li>
                  )}
                  <li className="hlt-journey-cta-step">
                    <span className="hlt-journey-cta-step-num">{num}</span>
                    <span className="hlt-journey-cta-step-text">
                      <strong>{title}</strong>
                      <small>{text}</small>
                      <em className="hlt-journey-cta-step-short">{shortTitle}</em>
                    </span>
                  </li>
                </React.Fragment>
              ))}
            </ol>

            <div className="hlt-journey-cta-route-actions">
              <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Book via WhatsApp
              </a>
              <a className="hlt-btn hlt-journey-cta-route-outline" href="/booking/">
                Request Availability
              </a>
            </div>

            {/* Chỉ hiện ở mobile (theo mẫu): logo + tên thương hiệu | khẩu hiệu */}
            <div className="hlt-journey-cta-route-brand">
              <img src={logoUrl} alt="" />
              <span className="hlt-journey-cta-route-brand-name">
                <strong>Hoang</strong>
                <span>Luxury Travel</span>
              </span>
              <p>Private luxury transfer across Vietnam&rsquo;s most beautiful destinations.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
