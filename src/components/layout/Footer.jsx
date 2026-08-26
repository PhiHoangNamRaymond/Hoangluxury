import React from "react";
import { logoUrl, whatsappQrUrl } from "../../config/assets.js";
import { catalogPageUrl, whatsappUrl } from "../../data.js";

export default function Footer() {
  const isHomePage = window.location.pathname.replace(/\/+$/, "") === "";
  const sectionHref = (href) => isHomePage ? href : `/${href}`;

  return (
    <footer className="hlt-footer hlt-footer-compact">
      {/* Desktop Footer Grid - 100% Intact */}
      <div className="hlt-container hlt-footer-grid hlt-footer-desktop-view">
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

      {/* Mobile Footer View - Matching Reference Image */}
      <div className="hlt-container hlt-footer-mobile-view">
        {/* Top Floating Card: Brand + QR */}
        <div className="hlt-footer-mobile-card">
          <div className="hlt-footer-mobile-card-brand">
            <div className="hlt-footer-mobile-logo-row">
              <img src={logoUrl} alt="Hoang Luxury Travel" className="hlt-footer-mobile-logo" />
              <div className="hlt-footer-mobile-brand-text">
                <strong>HOANG</strong>
                <span>LUXURY TRAVEL</span>
              </div>
            </div>
            <p className="hlt-footer-mobile-tagline">
              Luxury private car services for international travelers in Northern Vietnam.
            </p>
          </div>

          <div className="hlt-footer-mobile-card-divider">
            <span className="hlt-footer-mobile-card-diamond" />
          </div>

          <div className="hlt-footer-mobile-card-qr">
            <div className="hlt-footer-mobile-qr-box">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat via WhatsApp">
                <img src={whatsappQrUrl} alt="WhatsApp QR code" />
              </a>
              <p>WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="hlt-footer-mobile-contact-section">
          <h3 className="hlt-footer-mobile-contact-title">CONTACT US</h3>
          <div className="hlt-footer-mobile-title-divider">
            <span className="hlt-footer-mobile-title-diamond" />
          </div>

          <div className="hlt-footer-mobile-contact-list">
            <a href="tel:+84839779888" className="hlt-footer-mobile-contact-item">
              <div className="hlt-footer-mobile-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span>+84.839.779.888</span>
            </a>

            <a href="mailto:hoangluxury.travel@gmail.com" className="hlt-footer-mobile-contact-item">
              <div className="hlt-footer-mobile-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
              </div>
              <span>hoangluxury.travel@gmail.com</span>
            </a>

            <div className="hlt-footer-mobile-contact-item">
              <div className="hlt-footer-mobile-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span>Duplex Villa 68 SP Hanoi, Viet Nam</span>
            </div>

            <a
              href="https://www.youtube.com/@HoangLuxuryTravel"
              target="_blank"
              rel="noopener noreferrer"
              className="hlt-footer-mobile-contact-item"
            >
              <div className="hlt-footer-mobile-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="3" />
                  <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" />
                </svg>
              </div>
              <span>youtube.com/@HoangLuxuryTravel</span>
            </a>
          </div>
        </div>

        {/* Bottom Flourish Ornament Divider + Privacy Policy */}
        <div className="hlt-footer-mobile-bottom">
          <div className="hlt-footer-flourish-divider">
            <span className="hlt-footer-flourish-line" />
            <span className="hlt-footer-flourish-center">
              <svg viewBox="0 0 72 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="hlt-footer-flourish-svg">
                <path d="M36 1.5L39.2 8.5L36 15.5L32.8 8.5L36 1.5Z" fill="#c5a15a" />
                <path d="M36 6.5C39.5 9 46 8 48 14C44 14 40 11.5 36 12.5C32 11.5 28 14 24 14C26 8 32.5 9 36 6.5Z" fill="#c5a15a" opacity="0.85" />
                <path d="M48 14C51 14 54 12 52.5 9.5C51 7.5 48 8.8 48 11" stroke="#c5a15a" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M24 14C21 14 18 12 19.5 9.5C21 7.5 24 8.8 24 11" stroke="#c5a15a" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M54 13.5C58 13.5 64 12 66 8" stroke="#c5a15a" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                <path d="M18 13.5C14 13.5 8 12 6 8" stroke="#c5a15a" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
              </svg>
            </span>
            <span className="hlt-footer-flourish-line" />
          </div>

          <div className="hlt-footer-mobile-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="hlt-footer-mobile-legal-separator">|</span>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
