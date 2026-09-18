import React, { useEffect } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import {
  aboutImages,
  journeyCardImages,
  journeyCtaMountainsUrl,
  logoUrl,
  servicesBackgroundUrl,
} from "./config/assets.js";
import { whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

const luxuryValues = [
  ["Time, respected", "Careful planning around your schedule."],
  ["Space, protected", "Privacy and room to travel at your own pace."],
  ["Details, considered", "Attentive preparation, from first contact to arrival."],
];

const commitments = [
  ["01", "Clear arrangements", "Your itinerary and service details confirmed before departure."],
  ["02", "Transparent communication", "Agreed costs and inclusions explained clearly."],
  ["03", "Respect for privacy", "A considerate approach to your personal space."],
  ["04", "Support when plans change", "Discuss adjustments with us as your journey evolves."],
];

// Cùng thứ tự với journeyCardImages trong config/assets.js
const destinations = [
  ["Sapa", "sapa"],
  ["Ha Long Bay", "ha-long"],
  ["Ninh Binh", "ninh-binh"],
  ["Ha Giang", "ha-giang"],
  ["Cat Ba", "cat-ba"],
  ["Cao Bang", "cao-bang"],
  ["Mu Cang Chai", "mu-cang-chai"],
  ["Moc Chau", "moc-chau"],
  ["Ta Xua", "ta-xua"],
].map(([name, slug], index) => ({ name, slug, image: journeyCardImages[index] }));

// 5 ảnh hàng trên, 4 ảnh hàng dưới, theo thứ tự trong mẫu
const destinationRows = [[0, 1, 2, 3, 5], [7, 4, 6, 8]].map((row) => row.map((index) => destinations[index]));

function ArrowIcon() {
  return (
    <svg className="hlt-about-arrow" viewBox="0 0 20 10" aria-hidden="true">
      <path d="M1 5h17M14 1l4 4-4 4" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="hlt-about-wa" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.8 21.3l4.7-1.2A9.3 9.3 0 1 0 12 2.6Z" />
      <path className="is-fill" d="M8.9 7.6c.3-.3.7-.3.9 0l1.1 1.6c.2.3.2.7-.1 1l-.6.6c.6 1.3 1.7 2.4 3 3l.6-.6c.3-.3.7-.3 1-.1l1.6 1.1c.3.2.3.6 0 .9l-.8.9c-.5.5-1.3.7-2 .4a9.6 9.6 0 0 1-5.1-5.1c-.3-.7-.1-1.5.4-2l1-.8Z" />
    </svg>
  );
}

function Kicker({ children, className = "" }) {
  return (
    <p className={`hlt-about-kicker ${className}`}>
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

export default function AboutPage() {
  const pageEntered = usePageEntered();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "About Us | Hoang Luxury Travel";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className={`hlt-site hlt-about-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />

      <main className="hlt-about-main">
        {/* Hero */}
        <section
          className="hlt-about-hero"
          style={{ "--about-hero": `url(${aboutImages.hero})` }}
          aria-labelledby="about-title"
        >
          <div className="hlt-container hlt-about-hero-inner">
            <div className="hlt-about-hero-copy">
              <p className="hlt-about-hero-kicker">
                Our Story
                <span aria-hidden="true" />
              </p>
              <h1 id="about-title">
                <span>Thoughtful Travel.</span>
                <span className="is-gold">Personal by Nature.</span>
              </h1>
              <p className="hlt-about-hero-lead">
                Private journeys through Northern Vietnam, shaped around you.
              </p>
            </div>
            <p className="hlt-about-hero-note">
              Mountains create
              <br />
              a kinder pace of life.
            </p>
          </div>
        </section>

        {/* Personal approach */}
        <section className="hlt-about-split" aria-labelledby="about-approach-title">
          <div className="hlt-about-split-copy">
            <Kicker>Hoang Luxury Travel</Kicker>
            <h2 id="about-approach-title">
              A Personal Approach
              <br />
              to Every Journey
            </h2>
            <p>
              We provide private travel across Northern Vietnam, with a focus on comfort, privacy and thoughtful
              service. Our approach is simple: understand your plans, prepare the details and give you space to
              enjoy the journey.
            </p>
            <a className="hlt-about-text-link" href="#about-commitments">
              Learn more about us
              <ArrowIcon />
            </a>
          </div>
          <div className="hlt-about-split-media">
            <img src={aboutImages.approach} alt="Hoang Luxury Travel reception" loading="lazy" />
          </div>
        </section>

        {/* What luxury means */}
        <section className="hlt-about-values" aria-labelledby="about-values-title">
          <div className="hlt-container">
            <p className="hlt-about-lined-title">What Luxury Means to Us</p>
            <h2 id="about-values-title">The luxury of feeling cared for.</h2>
            <div className="hlt-about-values-grid">
              {luxuryValues.map(([title, text]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* People */}
        <section className="hlt-about-split is-reversed" aria-labelledby="about-people-title">
          <div className="hlt-about-split-media">
            <img src={aboutImages.people} alt="Hoang Luxury Travel team coordinating journeys" loading="lazy" />
          </div>
          <div className="hlt-about-split-copy">
            <Kicker>The People Behind Your Journey</Kicker>
            <h2 id="about-people-title">
              Personal Service.
              <br />
              Shared Responsibility.
            </h2>
            <p>
              Behind every journey are people coordinating the details, preparing for your arrival and supporting
              your travel plans.
            </p>
            <p className="hlt-about-signoff">Prepared with care. Delivered with respect.</p>
          </div>
        </section>

        {/* Commitments */}
        <section
          id="about-commitments"
          className="hlt-about-commitments"
          style={{ "--about-commitments-bg": `url(${servicesBackgroundUrl})` }}
          aria-labelledby="about-commitments-title"
        >
          <div className="hlt-container">
            <h2 id="about-commitments-title" className="hlt-about-lined-title is-light">
              Our Commitments to You
            </h2>
            <div className="hlt-about-commitments-grid">
              {commitments.map(([num, title, text]) => (
                <article key={num}>
                  <span className="hlt-about-commitment-num">{num}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Licence */}
        <section className="hlt-about-licence" aria-labelledby="about-licence-title">
          <div className="hlt-container hlt-about-licence-inner">
            <div className="hlt-about-licence-brand">
              <img src={logoUrl} alt="" />
              <strong>Hoang</strong>
              <span>Luxury Travel</span>
            </div>
            <div className="hlt-about-licence-body">
              <div className="hlt-about-licence-head">
                <svg className="hlt-about-doc" viewBox="0 0 32 40" aria-hidden="true">
                  <path d="M4 2h17l9 9v27H4Z" />
                  <path d="M21 2v9h9M10 19h14M10 25h14M10 31h9" />
                </svg>
                <div>
                  <h2 id="about-licence-title">Licensed Transport Operator in Vietnam</h2>
                  <p>Hoang Luxury Travel is licensed to provide passenger transport services under contract in Vietnam.</p>
                </div>
              </div>
              <div className="hlt-about-licence-grid">
                <div>
                  <h3>Private journeys</h3>
                  <p>A dedicated vehicle for your itinerary.</p>
                </div>
                <div>
                  <h3>Clear confirmations</h3>
                  <p>Travel details agreed before departure.</p>
                </div>
              </div>
              <div className="hlt-about-licence-foot">
                <span>Transport licence No. 15260263</span>
                <span className="is-gold">hoangluxury.travel</span>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="hlt-about-destinations" aria-labelledby="about-destinations-title">
          <div className="hlt-container">
            <h2 id="about-destinations-title" className="hlt-about-lined-title is-caps">
              Explore Northern Vietnam
            </h2>
            <p className="hlt-about-destinations-sub">Remarkable places. Thoughtfully planned journeys.</p>
            {destinationRows.map((row, rowIndex) => (
              <div className={`hlt-about-destination-row is-row-${rowIndex + 1}`} key={rowIndex}>
                {row.map((item) => (
                  <a className="hlt-about-destination" href={`/journey/${item.slug}/`} key={item.slug}>
                    <img src={item.image} alt={`Hanoi to ${item.name} private transfer`} loading="lazy" />
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            ))}
            <a className="hlt-about-outline-btn" href="/journeys/">
              Explore all destinations
              <ArrowIcon />
            </a>
          </div>
        </section>

        {/* CTA */}
        <section
          className="hlt-about-cta"
          style={{ "--about-cta-bg": `url(${journeyCtaMountainsUrl})` }}
          aria-labelledby="about-cta-title"
        >
          <div className="hlt-container hlt-about-cta-inner">
            <div>
              <h2 id="about-cta-title">
                Every Journey Begins
                <br />
                with a Conversation.
              </h2>
              <p>Share your plans. Let us take care of the details.</p>
            </div>
            <a className="hlt-about-cta-btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Plan Your Journey
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
