import React, { useEffect } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import {
  aboutCeoSignatureUrl,
  aboutDestinationImages,
  aboutImages,
  aboutStatIcons,
  aboutCtaBackgroundUrl,
  logoGoldUrl,
  servicesBackgroundUrl,
} from "./config/assets.js";
import { catalogPageUrl, getJourneyPageUrl, whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

/* Phần tử thứ ba là icon, chỉ hiện ở bản mobile */
const luxuryValues = [
  ["Your Time Matters", "We plan around your schedule, so you can travel without feeling rushed.", "calendar"],
  ["Space to Relax", "Enjoy the comfort and privacy of having your own space throughout the journey.", "shield"],
  ["Care in Every Detail", "Thoughtful touches make your journey feel more comfortable, personal and effortless.", "diamond"],
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
].map(([name, slug], index) => ({ name, slug, image: aboutDestinationImages[index] }));

// 5 ảnh hàng trên, 4 ảnh hàng dưới, theo thứ tự trong mẫu
const destinationRows = [[0, 1, 2, 3, 5], [7, 4, 6, 8]].map((row) => row.map((index) => destinations[index]));

// Dải số liệu dưới banner. Icon là PNG khách gửi, đặt ở assets/about-stats/.
const aboutStats = [
  ["travelers", "12,686+", "Travelers Who Trust Us"],
  ["countries", "20+", "Countries"],
  ["rating", "4.9/5", "Guest Rating"],
  ["support", "24/7", "WhatsApp Support"],
];

function StatIcon({ type }) {
  return <img className="hlt-about-stat-icon" src={aboutStatIcons[type]} alt="" aria-hidden="true" />;
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

/* Bản WhatsApp đặc nét, dùng cho nút vàng chung với trang chủ. Khác
   `WhatsAppIcon` ở trên: cái đó là bản nét mảnh, chỉ dùng ở banner mobile và
   lấy màu nét từ CSS của riêng nút đó. */
function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
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
          style={{ "--about-hero": `url(${aboutImages.heroBanner})` }}
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
            <p className="hlt-about-hero-note">Slow down. Breathe deeply. Let the mountains surround you.</p>
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
          </div>
          <div className="hlt-about-split-media">
            <img src={aboutImages.approach} alt="Planning a private journey through Northern Vietnam" loading="lazy" />
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
            <img src={aboutImages.people} alt="Hoang Luxury Travel driver handling a suitcase at a hotel entrance" loading="lazy" />
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
              <img src={logoGoldUrl} alt="" />
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
              <h2 id="about-ceo-title">
                Every trip is looked forward to and prepared for long before the day of departure.
              </h2>
              <p>
                After many years of accompanying thousands of guests, I have come to understand one thing very
                clearly: no two journeys are ever the same.
              </p>
              <p>
                Behind the journey is a person with their own stories, plans, expectations and reasons for
                travelling. That is why we have never seen our work as simply taking someone from one place to
                another.
              </p>
              <p className="hlt-about-ceo-highlight">
                Private transfer is the service we provide, but the experience throughout the journey is what truly
                matters to us.
              </p>
              <p>
                Our responsibility begins with listening carefully to our guests&rsquo; needs. It continues through
                every stage of preparation, including confirming the itinerary, preparing the vehicle, coordinating
                with the driver and making sure all important details are clear before departure and it does not end
                until your journey is complete.
              </p>
              <p>
                At Hoang Luxury Travel, every trip follows a clear process and is carefully managed. I set high
                standards for professionalism, consistency and attention to detail because I believe even the
                smallest things can make a real difference to your experience.
              </p>
              <p>
                I also believe that trust is not built through grand promises. It is built through the small things
                done properly: arriving on time, providing clear information, preparing the vehicle carefully,
                respecting your privacy and being available whenever you need support.
              </p>
              <p>
                When a guest entrusts us with part of their journey, we understand that they are also entrusting us
                with their time, their safety and their peace of mind. That is a responsibility we always take
                seriously.
              </p>
              <p className="hlt-about-ceo-highlight">
                For me, my wish is very simple: to provide the best possible experience for every guest who chooses
                and trusts us.
              </p>
              <p>
                We may only accompany you for a small part of your time in Vietnam but during that time, I hope you
                feel comfortable, unhurried and genuinely cared for. The journey will always be yours.
              </p>
              <p>
                We are grateful for the trust you place in us and for the opportunity to be part of it.
              </p>
              {/* Chữ ký CEO */}
              <div className="hlt-about-ceo-foot">
                <div className="hlt-about-ceo-sign">
                  <img
                    className="hlt-about-ceo-signature-img"
                    src={aboutCeoSignatureUrl}
                    alt="Hoang Hieu"
                  />
                  <strong>Hoang Hieu</strong>
                  <span className="hlt-about-ceo-role">CEO, Hoang Luxury Travel</span>
                </div>
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
            <p className="hlt-about-destinations-sub">Breathtaking places. Unforgettable experiences.</p>
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

      </main>

      {/* Match the Blog CTA design while preserving the About actions and copy. */}
      <section className="hlt-cruise-cta-section hlt-blog-story-cta" aria-labelledby="about-cta-title" style={{ backgroundImage: `url(${aboutCtaBackgroundUrl})` }}>
        <div className="hlt-cruise-cta-overlay" aria-hidden="true" />
        <div className="hlt-container hlt-cruise-cta-content">
          <div className="hlt-cruise-cta-text">
            <p className="hlt-blog-story-eyebrow">LOCAL EXPERIENCE. MEANINGFUL JOURNEY</p>
            <h2 id="about-cta-title">Every Journey Begins with a Conversation?</h2>
            <p className="hlt-blog-story-description">Share your plans. Let us take care of the details.</p>
          </div>
          {/* Cặp nút chung của trang chủ: nút vàng đặc + nút viền. */}
          <div className="hlt-blog-story-actions">
            <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <span className="hlt-hero-whatsapp-icon" aria-hidden="true"><WhatsAppMark /></span>
              Book via WhatsApp
            </a>
            <a className="hlt-btn hlt-btn-outline" href={catalogPageUrl}>View Catalog</a>
          </div>
        </div>
      </section>
      <ExperienceSlider />
      <Footer />
    </div>
  );
}
