import React from "react";
import {
  benefits,
  bookingRows,
  fleet,
  navLinks,
  routePins,
  routes,
  services,
  whatsappUrl,
  whyItems,
} from "./data";
import logoUrl from "../assets/hoang_luxury_logo_header.png";
import heroBannerUrl from "../assets/home-banner.png";
import serviceAirportUrl from "../assets/service-airport-transfer.png";
import serviceSapaUrl from "../assets/service-sapa.png";
import serviceHaGiangUrl from "../assets/service-ha-giang.png";
import serviceCustomTripUrl from "../assets/service-custom-trip.png";
import vehicleVf9Url from "../assets/vehicle-vinfast-vf9.png";
import vehicleLimoLuxUrl from "../assets/vehicle-limo-lux.png";
import vehicleLimoGreenUrl from "../assets/vehicle-limo-green.png";
import routesStandardUrl from "../assets/routes-standard.png";
import bookingWhatsappUrl from "../assets/booking-whatsapp.png";

function cssImage(url) {
  return { "--img": `url('${url}')` };
}

const serviceImages = {
  airport: serviceAirportUrl,
  sapa: serviceSapaUrl,
  haGiang: serviceHaGiangUrl,
  custom: serviceCustomTripUrl,
};

const fleetImages = {
  vf9: vehicleVf9Url,
  limoLux: vehicleLimoLuxUrl,
  limoGreen: vehicleLimoGreenUrl,
};

function Header() {
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

        <nav className="hlt-nav">
          {navLinks.map(([label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>

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
    <section className="hlt-hero" style={{ "--hero-img": `url(${heroBannerUrl})` }}>
      <div className="hlt-container">
        <div className="hlt-hero-content">
          <div className="hlt-badge">Private Transfer & Custom Journey</div>
          <h1>
            <span className="hlt-hero-title-line">Premium Private</span>
            <span>Car Service</span>
          </h1>
          <p>
            Premium private car service for airport transfer, long-distance travel and custom journeys
            across Northern Vietnam
          </p>
          <div className="hlt-actions">
            <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <span className="hlt-hero-whatsapp-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                </svg>
              </span>
              <span>Book via</span>
            </a>
            <a className="hlt-btn hlt-btn-outline" href="/catalog/">
              View Catalog
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyIcon({ type }) {
  const icons = {
    shield: (
      <>
        <path d="M12 3 5.5 5.5v5.4c0 4.2 2.7 7.8 6.5 9.1 3.8-1.3 6.5-4.9 6.5-9.1V5.5L12 3Z" />
        <path d="m8.8 11.7 2 2 4.4-4.8" />
      </>
    ),
    driver: (
      <>
        <circle cx="12" cy="7.5" r="3" />
        <path d="M5.5 20c.8-4.2 3-6.3 6.5-6.3s5.7 2.1 6.5 6.3" />
        <path d="M9.5 14.5 12 17l2.5-2.5" />
      </>
    ),
    car: (
      <>
        <path d="M5 13h14l-1.4-4.2A2.6 2.6 0 0 0 15.1 7H8.9a2.6 2.6 0 0 0-2.5 1.8L5 13Z" />
        <path d="M4 13v5h3m10 0h3v-5" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5v5l3.5 2" />
      </>
    ),
    lock: (
      <>
        <rect x="6" y="10.5" width="12" height="9" rx="1.4" />
        <path d="M8.8 10.5V8a3.2 3.2 0 0 1 6.4 0v2.5" />
      </>
    ),
    heart: (
      <path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z" />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

function WhyChoose() {
  return (
    <section className="hlt-section hlt-why">
      <div className="hlt-container">
        <div className="hlt-why-heading">
          <p className="hlt-why-eyebrow">Why Choose</p>
          <h2>Hoang Luxury Travel</h2>
          <div className="hlt-why-ornament" />
        </div>

        <div className="hlt-why-cards">
          {whyItems.map((item) => (
            <article className="hlt-why-card" key={item.title}>
              <div className="hlt-icon">
                <WhyIcon type={item.icon} />
              </div>
              <h3>{item.title}</h3>
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
    <section id="services" className="hlt-section hlt-services">
      <div className="hlt-container">
        <div className="hlt-services-heading">
          <p>Our Services</p>
          <h2>Private Transfer Services</h2>
          <div className="hlt-services-ornament" />
        </div>

        <div className="hlt-service-grid">
          {services.map((service) => (
            <article className="hlt-service-card" key={service.title}>
              <div className="hlt-service-image">
                <img src={serviceImages[service.image]} alt={service.title} />
              </div>
              <div className="hlt-service-icon">
                <ServiceIcon type={service.icon} />
              </div>
              <div className="hlt-service-body">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="hlt-services-cta">
          <a href="/services/">
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

function Fleet() {
  return (
    <section id="vehicles" className="hlt-section hlt-fleet">
      <div className="hlt-container">
        <div className="hlt-fleet-heading">
          <p>Our Premium Vehicles</p>
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
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.5 10.5a3.5 3.5 0 1 1 7 0" />
                        <path d="M5.5 19c.7-3.3 2.9-5.1 6.5-5.1s5.8 1.8 6.5 5.1" />
                        <path d="M7 19h10" />
                      </svg>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hlt-fleet-routes" id="routes">
          <img src={routesStandardUrl} alt="Popular private transfer routes" />
        </div>
      </div>
    </section>
  );
}

function BenefitIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 5 42 18 24 43 6 18 24 5Z" />
      <path d="M6 18h36M16 18l8 25 8-25" />
    </svg>
  );
}

function RouteMap() {
  return (
    <div className="hlt-routes-final__map" aria-label="Northern Vietnam route map">
      <div className="hlt-routes-final__map-shape" />
      <svg className="hlt-routes-final__map-art" viewBox="0 0 560 820" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="hlt-gold-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="map-outline" d="M270 25C315 32 341 58 368 77C420 114 472 149 490 205C510 267 472 316 484 376C498 446 526 512 497 584C470 654 418 704 379 775C328 750 319 699 285 664C250 628 210 619 184 574C154 522 104 501 83 445C60 384 86 342 72 284C58 226 33 169 71 119C109 68 205 65 270 25Z" />
        <path className="map-texture" d="M95 150c62-36 104-22 158-50M105 228c78-24 137-13 216-44M98 325c94-48 166-19 264-65M92 430c95-34 192-20 322-53M137 546c109-50 198-17 319-57M186 650c83-28 147-6 214-35" />
        {[
          "M275 477Q258 300 230 116",
          "M275 477Q305 345 306 230",
          "M275 477Q205 358 112 334",
          "M275 477Q373 365 430 290",
          "M275 477Q176 450 78 430",
          "M275 477Q156 530 76 560",
          "M275 477Q355 550 424 610",
          "M275 477Q372 618 450 700",
          "M275 477Q252 610 228 735",
        ].map((d) => (
          <path className="route-line" d={d} key={d} />
        ))}
        <circle className="map-hub-dot" cx="275" cy="477" r="17" />
        <path className="map-hanoi-icon" d="M252 463h46M260 452h30M265 442h20M255 463l7 28h28l7-28M269 442v-15h12v15" />
      </svg>

      <div className="hlt-map-pin hlt-map-pin--hanoi" style={{ "--x": "49%", "--y": "58%" }}>
        <b />
        <span>HANOI</span>
      </div>
      {routePins.map((pin) => (
        <div className="hlt-map-pin" style={{ "--x": pin.x, "--y": pin.y }} key={pin.number}>
          <b>{pin.number}</b>
          <span>{pin.name}</span>
        </div>
      ))}
      <div className="hlt-routes-final__compass">N&nbsp;&nbsp;&nbsp;E&nbsp;&nbsp;&nbsp;S&nbsp;&nbsp;&nbsp;W</div>
    </div>
  );
}

function PopularRoutes() {
  return (
    <section className="hlt-routes-final" id="routes">
      <img className="hlt-routes-image" src={routesStandardUrl} alt="Popular private transfer routes" />
    </section>
  );
}

function Booking() {
  const processSteps = [
    "Quick WhatsApp consultation",
    "Booking confirmation",
    "Professional service",
    "Safe & comfortable journey",
    "On-time drop-off",
    "24/7 support",
  ];

  return (
    <section className="hlt-booking">
      <div className="hlt-container">
        <div className="hlt-booking-panel">
          <article className="hlt-booking-card" aria-label="Booking confirmation">
            <div className="hlt-booking-top">
              <div className="hlt-booking-logo">
                <img src={logoUrl} alt="Hoang Luxury Travel" />
                <strong>Hoang</strong>
              </div>
              <b>Booking Confirmation</b>
              <div className="hlt-booking-id">
                <span>Booking ID</span>
                <strong>HLT21-07-001</strong>
              </div>
            </div>

            <div className="hlt-booking-table">
              {bookingRows.map(([label, value]) => (
                <div className="hlt-booking-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="hlt-booking-note">
              <span>Thank you for choosing Hoang Luxury Travel.</span>
              <em>Hoang Luxury Travel Team</em>
            </div>
          </article>

          <div className="hlt-booking-process">
            <h2>
              Professional Process
              <br />
              Peace of Mind
            </h2>
            <ul>
              {processSteps.map((step) => (
                <li key={step}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m7.8 12.1 2.7 2.7 5.8-6.2" />
                  </svg>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hlt-booking-visual">
            <img src={bookingWhatsappUrl} alt="WhatsApp booking consultation" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
      <footer className="hlt-footer">
        <div className="hlt-container hlt-footer-grid">
          <div className="hlt-footer-brand">
            <img src={logoUrl} alt="Hoang Luxury Travel" />
            <strong>Hoang</strong>
            <span>Luxury Travel</span>
            <div className="hlt-footer-ornament" />
            <p>Premium private car services for international travelers in Northern Vietnam.</p>
          </div>

          <div className="hlt-footer-col">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/catalog/">Catalog</a>
            <a href="/travel-blog/">Travel Blog</a>
            <a href="/contact/">Contact Us</a>
          </div>

          <div className="hlt-footer-col">
            <h4>Services</h4>
            <a href="#services">Airport Transfer</a>
            <a href="#routes">Long-Distance Transfer</a>
            <a href="#services">Custom Private Trip</a>
            <a href="/partner-transfer/">Business / Partner Transfer</a>
          </div>

          <div className="hlt-footer-col hlt-footer-contact">
            <h4>Contact Us</h4>
            <a href="tel:+84912898398">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.3 22.1 1.9 13.7 1.9 3.4c0-.7.6-1.3 1.3-1.3h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.7.6 4 .1.4 0 .8-.3 1.2l-1.7 2.2Z" />
              </svg>
              +84 912 89 83 98
            </a>
            <a href="mailto:info@hoangluxurytravel.com">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.5 6.5h17v11h-17z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              info@hoangluxurytravel.com
            </a>
            <span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2.4" />
              </svg>
              Hanoi, Vietnam
            </span>
          </div>

          <div className="hlt-footer-qr">
            <div className="hlt-footer-whatsapp">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.1 4.9A9.8 9.8 0 0 0 12 2C6.6 2 2.1 6.5 2.1 11.9c0 1.8.5 3.5 1.3 5L2.1 22l5.2-1.4a9.8 9.8 0 0 0 4.7 1.2h.1c5.4 0 9.9-4.4 9.9-9.9 0-2.6-1-5.1-2.9-7Z" />
                <path d="M8.7 7.9c-.2 0-.5.1-.7.4-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2.4.7 2.8.7.4 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.3Z" />
              </svg>
              <span>WhatsApp</span>
            </div>
            <div className="hlt-qr-box" aria-label="WhatsApp QR code">
              <div className="hlt-qr-pattern" />
              <span>☎</span>
            </div>
            <p>Scan to chat with us</p>
          </div>
        </div>

        <div className="hlt-footer-bottom">
          <div className="hlt-container">
            <span>© 2025 Hoang Luxury Travel. All rights reserved.</span>
            <span>
              Proudly based in Hanoi, Vietnam <i className="hlt-vn-flag" aria-label="Vietnam" />
            </span>
          </div>
        </div>
      </footer>
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
      <Booking />
      <Footer />
    </div>
  );
}
