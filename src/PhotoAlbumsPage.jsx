import React, { useEffect, useMemo, useState } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import {
  aboutImages,
  experienceImages,
  journeyCardImages,
  journeyCtaMountainsUrl,
} from "./config/assets.js";
import { whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

const ALL = "All";
const PER_PAGE = 12;

/* Danh mục theo mẫu; thứ tự này cũng là thứ tự nút lọc. */
const categories = [
  ALL,
  "Natural Journey",
  "Couple & Honeymoon",
  "Local Heritage",
  "Family Memories",
  "Cinematic Travel",
  "Proposal & Celebration",
];

/* Album ảnh: [tiêu đề, địa điểm, danh mục, ảnh].
   Ảnh đang dùng lại kho ảnh sẵn có của trang (ảnh minh hoạ). */
const albums = [
  ["Sapa Sunrise Story", "Sapa", "Natural Journey", journeyCardImages[0]],
  ["Mountain Love Story", "Ha Giang", "Couple & Honeymoon", experienceImages[9].src],
  ["Colors of Local Life", "Ha Giang", "Local Heritage", experienceImages[15].src],
  ["A Family Day in Ninh Binh", "Ninh Binh", "Family Memories", journeyCardImages[2]],
  ["Dreamy Moments in Moc Chau", "Moc Chau", "Natural Journey", journeyCardImages[7]],
  ["She Said Yes", "Sapa", "Proposal & Celebration", experienceImages[13].src],
  ["Golden Terraces", "Mu Cang Chai", "Cinematic Travel", journeyCardImages[6]],
  ["People Make the Journey", "Sapa", "Local Heritage", experienceImages[5].src],
  ["A Peaceful Escape", "Ha Long", "Natural Journey", experienceImages[6].src],
  ["On the Road to Ha Giang", "Ha Giang", "Cinematic Travel", journeyCardImages[3]],
  ["Little Smiles, Big Stories", "Sapa", "Family Memories", experienceImages[16].src],
  ["Sunset Memories in Ha Long", "Ha Long", "Natural Journey", journeyCardImages[1]],
  ["Morning Mist in Ta Xua", "Ta Xua", "Cinematic Travel", journeyCardImages[8]],
  ["Ban Gioc in Bloom", "Cao Bang", "Natural Journey", journeyCardImages[5]],
  ["Island Days in Cat Ba", "Cat Ba", "Family Memories", journeyCardImages[4]],
  ["A Toast to the View", "Sapa", "Couple & Honeymoon", experienceImages[11].src],
].map(([title, place, category, image]) => ({ title, place, category, image }));

function PinIcon() {
  return (
    <svg className="hlt-photo-meta-ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21.5s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="9.2" r="2.5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="hlt-photo-meta-ic" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 15.5 8.5 11l4.5 4 3-2.5 5 4.5" />
      <circle cx="8.3" cy="9" r="1.4" />
    </svg>
  );
}

function ArrowCircle() {
  return (
    <span className="hlt-photo-go" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10.5" />
        <path d="M8 12h8M12.5 8.5 16 12l-3.5 3.5" />
      </svg>
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="hlt-photo-wa" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.8 21.3l4.7-1.2A9.3 9.3 0 1 0 12 2.6Z" />
      <path className="is-fill" d="M8.9 7.6c.3-.3.7-.3.9 0l1.1 1.6c.2.3.2.7-.1 1l-.6.6c.6 1.3 1.7 2.4 3 3l.6-.6c.3-.3.7-.3 1-.1l1.6 1.1c.3.2.3.6 0 .9l-.8.9c-.5.5-1.3.7-2 .4a9.6 9.6 0 0 1-5.1-5.1c-.3-.7-.1-1.5.4-2l1-.8Z" />
    </svg>
  );
}

const ctaPoints = [
  [
    "No obligation",
    <path key="p" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19ZM7.8 12.2l2.9 2.9 5.5-6" />,
  ],
  [
    "Quick response",
    <path
      key="p"
      d="M21 12.2c0 4-4 7.2-9 7.2a11 11 0 0 1-3.3-.5L3.5 20.5l1.6-3.7A6.7 6.7 0 0 1 3 12.2C3 8.2 7 5 12 5s9 3.2 9 7.2Z"
    />,
  ],
  [
    "Tailored to your plans",
    <>
      <rect key="r" x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path key="p" d="M3.5 10h17M8 2.8v4M16 2.8v4M8.5 14h7" />
    </>,
  ],
];

export default function PhotoPage() {
  const pageEntered = usePageEntered();
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Photo Gallery | Hoang Luxury Travel";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const filtered = useMemo(
    () => (activeCategory === ALL ? albums : albums.filter((item) => item.category === activeCategory)),
    [activeCategory]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const selectCategory = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  return (
    <div className={`hlt-site hlt-photo-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />

      <main className="hlt-photo-main">
        {/* Banner */}
        <section
          className="hlt-photo-hero"
          style={{ "--photo-hero": `url(${aboutImages.hero})` }}
          aria-labelledby="photo-title"
        >
          <div className="hlt-container hlt-photo-hero-inner">
            <p className="hlt-photo-kicker">
              Photo Gallery
              <span aria-hidden="true" />
            </p>
            <h1 id="photo-title">
              Real Journeys.
              <br />
              Beautifully Remembered.
            </h1>
            <p className="hlt-photo-lead">
              Explore real photographs from journeys across Northern Vietnam.
              <br />
              Different people. Different stories. The same unforgettable moments.
            </p>
            <p className="hlt-photo-script" aria-hidden="true">
              More Photos
              <span>A More Meaningful Journey</span>
            </p>
          </div>
        </section>

        {/* Bộ lọc + lưới album */}
        <section className="hlt-photo-gallery" aria-label="Photo albums">
          <div className="hlt-container">
            <div className="hlt-photo-filters" role="group" aria-label="Filter albums by category">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`hlt-photo-filter${category === activeCategory ? " is-active" : ""}`}
                  aria-pressed={category === activeCategory}
                  onClick={() => selectCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <p className="hlt-photo-count">
              Showing {filtered.length} album{filtered.length === 1 ? "" : "s"}
            </p>

            <div className="hlt-photo-grid">
              {visible.map((item) => (
                <article className="hlt-photo-card" key={item.title}>
                  <a className="hlt-photo-card-media" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <img src={item.image} alt={`${item.title} – ${item.place}`} loading="lazy" />
                  </a>
                  <div className="hlt-photo-card-body">
                    <div className="hlt-photo-card-text">
                      <h2>{item.title}</h2>
                      <p>
                        <span>
                          <PinIcon />
                          {item.place}
                        </span>
                        <span>
                          <TagIcon />
                          {item.category}
                        </span>
                      </p>
                    </div>
                    <a
                      className="hlt-photo-card-link"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ask about ${item.title}`}
                    >
                      <ArrowCircle />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {pageCount > 1 && (
              <nav className="hlt-photo-pager" aria-label="Album pages">
                <button
                  type="button"
                  className="hlt-photo-page is-arrow"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" /></svg>
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button
                    type="button"
                    key={number}
                    className={`hlt-photo-page${number === currentPage ? " is-active" : ""}`}
                    aria-current={number === currentPage ? "page" : undefined}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  className="hlt-photo-page is-arrow"
                  onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                  disabled={currentPage === pageCount}
                  aria-label="Next page"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
                </button>
              </nav>
            )}
          </div>
        </section>

        {/* CTA */}
        <section
          className="hlt-photo-cta"
          style={{ "--photo-cta-bg": `url(${journeyCtaMountainsUrl})` }}
          aria-labelledby="photo-cta-title"
        >
          <div className="hlt-container hlt-photo-cta-inner">
            <div className="hlt-photo-cta-copy">
              <h2 id="photo-cta-title">Your Story Could Be Next.</h2>
              <p>Tell us your destination and travel date. We&rsquo;ll take care of the details.</p>
              <ul className="hlt-photo-cta-points">
                {ctaPoints.map(([label, shape]) => (
                  <li key={label}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">{shape}</svg>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <a className="hlt-photo-cta-btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Book via WhatsApp
              <svg className="hlt-photo-cta-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </a>
            <p className="hlt-photo-cta-script" aria-hidden="true">
              Beautiful Places
              <span>Meaningful People</span>
              <span>Lasting Memories</span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
