import React, { useEffect, useRef, useState } from "react";
import { logoUrl } from "../../config/assets.js";
import { navLinks, whatsappUrl } from "../../data.js";
import BackToTop from "./BackToTop.jsx";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollAnimationFrame = useRef(null);
  const isHomePage = window.location.pathname.replace(/\/+$/, "") === "";

  const cancelScrollAnimation = () => {
    if (scrollAnimationFrame.current === null) return;

    cancelAnimationFrame(scrollAnimationFrame.current);
    scrollAnimationFrame.current = null;
  };

  const scrollToSection = (target) => {
    cancelScrollAnimation();

    const headerHeight = document.querySelector(".hlt-header")?.offsetHeight ?? 0;
    const startPosition = window.scrollY;
    const contentAnchor = target.querySelector("[data-scroll-anchor]");
    const scrollAnchor =
      window.matchMedia("(min-width: 769px)").matches && contentAnchor
        ? contentAnchor
        : target.querySelector("h1, h2") || target;
    const anchorRect = scrollAnchor.getBoundingClientRect();
    const viewportCenter = headerHeight + (window.innerHeight - headerHeight) / 2;
    const targetPosition = Math.max(
      0,
      anchorRect.top + startPosition + anchorRect.height / 2 - viewportCenter
    );
    const distance = targetPosition - startPosition;

    if (Math.abs(distance) < 1) return;

    const duration = 900;
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

  const handleNavigation = (event, href) => {
    setMenuOpen(false);

    if (!href.startsWith("#") || href.length === 1) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    scrollToSection(target);
    window.history.replaceState(null, "", href);
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
            {navLinks.map(([label, href, external]) => {
              const resolvedHref = navigationHref(href);

              return (
                <a
                  href={resolvedHref}
                  key={label}
                  onClick={(event) => handleNavigation(event, resolvedHref)}
                  target={external && href !== "#catalog" ? "_blank" : undefined}
                  rel={external && href !== "#catalog" ? "noopener noreferrer" : undefined}
                >
                  {label}
                </a>
              );
            })}
          </nav>

          <button
            className="hlt-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-controls="primary-navigation"
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
      <BackToTop />
    </>
  );
}
