import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { logoUrl } from "../../config/assets.js";
import { navLinks, routesMenu, whatsappUrl } from "../../data.js";
import BackToTop from "./BackToTop.jsx";

const normalizePath = (pathname) => pathname.replace(/\/+$/, "");

const getInitialActiveHref = () => {
  const currentPath = normalizePath(window.location.pathname);

  if (currentPath === "") {
    return window.location.hash || "#home";
  }

  for (const [, href, children] of navLinks) {
    if (!href.startsWith("#") && normalizePath(new URL(href, window.location.origin).pathname) === currentPath) {
      return href;
    }
    if (children) {
      for (const [, childHref] of children) {
        if (!childHref.startsWith("#") && normalizePath(new URL(childHref, window.location.origin).pathname) === currentPath) {
          return href;
        }
      }
    }
  }

  return "";
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileJourneysOpen, setMobileJourneysOpen] = useState(
    () => getInitialActiveHref() === "/journeys/"
  );
  const [activeHref, setActiveHref] = useState(getInitialActiveHref);
  const scrollAnimationFrame = useRef(null);
  const isHomePage = normalizePath(window.location.pathname) === "";

  const cancelScrollAnimation = () => {
    if (scrollAnimationFrame.current === null) return;

    cancelAnimationFrame(scrollAnimationFrame.current);
    scrollAnimationFrame.current = null;
  };

  // Mốc dừng của một mục: tiêu đề nằm ngay dưới header, chừa một khoảng nhỏ.
  const sectionScrollTop = (target) => {
    // Hero là mục đầu trang: về đúng đỉnh, canh theo tiêu đề sẽ cắt mất phần trên.
    if (target.id === "home") return 0;

    const headerHeight =
      document.querySelector(".hlt-header")?.getBoundingClientRect().height ?? 0;
    const scrollAnchor =
      target.querySelector(
        ".hlt-services-heading, .hlt-fleet-heading, .hlt-route-heading, [data-section-heading]"
      ) || target.querySelector("h1, h2") || target;
    const anchorRect = scrollAnchor.getBoundingClientRect();
    const headingGap = Math.round(
      Math.max(12, Math.min(28, window.innerHeight * 0.025))
    );

    return Math.max(0, anchorRect.top + window.scrollY - headerHeight - headingGap);
  };

  const scrollToSection = (target, onComplete) => {
    cancelScrollAnimation();

    const startPosition = window.scrollY;
    const targetPosition = sectionScrollTop(target);
    const distance = targetPosition - startPosition;

    if (Math.abs(distance) < 1) { onComplete?.(); return; }

    const duration = Math.max(650, Math.min(1000, Math.abs(distance) * 0.42));
    let startTime;

    const easeInOutCubic = (progress) =>
      progress < 0.5
        ? 4 * progress ** 3
        : 1 - (-2 * progress + 2) ** 3 / 2;

    const animateScroll = (time) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);

      window.scrollTo({
        top: startPosition + distance * easeInOutCubic(progress),
        behavior: "instant",
      });

      if (progress < 1) {
        scrollAnimationFrame.current = requestAnimationFrame(animateScroll);
      } else {
        scrollAnimationFrame.current = null;
        onComplete?.();
      }
    };

    scrollAnimationFrame.current = requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    window.addEventListener("wheel", cancelScrollAnimation, { passive: true });
    window.addEventListener("touchstart", cancelScrollAnimation, { passive: true });

    return () => {
      window.removeEventListener("wheel", cancelScrollAnimation);
      window.removeEventListener("touchstart", cancelScrollAnimation);
      cancelScrollAnimation();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  // Mục vàng trên header chỉ đổi khi khách bấm vào nó (hoặc theo trang đang mở),
  // không chạy theo vị trí cuộn — cuộn qua các mục mà đèn vàng nhảy liên tục
  // thì rối mắt.

  // Services/Fleet/Routes từ trang khác: bắt đầu ở đỉnh Home rồi dùng cùng animation
  // với nút trên Home. Chỉ sửa lệch do ảnh/font sau khi cuộn đã hoàn tất.
  useLayoutEffect(() => {
    if (!isHomePage) return undefined;

    const hash = window.location.hash;
    if (!hash || hash.length < 2) return undefined;

    const target = document.getElementById(hash.slice(1));
    if (!target) return undefined;

    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const animateFromTop = ["#services", "#fleet", "#routes"].includes(hash);
    if (animateFromTop) window.scrollTo({ top: 0, behavior: "instant" });

    const DRIFT_TOLERANCE = 24;
    const MAX_CORRECTIONS = 2;

    let aligning = true;
    let animating = false;
    let initialPending = true;
    let corrections = 0;
    let frame = null;
    const timers = [];

    const align = (isFirstJump) => {
      if (!aligning || animating || (!isFirstJump && initialPending)) return;
      if (frame !== null) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        frame = null;
        if (!aligning) return;
        initialPending = false;

        if (isFirstJump && animateFromTop) {
          animating = true;
          scrollToSection(target, () => {
            animating = false;
            align(false);
          });
          return;
        }

        const top = sectionScrollTop(target);

        if (!isFirstJump) {
          // Lệch ít thì bỏ qua, và chỉ sửa tối đa hai lần.
          if (Math.abs(top - window.scrollY) <= DRIFT_TOLERANCE) return;
          if (corrections >= MAX_CORRECTIONS) return;
          corrections += 1;
        }

        cancelScrollAnimation();
        window.scrollTo({ top, behavior: "instant" });
      });
    };

    const correct = () => align(false);

    // Khách tự cuộn thì dừng canh ngay, không giật trang của họ.
    const stopAligning = () => {
      aligning = false;
    };

    align(true);
    window.addEventListener("load", correct);
    timers.push(window.setTimeout(correct, 900));
    timers.push(window.setTimeout(stopAligning, 2200));
    document.fonts?.ready.then(correct).catch(() => {});
    window.addEventListener("wheel", stopAligning, { passive: true });
    window.addEventListener("touchstart", stopAligning, { passive: true });
    window.addEventListener("keydown", stopAligning);
    window.addEventListener("mousedown", stopAligning);

    return () => {
      aligning = false;
      window.removeEventListener("load", correct);
      window.removeEventListener("wheel", stopAligning);
      window.removeEventListener("touchstart", stopAligning);
      window.removeEventListener("keydown", stopAligning);
      window.removeEventListener("mousedown", stopAligning);
      timers.forEach((timer) => window.clearTimeout(timer));
      if (frame !== null) cancelAnimationFrame(frame);
      cancelScrollAnimation();
    };
  }, [isHomePage]);

  // Link "#section" ở footer (Services, Home, Journey…) cuộn giống hệt link header;
  // nếu để trình duyệt tự nhảy anchor thì vị trí dừng lệch so với header.
  useEffect(() => {
    if (!isHomePage) return undefined;

    const handleFooterClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

      const link = event.target.closest?.(".hlt-footer a[href^='#']");
      const href = link?.getAttribute("href");
      if (!href || href.length === 1) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      setActiveHref(href);
      scrollToSection(target);
      window.history.replaceState(null, "", href);
    };

    document.addEventListener("click", handleFooterClick);
    return () => document.removeEventListener("click", handleFooterClick);
  }, [isHomePage]);

  const handleNavigation = (event, href, resolvedHref) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setMenuOpen(false);
    setMobileJourneysOpen(false);
    setActiveHref(href);

    if (!isHomePage || !href.startsWith("#") || href.length === 1) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    scrollToSection(target);
    window.history.replaceState(null, "", resolvedHref);
  };

  const navigationHref = (href) =>
    href.startsWith("#") && !isHomePage ? `/${href}` : href;

  return (
    <>
      <header className="hlt-header">
        <div className="hlt-header-inner">
          <a className="hlt-brand" href="/">
            <img className="hlt-brand-logo" src={logoUrl} alt="Hoang Luxury Travel" />
            <div className="hlt-brand-text">
              <strong>HOANG</strong>
              <span>LUXURY TRAVEL</span>
            </div>
          </a>

          <nav id="primary-navigation" className={`hlt-nav${menuOpen ? " is-open" : ""}`}>
            {navLinks.map(([label, href, children]) => {
              const resolvedHref = navigationHref(href);
              const link = (
                <a
                  className={activeHref === href ? "is-active" : undefined}
                  href={resolvedHref}
                  key={label}
                  aria-current={activeHref === href ? "page" : undefined}
                  onClick={(event) => handleNavigation(event, href, resolvedHref)}
                >
                  {label}
                </a>
              );

              if (!children) return link;

              return (
                <div className="hlt-nav-group" key={label}>
                  {link}
                  <div className="hlt-nav-menu">
                    <a className="hlt-nav-menu-title" href={routesMenu.titleUrl}>
                      {routesMenu.title}
                    </a>

                    <div className="hlt-nav-menu-body">
                      {routesMenu.columns.map((column, columnIndex) => (
                        <div className="hlt-nav-menu-col" key={columnIndex}>
                          {column.map(([childLabel, childHref]) => (
                            <a href={childHref} key={childLabel}>
                              {childLabel}
                            </a>
                          ))}
                        </div>
                      ))}

                      <a className="hlt-nav-menu-cruise" href={routesMenu.cruise.url}>
                        <svg className="hlt-nav-menu-cruise-icon" viewBox="0 0 40 24" aria-hidden="true">
                          <path d="M4 16h32l-3.4 5.2a2 2 0 0 1-1.7.8H9.1a2 2 0 0 1-1.7-.8L4 16Z" />
                          <path d="M8 16V9.4h24V16" />
                          <path d="M13 9.4V6.2h14v3.2" />
                          <path d="M20 6.2V2.4" />
                          <path d="M14 12.6h4M22 12.6h4" />
                        </svg>
                        <span className="hlt-nav-menu-cruise-title">{routesMenu.cruise.title}</span>
                        <span className="hlt-nav-menu-cruise-text">{routesMenu.cruise.text}</span>
                        <span className="hlt-nav-menu-cruise-cta">{routesMenu.cruise.ctaLabel}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <button
            className="hlt-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <a className="hlt-header-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <span className="hlt-phone-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.31-.31.77-.42 1.18-.28 1.3.43 2.7.66 4.11.66.72 0 1.3.58 1.3 1.3v3.44c0 .72-.58 1.3-1.3 1.3C10.28 22.1 1.9 13.72 1.9 3.3 1.9 2.58 2.48 2 3.2 2h3.45c.72 0 1.3.58 1.3 1.3 0 1.41.23 2.8.66 4.11.13.4.03.86-.29 1.18l-1.7 2.2Z" />
              </svg>
            </span>
            <span>WhatsApp Now</span>
          </a>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`hlt-nav-backdrop${menuOpen ? " is-open" : ""}`}
        onClick={() => {
          setMenuOpen(false);
          setMobileJourneysOpen(false);
        }}
        aria-hidden="true"
      />

      {/* Mobile Slide Drawer */}
      <aside
        id="mobile-navigation"
        className={`hlt-mobile-drawer${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile Navigation"
      >
        <button
          className="hlt-mobile-drawer-close"
          type="button"
          aria-label="Close navigation"
          onClick={() => {
            setMenuOpen(false);
            setMobileJourneysOpen(false);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="hlt-mobile-drawer-header">
          <span className="hlt-mobile-drawer-title">M E N U</span>
          <div className="hlt-mobile-drawer-title-line" />
        </div>

        <nav className="hlt-mobile-drawer-nav">
          {[
            ["Home", "#home"],
            ["Services", "#services"],
            ["Fleet", "#fleet"],
          ].map(([label, href]) => {
            const resolvedHref = navigationHref(href);
            const isActive = activeHref === href;
            return (
              <a
                className={`hlt-mobile-nav-link${isActive ? " is-active" : ""}`}
                href={resolvedHref}
                key={label}
                onClick={(event) => handleNavigation(event, href, resolvedHref)}
              >
                {isActive && <span className="hlt-mobile-nav-active-bar" />}
                <span>{label}</span>
              </a>
            );
          })}

          <div className="hlt-mobile-journey-group">
            <div className="hlt-mobile-route-row">
              <a
                className={`hlt-mobile-nav-link${activeHref === "#routes" || activeHref === "/journeys/" ? " is-active" : ""}`}
                href={navigationHref("#routes")}
                onClick={(event) => handleNavigation(event, "#routes", navigationHref("#routes"))}
              >
                {(activeHref === "#routes" || activeHref === "/journeys/") && <span className="hlt-mobile-nav-active-bar" />}
                <span className="hlt-mobile-nav-label">Routes</span>
              </a>
              <button
                className="hlt-mobile-nav-link hlt-mobile-nav-toggle hlt-mobile-route-toggle"
                type="button"
                aria-label={mobileJourneysOpen ? "Close routes menu" : "Open routes menu"}
                aria-expanded={mobileJourneysOpen}
                aria-controls="mobile-journey-menu"
                onClick={() => setMobileJourneysOpen((open) => !open)}
              >
                <svg
                  className={`hlt-mobile-nav-caret${mobileJourneysOpen ? " is-open" : ""}`}
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path d="m3 4.5 3 3 3-3" />
                </svg>
              </button>
            </div>

            <div
              id="mobile-journey-menu"
              className={`hlt-mobile-journey-menu${mobileJourneysOpen ? " is-open" : ""}`}
              aria-hidden={!mobileJourneysOpen}
            >
              {/* Cùng nội dung với menu Routes bản PC: dòng vàng dẫn sang trang
                  tổng hợp, 9 cung đường, rồi thẻ du thuyền Hạ Long. */}
              <div className="hlt-mobile-journey-menu-inner">
                <a
                  className="hlt-mobile-journey-title"
                  href={routesMenu.titleUrl}
                  tabIndex={mobileJourneysOpen ? 0 : -1}
                >
                  {routesMenu.title}
                </a>

                {routesMenu.routes.map(([childLabel, childHref]) => {
                  const isChildActive =
                    normalizePath(new URL(childHref, window.location.origin).pathname) ===
                    normalizePath(window.location.pathname);

                  return (
                    <a
                      className={`hlt-mobile-journey-link${isChildActive ? " is-active" : ""}`}
                      href={childHref}
                      key={childLabel}
                      aria-current={isChildActive ? "page" : undefined}
                      tabIndex={mobileJourneysOpen ? 0 : -1}
                    >
                      {childLabel}
                    </a>
                  );
                })}

                <a
                  className="hlt-mobile-journey-cruise"
                  href={routesMenu.cruise.url}
                  tabIndex={mobileJourneysOpen ? 0 : -1}
                >
                  <svg className="hlt-mobile-journey-cruise-icon" viewBox="0 0 40 24" aria-hidden="true">
                    <path d="M4 16h32l-3.4 5.2a2 2 0 0 1-1.7.8H9.1a2 2 0 0 1-1.7-.8L4 16Z" />
                    <path d="M8 16V9.4h24V16" />
                    <path d="M13 9.4V6.2h14v3.2" />
                    <path d="M20 6.2V2.4" />
                    <path d="M14 12.6h4M22 12.6h4" />
                  </svg>
                  <span className="hlt-mobile-journey-cruise-title">{routesMenu.cruise.title}</span>
                  <span className="hlt-mobile-journey-cruise-text">{routesMenu.cruise.text}</span>
                  <span className="hlt-mobile-journey-cruise-cta">{routesMenu.cruise.ctaLabel}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Các mục còn lại lấy thẳng từ navLinks để panel mobile luôn khớp
              với menu trên header (Catalog, Booking, Feedback, Photo, Blog, About). */}
          {navLinks.filter(([, href]) => !href.startsWith("#")).map(([label, href]) => {
            const resolvedHref = navigationHref(href);
            const isActive = activeHref === href;
            return (
              <a
                className={`hlt-mobile-nav-link${isActive ? " is-active" : ""}`}
                href={resolvedHref}
                key={label}
                onClick={(event) => handleNavigation(event, href, resolvedHref)}
              >
                {isActive && <span className="hlt-mobile-nav-active-bar" />}
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        <div className="hlt-mobile-drawer-footer">
          <img src={logoUrl} alt="" className="hlt-mobile-drawer-watermark" aria-hidden="true" />
          <p className="hlt-mobile-drawer-slogan">LUXURY. COMFORT. PRIVATE.</p>
        </div>
      </aside>

      <BackToTop />
    </>
  );
}
