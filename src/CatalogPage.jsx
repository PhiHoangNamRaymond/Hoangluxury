import React from "react";
import { Footer, Header } from "./App.jsx";
import { catalogUrl, whatsappUrl } from "./data.js";
import catalogBackgroundUrl from "../assets/catalog-background.png";
import catalogOpenBookUrl from "../assets/catalog-open-book.png";

function BookIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 6.5c4.4 0 8 .8 12 3.3v16.1c-4-2.5-7.6-3.3-12-3.3V6.5Zm24 0c-4.4 0-8 .8-12 3.3v16.1c4-2.5 7.6-3.3 12-3.3V6.5Z" />
      <path d="M16 9.8v16.1" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.1 4.9A9.8 9.8 0 0 0 12 2a9.9 9.9 0 0 0-8.6 14.9L2 22l5.3-1.4a9.9 9.9 0 0 0 4.7 1.2A9.9 9.9 0 0 0 19.1 4.9Z" />
      <path d="M8.2 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.9c.1.2.1.4-.1.6l-.6.8c-.2.2-.1.4 0 .6.7 1.2 1.7 2.2 2.9 2.9.2.1.4.2.6 0l.9-1c.2-.2.4-.3.7-.2l1.8.8c.3.1.4.3.4.5 0 .4-.2 1.4-.8 2-.6.6-1.5.9-2.4.7-1.1-.2-2.9-.9-4.8-2.6-1.5-1.4-2.6-3.1-2.9-4.2-.3-1 .1-2.1.7-2.8Z" />
    </svg>
  );
}

export default function CatalogPage() {
  const hasPdfUrl = catalogUrl !== "#catalog";

  return (
    <div className="hlt-site hlt-catalog-site">
      <Header />

      <main className="hlt-catalog-main">
        <section
          id="catalog"
          className="hlt-catalog-hero"
          style={{ "--catalog-background": `url('${catalogBackgroundUrl}')` }}
          aria-labelledby="catalog-page-title"
        >
          <div className="hlt-container hlt-catalog-content">
            <header className="hlt-catalog-heading">
              <p>Our Catalog</p>
              <h1 id="catalog-page-title">Hoang Luxury Travel</h1>
              <span>Private Car Service - Northwest Routes - Personalized Experiences</span>
              <i aria-hidden="true" />
            </header>

            <img
              className="hlt-catalog-book"
              src={catalogOpenBookUrl}
              alt="Hoang Luxury Travel premium vehicle and Hanoi to Sapa catalog"
            />

            <div className="hlt-catalog-actions">
              <a
                className="hlt-catalog-button hlt-catalog-button-outline"
                href={catalogUrl}
                target={hasPdfUrl ? "_blank" : undefined}
                rel={hasPdfUrl ? "noopener noreferrer" : undefined}
              >
                <BookIcon />
                <span>View Full Catalog (PDF)</span>
              </a>
              <a
                className="hlt-catalog-button hlt-catalog-button-gold"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                <span>Book via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
