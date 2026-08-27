import React, { useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { cruiseData } from "./config/cruises.js";
import { cruiseImages, logoUrl } from "./config/assets.js";
import { catalogPageUrl, whatsappUrl } from "./data.js";
import "./styles/cruises.css";

export default function CruisesPage() {
  const [selectedBay, setSelectedBay] = useState("all");
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const getCruiseInquiryUrl = (cruiseName) => {
    const text = encodeURIComponent(
      `Hello Hoang Luxury Travel, I am interested in booking or checking availability for ${cruiseName} (Cruise + Private Transfer). Please provide details.`
    );
    return `https://wa.me/84839779888?text=${text}`;
  };

  const getCustomInquiryUrl = (topic) => {
    const text = encodeURIComponent(
      `Hello Hoang Luxury Travel, I would like personal recommendation for ${topic} in Ha Long Bay / Lan Ha Bay.`
    );
    return `https://wa.me/84839779888?text=${text}`;
  };

  const filteredCruises = cruiseData.cruises.filter((c) => {
    if (selectedBay === "all") return true;
    return c.bay.toLowerCase().includes(selectedBay.toLowerCase());
  });

  return (
    <div className="hlt-cruises-page">
      <Header />

      <main className="hlt-cruises-main">
        {/* =========================================================================
            1. HERO BANNER & USPs TRUSTBAR
        ========================================================================= */}
        <section
          className="hlt-cruise-hero"
          style={{ backgroundImage: `url(${cruiseImages.heroHalong})` }}
        >
          <div className="hlt-cruise-hero-overlay" aria-hidden="true" />
          <div className="hlt-container hlt-cruise-hero-container">
            <div className="hlt-cruise-hero-content">
              <p className="hlt-cruise-hero-kicker">{cruiseData.hero.kicker}</p>
              <h1 className="hlt-cruise-hero-title">
                <span>LUXURY</span>
                <span className="hlt-gold-text">HA LONG CRUISES</span>
              </h1>
              <p className="hlt-cruise-hero-subtitle">{cruiseData.hero.subtitle}</p>

              <div className="hlt-cruise-hero-actions">
                <a className="hlt-btn hlt-btn-gold" href="#find-cruise">
                  Explore Cruises
                </a>
                <a
                  className="hlt-btn hlt-btn-outline-glass"
                  href={getCustomInquiryUrl("Luxury Ha Long Cruise & Private Transfer")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="hlt-whatsapp-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
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
                <span className="hlt-trust-icon">💎</span>
                <span>Handpicked Cruises</span>
              </div>
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-icon">🚐</span>
                <span>Private 7-Seat Transfer</span>
              </div>
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-icon">🎧</span>
                <span>Direct Support</span>
              </div>
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-icon">⭐</span>
                <span>Best Available Options</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. FIND YOUR CRUISE (CATALOG / GRID)
        ========================================================================= */}
        <section id="find-cruise" className="hlt-cruise-catalog-section">
          <div className="hlt-container">
            <div className="hlt-cruise-catalog-layout">
              {/* Left Intro Sidebar */}
              <div className="hlt-cruise-catalog-intro">
                <h2>Find Your Cruise</h2>
                <p>
                  Handpicked luxury cruises in Ha Long Bay & Lan Ha Bay. Best service. Best value.
                </p>
                <div className="hlt-cruise-filter-tabs">
                  <button
                    type="button"
                    className={`hlt-cruise-filter-btn ${selectedBay === "all" ? "is-active" : ""}`}
                    onClick={() => setSelectedBay("all")}
                  >
                    All Bays
                  </button>
                  <button
                    type="button"
                    className={`hlt-cruise-filter-btn ${selectedBay === "ha long" ? "is-active" : ""}`}
                    onClick={() => setSelectedBay("ha long")}
                  >
                    Ha Long Bay
                  </button>
                  <button
                    type="button"
                    className={`hlt-cruise-filter-btn ${selectedBay === "lan ha" ? "is-active" : ""}`}
                    onClick={() => setSelectedBay("lan ha")}
                  >
                    Lan Ha Bay
                  </button>
                </div>
              </div>

              {/* Right Cruise Cards Grid */}
              <div className="hlt-cruise-grid">
                {filteredCruises.map((cruise) => {
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
                          <svg viewBox="0 0 16 16" fill="currentColor">
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
                            <span className="hlt-star">★</span> {cruise.rating} ({cruise.reviewsCount})
                          </span>
                          <span className="hlt-cruise-card-price">
                            From <strong>{cruise.priceVnd} VND</strong>
                          </span>
                        </div>

                        <a
                          className="hlt-cruise-card-btn"
                          href={getCruiseInquiryUrl(cruise.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Cruise
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. NOT SURE WHICH CRUISE TO CHOOSE? (PREFERENCE MATCHING)
        ========================================================================= */}
        <section className="hlt-cruise-match-section">
          <div className="hlt-container">
            <div className="hlt-cruise-match-card">
              <div className="hlt-cruise-match-left">
                <h2>Not Sure Which Cruise to Choose?</h2>
                <p>
                  Tell us what you're looking for. We'll recommend the most suitable cruise based on your
                  travel dates, preferences and budget.
                </p>
                <a
                  className="hlt-btn hlt-btn-gold"
                  href={getCustomInquiryUrl(
                    selectedPreference ? `Cruise Recommendation for ${selectedPreference}` : "Cruise Recommendation"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get a Personal Recommendation
                </a>
              </div>

              <div className="hlt-cruise-match-grid">
                {cruiseData.preferenceCategories.map((cat) => {
                  const isSelected = selectedPreference === cat.title;
                  return (
                    <div
                      key={cat.id}
                      className={`hlt-cruise-pref-box ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setSelectedPreference(isSelected ? null : cat.title)}
                    >
                      <div className="hlt-cruise-pref-icon">
                        {cat.icon === "heart" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        )}
                        {cat.icon === "family" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        )}
                        {cat.icon === "diamond" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                            <path d="M2 9h20" />
                            <path d="m12 21 4-12-4-6-4 6 4 12z" />
                          </svg>
                        )}
                        {cat.icon === "mountains" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                          </svg>
                        )}
                      </div>
                      <h3>{cat.title}</h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. FROM YOUR HOTEL TO YOUR CRUISE — SEAMLESSLY
        ========================================================================= */}
        <section className="hlt-cruise-seamless-section">
          <div
            className="hlt-cruise-seamless-banner"
            style={{ backgroundImage: `url(${cruiseImages.seamlessTransfer})` }}
          >
            <div className="hlt-cruise-seamless-overlay" aria-hidden="true" />
            <div className="hlt-container hlt-cruise-seamless-content">
              <h2>{cruiseData.seamlessTransfer.heading}</h2>
              <p className="hlt-cruise-seamless-subtitle">
                {cruiseData.seamlessTransfer.subtitle}
              </p>

              {/* 4-Step Diagram */}
              <div className="hlt-cruise-flow-steps">
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-icon">🏨</span>
                  <span>Hanoi Hotel</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">➔</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-icon">🚐</span>
                  <span>Private Hoang Luxury Vehicle</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">➔</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-icon">⚓</span>
                  <span>Ha Long / Tuan Chau Port</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">➔</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-icon">🚢</span>
                  <span>Luxury Cruise</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Strip & CTA */}
          <div className="hlt-cruise-seamless-bottom">
            <div className="hlt-container">
              <div className="hlt-cruise-features-row">
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-icon">🚗</span>
                  <span>Door-to-door pickup</span>
                </div>
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-icon">7️⃣</span>
                  <span>Private 7-Seat vehicle</span>
                </div>
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-icon">⏱️</span>
                  <span>Flexible departure time</span>
                </div>
                <div className="hlt-cruise-feature-item">
                  <span className="hlt-feature-icon">🧳</span>
                  <span>Luggage assistance</span>
                </div>
              </div>

              <div className="hlt-cruise-seamless-cta">
                <a
                  className="hlt-btn hlt-btn-gold"
                  href={getCustomInquiryUrl("Combined Cruise + Private Transfer Package")}
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
            5. MORE THAN A NIGHT ON THE BAY (EXPERIENCES MOSAIC)
        ========================================================================= */}
        <section className="hlt-cruise-exp-section">
          <div className="hlt-container">
            <div className="hlt-cruise-exp-layout">
              <div className="hlt-cruise-exp-intro">
                <h2>{cruiseData.experiences.heading}</h2>
                <p>{cruiseData.experiences.description}</p>
              </div>

              <div className="hlt-cruise-exp-mosaic">
                <div
                  className="hlt-cruise-exp-banner"
                  style={{ backgroundImage: `url(${cruiseImages.heroHalong})` }}
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
          </div>
        </section>

        {/* =========================================================================
            6. CHOOSE YOUR JOURNEY (DURATION CARDS)
        ========================================================================= */}
        <section className="hlt-cruise-durations-section">
          <div className="hlt-container">
            <div className="hlt-cruise-section-heading">
              <h2>Choose Your Journey</h2>
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
        </section>

        {/* =========================================================================
            7. A MORE PERSONAL WAY TO EXPERIENCE HA LONG (STATS & VALUES)
        ========================================================================= */}
        <section className="hlt-cruise-stats-section">
          <div className="hlt-container">
            <div className="hlt-cruise-stats-layout">
              <div className="hlt-cruise-stats-left">
                <h2>{cruiseData.stats.heading}</h2>
                <ul className="hlt-cruise-benefits-list">
                  {cruiseData.stats.benefits.map((b, i) => (
                    <li key={i}>
                      <span className="hlt-check-icon">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hlt-cruise-stats-grid">
                {cruiseData.stats.metrics.map((m, i) => (
                  <div className="hlt-cruise-metric-box" key={i}>
                    <div className="hlt-metric-icon">
                      {m.icon === "group" && "👥"}
                      {m.icon === "globe" && "🌐"}
                      {m.icon === "star" && "⭐"}
                      {m.icon === "headset" && "🎧"}
                    </div>
                    <div className="hlt-metric-val">{m.value}</div>
                    <div className="hlt-metric-lbl">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. REAL CRUISE MOMENTS (GALLERY)
        ========================================================================= */}
        <section className="hlt-cruise-moments-section">
          <div className="hlt-container">
            <div className="hlt-cruise-section-heading">
              <h2>Real Cruise Moments</h2>
            </div>

            <div className="hlt-cruise-moments-grid">
              <div className="hlt-cruise-moment-card">
                <img src={cruiseImages.expSunset} alt="Sundeck moments" loading="lazy" />
              </div>
              <div className="hlt-cruise-moment-card">
                <img src={cruiseImages.expCabin} alt="Luxury suite interior" loading="lazy" />
              </div>
              <div className="hlt-cruise-moment-card">
                <img src={cruiseImages.expDining} alt="Fine dining table setup" loading="lazy" />
              </div>
              <div className="hlt-cruise-moment-card">
                <img src={cruiseImages.expKayaking} alt="Kayaking in Ha Long Bay" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. TRUSTED BY INTERNATIONAL TRAVELERS (REVIEWS)
        ========================================================================= */}
        <section className="hlt-cruise-reviews-section">
          <div className="hlt-container">
            <div className="hlt-cruise-section-heading">
              <h2>Trusted by International Travelers</h2>
            </div>

            <div className="hlt-cruise-reviews-grid">
              {cruiseData.reviews.map((rev, idx) => (
                <article className="hlt-cruise-review-card" key={idx}>
                  <div className="hlt-cruise-review-stars">★★★★★</div>
                  <p className="hlt-cruise-review-quote">"{rev.text}"</p>
                  <div className="hlt-cruise-review-author">
                    <div className="hlt-review-avatar">{rev.avatarLetter}</div>
                    <div className="hlt-review-info">
                      <strong>{rev.name}</strong>
                      <span>{rev.country}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. FREQUENTLY ASKED QUESTIONS
        ========================================================================= */}
        <section className="hlt-cruise-faq-section">
          <div className="hlt-container">
            <div className="hlt-cruise-faq-layout">
              <div className="hlt-cruise-faq-title-col">
                <h2>Frequently Asked Questions</h2>
              </div>

              <div className="hlt-cruise-faq-accordion">
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
            11. YOUR HA LONG JOURNEY STARTS HERE (CTA BANNER)
        ========================================================================= */}
        <section
          className="hlt-cruise-cta-section"
          style={{ backgroundImage: `url(${cruiseImages.heroHalong})` }}
        >
          <div className="hlt-cruise-cta-overlay" aria-hidden="true" />
          <div className="hlt-container hlt-cruise-cta-content">
            <div className="hlt-cruise-cta-text">
              <h2>Your Ha Long Journey Starts Here</h2>
              <p>
                Tell us your travel dates and preferences. We'll help you select the right cruise and
                arrange your private journey from Hanoi.
              </p>
            </div>

            <div className="hlt-cruise-cta-actions">
              <a
                className="hlt-btn hlt-btn-gold"
                href={getCustomInquiryUrl("Check Cruise Availability & Rates")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Check Cruise Availability
              </a>
              <a
                className="hlt-btn hlt-btn-outline-glass"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="hlt-whatsapp-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                  </svg>
                </span>
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          <div className="hlt-cruise-cta-trust">
            <span>Personal Support</span> · <span>Secure Booking</span> · <span>Private Transfer Available</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
