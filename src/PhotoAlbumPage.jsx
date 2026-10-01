import React, { useEffect } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import { photoAlbumBySlug, photoAlbumUrl, photoAlbums } from "./config/photo-albums.js";
import { whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

/* /photo/albums/<slug>/ - xem hết ảnh của một album: ảnh xếp dọc, cỡ lớn,
   tên album ở trên cùng theo đúng kiểu dòng chữ ở trang lưới. */

const ALBUMS_URL = "/photo/albums/";

function WhatsAppIcon() {
  return (
    <svg className="hlt-photo-wa" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.8 21.3l4.7-1.2A9.3 9.3 0 1 0 12 2.6Z" />
      <path
        className="is-fill"
        d="M8.9 7.6c.3-.3.7-.3.9 0l1.1 1.6c.2.3.2.7-.1 1l-.6.6c.6 1.3 1.7 2.4 3 3l.6-.6c.3-.3.7-.3 1-.1l1.6 1.1c.3.2.3.6 0 .9l-.8.9c-.5.5-1.3.7-2 .4a9.6 9.6 0 0 1-5.1-5.1c-.3-.7-.1-1.5.4-2l1-.8Z"
      />
    </svg>
  );
}

export default function PhotoAlbumPage({ slug }) {
  const pageEntered = usePageEntered();
  const album = photoAlbumBySlug[slug];

  useEffect(() => {
    if (!album) return undefined;
    const previousTitle = document.title;
    document.title = `${album.title} | Hoang Luxury Travel`;
    return () => {
      document.title = previousTitle;
    };
  }, [album]);

  if (!album) return null;

  const index = photoAlbums.findIndex((item) => item.slug === album.slug);
  const next = photoAlbums[(index + 1) % photoAlbums.length];

  return (
    <div className={`hlt-site hlt-photo-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />

      <main className="hlt-album-main">
        <section className="hlt-album" aria-labelledby="album-title">
          <div className="hlt-album-inner">
            <a className="hlt-album-back" href={ALBUMS_URL}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5 8 12l7 7" />
              </svg>
              All albums
            </a>

            <p className="hlt-album-eyebrow" id="album-title">
              {album.title}
            </p>
            <p className="hlt-album-meta">
              {album.place} &middot; {album.category}
            </p>

            <div className="hlt-album-photos">
              {album.photos.map((photo, position) => (
                <figure className="hlt-album-photo" key={`${photo}-${position}`}>
                  <img
                    src={photo}
                    alt={`${album.title} ${position + 1}`}
                    loading={position < 2 ? "eager" : "lazy"}
                  />
                </figure>
              ))}
            </div>

            <div className="hlt-album-foot">
              <a className="hlt-album-btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Book a photo experience
              </a>
              <a className="hlt-album-next" href={photoAlbumUrl(next.slug)}>
                Next album: {next.title}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
