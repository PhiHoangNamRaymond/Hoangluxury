import React, { useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import { cruiseData, cruiseLanding } from "./config/cruises.js";
import { cruiseBackgroundAlts, cruiseFlowIcons, cruiseImages, preferenceIconImages } from "./config/assets.js";
import usePageEntered from "./hooks/usePageEntered.js";
import CruiseLandingCollection, { cruiseInquiry } from "./components/CruiseLandingCollection.jsx";
import WhatsAppGlyph from "./components/WhatsAppGlyph.jsx";
import CruiseDesktopIcon from "./components/CruiseDesktopIcon.jsx";
import "./styles/cruise-landing-desktop.css";
import "./styles/cruise-landing-mobile.css";

export default function CruisesPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const moveReview = (direction) => setReviewIndex((current) => (current + direction + cruiseData.reviews.length) % cruiseData.reviews.length);
  const pageEntered = usePageEntered();

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const getCustomInquiryUrl = (topic) => {
    const text = encodeURIComponent(
      `Hello Hoang Luxury Travel, I would like personal recommendation and rates for ${topic}.`
    );
    return `https://wa.me/84839779888?text=${text}`;
  };

  return (
    <div
      className={`hlt-site hlt-cruises-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}
    >
      {/* Header chung như mọi trang (khách yêu cầu 22/11/2026: bỏ icon WhatsApp riêng ở mobile). */}
      <Header />

      <main className="hlt-cruises-main">
        {/* =========================================================================
            1. HERO BANNER & USPs TRUSTBAR (Dark Gold Luxury)
        ========================================================================= */}
        <section className="hlt-cruise-hero">
          <picture className="hlt-cruise-hero-media">
            <img src={cruiseImages.heroDesktop} alt={cruiseBackgroundAlts.heroHalong} fetchPriority="high" data-no-skeleton />
          </picture>
          <div className="hlt-cruise-hero-overlay" aria-hidden="true" />

          <div className="hlt-container hlt-cruise-hero-container">
            {/* Scalloped concave corner frame overlay for mobile */}
            <div className="hlt-cruise-hero-mobile-frame" aria-hidden="true">
              <svg
                className="hlt-cruise-hero-scallop-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M 3.5,0 L 96.5,0 A 3.5,3.5 0 0,0 100,3.5 L 100,96.5 A 3.5,3.5 0 0,0 96.5,100 L 3.5,100 A 3.5,3.5 0 0,0 0,96.5 L 0,3.5 A 3.5,3.5 0 0,0 3.5,0 Z"
                  stroke="rgba(197, 161, 90, 0.7)"
                  strokeWidth="0.7"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="hlt-cruise-hero-content">
              <p className="hlt-cruise-v1-kicker">Luxury Bay Cruises</p>
              <h1 className="hlt-cruise-hero-title">
                <span className="hlt-title-white">Ha Long &amp; Lan Ha </span>
                <span className="hlt-title-gold">Bay Cruises</span>
              </h1>

              <div className="hlt-cruise-crown-divider" aria-hidden="true">
                <span className="hlt-cruise-crown-line" />
                <svg viewBox="0 0 20 11" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" className="hlt-cruise-crown-svg">
                  <polyline points="1,10 3,4 7,7.5 10,1 13,7.5 17,4 19,10" />
                  <line x1="1" y1="10" x2="19" y2="10" />
                </svg>
                <span className="hlt-cruise-crown-line" />
              </div>

              <div className="hlt-cruise-v1-hero-copy">
                <p>{cruiseLanding.intro}</p>
                <div className="hlt-cruise-v1-actions">
                  <a className="hlt-cruise-v1-btn" href={cruiseInquiry("a Ha Long Bay or Lan Ha Bay cruise")} target="_blank" rel="noopener noreferrer"><WhatsAppGlyph /> Book via WhatsApp</a>
                  {/* Không dẫn đi đâu, chỉ hiển thị (khách yêu cầu 22/11/2026). */}
                  <span className="hlt-cruise-v1-btn is-outline">View Catalog</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hlt-cruise-trustbar">
            <div className="hlt-container hlt-cruise-trustbar-inner">
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <CruiseDesktopIcon name="car" />
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
                <span>Private Car Transfers</span>
              </div>
              <div className="hlt-cruise-trust-divider" aria-hidden="true" />
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <CruiseDesktopIcon name="boat" />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                    <path d="M2 9h20" />
                    <path d="m12 21 4-12-4-6-4 6 4 12z" />
                  </svg>
                </span>
                <span>Luxury Cruises</span>
              </div>
              <div className="hlt-cruise-trust-divider" aria-hidden="true" />
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <CruiseDesktopIcon name="support" />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </span>
                <span>24/7 WhatsApp Support</span>
              </div>
              <div className="hlt-cruise-trust-divider" aria-hidden="true" />
              <div className="hlt-cruise-trust-item">
                <span className="hlt-trust-svg" aria-hidden="true">
                  <CruiseDesktopIcon name="price" />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.6 12.4 12.4 20.6a1.6 1.6 0 0 1-2.3 0L3 13.5V5a2 2 0 0 1 2-2h8.5l7.1 7.1a1.6 1.6 0 0 1 0 2.3Z" />
                    <circle cx="8.3" cy="8.3" r="1.6" />
                  </svg>
                </span>
                <span>Transparent Pricing</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. FIND YOUR CRUISE (Staggered Layout)
        ========================================================================= */}
        <div id="find-cruise">
        <CruiseLandingCollection />
        </div>

        {/* =========================================================================
            3. NOT SURE WHICH CRUISE TO CHOOSE? (Dark Navy Luxury)
        ========================================================================= */}
        <section className="hlt-cruise-match-section">
          <div className="hlt-container">
            <h2 className="hlt-cruise-mobile-only hlt-cruise-mobile-styles-title">Discover Luxury Cruises in Halong Bay</h2>
            {/* Thiết kế 23/11/2026: tiêu đề giữa, 4 thẻ có dòng mô tả ngắn, nút ở dưới; nền navy trơn. */}
            <header className="hlt-cruise-match-head hlt-cruise-pc-only">
              <p className="hlt-cruise-match-kicker">Personalized Cruise Selection</p>
              <h2 className="hlt-cruise-match-title">Discover Luxury Cruises in Halong Bay</h2>
              <svg className="hlt-cruise-match-swoosh" viewBox="0 0 80 18" aria-hidden="true">
                <path d="M4 11c8-6 17-7 26-3 6 3 11 4 16 1M30 13c9 3 18 2 26-3 5-3 11-4 20-1M37 9c2-3 6-4 9-2" />
              </svg>
              <p className="hlt-cruise-match-intro">
                Explore luxury cruises in Halong Bay, bringing memorable experiences to couples, families,
                luxury travelers, and nature lovers.
              </p>
            </header>

            <div className="hlt-cruise-match-grid">
              {cruiseData.preferenceCategories.map((cat) => (
                <div key={cat.id} className="hlt-cruise-pref-box">
                  <div className="hlt-cruise-pref-icon">
                    <img
                      src={preferenceIconImages[cat.id]}
                      alt=""
                      className="hlt-cruise-pref-img"
                      width="300"
                      height="240"
                      loading="lazy"
                      decoding="async"
                      data-no-skeleton
                    />
                  </div>
                  <div className="hlt-cruise-pref-title">{cat.title}</div>
                  <p className="hlt-cruise-pref-tagline hlt-cruise-pc-only">{cat.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. FROM YOUR HOTEL TO YOUR CRUISE — SEAMLESSLY (Composite Photo & Steps)
        ========================================================================= */}
        <section className="hlt-cruise-seamless-section">
          <div className="hlt-cruise-seamless-banner">
            {/* Ảnh là thẻ img hiển thị thật (tên file + alt, khách yêu cầu 29/10/2026). */}
            <picture className="hlt-cruise-seamless-media">
              <source media="(min-width: 961px)" srcSet={cruiseImages.seamlessTransferDesktop} />
              <img className="hlt-cruise-seamless-img" src={cruiseImages.seamlessTransfer} alt={cruiseBackgroundAlts.seamlessTransfer} loading="lazy" decoding="async" data-no-skeleton />
            </picture>
            <div className="hlt-cruise-seamless-overlay" aria-hidden="true" />
            <div className="hlt-container hlt-cruise-seamless-content">
              <div className="hlt-cruise-seamless-title">From Your Hotel to Your Cruise</div>
              <p className="hlt-cruise-seamless-subtitle">
                Enjoy a private journey from Hanoi or Noi Bai Airport directly to your cruise terminal.
              </p>

              {/* 4-Step Flowchart. Icon theo bộ khách gửi (22/11/2026). */}
              <div className="hlt-cruise-flow-steps">
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <img src={cruiseFlowIcons.hotel} alt="" data-no-skeleton />
                  </span>
                  <span>Hanoi Hotel</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">→</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <img src={cruiseFlowIcons.car} alt="" data-no-skeleton />
                  </span>
                  <span>Private Hoang Luxury Vehicle</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">→</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <img src={cruiseFlowIcons.anchor} alt="" data-no-skeleton />
                  </span>
                  <span>Ha Long / Tuan Chau Port</span>
                </div>
                <div className="hlt-cruise-flow-arrow" aria-hidden="true">→</div>
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <img src={cruiseFlowIcons.cruise} alt="" data-no-skeleton />
                  </span>
                  <span>Luxury Cruise</span>
                </div>
              </div>
              {/* 2 nút đặt (khách yêu cầu 23/11/2026). */}
              <div className="hlt-cruise-seamless-actions">
                <a className="hlt-cruise-seamless-btn is-gold" href={cruiseInquiry("a private transfer to my Ha Long cruise")} target="_blank" rel="noopener noreferrer">
                  <span className="hlt-cruise-seamless-btn-icon" aria-hidden="true"><WhatsAppGlyph /></span>
                  Book via WhatsApp
                </a>
                <a className="hlt-cruise-seamless-btn is-dark" href="/booking/">Book via Form</a>
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
                {/* Thiết kế 23/11/2026: hoa sen + dòng nhỏ phía trên tiêu đề. */}
                <div className="hlt-cruise-exp-kicker" aria-hidden="true">
                  <svg viewBox="0 0 32 20"><path d="M16 17c-2.6-2.1-3.6-5-3-8.6 2.6 1.6 3.6 4.4 3 8.6Zm0 0c2.6-2.1 3.6-5 3-8.6-2.6 1.6-3.6 4.4-3 8.6Zm0 0c-3.8.6-7.2-.8-9.5-3.9 3.6-.8 6.8.5 9.5 3.9Zm0 0c3.8.6 7.2-.8 9.5-3.9-3.6-.8-6.8.5-9.5 3.9ZM16 8.6c-1.3-2.2-1.3-4.4 0-6.6 1.3 2.2 1.3 4.4 0 6.6Z" /></svg>
                  <span>Hoang Luxury Travel</span>
                </div>
                <h2>What To Expect On Your Cruise</h2>
                <p>
                  Wake up to limestone islands beyond your window, explore quiet caves and hidden lagoons,
                  and savor exceptional dining as the sun sets over the bay. A refined cruise experience
                  where natural wonders and world-class hospitality come together.
                </p>
              </div>

              <div className="hlt-cruise-exp-mosaic">
                {/* Ảnh là thẻ img hiển thị thật (tên file + alt, khách yêu cầu 29/10/2026). */}
                <div className="hlt-cruise-exp-banner">
                  <img className="hlt-cruise-exp-banner-img" src={cruiseImages.mosaicPanorama} alt={cruiseBackgroundAlts.mosaicPanorama} loading="lazy" decoding="async" data-no-skeleton />
                </div>

                <div className="hlt-cruise-exp-grid">
                  {cruiseData.experiences.items.map((item) => (
                    <div className="hlt-cruise-exp-card" key={item.id}>
                      <img
                        src={cruiseImages[item.imageKey]}
                        alt={item.alt}
                        loading="lazy"
                        className="hlt-cruise-exp-img"
                      />
                      <div className="hlt-cruise-exp-overlay">
                        <h3>{item.label}</h3>
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
            9. TRUSTED BY INTERNATIONAL TRAVELERS (Light Theme Reviews)
        ========================================================================= */}
        <section className="hlt-cruise-reviews-section">
          <div className="hlt-container">
            <div className="hlt-cruise-reviews-layout">
              <div className="hlt-cruise-reviews-left">
                <h2>Trusted By International Travelers</h2>
              </div>

              <div className="hlt-cruise-reviews-grid">
                {cruiseData.reviews.map((rev, idx) => (
                  <article className={`hlt-cruise-review-card${idx === reviewIndex ? " is-mobile-active" : ""}`} key={idx}>
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
              <div className="hlt-cruise-mobile-only hlt-cruise-review-controls" aria-label="Review navigation">
                <button type="button" onClick={() => moveReview(-1)} aria-label="Previous review">‹</button>
                <div>{cruiseData.reviews.map((review, idx) => <button key={review.name} type="button" aria-label={`Show review ${idx + 1}`} aria-pressed={idx === reviewIndex} onClick={() => setReviewIndex(idx)} />)}</div>
                <button type="button" onClick={() => moveReview(1)} aria-label="Next review">›</button>
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
                <h2>Frequently Asked Questions</h2>
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
                        <h3 className="hlt-cruise-faq-q">{faq.q}</h3>
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
          className="hlt-cruise-cta-section hlt-blog-story-cta hlt-cruise-pc-only"
        >
          <img className="hlt-cruise-cta-img" src={cruiseImages.ctaSunset} alt="" loading="lazy" decoding="async" data-no-skeleton />
          <div className="hlt-cruise-cta-overlay" aria-hidden="true" />
          {/* Cùng kích thước dải CTA trang Blog / About (khách yêu cầu 22/11/2026):
              chữ và cặp nút chung .hlt-btn. */}
          <div className="hlt-container hlt-cruise-cta-content">
            <div className="hlt-cruise-cta-text">
              <div className="hlt-cruise-cta-title">Ready to explore Halong Bay?</div>
              <p className="hlt-blog-story-description">
                Start planning your journey today!
              </p>
            </div>

            <div className="hlt-cruise-cta-right">
              <div className="hlt-blog-story-actions">
                <a className="hlt-btn hlt-btn-gold" href={getCustomInquiryUrl("Check Cruise Availability & Rates")} target="_blank" rel="noopener noreferrer">
                  Book via WhatsApp
                </a>
                <a className="hlt-btn hlt-btn-outline" href="/booking/">Book via Form</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ExperienceSlider />
      <Footer />
    </div>
  );
}
