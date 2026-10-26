import React, { useEffect, useMemo, useState } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import { aboutImages, journeyCtaMountainsUrl } from "./config/assets.js";
import {
  ALL_PHOTO_CATEGORIES,
  photoAlbums,
  photoAlbumUrl,
  photoCategories,
} from "./config/photo-albums.js";
import { whatsappPhotoUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

const ALL = ALL_PHOTO_CATEGORIES;
const PER_PAGE = 12;
const categories = photoCategories;
const albums = photoAlbums;

function WhatsAppIcon() {
  return (
    <svg className="hlt-photo-wa" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.8 21.3l4.7-1.2A9.3 9.3 0 1 0 12 2.6Z" />
      <path className="is-fill" d="M8.9 7.6c.3-.3.7-.3.9 0l1.1 1.6c.2.3.2.7-.1 1l-.6.6c.6 1.3 1.7 2.4 3 3l.6-.6c.3-.3.7-.3 1-.1l1.6 1.1c.3.2.3.6 0 .9l-.8.9c-.5.5-1.3.7-2 .4a9.6 9.6 0 0 1-5.1-5.1c-.3-.7-.1-1.5.4-2l1-.8Z" />
    </svg>
  );
}

/* /photo/albums/?style=<tên danh mục>: mũi tên ở trang /photo/ dẫn sang đây
   kèm sẵn bộ lọc của đúng phong cách vừa bấm. */
function categoryFromUrl() {
  const wanted = new URLSearchParams(window.location.search).get("style");
  if (!wanted) return ALL;
  return categories.find((item) => item.toLowerCase() === wanted.toLowerCase()) || ALL;
}

export default function PhotoAlbumsPage() {
  const pageEntered = usePageEntered();
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Photo Albums | Hoang Luxury Travel";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  /* Album trong mục theo thứ tự danh sách; album được ghim vị trí cho mục này
     (categoryPositions) chen vào đúng ô đã ghim. */
  const filtered = useMemo(() => {
    if (activeCategory === ALL) return albums;
    const inCategory = albums.filter((item) => item.categories.includes(activeCategory));
    const pinned = inCategory
      .filter((item) => item.categoryPositions[activeCategory])
      .sort((a, b) => a.categoryPositions[activeCategory] - b.categoryPositions[activeCategory]);
    const result = inCategory.filter((item) => !item.categoryPositions[activeCategory]);
    for (const item of pinned) result.splice(item.categoryPositions[activeCategory] - 1, 0, item);
    return result;
  }, [activeCategory]);

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
              Real Moments.
              <br />
              Beautifully Captured.
            </h1>
            <p className="hlt-photo-lead">
              Explore photos from real shoots across Northern Vietnam. Discover different
              locations, styles and moments to inspire your own photo shoot.
            </p>
            <p className="hlt-photo-script" aria-hidden="true">
              Every Photo Tells a Story
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

            {filtered.length > 0 && (
              <p className="hlt-photo-count">
                Showing {filtered.length} album{filtered.length === 1 ? "" : "s"}
              </p>
            )}

            <div className="hlt-photo-grid">
              {visible.map((item) => (
                <article className="hlt-photo-card" key={item.title}>
                  <a className="hlt-photo-card-media" href={photoAlbumUrl(item.slug)}>
                    <img src={item.image} alt={`${item.title} – ${item.place}`} loading="lazy" />
                    {item.videos && (
                      <span className="hlt-photo-card-badge">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5-9-5.5Z" /></svg>
                        {item.videos.films.length + item.videos.shorts.length} videos
                      </span>
                    )}
                  </a>
                  <a className="hlt-photo-card-caption" href={photoAlbumUrl(item.slug)}>
                    {item.title}
                  </a>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="hlt-photo-empty">
                New albums for this style are coming soon.{" "}
                <a href={whatsappPhotoUrl} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> to see
                more of our recent work.
              </p>
            )}

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
              <h2 id="photo-cta-title">Ready to Plan Your Photo Shoot?</h2>
              <p>Tell us your destination and preferred date. We&rsquo;ll take care of the details.</p>
            </div>
            <a className="hlt-photo-cta-btn" href={whatsappPhotoUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Book via WhatsApp
              <svg className="hlt-photo-cta-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </a>
            <p className="hlt-photo-cta-script" aria-hidden="true">
              Beautiful Places
              <span>Real Moments</span>
              <span>Lasting Memories</span>
            </p>
          </div>
        </section>
      </main>

      <ExperienceSlider />
      <Footer />
    </div>
  );
}
