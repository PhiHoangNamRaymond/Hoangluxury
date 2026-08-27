import React, { useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { cruiseData } from "./config/cruises.js";
import { cruiseImages, preferenceIconImages } from "./config/assets.js";
import { whatsappUrl } from "./data.js";
import "./styles/cruises.css";

export default function CruisesPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const getCruiseInquiryUrl = (cruiseName) => {
    const text = encodeURIComponent(
      `Hello Hoang Luxury Travel, I would like to inquire about booking ${cruiseName} with Private Transfer from Hanoi.`
    );
    return `https://wa.me/84839779888?text=${text}`;
  };

  const getCustomInquiryUrl = (topic) => {
    const text = encodeURIComponent(
      `Hello Hoang Luxury Travel, I would like personal recommendation and rates for ${topic}.`
    );
    return `https://wa.me/84839779888?text=${text}`;
  };

  return (
    <div className="hlt-site hlt-cruises-site">
      <Header />

      <main className="hlt-cruises-main">
        {/* =========================================================================
            1. HERO BANNER & USPs TRUSTBAR (Dark Gold Luxury)
        ========================================================================= */}
        <section
          className="hlt-cruise-hero"
          style={{ backgroundImage: `url(${cruiseImages.heroHalong})` }}
        >
          <div className="hlt-cruise-hero-overlay" aria-hidden="true" />

          <div className="hlt-container hlt-cruise-hero-container">
            <div className="hlt-cruise-hero-content">
              <h1 className="hlt-cruise-hero-title">
                <span className="hlt-title-white">LUXURY</span>
                <span className="hlt-title-gold">HA LONG CRUISES</span>
              </h1>
              <p className="hlt-cruise-hero-subtitle">
                Exceptional journeys through Ha Long &amp; Lan Ha Bay
              </p>
              <p className="hlt-cruise-hero-bullets">
                <span>Handpicked Cruises</span>
                <span className="hlt-bullet-dot">·</span>
                <span>Private Hanoi Transfer</span>
                <span className="hlt-bullet-dot">·</span>
                <span>Personal Support</span>
              </p>

              <div className="hlt-cruise-hero-actions">
                <a className="hlt-btn hlt-cruise-btn-gold" href="#find-cruise">
                  Explore Cruises
                </a>
                <a
                  className="hlt-btn hlt-cruise-btn-glass"
                  href={getCustomInquiryUrl("Luxury Ha Long Cruise & Private Transfer")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="hlt-whatsapp-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                    </svg>
                  </span>
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <div className="hlt-cruise-trustbar">
            <div className="hlt-container hlt-cruise-trustbar-inner">
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                    <path d="M2 9h20" />
                    <path d="m12 21 4-12-4-6-4 6 4 12z" />
                  </svg>
                </span>
                <span>Handpicked Cruises</span>
              </div>
              <div className="hlt-cruise-trust-divider" aria-hidden="true" />
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <svg viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 2.5,14.5 V 7 C 2.5,5 4,4 6,4 H 16 L 22.5,9.5 H 25 C 26,9.5 26.5,10.5 26.5,12 V 14.5" />
                    <path d="M 2.5,14.5 H 4.5" />
                    <circle cx="7.5" cy="14.5" r="2.3" />
                    <path d="M 9.8,14.5 H 19.2" />
                    <circle cx="21.5" cy="14.5" r="2.3" />
                    <path d="M 23.8,14.5 H 26.5" />
                    <path d="M 5.5,6.5 H 14.5 V 10.5 H 5.5 Z" />
                    <line x1="10" y1="6.5" x2="10" y2="10.5" />
                    <path d="M 16.5,6.5 L 21,10.5 H 16.5 Z" />
                  </svg>
                </span>
                <span>Private 7-Seat Transfer</span>
              </div>
              <div className="hlt-cruise-trust-divider" aria-hidden="true" />
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </span>
                <span>Direct Support</span>
              </div>
              <div className="hlt-cruise-trust-divider" aria-hidden="true" />
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <span>Best Available Options</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. FIND YOUR CRUISE (Staggered Layout)
        ========================================================================= */}
        <section id="find-cruise" className="hlt-cruise-catalog-section">
          <div className="hlt-container hlt-cruise-catalog-container">
            {/* Top Row: Intro + First 3 Cards */}
            <div className="hlt-cruise-row-top">
              <div className="hlt-cruise-catalog-intro">
                <h2 className="hlt-cruise-catalog-title">
                  <span>Find Your</span>
                  <span>Cruise</span>
                </h2>
                <p className="hlt-cruise-catalog-desc">
                  Handpicked luxury cruises in Ha Long Bay &amp; Lan Ha Bay. Best service. Best value.
                </p>
                <div className="hlt-cruise-gold-rule" aria-hidden="true" />
              </div>

              {cruiseData.cruises.slice(0, 3).map((cruise) => {
                const cruiseImg = cruiseImages[cruise.imageKey] || cruiseImages.heroHalong;
                return (
                  <article className="hlt-cruise-card" key={cruise.id}>
                    <div className="hlt-cruise-card-media">
                      <img
                        src={cruiseImg}
                        alt={cruise.name}
                        loading="lazy"
                        className="hlt-cruise-card-img"
                      />
                      <span className="hlt-cruise-card-badge">
                        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M8 1a5 5 0 0 0-5 5c0 3.8 5 9 5 9s5-5.2 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
                        </svg>
                        <span>{cruise.locationBadge}</span>
                      </span>
                    </div>

                    <div className="hlt-cruise-card-body">
                      <h3 className="hlt-cruise-card-title">{cruise.name}</h3>
                      <p className="hlt-cruise-card-durations">{cruise.durations}</p>

                      <div className="hlt-cruise-card-meta">
                        <span className="hlt-cruise-card-rating">
                          <span className="hlt-star">★</span> {cruise.rating} <span className="hlt-cruise-reviews-count">({cruise.reviewsCount})</span>
                        </span>
                        <span className="hlt-cruise-card-price">
                          From <strong>{cruise.priceVnd} VND</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        className="hlt-cruise-card-btn"
                        onClick={() => setSelectedCruise(cruise)}
                      >
                        View Cruise
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom Row: 3 Cards Offset / Staggered */}
            <div className="hlt-cruise-row-bottom">
              {cruiseData.cruises.slice(3, 6).map((cruise) => {
                const cruiseImg = cruiseImages[cruise.imageKey] || cruiseImages.heroHalong;
                return (
                  <article className="hlt-cruise-card" key={cruise.id}>
                    <div className="hlt-cruise-card-media">
                      <img
                        src={cruiseImg}
                        alt={cruise.name}
                        loading="lazy"
                        className="hlt-cruise-card-img"
                      />
                      <span className="hlt-cruise-card-badge">
                        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M8 1a5 5 0 0 0-5 5c0 3.8 5 9 5 9s5-5.2 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
                        </svg>
                        <span>{cruise.locationBadge}</span>
                      </span>
                    </div>

                    <div className="hlt-cruise-card-body">
                      <h3 className="hlt-cruise-card-title">{cruise.name}</h3>
                      <p className="hlt-cruise-card-durations">{cruise.durations}</p>

                      <div className="hlt-cruise-card-meta">
                        <span className="hlt-cruise-card-rating">
                          <span className="hlt-star">★</span> {cruise.rating} <span className="hlt-cruise-reviews-count">({cruise.reviewsCount})</span>
                        </span>
                        <span className="hlt-cruise-card-price">
                          From <strong>{cruise.priceVnd} VND</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        className="hlt-cruise-card-btn"
                        onClick={() => setSelectedCruise(cruise)}
                      >
                        View Cruise
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. NOT SURE WHICH CRUISE TO CHOOSE? (Dark Navy Luxury)
        ========================================================================= */}
        <section className="hlt-cruise-match-section">
          <div className="hlt-container">
            <div className="hlt-cruise-match-layout">
              <div className="hlt-cruise-match-left">
                <h2>Not Sure Which Cruise to Choose?</h2>
                <p>
                  Tell us what you're looking for. We'll recommend the most suitable cruise based on your
                  travel dates, preferences and budget.
                </p>
                <a
                  className="hlt-cruise-btn-gold"
                  href={getCustomInquiryUrl("Cruise Recommendation")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get a Personal Recommendation
                </a>
              </div>

              <div className="hlt-cruise-match-grid">
                {cruiseData.preferenceCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="hlt-cruise-pref-box"
                  >
                    <div className="hlt-cruise-pref-icon">
                      <img
                        src={preferenceIconImages[cat.id]}
                        alt={cat.title}
                        className="hlt-cruise-pref-img"
                        width="54"
                        height="54"
                      />
                    </div>
                    <h3>{cat.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. FROM YOUR HOTEL TO YOUR CRUISE — SEAMLESSLY (Composite Photo & Steps)
        ========================================================================= */}
        <section className="hlt-cruise-seamless-section">
          <div
            className="hlt-cruise-seamless-banner"
            style={{ backgroundImage: `url(${cruiseImages.seamlessTransfer})` }}
          >
            <div className="hlt-cruise-seamless-overlay" aria-hidden="true" />
            <div className="hlt-container hlt-cruise-seamless-content">
              <h2>
                From Your Hotel<br />
                to Your Cruise —<br />
                Seamlessly
              </h2>
              <p className="hlt-cruise-seamless-subtitle">
                Enjoy a private journey from Hanoi or Noi Bai Airport directly to your cruise terminal.
              </p>

              {/* 4-Step Flowchart */}
              <div className="hlt-cruise-flow-steps">
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16" />
                      <rect x="7" y="6" width="3" height="3" rx="0.5" />
                      <rect x="14" y="6" width="3" height="3" rx="0.5" />
                      <rect x="7" y="11" width="3" height="3" rx="0.5" />
                      <rect x="14" y="11" width="3" height="3" rx="0.5" />
                      <path d="M10 21v-4h4v4" />
                    </svg>
                  </span>
                  <span>Hanoi Hotel</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">→</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <svg viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 2.5,14.5 V 7 C 2.5,5 4,4 6,4 H 16 L 22.5,9.5 H 25 C 26,9.5 26.5,10.5 26.5,12 V 14.5" />
                      <path d="M 2.5,14.5 H 4.5" />
                      <circle cx="7.5" cy="14.5" r="2.3" />
                      <path d="M 9.8,14.5 H 19.2" />
                      <circle cx="21.5" cy="14.5" r="2.3" />
                      <path d="M 23.8,14.5 H 26.5" />
                      <path d="M 5.5,6.5 H 14.5 V 10.5 H 5.5 Z" />
                      <line x1="10" y1="6.5" x2="10" y2="10.5" />
                      <path d="M 16.5,6.5 L 21,10.5 H 16.5 Z" />
                    </svg>
                  </span>
                  <span>Private Hoang Luxury Vehicle</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">→</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="2.5" />
                      <line x1="12" y1="7.5" x2="12" y2="21" />
                      <line x1="8" y1="10" x2="16" y2="10" />
                      <path d="M4 14a8 8 0 0 0 16 0" />
                      <path d="M3 12l1 2 2-1" />
                      <path d="M21 12l-1 2-2-1" />
                    </svg>
                  </span>
                  <span>Ha Long / Tuan Chau Port</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">→</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17l1.5 4h15L21 17H3z" />
                      <path d="M5 17V11h14v6" />
                      <path d="M7 11V7h10v4" />
                      <line x1="12" y1="7" x2="12" y2="4" />
                      <line x1="8" y1="14" x2="16" y2="14" />
                    </svg>
                  </span>
                  <span>Luxury Cruise</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights & Central CTA */}
          <div className="hlt-cruise-seamless-bottom">
            <div className="hlt-container">
              <div className="hlt-cruise-features-row">
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-svg">
                    <svg viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 4h12a1.5 1.5 0 0 1 1.5 1.5v1.5H5.5V5.5A1.5 1.5 0 0 1 7 4z" />
                      <line x1="8" y1="7" x2="8" y2="9.5" />
                      <line x1="18" y1="7" x2="18" y2="9.5" />
                      <path d="M4 17V12a2 2 0 0 1 2-2h11.5l4.5 4h2a2 2 0 0 1 2 2v1" />
                      <path d="M7 10h5v3H6z" />
                      <path d="M14 10h3l3 3h-6z" />
                      <circle cx="7.5" cy="18" r="2.8" />
                      <circle cx="19.5" cy="18" r="2.8" />
                      <path d="M2 17h2.8" />
                      <path d="M10.3 17h6.4" />
                      <path d="M22.3 17H26" />
                    </svg>
                  </span>
                  <span>Door-to-door pickup</span>
                </div>
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9.5" />
                      <path d="M8.5 8.5h7l-4.5 7.5" />
                    </svg>
                  </span>
                  <span>Private 7-seat vehicle</span>
                </div>
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9.5" />
                      <polyline points="12 7 12 12 15.5 14" />
                    </svg>
                  </span>
                  <span>Flexible departure time</span>
                </div>
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="7" width="14" height="14" rx="2" />
                      <path d="M9 7V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5V7" />
                      <line x1="9" y1="12" x2="9" y2="16" />
                      <line x1="15" y1="12" x2="15" y2="16" />
                    </svg>
                  </span>
                  <span>Luggage assistance</span>
                </div>
              </div>

              <div className="hlt-cruise-seamless-cta">
                <a
                  className="hlt-cruise-btn-gold"
                  href={getCustomInquiryUrl("Book Cruise + Private Transfer Package")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Cruise + Private Transfer
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. MORE THAN A NIGHT ON THE BAY (Light Theme Mosaic)
        ========================================================================= */}
        <section className="hlt-cruise-exp-section">
          <div className="hlt-container">
            <div className="hlt-cruise-exp-layout">
              <div className="hlt-cruise-exp-intro">
                <h2>
                  More Than a<br />
                  Night on the Bay
                </h2>
                <p>
                  Wake up surrounded by limestone islands, savor refined dining, explore hidden caves
                  and create unforgettable memories in one of the world's most extraordinary landscapes.
                </p>
              </div>

              <div className="hlt-cruise-exp-mosaic">
                <div
                  className="hlt-cruise-exp-banner"
                  style={{ backgroundImage: `url(${cruiseImages.mosaicPanorama || cruiseImages.heroHalong})` }}
                  aria-label="Ha Long Bay panorama"
                />

                <div className="hlt-cruise-exp-grid">
                  {cruiseData.experiences.items.map((item) => (
                    <div className="hlt-cruise-exp-card" key={item.id}>
                      <img
                        src={cruiseImages[item.imageKey]}
                        alt={item.label}
                        loading="lazy"
                        className="hlt-cruise-exp-img"
                      />
                      <div className="hlt-cruise-exp-overlay">
                        <h4>{item.label}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr className="hlt-cruise-light-divider" />
          </div>
        </section>

        {/* =========================================================================
            6. CHOOSE YOUR JOURNEY (Light Theme Itineraries)
        ========================================================================= */}
        <section className="hlt-cruise-durations-section">
          <div className="hlt-container">
            <div className="hlt-cruise-durations-layout">
              <div className="hlt-cruise-durations-intro">
                <h2>
                  Choose Your<br />
                  Journey
                </h2>
              </div>

              <div className="hlt-cruise-durations-grid">
                {cruiseData.durations.map((duration, idx) => (
                  <div className="hlt-cruise-duration-card" key={idx}>
                    <div className="hlt-cruise-duration-media">
                      <img
                        src={cruiseImages[duration.imageKey]}
                        alt={duration.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="hlt-cruise-duration-body">
                      <h3>{duration.title}</h3>
                      <p>{duration.subtitle}</p>
                      <a
                        className="hlt-cruise-duration-btn"
                        href={getCustomInquiryUrl(`${duration.title} Itinerary`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Journey
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. A MORE PERSONAL WAY TO EXPERIENCE HA LONG (Dark Navy Luxury)
        ========================================================================= */}
        <section className="hlt-cruise-stats-section">
          <div className="hlt-container">
            <div className="hlt-cruise-stats-layout">
              <div className="hlt-cruise-stats-left">
                <h2>A More Personal Way to Experience Ha Long</h2>
                <ul className="hlt-cruise-benefits-list">
                  <li>
                    <span className="hlt-check-icon">✓</span>
                    <span>Expert cruise recommendation</span>
                  </li>
                  <li>
                    <span className="hlt-check-icon">✓</span>
                    <span>Private transfer coordination</span>
                  </li>
                  <li>
                    <span className="hlt-check-icon">✓</span>
                    <span>Cruise terminal assistance</span>
                  </li>
                  <li>
                    <span className="hlt-check-icon">✓</span>
                    <span>Direct WhatsApp support</span>
                  </li>
                </ul>
              </div>

              <div className="hlt-cruise-stats-grid">
                <div className="hlt-cruise-metric-box">
                  <div className="hlt-metric-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="hlt-metric-val">12,686+</div>
                  <div className="hlt-metric-lbl">Successful Transfers</div>
                </div>

                <div className="hlt-cruise-metric-box">
                  <div className="hlt-metric-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div className="hlt-metric-val">20+</div>
                  <div className="hlt-metric-lbl">Countries Served</div>
                </div>

                <div className="hlt-cruise-metric-box">
                  <div className="hlt-metric-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="hlt-metric-val">4.9 / 5</div>
                  <div className="hlt-metric-lbl">Guest Rating</div>
                </div>

                <div className="hlt-cruise-metric-box">
                  <div className="hlt-metric-svg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <div className="hlt-metric-val">24/7</div>
                  <div className="hlt-metric-lbl">Travel Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. REAL CRUISE MOMENTS (Light Theme Gallery)
        ========================================================================= */}
        <section className="hlt-cruise-moments-section">
          <div className="hlt-container">
            <div className="hlt-cruise-moments-grid">
              <div className="hlt-cruise-moment-card hlt-cruise-moment-featured">
                <img src={cruiseImages.momentSundeck || cruiseImages.heroHalong} alt="Ha Long Bay sundeck panorama" loading="lazy" />
                <h2 className="hlt-cruise-moment-title">Real Cruise Moments</h2>
              </div>
              <div className="hlt-cruise-moment-card">
                <img src={cruiseImages.expCabin} alt="Luxury suite interior" loading="lazy" />
              </div>
              <div className="hlt-cruise-moment-card">
                <img src={cruiseImages.expDining} alt="Fine dining table setting" loading="lazy" />
              </div>
              <div className="hlt-cruise-moment-card">
                <img src={cruiseImages.expKayaking} alt="Kayaking in Ha Long Bay" loading="lazy" />
              </div>
            </div>

            <hr className="hlt-cruise-light-divider" />
          </div>
        </section>

        {/* =========================================================================
            9. TRUSTED BY INTERNATIONAL TRAVELERS (Light Theme Reviews)
        ========================================================================= */}
        <section className="hlt-cruise-reviews-section">
          <div className="hlt-container">
            <div className="hlt-cruise-reviews-layout">
              <div className="hlt-cruise-reviews-left">
                <h2>
                  Trusted by<br />
                  International<br />
                  Travelers
                </h2>
              </div>

              <div className="hlt-cruise-reviews-grid">
                {cruiseData.reviews.map((rev, idx) => (
                  <article className="hlt-cruise-review-card" key={idx}>
                    <div className="hlt-cruise-review-stars">★★★★★</div>
                    <p className="hlt-cruise-review-quote">"{rev.text}"</p>
                    <div className="hlt-cruise-review-author">
                      {cruiseImages[rev.avatarKey] ? (
                        <img
                          src={cruiseImages[rev.avatarKey]}
                          alt={rev.name}
                          className="hlt-review-avatar-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="hlt-review-avatar">{rev.avatarLetter}</div>
                      )}
                      <div className="hlt-review-info">
                        <strong>{rev.name}</strong>
                        <span>{rev.country}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <hr className="hlt-cruise-light-divider" />
          </div>
        </section>

        {/* =========================================================================
            10. FREQUENTLY ASKED QUESTIONS (Light Theme Accordion Grid)
        ========================================================================= */}
        <section className="hlt-cruise-faq-section">
          <div className="hlt-container">
            <div className="hlt-cruise-faq-layout">
              <div className="hlt-cruise-faq-left">
                <h2>
                  Frequently Asked<br />
                  Questions
                </h2>
              </div>

              <div className="hlt-cruise-faq-grid">
                {cruiseData.faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      className={`hlt-cruise-faq-item ${isOpen ? "is-open" : ""}`}
                      key={index}
                    >
                      <button
                        type="button"
                        className="hlt-cruise-faq-question"
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        <svg
                          className="hlt-faq-chevron"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M4 6l4 4 4-4"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="hlt-cruise-faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            11. YOUR HA LONG JOURNEY STARTS HERE (Pre-footer Dark Gold CTA)
        ========================================================================= */}
        <section
          className="hlt-cruise-cta-section"
          style={{ backgroundImage: `url(${cruiseImages.ctaSunset || cruiseImages.heroHalong})` }}
        >
          <div className="hlt-cruise-cta-overlay" aria-hidden="true" />
          <div className="hlt-container hlt-cruise-cta-content">
            <div className="hlt-cruise-cta-text">
              <h2>
                Your Ha Long<br />
                Journey Starts Here
              </h2>
              <p>
                Tell us your travel date and preferences. We'll help you select the right cruise and
                arrange your private journey from Hanoi.
              </p>
            </div>

            <div className="hlt-cruise-cta-right">
              <div className="hlt-cruise-cta-actions">
                <a
                  className="hlt-cruise-btn-gold"
                  href={getCustomInquiryUrl("Check Cruise Availability & Rates")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Check Cruise Availability
                </a>
                <a
                  className="hlt-cruise-btn-dark-wa"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="hlt-whatsapp-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                    </svg>
                  </span>
                  WhatsApp Us
                </a>
              </div>
              <div className="hlt-cruise-cta-trust">
                <span>Personal Support</span>
                <span className="hlt-cta-dot">·</span>
                <span>Secure Booking</span>
                <span className="hlt-cta-dot">·</span>
                <span>Private Transfer Available</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
