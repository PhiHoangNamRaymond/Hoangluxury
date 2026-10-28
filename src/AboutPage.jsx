import React, { useEffect, useState } from "react";
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
} from "./config/assets.js";
import { catalogPageUrl, getJourneyPageUrl, whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

/* Phần tử thứ ba là icon, chỉ hiện ở bản mobile */
const luxuryValues = [
  ["Your Time Matters", "We plan around your schedule, so you can travel without feeling rushed.", "clock"],
  ["Space to Relax", "Enjoy the comfort and privacy of having your own space throughout the journey.", "shield"],
  ["Care in Every Detail", "Thoughtful touches make your journey feel more comfortable, personal and effortless.", "diamond"],
];

const commitments = [
  ["01", "Built Around You", "Your plans, preferences and travel needs shape the journey."],
  ["02", "Clarity Before You Travel", "Your trip details, arrangements and agreed price are clearly confirmed in advance."],
  [
    "03",
    "Travel at Your Own Pace",
    "100% private travel with no shared passengers or multiple pick-ups, plus more flexibility with your time and stops.",
  ],
  ["04", "Support When You Need It", "From planning to arrival, we're here whenever you need support."],
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

// Icon nét dùng cho các thẻ ở bản mobile (giá trị, cam kết, giấy phép)
function AboutIcon({ type }) {
  const shapes = {
    shield: (
      <>
        <path d="M12 2.5 20 6v6c0 5-3.4 8.3-8 9.5-4.6-1.2-8-4.5-8-9.5V6Z" />
        <path d="m8.8 12 2.2 2.2 4.2-4.4" />
      </>
    ),
    // Đồng hồ và viên kim cương có mặt cắt theo mẫu mobile (28/10/2026).
    clock: (
      <>
        <circle cx="12" cy="12" r="8.6" />
        <path d="M12 7.4V12l3.2 2.2" />
      </>
    ),
    diamond: (
      <>
        <path d="M7.2 4.2h9.6L21 9.4 12 20.4 3 9.4Z" />
        <path d="M3 9.4h18M9.6 4.2 8.2 9.4 12 20.4l3.8-11-1.4-5.2" />
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

/* Icon WhatsApp đặc nét cho nút vàng của CTA (cặp nút chung với trang chủ). */
function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

/* as="h2": dòng nhỏ chính là tiêu đề của khối (cấu trúc SEO khách duyệt 28/10/2026). */
function Kicker({ children, className = "", as: Tag = "p", id }) {
  return (
    <Tag className={`hlt-about-kicker ${className}`} id={id}>
      <span aria-hidden="true" />
      {children}
    </Tag>
  );
}

export default function AboutPage() {
  const pageEntered = usePageEntered();
  // Mobile: thư CEO thu gọn còn đoạn mở đầu, bấm nút mới mở cả thư (PC luôn mở).
  const [ceoOpen, setCeoOpen] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "About Hoang Luxury Travel | Private Transfers in Vietnam";
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
              {/* H1 theo khách (28/10/2026): "Hoang Luxury Travel’s Story - More Than A
                  Journey"; dấu " - " ẩn, giao diện vẫn là dòng nhỏ + tiêu đề vàng. */}
              <h1 id="about-title">
                <span className="hlt-about-hero-kicker">
                  Hoang Luxury Travel&rsquo;s Story
                  <span aria-hidden="true" />
                </span>
                <span className="hlt-seo-sep"> - </span>
                <span className="hlt-about-hero-title">
                  <span className="is-gold">More Than A Journey</span>
                </span>
              </h1>
              <p className="hlt-about-hero-lead">
                Our story is shaped by the journeys we share with you.
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
            <h2 id="about-approach-title" className="hlt-about-split-title">
              A Personal Approach{" "}
              <br />
              To Every Journey
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
            <img src={aboutImages.approach} alt="Hoang Luxury Travel planning a personalized trip by private car across Northern Vietnam with a map and travel checklist" loading="lazy" />
          </div>
        </section>

        {/* What luxury means */}
        <section className="hlt-about-values" aria-labelledby="about-values-title">
          <div className="hlt-container">
            <h2 id="about-values-title" className="hlt-about-lined-title">What Luxury Means To Us?</h2>
            <div className="hlt-about-values-title">For us, luxury means feeling truly cared for.</div>
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
            <img src={aboutImages.people} alt="Professional driver handling a traveler's luggage outside a hotel during a private transfer" loading="lazy" />
          </div>
          <div className="hlt-about-split-copy">
            <Kicker as="h2" id="about-people-title">The People Behind Your Journey</Kicker>
            <div className="hlt-about-split-title">
              Served with respect.
              <br />
              Prepared with dedication.
            </div>
            <p>
              Your journey is supported by experienced drivers and a dedicated team who take care of the details,
              confirm every arrangement and remain available throughout your trip. From your first message to your
              final drop-off, we are there to help make every part of the journey feel smooth and well cared for.
            </p>
            <p className="hlt-about-signoff">
              Our driver takes care of the road. Our team takes care of the journey.
            </p>
          </div>
        </section>

        {/* Commitments */}
        <section
          id="about-commitments"
          className="hlt-about-commitments"
          style={{ "--about-commitments-bg": `url(${aboutImages.commitments})` }}
          aria-labelledby="about-commitments-title"
        >
          <div className="hlt-container">
            <h2 id="about-commitments-title" className="hlt-about-lined-title is-light">
              Our Commitments To You
            </h2>
            <div className="hlt-about-commitments-grid">
              {commitments.map(([num, title, text]) => (
                <article key={num}>
                  <span className="hlt-about-commitment-num">{num}</span>
                  <div>
                    <h3><span className="hlt-seo-sep">{num}. </span>{title}</h3>
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
                  <h2 id="about-licence-title">Licensed Transport Operator In Vietnam</h2>
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
                    <div className="hlt-about-licence-item-title">Private journeys</div>
                    <p>A dedicated vehicle for your itinerary.</p>
                  </div>
                </div>
                <div>
                  <AboutIcon type="doc" />
                  <div>
                    <div className="hlt-about-licence-item-title">Clear confirmations</div>
                    <p>Travel details agreed before departure.</p>
                  </div>
                </div>
              </div>
              <div className="hlt-about-licence-foot">
                {/* Số giấy phép bọc riêng để bản mobile đưa xuống dòng, chữ to (PC giữ một dòng). */}
                <span>Transport licence No. <span className="hlt-about-licence-no">15260263</span></span>
                <span className="is-gold">hoangluxury.travel</span>
              </div>
            </div>
          </div>
        </section>

        {/* Thư ngỏ của CEO */}
        <section className={`hlt-about-ceo${ceoOpen ? " is-open" : ""}`} aria-labelledby="about-ceo-title">
          <div className="hlt-container hlt-about-ceo-inner">
            <div className="hlt-about-ceo-media">
              <img src={aboutImages.ceo} alt="Golden terraced rice fields stretching across the mountains of Mu Cang Chai, Vietnam" loading="lazy" />
            </div>
            <div className="hlt-about-ceo-copy">
              <h2 id="about-ceo-title" className="hlt-about-ceo-kicker">
                <span aria-hidden="true" />
                A Message from the CEO
                <span aria-hidden="true" />
              </h2>
              <span className="hlt-about-ceo-diamond" aria-hidden="true" />
              <div className="hlt-about-ceo-title">
                Every trip is looked forward to and prepared for long before the day of departure.
              </div>
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
              <button
                type="button"
                className="hlt-about-ceo-more"
                aria-expanded={ceoOpen}
                onClick={() => setCeoOpen(true)}
              >
                Read full message
                <ArrowIcon />
              </button>
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
            {/* Khối ảnh + nút: PC trong suốt (display: contents), mobile là khung viền. */}
            <div className="hlt-about-destinations-panel">
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
              <a className="hlt-about-outline-btn" href="/routes/">
                Explore all destinations
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Match the Blog CTA design while preserving the About actions and copy. */}
      <section className="hlt-cruise-cta-section hlt-blog-story-cta" aria-labelledby="about-cta-title" style={{ backgroundImage: `url(${aboutCtaBackgroundUrl})` }}>
        <div className="hlt-cruise-cta-overlay" aria-hidden="true" />
        <div className="hlt-container hlt-cruise-cta-content">
          <div className="hlt-cruise-cta-text">
            <p className="hlt-blog-story-eyebrow">LOCAL EXPERIENCE. MEANINGFUL JOURNEY</p>
            <div id="about-cta-title" className="hlt-cruise-cta-title">Every Journey Begins with a Conversation?</div>
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
