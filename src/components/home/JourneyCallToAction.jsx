import React from "react";
import { journeyCtaMountainsUrl } from "../../config/assets.js";
import { catalogPageUrl, whatsappUrl } from "../../data.js";

// Ba bước đặt xe cho bản "route" (trang /journey/<slug>/): số, tiêu đề (h3, PC
// và mobile), phụ đề chỉ hiện trên PC.
const bookingSteps = [
  ["01", "Start Your Booking", "WhatsApp or Booking Form"],
  ["02", "Plan Your Trip", "Route · Vehicle · Final price"],
  ["03", "Confirm & Enjoy", "Driver ready for pick-up"],
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
export default function JourneyCallToAction({
  variant,
  className = "",
  title = "Ready to start your journey?",
  text = "We are here to make your trip comfortable, safe and unforgettable.",
  headingLevel = "h3",
  // "form": nút thứ hai là Book via Form (/booking/) thay cho View Catalog —
  // trang chủ và /journeys/ theo yêu cầu khách 28/10/2026.
  secondary = "catalog",
}) {
  const Heading = headingLevel === "h2" ? "h2" : "h3";
  if (variant === "route") {
    return (
      <section
        className="hlt-booking-showcase-footer hlt-journey-cta hlt-journey-cta-route"
        aria-labelledby="journey-cta-title"
      >
        {/* Ảnh nền là thẻ img có tên file, alt rỗng (khách yêu cầu 29/10/2026). */}
        <img className="hlt-journey-cta-route-img" src={journeyCtaMountainsUrl} alt="" loading="lazy" decoding="async" data-no-skeleton />
        <span className="hlt-journey-cta-route-shade" aria-hidden="true" />
        <div className="hlt-container">
          <div className="hlt-journey-cta-route-inner">
            <header className="hlt-journey-cta-route-head">
              {/* H2 theo cấu trúc SEO khách duyệt (28/10/2026): H2 tiêu đề, H3 ba bước. */}
              <h2 id="journey-cta-title" className="hlt-journey-cta-route-title">Ready To Start Your Journey?</h2>
              <p>Driver - Vehicle - Pick-up Time confirmed before departure.</p>
            </header>

            <ol className="hlt-journey-cta-steps">
              {bookingSteps.map(([num, title, text], index) => (
                <React.Fragment key={num}>
                  {index > 0 && (
                    <li className="hlt-journey-cta-arrow" aria-hidden="true">
                      <svg viewBox="0 0 32 12">
                        <path d="M1 6h29M24 1l6 5-6 5" />
                      </svg>
                    </li>
                  )}
                  {/* h3 gồm cả số đang hiện ("01. Start Your Booking", khách yêu cầu
                      29/10/2026); dấu chấm ẩn. Phụ đề nằm ngoài h3. */}
                  <li className="hlt-journey-cta-step">
                    <h3 className="hlt-journey-cta-step-heading">
                      <span className="hlt-journey-cta-step-num">{num}</span>
                      <span className="hlt-seo-sep">. </span>
                      <span className="hlt-journey-cta-step-title">{title}</span>
                    </h3>
                    <small>{text}</small>
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
                Book via Form
              </a>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`hlt-booking-showcase-footer hlt-journey-cta${className ? ` ${className}` : ""}`}
      aria-labelledby="journey-cta-title"
    >
      <div className="hlt-container">
        {/* Desktop View */}
        <div className="hlt-journey-desktop-view">
          <div>
            <Heading id="journey-cta-title">{title}</Heading>
            <p>{text}</p>
          </div>
          <div className="hlt-showcase-actions">
            <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Book via WhatsApp
            </a>
            <a
              className="hlt-btn hlt-btn-outline"
              href={secondary === "form" ? "/booking/" : catalogPageUrl}
            >
              {secondary === "form" ? "Book via Form" : "View Catalog"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
