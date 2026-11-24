import React, { useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import { cruiseData, cruiseLanding } from "./config/cruises.js";
import { cruiseBackgroundAlts, cruiseFlowIcons, cruiseImages } from "./config/assets.js";
import usePageEntered from "./hooks/usePageEntered.js";
import CruiseLandingCollection, { cruiseInquiry } from "./components/CruiseLandingCollection.jsx";
import WhatsAppGlyph from "./components/WhatsAppGlyph.jsx";
import CruiseDesktopIcon from "./components/CruiseDesktopIcon.jsx";
import couplesGold from "../assets/cruise-icons/halong-bay-couples-cruise-icon-hoang-luxury-travel.png";
import familyGold from "../assets/cruise-icons/family-cruise-icon-private-car-hoang-luxury-travel.png";
import luxuryGold from "../assets/cruise-icons/private-transfer-luxury-cruise-experience-icon-halong-bay.png";
import scenicGold from "../assets/cruise-icons/hoang-luxury-travel-halong-bay-scenic-cruise-icon.png";
import preferenceWave from "../assets/cruise-icons/preference-gold-wave.png";
import preferenceBackground from "../assets/opt/halong-bay-sunset-landscape-hoang-luxury-travel.jpg";
import finalCtaBackground from "../assets/opt/halong-bay-sunset-private-transfer-hoang-luxury-travel.png";
import experienceLotus from "../assets/cruise-icons/experience-gold-lotus.png";
import "./styles/cruise-landing-desktop.css";
import "./styles/cruise-landing-mobile.css";
import { bookingCta, waCta } from "./lib/cta-tracking.js";

const preferenceIcons = { couples: couplesGold, family: familyGold, luxury: luxuryGold, scenic: scenicGold };

/* Tên thử cho thẻ đánh giá 2 và 3, CHỈ khi chạy máy dev (npm run dev) để khách xem thử
   (yêu cầu 23/11/2026). Bản build/deploy (import.meta.env.DEV = false) vẫn hiện tên
   gốc: không đăng tên người không có thật lên web thật. */
const reviewTestOverrides = import.meta.env?.DEV
  ? {
      1: { name: "Yuki Natsumi", country: "Japan", avatarLetter: "Y", avatarKey: null },
      2: { name: "Kim Ji Uon", country: "South Korea", avatarLetter: "K", avatarKey: null },
    }
  : {};

export default function CruisesPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const pageEntered = usePageEntered();

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
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
                <p className="hlt-cruise-pc-only">{cruiseLanding.intro}</p>
                <p className="hlt-cruise-mobile-only">Hoang Luxury Travel provides curated cruise experiences in Ha Long &amp; Lan Ha Bay, combining comfort, elegance and exceptional service.</p>
                <div className="hlt-cruise-v1-actions">
                  <a className="hlt-cruise-v1-btn" href={cruiseInquiry("a Halong Bay cruise")} target="_blank" rel="noopener noreferrer" {...waCta("hero", "whatsapp_cruise_hero")}><WhatsAppGlyph /> Book via WhatsApp</a>
                  <a className="hlt-cruise-v1-btn is-outline" href="/catalog/">View Catalog</a>
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
        <section className="hlt-cruise-match-section" aria-labelledby="cruise-preference-heading">
          <img className="hlt-cruise-match-background" src={preferenceBackground} alt="" loading="lazy" decoding="async" data-no-skeleton />
          <div className="hlt-container">
            <header className="hlt-cruise-match-head">
              <h2 id="cruise-preference-heading" className="hlt-cruise-match-title">Discover Luxury Cruises In Halong Bay</h2>
              <p className="hlt-cruise-match-intro">
                Explore luxury cruises in Halong Bay, bringing memorable experiences to couples, families, luxury travelers, and nature lovers.
              </p>
            </header>

            <div className="hlt-cruise-match-grid">
              {cruiseData.preferenceCategories.map((cat) => (
                <div key={cat.id} className="hlt-cruise-pref-box">
                  <div className="hlt-cruise-pref-icon">
                    <img
                      src={preferenceIcons[cat.id]}
                      alt=""
                      className="hlt-cruise-pref-img"
                      width="224"
                      height="224"
                      loading="lazy"
                      decoding="async"
                      data-no-skeleton
                    />
                  </div>
                  <div className="hlt-cruise-pref-title">{cat.title}</div>
                  <p className="hlt-cruise-pref-tagline">{cat.tagline}</p>
                </div>
              ))}
            </div>
            <img className="hlt-cruise-match-wave" src={preferenceWave} alt="" loading="lazy" decoding="async" data-no-skeleton />
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
              <div className="hlt-cruise-seamless-title">From Your Hotel To Your Cruise</div>
              <p className="hlt-cruise-seamless-subtitle">
                Enjoy a private journey from Hanoi or Noi Bai Airport directly to your cruise terminal.
              </p>

              {/* 4-Step Flowchart. Icon theo bộ khách gửi (22/11/2026). */}
              <div className="hlt-cruise-flow-steps">
                <div className="hlt-cruise-flow-step">
                  <span className="hlt-flow-svg">
                    <span className="hlt-flow-hotel-glyph" aria-hidden="true"
                      style={{ "--hlt-flow-hotel-image": `url("${cruiseFlowIcons.hotel}")` }} />
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
                <a className="hlt-cruise-seamless-btn is-gold" href={cruiseInquiry("a private transfer to my Halong Bay cruise")} target="_blank" rel="noopener noreferrer" {...waCta("transfer_section", "whatsapp_cruise_transfer", { service: "private_transfer" })}>
                  <span className="hlt-cruise-seamless-btn-icon" aria-hidden="true"><WhatsAppGlyph /></span>
                  Book via WhatsApp
                </a>
                <a className="hlt-cruise-seamless-btn is-dark" href="/booking/" {...bookingCta("transfer_section", "booking_cruise_transfer")}>Book via Form</a>
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
                  <img src={experienceLotus} alt="" width="144" height="94" loading="lazy" decoding="async" data-no-skeleton />
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
                {cruiseData.reviews.map((review, idx) => ({ ...review, ...reviewTestOverrides[idx] })).map((rev, idx) => (
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
                        <span className="hlt-cruise-mobile-only hlt-cruise-faq-plus" aria-hidden="true">+</span>
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
          className="hlt-cruise-cta-section hlt-blog-story-cta hlt-cruise-final-cta"
        >
          <img className="hlt-cruise-cta-img" src={finalCtaBackground} alt="" loading="lazy" decoding="async" data-no-skeleton />
          <div className="hlt-cruise-cta-overlay" aria-hidden="true" />
          {/* Cùng kích thước dải CTA trang Blog / About (khách yêu cầu 22/11/2026):
              chữ và cặp nút chung .hlt-btn. */}
          <div className="hlt-container hlt-cruise-cta-content">
            <div className="hlt-cruise-cta-text">
              <div className="hlt-cruise-cta-title">Ready To Explore Halong Bay?</div>
              <p className="hlt-blog-story-description">
                Start planning your journey with a private transfer today!
              </p>
            </div>

            <div className="hlt-cruise-cta-right">
              <div className="hlt-blog-story-actions">
                <a className="hlt-btn hlt-btn-gold" href={cruiseInquiry("a private transfer to Halong cruise")} target="_blank" rel="noopener noreferrer" {...waCta("bottom_cta", "whatsapp_cruise_bottom_cta")}>
                  Book via WhatsApp
                </a>
                <a className="hlt-btn hlt-btn-outline" href="/booking/" {...bookingCta("bottom_cta", "booking_cruise_bottom_cta")}>Book via Form</a>
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
