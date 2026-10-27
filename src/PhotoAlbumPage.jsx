import React, { useEffect, useState } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import { photoAlbumBySlug, photoAlbumUrl, photoAlbums } from "./config/photo-albums.js";
import { whatsappPhotoUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";
import { albumReturnUrl, markAlbumReturn } from "./lib/album-return.js";

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

/* Ảnh xem trước của YouTube: video ngang lấy bản lớn nhất, nếu video không có
   bản đó (YouTube trả về ảnh xám 120px) thì lùi về bản hqdefault luôn có sẵn. */
const youtubeThumb = (id, size) => `https://i.ytimg.com/vi/${id}/${size}.jpg`;

/* Khung video: chỉ hiện ảnh xem trước và nút phát; bấm mới tạo iframe YouTube,
   để trang không phải tải 15 trình phát cùng lúc. Dùng youtube-nocookie để
   YouTube không đặt cookie theo dõi trước khi khách bấm xem. */
function AlbumVideo({ id, title, vertical }) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(youtubeThumb(id, vertical ? "hqdefault" : "maxresdefault"));
  const useFallback = () => setThumb(youtubeThumb(id, "hqdefault"));

  return (
    <figure className={`hlt-album-video${vertical ? " is-short" : ""}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          // Trang đặt Referrer-Policy: no-referrer; YouTube từ chối phát nếu
          // không nhận được nguồn trang nhúng nên khung này gửi riêng origin.
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className="hlt-album-video-play" onClick={() => setPlaying(true)} aria-label={`Play ${title}`}>
          <img
            src={thumb}
            alt=""
            loading="lazy"
            onLoad={(event) => {
              if (event.currentTarget.naturalWidth <= 120) useFallback();
            }}
            onError={useFallback}
          />
          <span className="hlt-album-video-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M9 6.5v11l9-5.5-9-5.5Z" />
            </svg>
          </span>
        </button>
      )}
    </figure>
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
            <a className="hlt-album-back" href={albumReturnUrl(ALBUMS_URL)} onClick={markAlbumReturn}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5 8 12l7 7" />
              </svg>
              All albums
            </a>

            <p className="hlt-album-eyebrow" id="album-title">
              {album.name}
              {album.note && <span className="hlt-album-note"> ({album.note})</span>}
            </p>
            <p className="hlt-album-meta">
              {album.place} &middot; {album.category}
            </p>

            {album.videos && (
              <>
                {album.videos.films.map((id, position) => (
                  <AlbumVideo key={id} id={id} title={`${album.title} – film ${position + 1}`} />
                ))}
                <div className="hlt-album-shorts">
                  {album.videos.shorts.map((id, position) => (
                    <AlbumVideo key={id} id={id} title={`${album.title} – short ${position + 1}`} vertical />
                  ))}
                </div>
              </>
            )}

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
              <a className="hlt-album-btn" href={whatsappPhotoUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Book via Photo
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

      <ExperienceSlider />
      <Footer />
    </div>
  );
}
