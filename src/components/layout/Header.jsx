import React, { useEffect, useRef, useState } from "react";
import { logoUrl } from "../../config/assets.js";
import { navLinks, whatsappUrl } from "../../data.js";
import BackToTop from "./BackToTop.jsx";

const normalizePath = (pathname) => pathname.replace(/\/+$/, "");

const getInitialActiveHref = () => {
  const currentPath = normalizePath(window.location.pathname);

  if (currentPath === "") {
    return window.location.hash || "#home";
  }

  return navLinks.find(([, href]) => {
    if (href.startsWith("#")) return false;

    return normalizePath(new URL(href, window.location.origin).pathname) === currentPath;
  })?.[1] || "";
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(getInitialActiveHref);
  const scrollAnimationFrame = useRef(null);
  const isHomePage = normalizePath(window.location.pathname) === "";

  const cancelScrollAnimation = () => {
    if (scrollAnimationFrame.current === null) return;

    cancelAnimationFrame(scrollAnimationFrame.current);
    scrollAnimationFrame.current = null;
  };

  const scrollToSection = (target) => {
    cancelScrollAnimation();

    const headerHeight =
      document.querySelector(".hlt-header")?.getBoundingClientRect().height ?? 0;
    const startPosition = window.scrollY;
    const scrollAnchor =
      target.querySelector(
        ".hlt-services-heading, .hlt-fleet-heading, .hlt-route-heading, [data-section-heading]"
      ) || target.querySelector("h1, h2") || target;
    const anchorRect = scrollAnchor.getBoundingClientRect();
    const headingGap = Math.round(
      Math.max(12, Math.min(28, window.innerHeight * 0.025))
    );
    const targetPosition = Math.max(
      0,
      anchorRect.top + startPosition - headerHeight - headingGap
    );
    const distance = targetPosition - startPosition;

    if (Math.abs(distance) < 1) return;

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
    if (!isHomePage) return undefined;

    const sectionLinks = navLinks.filter(([, href]) => href.startsWith("#"));
    let observerFrame = null;

    const updateActiveSection = () => {
      observerFrame = null;
      if (scrollAnimationFrame.current !== null) return;

      const headerHeight =
        document.querySelector(".hlt-header")?.getBoundingClientRect().height ?? 0;
      const marker = window.scrollY + headerHeight + Math.max(28, window.innerHeight * 0.18);
      let nextHref = "#home";

      sectionLinks.forEach(([, href]) => {
        const section = document.querySelector(href);
        if (section && section.offsetTop <= marker) nextHref = href;
      });

      setActiveHref(nextHref);
    };

    const scheduleUpdate = () => {
      if (observerFrame !== null) return;
      observerFrame = requestAnimationFrame(updateActiveSection);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (observerFrame !== null) cancelAnimationFrame(observerFrame);
    };
  }, [isHomePage]);

  useEffect(() => {
    if (!isHomePage || !window.location.hash) return;

    const target = document.querySelector(window.location.hash);
    if (!target) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToSection(target));
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelScrollAnimation();
    };
  }, [isHomePage]);

  const handleNavigation = (event, href, resolvedHref) => {
    setMenuOpen(false);
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
                  {children && (
                    <svg className="hlt-nav-caret" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="m3 4.5 3 3 3-3" />
                    </svg>
                  )}
                </a>
              );

              if (!children) return link;

              return (
                <div className="hlt-nav-group" key={label}>
                  {link}
                  <div className="hlt-nav-menu">
                    {children.map(([childLabel, childHref]) => {
                      const resolvedChildHref = navigationHref(childHref);
                      return (
                        <a
                          href={resolvedChildHref}
                          key={childLabel}
                          onClick={(event) => handleNavigation(event, childHref, resolvedChildHref)}
                        >
                          {childLabel}
                        </a>
                      );
                    })}
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
        onClick={() => setMenuOpen(false)}
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
          onClick={() => setMenuOpen(false)}
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
            ["Journeys", "/journeys/"],
            ["Catalog", catalogPageUrl],
            ["Booking", "/booking/"],
            ["Contact", "#contact"],
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
        </nav>

        <div className="hlt-mobile-drawer-footer">
          <img src={logoUrl} alt="" className="hlt-mobile-drawer-watermark" aria-hidden="true" />
          <p className="hlt-mobile-drawer-slogan">LUXURY. COMFORT. TRUST.</p>
        </div>
      </aside>

      <BackToTop />
    </>
  );
}
