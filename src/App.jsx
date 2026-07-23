import React, { useState } from "react";
import {
  bookingRows,
  catalogPageUrl,
  catalogUrl,
  fleet,
  navLinks,
  popularRoutes,
  services,
  whatsappUrl,
  whyItems,
} from "./data";
import logoUrl from "../assets/hoang-luxury-logo-crown-2026.png";
import heroBannerUrl from "../assets/home-banner.png";
import serviceAirportUrl from "../assets/service-airport-transfer.png";
import serviceSapaUrl from "../assets/service-sapa.png";
import serviceHaGiangUrl from "../assets/service-ha-giangv2.jpg";
import serviceCustomTripUrl from "../assets/service-custom-trip.png";
import vehicleVf9Url from "../assets/vehicle-vinfast-vf9.png";
import vehicleLimoLuxUrl from "../assets/vehicle-limo-lux.png";
import vehicleLimoGreenUrl from "../assets/vehicle-limo-green.png";
import whyDriverIconUrl from "../assets/why-icon-driver.png";
import whyVehicleIconUrl from "../assets/why-icon-vehicle.png";
import whyWhatsappIconUrl from "../assets/why-icon-whatsapp.png";
import whyPricingIconUrl from "../assets/why-icon-pricing.png";
import servicesBackgroundUrl from "../assets/services-background.png";
import bookingProcessBackgroundUrl from "../assets/booking-process-background.png";
import whatsappQrUrl from "../assets/whatsapp-qr.png";
import stickyBookDriveIconUrl from "../assets/sticky-book-drive.png";
import vietnamRoutesMapUrl from "../assets/vietnam-routes-map.png";
import routeHaGiangArtUrl from "../assets/route-art-ha-giang.webp";
import routeTaXuaArtUrl from "../assets/route-art-ta-xua.webp";
import routeSaPaArtUrl from "../assets/route-art-sa-pa.webp";
import routeCaoBangArtUrl from "../assets/route-art-cao-bang.webp";
import routeMuCangChaiArtUrl from "../assets/route-art-mu-cang-chai.webp";
import routeMocChauArtUrl from "../assets/route-art-moc-chau.webp";
import routeCatBaArtUrl from "../assets/route-art-cat-ba.webp";
import routeHaLongArtUrl from "../assets/route-art-ha-long.webp";
import routeNinhBinhArtUrl from "../assets/route-art-ninh-binh.webp";

function cssImage(url) {
  return { "--img": `url('${url}')` };
}

const serviceImages = {
  airport: serviceAirportUrl,
  sapa: serviceSapaUrl,
  haGiang: serviceCustomTripUrl,
  custom: serviceHaGiangUrl,
};

const fleetImages = {
  vf9: vehicleVf9Url,
  limoLux: vehicleLimoLuxUrl,
  limoGreen: vehicleLimoGreenUrl,
};

const whyIconImages = {
  driver: whyDriverIconUrl,
  car: whyVehicleIconUrl,
  whatsapp: whyWhatsappIconUrl,
  price: whyPricingIconUrl,
};

const routeArtwork = [
  routeHaGiangArtUrl,
  routeTaXuaArtUrl,
  routeSaPaArtUrl,
  routeCaoBangArtUrl,
  routeMuCangChaiArtUrl,
  routeMocChauArtUrl,
  routeCatBaArtUrl,
  routeHaLongArtUrl,
  routeNinhBinhArtUrl,
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isHomePage = window.location.pathname.replace(/\/+$/, "") === "";

  const scrollToSection = (target) => {
    const headerHeight = document.querySelector(".hlt-header")?.offsetHeight ?? 0;
    const startPosition = window.scrollY;
    const targetPosition = target.getBoundingClientRect().top + startPosition - headerHeight;
    const distance = targetPosition - startPosition;
    const duration = 900;
    let startTime;

    const easeInOutCubic = (progress) =>
      progress < 0.5
        ? 4 * progress ** 3
        : 1 - (-2 * progress + 2) ** 3 / 2;

    const animateScroll = (time) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (progress < 1) requestAnimationFrame(animateScroll);
    };

    requestAnimationFrame(animateScroll);
  };

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
  );
}

function Hero() {
  return (
    <section id="home" className="hlt-hero" style={{ "--hero-img": `url(${heroBannerUrl})` }}>
      <div className="hlt-container">
        <div className="hlt-hero-content">
          <h1>
            <span className="hlt-hero-title-line">Private Luxury</span>
            <span>Car Transfer</span>
          </h1>
          <p>
            Luxury private car services for international travelers across Northern Vietnam, specializing
            in airport transfers, long-distance travel, and bespoke journeys.
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
    </section>
  );
}

function WhyChoose() {
  return (
    <section className="hlt-section hlt-why" aria-labelledby="why-title">
      <div className="hlt-container hlt-why-layout">
        <div className="hlt-why-intro">
          <p className="hlt-why-eyebrow">Why choose</p>
          <div className="hlt-why-eyebrow-line" aria-hidden="true" />
          <h2 id="why-title">
            <span className="hlt-why-title-gold">Hoang<br />Luxury</span>
            <span className="hlt-why-title-ink">Travel?</span>
          </h2>
          <div className="hlt-gold-line" />
          <p>
            <strong>Hoang Luxury Travel</strong> is a 5-star personalized transfer service in Vietnam,
            offering private and comfortable journeys from professional airport pick-ups to Northwest
            mountain tours.
          </p>
        </div>

        <div className="hlt-why-cards">
          {whyItems.map((item) => (
            <article className="hlt-why-card" key={item.title}>
              <div className="hlt-icon">
                <img src={whyIconImages[item.icon]} alt="" />
              </div>
              <h3>{item.title}</h3>
              <div className="hlt-why-card-line" aria-hidden="true" />
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceIcon({ type }) {
  const icons = {
    plane: (
      <>
        <path d="M3.8 12.2 20 5.4l-6.9 16.1-2.4-7.1-6.9-2.2Z" />
        <path d="m10.7 14.4 4-4" />
      </>
    ),
    mountain: (
      <>
        <path d="M3.5 18.5 10 7l3.4 5.7 2-3.1 5.1 8.9H3.5Z" />
        <path d="m8.6 13.1 1.4 1.2 1.7-1.6" />
      </>
    ),
    route: (
      <>
        <path d="M3.5 18.5 10 7l3.4 5.7 2-3.1 5.1 8.9H3.5Z" />
        <path d="M6 18.5c3.2-3.4 7.4-4.6 12.7-4.1" />
      </>
    ),
    dots: (
      <>
        <circle cx="7.2" cy="8.3" r="2.1" />
        <circle cx="16.8" cy="8.3" r="2.1" />
        <circle cx="12" cy="16.3" r="2.1" />
        <path d="M9.1 9.4 10.5 14M14.9 9.4 13.5 14" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

function Services() {
  return (
    <section
      id="services"
      className="hlt-section hlt-services"
      style={{ "--services-bg": `url(${servicesBackgroundUrl})` }}
    >
      <div className="hlt-container">
        <div className="hlt-services-heading">
          <p>Our Services</p>
          <h2>Private Luxury Transfer</h2>
          <div className="hlt-services-ornament" />
        </div>

        <div className="hlt-service-grid">
          {services.map((service, index) => (
            <article className="hlt-service-card" key={service.title}>
              <div className="hlt-service-media">
                <div className="hlt-service-image">
                  <img src={serviceImages[service.image]} alt={service.title} />
                </div>
                <div className="hlt-service-icon">
                  <ServiceIcon type={service.icon} />
                </div>
              </div>
              <div className="hlt-service-body">
                <span className="hlt-service-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="hlt-services-cta">
          <a href="#contact">
            <span>View All Services</span>
            <svg className="hlt-services-chev" viewBox="0 0 18 18" aria-hidden="true">
              <path d="m6.5 3.8 5 5.2-5 5.2" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function FleetSpecIcon({ spec }) {
  const type = spec.toLowerCase();

  if (type.includes("seat")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2" /></svg>;
  }

  if (type.includes("premium")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9L12 2.8Z" /></svg>;
  }

  if (type.includes("comfort")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3.5C12 4 6.2 8.3 5.5 15.6c3.9.9 8-.3 10.7-3.2C18.8 9.7 20 6.5 20 3.5Z" /><path d="M4 20c2.2-4.2 5.5-7.1 10.2-9.2" /></svg>;
  }

  if (type.includes("electric")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.5 2-8 11H12l-1.5 9 8-12H12l1.5-8Z" /></svg>;
  }

  if (type.includes("luxury")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Z" /><path d="M5 21h14" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V4h6v3M4 12h16M10 12v2h4v-2" /></svg>;
}

function Fleet() {
  return (
    <section id="fleet" className="hlt-section hlt-fleet">
      <div className="hlt-container">
        <div className="hlt-fleet-heading">
          <p className="hlt-fleet-kicker">Our Fleet</p>
          <h2>
            <span>Our Luxury</span> <strong>Fleet</strong>
          </h2>
          <div className="hlt-fleet-heading-ornament" />
          <p className="hlt-fleet-subtitle">Premium Selection</p>
        </div>

        <div className="hlt-fleet-grid">
          {fleet.map((vehicle) => (
            <article className="hlt-fleet-card" key={vehicle.name}>
              <h3>{vehicle.name}</h3>
              <div className="hlt-fleet-img">
                <img src={fleetImages[vehicle.image]} alt={vehicle.name} />
              </div>
              <div className="hlt-fleet-body">
                <div className="hlt-fleet-specs">
                  {vehicle.specs.map((spec) => (
                    <span key={spec}>
                      <FleetSpecIcon spec={spec} />
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hlt-fleet-divider" aria-hidden="true" />

        <div className="hlt-route-showcase" id="routes">
          <div className="hlt-route-map" aria-hidden="true">
            <img src={vietnamRoutesMapUrl} alt="" />
          </div>

          <div className="hlt-route-content">
            <div className="hlt-route-heading">
              <p>Curated Journeys</p>
              <h2>Popular Private Transfer Routes</h2>
              <div className="hlt-route-heading-ornament" />
            </div>

            <div className="hlt-route-grid">
              {popularRoutes.map((route, index) => (
                <article className="hlt-route-card" key={route}>
                  <span className="hlt-route-number">{String(index + 1).padStart(2, "0")}</span>
                  {routeArtwork[index] ? (
                    <span className="hlt-route-artwork" aria-hidden="true">
                      <img src={routeArtwork[index]} alt="" />
                    </span>
                  ) : (
                    <span className="hlt-route-mountain" aria-hidden="true">
                      <svg viewBox="0 0 80 42">
                        <path d="M3 37 22 14l10 12L45 6l32 31H3Z" />
                        <path d="m16 37 14-16 10 10 9-12 16 18" />
                      </svg>
                    </span>
                  )}
                  <h3>Hanoi / Noi Bai</h3>
                  <p>{route}</p>
                  <span className="hlt-route-card-ornament" aria-hidden="true" />
                </article>
              ))}
            </div>

            <a className="hlt-route-cta" href="#contact">
              <span className="hlt-route-cta-compass" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 4.8 13.7 10.3 19.2 12l-5.5 1.7L12 19.2l-1.7-5.5L4.8 12l5.5-1.7L12 4.8Z" />
                  <circle cx="12" cy="12" r="1.15" />
                </svg>
              </span>
              <span>View All Routes</span>
              <svg className="hlt-route-cta-arrow" viewBox="0 0 18 18" aria-hidden="true">
                <path d="m6.5 3.8 5 5.2-5 5.2" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

function BookingProcessIcon({ type }) {
  const icons = {
    whatsapp: (
      <>
        <path d="M19.1 4.9A9.8 9.8 0 0 0 12 2C6.6 2 2.1 6.5 2.1 11.9c0 1.8.5 3.5 1.3 5L2.1 22l5.2-1.4a9.8 9.8 0 0 0 4.7 1.2h.1c5.4 0 9.9-4.4 9.9-9.9 0-2.6-1-5.1-2.9-7Z" />
        <path d="M8.7 7.9c.7 3.6 2.7 5.7 6.3 6.6l1.2-1.2 1.8.9c-.2 1.5-1.2 2.3-2.8 2.3-4.4-.5-7.2-3.2-7.7-7.5 0-1.5.8-2.4 2.2-2.6L10 8.1 8.7 7.9Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 3v5M16 3v5M4 10h16M8 14h2M13 14h2M8 17h2M13 17h2" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18M7 15h4" />
      </>
    ),
    car: (
      <>
        <path d="M5 13h14l-1.4-4A2.8 2.8 0 0 0 15 7H9a2.8 2.8 0 0 0-2.6 2L5 13Z" />
        <path d="M4 13v5h3m10 0h3v-5M7 13h10" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

function BookingRowIcon({ label }) {
  const paths = {
    "Customer Name": <><circle cx="12" cy="7" r="3" /><path d="M6.5 20v-2.5a5.5 5.5 0 0 1 11 0V20M6.5 20h11" /></>,
    WhatsApp: <><path d="M19.1 4.9A9.8 9.8 0 0 0 12 2C6.6 2 2.1 6.5 2.1 11.9c0 1.8.5 3.5 1.3 5L2.1 22l5.2-1.4" /><path d="M8.7 7.9c.5 3.5 2.6 5.7 6.2 6.7" /></>,
    Flight: <><path d="m3 13 8-3 5-7 2 1-3 7 5 3-1 2-6-1-3 5-2-1 1-5-6 1Z" /></>,
    Route: <><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    Vehicle: <><path d="M4 14h16l-2-5H6l-2 5Zm1 0v5m14-5v5M7 18h.01M17 18h.01" /></>,
    Service: <><path d="M4 15h16M6 15V9a6 6 0 0 1 12 0v6M3 19h18" /><path d="M12 3V1" /></>,
    "Total Price": <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.7-.7-1.7-1-3-1-1.7 0-3 .8-3 2s1.1 1.8 3 2.2 3 1 3 2.3-1.3 2.5-3 2.5c-1.2 0-2.4-.4-3.2-1.2M12 5v14" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[label]}</svg>;
}

function Contact() {
  const steps = [
    ["whatsapp", "01. Contact Us", "Send us a message via WhatsApp."],
    ["calendar", "02. Confirm Details", "We confirm your booking needs and pricing."],
    ["card", "03. Secure Booking", "Confirm your trip details and onward."],
    ["car", "04. Enjoy Your Trip", "Sit back and enjoy a stress-free ride with us."],
  ];

  return (
    <section
      id="contact"
      className="hlt-booking-showcase"
      style={{ "--booking-process-bg": `url(${bookingProcessBackgroundUrl})` }}
      aria-labelledby="booking-process-title"
    >
      <div className="hlt-container hlt-booking-showcase-main">
        <article className="hlt-showcase-ticket" aria-label="Booking confirmation">
          <header>
            <div className="hlt-showcase-brand">
              <img src={logoUrl} alt="" />
              <div>
                <strong>Hoang</strong>
                <span>Luxury Travel</span>
              </div>
            </div>
            <b>Booking Confirmation</b>
            <div className="hlt-showcase-confirmed">
              <span>Confirm ID</span>
              <strong>#HGLT307-001</strong>
            </div>
          </header>

          <div className="hlt-showcase-ticket-rows">
            <img className="hlt-showcase-watermark" src={logoUrl} alt="" aria-hidden="true" />
            {bookingRows.map(([label, value]) => (
              <div className="hlt-showcase-ticket-row" key={label}>
                <i aria-hidden="true"><BookingRowIcon label={label} /></i>
                <span>{label}</span>
                <b>:</b>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <footer>
            <em>Hoang Luxury Travel</em>
          </footer>
        </article>

        <div className="hlt-process-panel">
          <h2 id="booking-process-title">Booking Process</h2>
          <div className="hlt-process-ornament" />
          <div className="hlt-process-steps">
            {steps.map(([icon, title, text]) => (
              <article className="hlt-process-step" key={title}>
                <div className="hlt-process-icon">
                  <BookingProcessIcon type={icon} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

function JourneyCallToAction() {
  return (
    <section
      className="hlt-booking-showcase-footer hlt-journey-cta"
      aria-labelledby="journey-cta-title"
    >
      <div className="hlt-container">
        <div>
          <h3 id="journey-cta-title">Ready to start your journey?</h3>
          <p>We are here to make your trip comfortable, safe and unforgettable.</p>
        </div>
        <div className="hlt-showcase-actions">
          <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Book via WhatsApp
          </a>
          <a
            className="hlt-btn hlt-btn-outline"
            href={catalogPageUrl}
          >
            View Catalog
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const isHomePage = window.location.pathname.replace(/\/+$/, "") === "";
  const sectionHref = (href) => isHomePage ? href : `/${href}`;

  return (
    <footer className="hlt-footer hlt-footer-compact">
      <div className="hlt-container hlt-footer-grid">
        <div className="hlt-footer-brand">
          <img src={logoUrl} alt="Hoang Luxury Travel" />
          <strong>Hoang</strong>
          <span>Luxury Travel</span>
          <p>Luxury private car services for international travelers in Northern Vietnam.</p>
        </div>

        <div className="hlt-footer-col">
          <h4>Quick Links</h4>
          <a href={sectionHref("#home")}>Home</a>
          <a href={catalogPageUrl}>Catalog</a>
          <a href="/travel-blog/">Travel Blog</a>
          <a href="/booking/">Contact</a>
        </div>

        <div className="hlt-footer-col">
          <h4>Services</h4>
          <a href={sectionHref("#services")}>Airport Transfer</a>
          <a href={sectionHref("#services")}>Long-Distance Private Transfer</a>
          <a href={sectionHref("#services")}>Custom Private Trip</a>
          <a href="/partner-transfer/">Business Partner Transfer</a>
        </div>

        <div className="hlt-footer-col hlt-footer-contact">
          <h4>Contact Us</h4>
          <a href="tel:+84839779888">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.3 22.1 1.9 13.7 1.9 3.4c0-.7.6-1.3 1.3-1.3h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.7.6 4 .1.4 0 .8-.3 1.2l-1.7 2.2Z" />
            </svg>
            +84.839.779.888
          </a>
          <a href="mailto:hoangluxury.travel@gmail.com">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 6.5h17v11h-17z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            hoangluxury.travel@gmail.com
          </a>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            Duplex Villa 68 SP Hanoi, Viet Nam
          </span>
        </div>

        <div className="hlt-footer-qr">
          <div className="hlt-footer-qr-frame">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat via WhatsApp">
              <img src={whatsappQrUrl} alt="WhatsApp QR code" />
            </a>
            <p>WhatsApp</p>
          </div>
          <nav className="hlt-footer-legal" aria-label="Legal links">
            <a href="/privacy-policy/">Privacy Policy</a>
            <a href="/terms/">Terms of Service</a>
          </nav>
        </div>
      </div>

    </footer>
  );
}

function StickyActions() {
  return (
    <aside className="hlt-sticky-actions" aria-label="Quick contact actions">
      <a
        href="/booking/"
        className="hlt-sticky-book"
        title="Book Your Drive"
      >
        <img src={stickyBookDriveIconUrl} alt="" aria-hidden="true" />
        <span>Book Your Drive</span>
      </a>
      <a className="hlt-sticky-phone" href="tel:+84839779888" title="Call +84.839.779.888" aria-label="Call +84.839.779.888">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.3 22.1 1.9 13.7 1.9 3.4c0-.7.6-1.3 1.3-1.3h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.7.6 4 .1.4 0 .8-.3 1.2l-1.7 2.2Z" />
        </svg>
      </a>
    </aside>
  );
}

export default function App() {
  return (
    <div className="hlt-site">
      <Header />
      <Hero />
      <WhyChoose />
      <Services />
      <Fleet />
      <Contact />
      <JourneyCallToAction />
      <Footer />
      <StickyActions />
    </div>
  );
}
