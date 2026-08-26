import React, { useCallback, useEffect, useRef, useState } from "react";
import { heroSlideImages, heroSlideMobileImages } from "../../config/assets.js";
import { catalogPageUrl, heroSlides, whatsappUrl } from "../../data.js";

// Một vòng = 5 slide x (6000 + 900) ~ 30 giây.
const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 900;
const SWIPE_THRESHOLD = 40;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(() => new Set([0]));
  // Trang có thể mở sẵn ở tab nền, nên lấy trạng thái ẩn ngay từ đầu
  // thay vì chờ sự kiện visibilitychange đầu tiên.
  const [paused, setPaused] = useState(() => document.hidden);
  const [leaving, setLeaving] = useState(null);
  const touchStartX = useRef(null);
  const currentIndex = useRef(0);
  // Bản sao của `loaded` cho bộ đếm autoplay đọc, để việc preload xong một ảnh
  // không lọt vào dependency và làm đặt lại đồng hồ 6 giây đang chạy.
  const loadedRef = useRef(loaded);

  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  const goTo = useCallback((next) => {
    setIndex((next + heroSlides.length) % heroSlides.length);
  }, []);

  // Slide cũ giữ nguyên độ mờ đục ở lớp dưới trong lúc slide mới mờ chồng lên,
  // nếu để cả hai cùng fade thì giữa nhịp chuyển sẽ bị hụt sáng.
  useEffect(() => {
    if (currentIndex.current === index) return undefined;

    setLeaving(currentIndex.current);
    currentIndex.current = index;

    const timer = window.setTimeout(() => setLeaving(null), TRANSITION_DURATION);
    return () => window.clearTimeout(timer);
  }, [index]);

  // Slide đầu tải ngay; 4 slide sau nạp nền sau khi trang đã vẽ xong,
  // để hero không phải chờ ~9.6 MB ảnh trước lần hiển thị đầu tiên.
  useEffect(() => {
    let cancelled = false;

    const preloadRest = () => {
      heroSlides.forEach((slide, slideIndex) => {
        if (slideIndex === 0) return;

        const image = new Image();
        image.decoding = "async";
        // Ảnh hỏng vẫn phải đánh dấu xong, nếu không autoplay sẽ chờ mãi.
        const markLoaded = () => {
          if (cancelled) return;
          setLoaded((current) => new Set(current).add(slideIndex));
        };

        image.onload = markLoaded;
        image.onerror = markLoaded;
        image.src = heroSlideImages[slide.image];
      });
    };

    const schedule = () =>
      window.requestIdleCallback
        ? window.requestIdleCallback(preloadRest, { timeout: 2500 })
        : window.setTimeout(preloadRest, 900);

    if (document.readyState === "complete") {
      schedule();
      return () => {
        cancelled = true;
      };
    }

    window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setPaused(document.hidden);

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (paused) return undefined;

    let timer;
    const advance = () => {
      const next = (index + 1) % heroSlides.length;
      // Chưa nạp xong thì chờ thêm, tránh crossfade sang một ô trống.
      if (loadedRef.current.has(next)) {
        goTo(next);
        return;
      }
      timer = window.setTimeout(advance, 500);
    };

    timer = window.setTimeout(advance, SLIDE_DURATION);
    return () => window.clearTimeout(timer);
  }, [index, paused, goTo]);

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    goTo(index + (distance < 0 ? 1 : -1));
  };

  const slideStyle = (slide, slideIndex) => {
    if (!loaded.has(slideIndex)) return undefined;

    const mobileImage = heroSlideMobileImages[slide.image];
    return {
      "--slide-img": `url(${heroSlideImages[slide.image]})`,
      ...(mobileImage && { "--slide-mobile-img": `url(${mobileImage})` }),
    };
  };

  return (
    <section
      id="home"
      className="hlt-hero"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hlt-hero-stage" aria-hidden="true">
        {heroSlides.map((slide, slideIndex) => (
          <div
            className={
              "hlt-hero-slide" +
              (slideIndex === index ? " is-active" : "") +
              (slideIndex === leaving ? " is-leaving" : "")
            }
            key={slide.image}
          >
            <div
              className="hlt-hero-slide-image"
              style={slideStyle(slide, slideIndex)}
            />
          </div>
        ))}
      </div>
      <div className="hlt-hero-scrim" aria-hidden="true" />

      <div className="hlt-container">
        {/* Scalloped concave corner frame overlay for mobile */}
        <div className="hlt-hero-mobile-frame" aria-hidden="true">
          <svg
            className="hlt-hero-scallop-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 0,6 A 6,6 0 0,1 6,0 L 94,0 A 6,6 0 0,1 100,6 L 100,94 A 6,6 0 0,1 94,100 L 6,100 A 6,6 0 0,1 0,94 Z"
              stroke="rgba(197, 161, 90, 0.55)"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="hlt-hero-content">
          <p className="hlt-hero-kicker">PRIVATE · PREMIUM · PERSONALIZED</p>
          <h1 className="hlt-hero-title">
            <span className="hlt-hero-title-white">PRIVATE</span>
            <span className="hlt-hero-title-white">LUXURY</span>
            <span className="hlt-hero-title-gold">CAR TRANSFER</span>
          </h1>

          <div className="hlt-hero-crown-divider" aria-hidden="true">
            <span className="hlt-hero-crown-line" />
            <svg viewBox="0 0 20 14" fill="currentColor" className="hlt-hero-crown-svg">
              <path d="M1 11.5h18v1.8H1v-1.8zm1.2-2.5l2.4-5.8 3.8 3.2 2.6-4.8 2.6 4.8 3.8-3.2 2.4 5.8H2.2z" />
            </svg>
            <span className="hlt-hero-crown-line" />
          </div>

          <p className="hlt-hero-desc">
            Premium private car services across Northern Vietnam. From airport transfers to long-distance journeys, we deliver comfort, discretion, and punctuality at every mile.
          </p>

          <div className="hlt-actions">
            <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <span className="hlt-hero-whatsapp-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                </svg>
              </span>
              <span>Book via WhatsApp</span>
            </a>
            <a
              className="hlt-btn hlt-btn-outline"
              id="catalog"
              href={catalogPageUrl}
            >
              View Catalog
            </a>
          </div>
        </div>
      </div>

      <button
        className="hlt-hero-arrow is-prev"
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
      </button>
      <button
        className="hlt-hero-arrow is-next"
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
      </button>

      <div className="hlt-hero-dots">
        {heroSlides.map((slide, slideIndex) => (
          <button
            className={`hlt-hero-dot${slideIndex === index ? " is-active" : ""}`}
            key={slide.image}
            type="button"
            aria-label={slide.alt}
            aria-current={slideIndex === index ? "true" : undefined}
            onClick={() => goTo(slideIndex)}
          />
        ))}
      </div>
    </section>
  );
}
