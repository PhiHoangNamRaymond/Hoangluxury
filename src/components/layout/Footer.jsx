import React from "react";
import { logoUrl, whatsappQrUrl } from "../../config/assets.js";
import { catalogPageUrl, whatsappUrl } from "../../data.js";

export default function Footer() {
  const isHomePage = window.location.pathname.replace(/\/+$/, "") === "";
  const sectionHref = (href) => isHomePage ? href : `/${href}`;

  return (
    <footer className="hlt-footer hlt-footer-compact">
      <div className="hlt-container hlt-footer-grid">
        <div className="hlt-footer-brand">
          <img src={logoUrl} alt="Hoang Luxury Travel" />
          <strong>Hoang</strong>
          <span>Luxury Travel</span>
          <p>
            Luxury private car services for international<br />
            travelers in Northern Vietnam.
          </p>
        </div>

        <div className="hlt-footer-col">
          <h4>Quick Links</h4>
          <a href={sectionHref("#home")}>Home</a>
          <a href={catalogPageUrl}>Catalog</a>
          <a href={sectionHref("#routes")}>Journey</a>
          <a href="/booking/">Booking</a>
        </div>

        <div className="hlt-footer-col">
          <h4>Services</h4>
          <a href={sectionHref("#services")}>Airport Transfer</a>
          <a href={sectionHref("#services")}>Long-Distance Private Transfer</a>
          <a href={sectionHref("#services")}>Custom Private Trip</a>
          <a href={sectionHref("#services")}>Business Partner Transfer</a>
        </div>

        <div className="hlt-footer-col hlt-footer-contact">
          <h4>Contact Us</h4>
          <a href="tel:+84839779888">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.3 22.1 1.9 13.7 1.9 3.4c0-.7.6-1.3 1.3-1.3h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.7.6 4 .1.4 0 .8-.3 1.2l-1.7 2.2Z" />
            </svg>
            +84.839.779.888
          </a>
          <a href="mailto:hoangluxury.travel@gmail.com">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 6.5h17v11h-17z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            hoangluxury.travel@gmail.com
          </a>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            Duplex Villa 68 SP Hanoi, Viet Nam
          </span>
          <a
            href="https://www.youtube.com/@HoangLuxuryTravel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="4" />
              <path d="m10 9 5 3-5 3V9Z" />
            </svg>
            youtube.com/@HoangLuxuryTravel
          </a>
        </div>

        <div className="hlt-footer-qr">
          <div className="hlt-footer-qr-frame">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat via WhatsApp">
              <img src={whatsappQrUrl} alt="WhatsApp QR code" />
            </a>
            <p>WhatsApp</p>
          </div>
          <div className="hlt-footer-legal" aria-label="Legal information">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
