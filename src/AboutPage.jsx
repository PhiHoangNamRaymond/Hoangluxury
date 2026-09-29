import React, { useEffect } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import {
  aboutImages,
  curatedMountainDecorationUrl,
  journeyCardImages,
  journeyCtaMountainsUrl,
  logoUrl,
  servicesBackgroundUrl,
} from "./config/assets.js";
import { getJourneyPageUrl, whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

/* Phần tử thứ ba là icon, chỉ hiện ở bản mobile */
const luxuryValues = [
  ["Your Time Matters", "We plan around your schedule, so you can travel without feeling rushed.", "calendar"],
  ["Space to Relax", "Enjoy the comfort and privacy of having your own space throughout the journey.", "shield"],
  ["Care in Every Detail", "From your first message to your arrival, we take care of the details along the way.", "diamond"],
];

const commitments = [
  ["01", "Built Around You", "Your plans, preferences and travel needs shape the journey.", "calendar"],
  [
    "02",
    "Clarity Before You Travel",
    "Your trip details, arrangements and agreed price are clearly confirmed in advance.",
    "chat",
  ],
  [
    "03",
    "Travel at Your Own Pace",
    "100% private travel with no shared passengers or multiple pick-ups, plus more flexibility with your time and stops.",
    "lock",
  ],
  ["04", "Support When You Need It", "From planning to arrival, we're here whenever you need support.", "leaf"],
];

/* Ba điểm trong khối "The people behind your journey" (chỉ hiện ở mobile, theo mẫu) */
const peoplePoints = [
  ["people", "Prepared with care", "Your trip is planned by a dedicated team who understands your preferences."],
  ["heart", "Delivered with respect", "A thoughtful and professional service from start to finish."],
  ["handshake", "Here when you need us", "We stay in touch and support you whenever plans change."],
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

// Dải số liệu dưới banner (theo mẫu). Icon vẽ nét, cùng màu vàng của trang.
const aboutStats = [
  ["journeys", "12,686+", "Journeys Completed"],
  ["countries", "20+", "Countries"],
  ["rating", "4.9/5", "Guest Rating"],
  ["support", "24/7", "WhatsApp Support"],
];

function StatIcon({ type }) {
  const shapes = {
    journeys: (
      <>
        <circle cx="9" cy="8" r="3.4" />
        <circle cx="21" cy="8" r="3.4" />
        <path d="M2.5 21v-2.5c0-3 2.9-4.8 6.5-4.8s6.5 1.8 6.5 4.8V21M15.5 14.2c3.7-.5 8 1.1 8 4.3V21" />
      </>
    ),
    countries: (
      <>
        <circle cx="15" cy="12" r="10" />
        <path d="M5 12h20M15 2a17 17 0 0 1 0 20 17 17 0 0 1 0-20" />
      </>
    ),
    rating: <path d="m15 2.5 3.9 7.9 8.6 1.2-6.2 6.1 1.5 8.6-7.8-4.1-7.8 4.1 1.5-8.6-6.2-6.1 8.6-1.2Z" />,
    support: (
      <>
        <path d="M4 17v-5a11 11 0 0 1 22 0v5" />
        <path d="M26 16.5a2.8 2.8 0 0 1 0 5.5h-2.5v-5.5ZM4 16.5a2.8 2.8 0 0 0 0 5.5h2.5v-5.5Z" />
        <path d="M26 22v1.5c0 2-2 3.5-5 3.5h-3" />
      </>
    ),
  };

  return (
    <svg className="hlt-about-stat-icon" viewBox="0 0 30 30" aria-hidden="true">
      {shapes[type]}
    </svg>
  );
}

// Icon nét dùng cho các thẻ ở bản mobile (giá trị, cam kết, giấy phép, People)
function AboutIcon({ type }) {
  const shapes = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 2.5v4M16 2.5v4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2.5 20 6v6c0 5-3.4 8.3-8 9.5-4.6-1.2-8-4.5-8-9.5V6Z" />
        <path d="m8.8 12 2.2 2.2 4.2-4.4" />
      </>
    ),
    diamond: <path d="M12 2.5 21 9l-9 12.5L3 9Zm-9 6.5h18M8.4 9 12 2.5 15.6 9 12 21.5" />,
    people: (
      <>
        <circle cx="8.5" cy="8" r="3" />
        <circle cx="16.5" cy="9" r="2.5" />
        <path d="M2.8 19.5v-1.8c0-2.6 2.6-4.2 5.7-4.2s5.7 1.6 5.7 4.2v1.8M15 13.8c2.8.2 6.2 1.3 6.2 3.9v1.8" />
      </>
    ),
    heart: <path d="M12 20.5C6.5 17 3 13.7 3 9.8 3 7 5.1 5 7.7 5c1.8 0 3.3 1 4.3 2.4C13 6 14.5 5 16.3 5 18.9 5 21 7 21 9.8c0 3.9-3.5 7.2-9 10.7Z" />,
    handshake: (
      <>
        <path d="M2.5 9.5 6 6.5l4 1 2-1 2 1 4-1 3.5 3-3.5 4-2-1.6" />
        <path d="M10 7.5 7.2 10.3a1.9 1.9 0 0 0 2.7 2.7l.8-.8 2.1 2.1a1.9 1.9 0 0 0 2.7-2.7" />
        <path d="m11.3 14.2 1.8 1.8a1.9 1.9 0 0 0 2.7-2.7" />
      </>
    ),
    chat: (
      <>
        <path d="M21 12.5c0 4-4 7.2-9 7.2a11 11 0 0 1-3.3-.5L3.5 21l1.6-3.7A6.7 6.7 0 0 1 3 12.5c0-4 4-7.2 9-7.2s9 3.2 9 7.2Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </>
    ),
    lock: (
      <>
        <rect x="4.5" y="10" width="15" height="11" rx="2.5" />
        <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v3" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4c0 9-4.6 14-11 14-2 0-4-.6-5-1.5C4 9.5 10 4 20 4Z" />
        <path d="M16 8C11 10 7.5 13.5 5.5 20" />
      </>
    ),
    car: (
      <>
        <path d="M4 16v-3.2l1.8-4.3A2 2 0 0 1 7.6 7h8.8a2 2 0 0 1 1.8 1.5l1.8 4.3V16" />
        <path d="M4 12.8h16M4 16h16v2.5h-3V16M7 18.5H4Z" />
        <circle cx="7.6" cy="14.4" r=".9" />
        <circle cx="16.4" cy="14.4" r=".9" />
      </>
    ),
    doc: (
      <>
        <path d="M5.5 2.5h9l5 5v14h-14Z" />
        <path d="M14.5 2.5v5h5M8.5 12h7M8.5 16h7" />
      </>
    ),
  };

  return (
    <span className="hlt-about-ic" aria-hidden="true">
      <svg viewBox="0 0 24 24">{shapes[type]}</svg>
    </span>
  );
}

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
                Hoang Luxury Travel&rsquo;s Story
                <span aria-hidden="true" />
              </p>
              <h1 id="about-title">
                <span className="is-gold">More Than a Journey</span>
              </h1>
              <p className="hlt-about-hero-lead">
                Our story is shaped by the journeys we share with you.
              </p>
              {/* Nút + dòng chữ dưới banner: chỉ hiện ở mobile (theo mẫu) */}
              <a
                className="hlt-about-hero-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                Plan Your Journey
                <svg className="hlt-about-chevron" viewBox="0 0 12 20" aria-hidden="true">
                  <path d="M2.5 2 10 10l-7.5 8" />
                </svg>
              </a>
              <p className="hlt-about-hero-tag" aria-hidden="true">
                <span />
                People<i>Places</i>Meaningful Journeys
                <span />
              </p>
            </div>
            <p className="hlt-about-hero-note">
              Mountains create
              <br />
              a kinder pace of life.
            </p>
          </div>
        </section>

        {/* Dải số liệu */}
        <section className="hlt-about-stats" aria-label="Hoang Luxury Travel in numbers">
          <div className="hlt-container hlt-about-stats-inner">
            {aboutStats.map(([icon, value, label]) => (
              <div className="hlt-about-stat" key={label}>
                <StatIcon type={icon} />
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
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
              Hoang Luxury Travel provides private transfer and car-with-driver services across Northern Vietnam.
              We specialize in long-distance journeys from Hanoi and Noi Bai International Airport to Sa Pa,
              Ha Long Bay, Ninh Binh, Ha Giang and other famous destinations. Every private journey is designed
              around comfort, privacy and flexibility. Our approach is simple: understand your travel plans,
              prepare every detail with care, and give you the freedom to enjoy the journey at your own pace.
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
            <h2 id="about-values-title">For us, luxury means feeling truly cared for.</h2>
            <div className="hlt-about-values-grid">
              {luxuryValues.map(([title, text, icon]) => (
                <article key={title}>
                  <AboutIcon type={icon} />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* People */}
        <section className="hlt-about-split is-reversed" aria-labelledby="about-people-title">
          <div className="hlt-about-split-media">
            <img src={aboutImages.people} alt="Hoang Luxury Travel driver loading a guest's luggage" loading="lazy" />
          </div>
          <div className="hlt-about-split-copy">
            <Kicker>The People Behind Your Journey</Kicker>
            <h2 id="about-people-title">
              Served with respect.
              <br />
              Prepared with dedication.
            </h2>
            <p>
              Your journey is supported by experienced drivers and a dedicated team who take care of the details,
              confirm every arrangement and remain available throughout your trip. From your first message to your
              final drop-off, we are there to help make every part of the journey feel smooth and well cared for.
            </p>
            <p className="hlt-about-signoff">
              Our driver takes care of the road. Our team takes care of the journey.
            </p>
            {/* Ba điểm chỉ hiện ở mobile (theo mẫu) */}
            <ul className="hlt-about-people-points">
              {peoplePoints.map(([icon, title, text]) => (
                <li key={title}>
                  <AboutIcon type={icon} />
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </li>
              ))}
            </ul>
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
              {commitments.map(([num, title, text, icon]) => (
                <article key={num}>
                  <span className="hlt-about-commitment-num">{num}</span>
                  <AboutIcon type={icon} />
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
                  <p>
                    Hoang Luxury Travel is licensed to provide passenger transport services in Vietnam and operates
                    in compliance with applicable laws and regulations.
                  </p>
                </div>
              </div>
              <div className="hlt-about-licence-grid">
                <div>
                  <AboutIcon type="car" />
                  <div>
                    <h3>Private journeys</h3>
                    <p>A dedicated vehicle for your itinerary.</p>
                  </div>
                </div>
                <div>
                  <AboutIcon type="doc" />
                  <div>
                    <h3>Clear confirmations</h3>
                    <p>Travel details agreed before departure.</p>
                  </div>
                </div>
              </div>
              <div className="hlt-about-licence-foot">
                <span>Transport licence No. 15260263</span>
                <span className="is-gold">hoangluxury.travel</span>
              </div>
            </div>
          </div>
        </section>

        {/* Thư ngỏ của CEO */}
        <section className="hlt-about-ceo" aria-labelledby="about-ceo-title">
          <div className="hlt-container hlt-about-ceo-inner">
            <div className="hlt-about-ceo-media">
              <img src={aboutImages.ceo} alt="Terraced valley in Northern Vietnam at sunrise" loading="lazy" />
            </div>
            <div className="hlt-about-ceo-copy">
              <p className="hlt-about-ceo-kicker">
                <span aria-hidden="true" />
                A Message from the CEO
                <span aria-hidden="true" />
              </p>
              <span className="hlt-about-ceo-diamond" aria-hidden="true" />
              <h2 id="about-ceo-title">A journey often begins long before the day we actually set off.</h2>
              <p>
                It may begin with a wish to see a new part of the world, explore somewhere new with family, return
                to a place full of memories, or take a few days away from our usual routine to experience something
                different.
              </p>
              <p>
                From that first thought, each journey gradually takes shape &ndash; a departure date, a destination,
                the people we will travel with, and the things we hope to see, feel and experience.
              </p>
              <p>
                After being part of thousands of journeys over the years, I have come to understand one thing very
                clearly: no two journeys are the same.
              </p>
              <p>
                Some guests are visiting Vietnam for the first time with their families. Some have looked forward to
                this trip for a long time, eager to spend time with the people they love. Others have travelled a very
                long way just to see, experience and learn more about another country for the first time. Some choose
                to travel alone, stepping away from the hustle and bustle of everyday life to find a little peace and
                quiet. And sometimes, an unplanned stop becomes one of the most memorable moments of all because the
                view outside the window is too beautiful to just drive past.
              </p>
              <p className="hlt-about-ceo-highlight">
                Those moments may seem small, but they are often the ones people remember the longest.
              </p>
              <p>
                Perhaps that is why I have never seen our work as simply taking someone from one place to another.
                Behind every booking is a person with their own plans, their own reasons for travelling and their own
                hopes for the journey ahead.
              </p>
              <p>
                Our role is to support you with care and dedication: to listen carefully, prepare thoughtfully and
                be there when you need us.
              </p>
              <p>
                Along the way, our guests also become part of Hoang Luxury Travel&rsquo;s story. Sometimes, they share
                a photo with us. Sometimes, a few kind words. Some recommend us to their friends; others return to
                travel with us again. And sometimes, it is simply a smile and a thank you at the end of the journey.
              </p>
              <p className="hlt-about-ceo-highlight">For us, that is enough.</p>
              <p>
                We may only be with you for a very small part of your trip, but during that time, we hope you feel
                comfortable, never rushed and always cared for.
              </p>
              <p>
                Your story will always be your own. We are simply grateful to share a part of that journey with you.
              </p>
              {/* Chữ ký bên trái, khẩu hiệu bên phải, nền là nét núi mờ (như mẫu) */}
              <div
                className="hlt-about-ceo-foot"
                style={{ "--about-ceo-art": `url(${curatedMountainDecorationUrl})` }}
              >
                <div className="hlt-about-ceo-sign">
                  <span className="hlt-about-ceo-signature">Hoang Hieu</span>
                  <strong>Hoang Hieu</strong>
                  <span className="hlt-about-ceo-role">CEO, Hoang Luxury Travel</span>
                </div>
                <p className="hlt-about-ceo-tag" aria-hidden="true">People &nbsp;Places &nbsp;A More Meaningful Tomorrow</p>
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
                  <a className="hlt-about-destination" href={getJourneyPageUrl(item.name)} key={item.slug}>
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
