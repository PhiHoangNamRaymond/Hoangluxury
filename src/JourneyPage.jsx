import React, { useEffect } from "react";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import { whatsappUrl } from "./data.js";
import {
  catalogBackgroundUrl,
  fleetImages,
  heroBannerUrl,
  serviceImages,
} from "./config/assets.js";
import {
  journeyExperience,
  journeyFaq,
  journeyFeatures,
  journeyIncluded,
  journeyVehicles,
  journeys,
} from "./config/journeys.js";

const experienceImages = [
  serviceImages.sapa,
  serviceImages.custom,
  serviceImages.haGiang,
  serviceImages.airport,
];

function Icon({ type, className }) {
  if (type === "carFront") {
    return (
      <svg className={className} viewBox="0 0 512 512" aria-hidden="true" fill="currentColor">
        <path d="M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91m-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85s-28.8 15.95-48 15.95m320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9s-12.8 31.9-32 31.9" />
      </svg>
    );
  }

  const shapes = {
    // Top crest emblem (M-peaks with base)
    emblem: (
      <>
        <path d="M5 13 L9.5 4.5 L14 9.5 L18.5 4.5 L23 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M8 13 L11.5 8 L14 9.5 L16.5 8 L20 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
        <path d="M4 15.5 h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    // Map pin marker with filled dot
    marker: (
      <>
        <path d="M12 21.5 C15.5 17 18 13.5 18 9.5 A6 6 0 1 0 6 9.5 C6 13.5 8.5 17 12 21.5 Z" fill="#b88a38" stroke="#b88a38" strokeWidth="1" />
        <circle cx="12" cy="9.5" r="2.2" fill="#ffffff" stroke="none" />
      </>
    ),
    // Pagoda / Temple with pediment, architrave, 4 pillars & stepped base
    pagoda: (
      <>
        <path d="M3.5 9.5 L12 4 L20.5 9.5 Z" fill="none" stroke="#b88a38" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M3 10 h18" stroke="#b88a38" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 10.5 v8 M10 10.5 v8 M14 10.5 v8 M18 10.5 v8" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M4.5 18.5 h15" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M2.5 20.5 h19" stroke="#b88a38" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    // Mountain peaks for Sapa
    mountain: (
      <>
        <path d="M3 18.5 L8.5 9 L12.5 14 L15.5 9.5 L21 18.5 Z" fill="none" stroke="#b88a38" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8.5 9 L10.5 13.5 M15.5 9.5 L14 13" stroke="#b88a38" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2 19 h20" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    // Luxury reclining seat
    seat: (
      <>
        <circle cx="9.2" cy="4.8" r="1.8" fill="none" stroke="#b88a38" strokeWidth="1.4" />
        <path d="M7.5 8 h3.2 a2 2 0 0 1 2 2 v4.5 a2 2 0 0 0 2 2 h2.6" fill="none" stroke="#b88a38" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 18 h7" stroke="#b88a38" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 10.5 v7" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M17 16.5 l2 2" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    // Calendar with grid
    calendar: (
      <>
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" fill="none" stroke="#b88a38" strokeWidth="1.5" />
        <path d="M8 2.5 v4 M16 2.5 v4 M3.5 9.5 h17" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="7.5" cy="13" r="1" fill="#b88a38" stroke="none" />
        <circle cx="12" cy="13" r="1" fill="#b88a38" stroke="none" />
        <circle cx="16.5" cy="13" r="1" fill="#b88a38" stroke="none" />
        <circle cx="7.5" cy="17" r="1" fill="#b88a38" stroke="none" />
        <circle cx="12" cy="17" r="1" fill="#b88a38" stroke="none" />
        <circle cx="16.5" cy="17" r="1" fill="#b88a38" stroke="none" />
      </>
    ),
    // Chauffeur with peaked cap
    driver: (
      <>
        <path d="M6.5 8 C6.5 5.5 9 4 12 4 s5.5 1.5 5.5 4" fill="none" stroke="#b88a38" strokeWidth="1.4" />
        <path d="M4.5 8.2 h15" stroke="#b88a38" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="11.8" r="2.8" fill="none" stroke="#b88a38" strokeWidth="1.4" />
        <path d="M6.5 20 c0-3 2.5-5 5.5-5 s5.5 2 5.5 5" fill="none" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    // Transparent pricing coin with $
    price: (
      <>
        <circle cx="12" cy="12" r="9.2" fill="none" stroke="#b88a38" strokeWidth="1.5" />
        <path d="M14.5 9.2 c-.6-.7-1.5-1-2.5-1 -1.7 0-2.8 .9-2.8 2 s1 1.7 2.6 2 c1.8 .4 2.8 .9 2.8 2.1 0 1.3-1.2 2.1-2.9 2.1 -1.3 0-2.3-.4-3-1.1 M12 6.5 v11" fill="none" stroke="#b88a38" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    car: <><path d="m5 16-2-2v-3l2-5h14l2 5v3l-2 2" /><path d="M4 11h16M7 16v2M17 16v2" /><circle cx="7" cy="14" r="1" /><circle cx="17" cy="14" r="1" /></>,
    tag: <><path d="M3 12V4h8l9 9-8 8-9-9Z" /><circle cx="7.5" cy="7.5" r="1.4" /></>,
    bay: <><path d="M3.6 15.4c1.8 0 1.6-6.4 4.4-6.4s2.6 6.4 4.4 6.4" /><path d="M13.4 15.4c1.4 0 1.3-4.2 3.2-4.2s1.9 4.2 3.4 4.2" /><path d="M3 18.4c1.6 0 1.6 1.2 3.2 1.2s1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2" /></>,
    passengers: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2" /></>,
    luggage: <><rect x="5" y="7" width="14" height="14" rx="2" /><path d="M9 7V4h6v3M9 11v6M15 11v6" /></>,
    route: <><path d="M4 20c6 0 4-8 10-8s6 8 6 8" /><circle cx="4" cy="20" r="1.5" /></>,
    camera: <><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="12" cy="13.5" r="3.5" /><path d="M9 7l1.5-3h3L15 7" /></>,
    smile: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" /></>,
    road: <><path d="M8 3 5 21M16 3l3 18M12 4v3M12 11v3M12 18v3" /></>,
    sparkle: <><path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" /></>,
    water: <><path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3Z" /></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5Z" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.4 4.2 6.4 4.2 9S15 17.6 12 21c-3-3.4-4.2-6.4-4.2-9S9 6.4 12 3Z" /></>,
    star: <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8L12 3Z" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  };

  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{shapes[type]}</svg>;
}

export default function JourneyPage({ slug }) {
  const journey = journeys[slug];

  // index.html chỉ có một <title> tĩnh dùng chung cho mọi trang; đặt riêng
  // cho từng tuyến để kết quả tìm kiếm không hiện trùng tiêu đề.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `Hanoi to ${journey.name} Private Car Transfer | Hoang Luxury Travel`;

    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");
    description?.setAttribute("content", journey.intro);

    return () => {
      document.title = previousTitle;
      if (previousDescription) description?.setAttribute("content", previousDescription);
    };
  }, [journey]);

  const facts = [
    ["pin", "Route", journey.routeLabel, journey.distance],
    ["clock", "Time", journey.duration, journey.durationNote],
    ["car", "Vehicle", "Limo Lux / Limo Prime /", "VF9 Luxury"],
    ["tag", "Price", journey.price || "On request", "Private transfer"],
  ];

  return (
    <div className="hlt-site hlt-journey-site">
      <Header />

      <main className="hlt-journey">
        <section
          className="hlt-journey-hero"
          style={{ "--journey-hero-img": `url(${heroBannerUrl})` }}
        >
          <div className="hlt-container">
            <div className="hlt-journey-hero-content">
              <p className="hlt-journey-eyebrow">Private Luxury Transfer</p>
              <h1>
                <span>Hanoi</span>
                <span className="hlt-journey-title-accent">{journey.titleAccent}</span>
              </h1>
              <p className="hlt-journey-lead">{journey.intro}</p>
              <div className="hlt-journey-actions">
                <a className="hlt-btn hlt-btn-gold" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <span className="hlt-hero-whatsapp-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.91a9.82 9.82 0 0 0-2.9-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                    </svg>
                  </span>
                  <span>Book via WhatsApp</span>
                </a>
                <a className="hlt-btn hlt-btn-outline" href="/booking/">
                  Request Availability
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="hlt-container">
          <div className="hlt-journey-facts">
            {facts.map(([icon, label, value, note]) => (
              <div className="hlt-journey-fact" key={label}>
                <Icon type={icon} className="hlt-journey-fact-icon" />
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="hlt-journey-section hlt-journey-transit-section">
          <div className="hlt-journey-bg-accent hlt-journey-bg-left" aria-hidden="true">
            <svg viewBox="0 0 320 320" fill="none">
              <path d="M0,0 C130,40 190,140 220,320" stroke="url(#goldGradLeft1)" strokeWidth="1.5" opacity="0.4" />
              <path d="M0,45 C110,85 160,170 185,320" stroke="url(#goldGradLeft2)" strokeWidth="1.2" opacity="0.3" />
              <path d="M0,95 C90,135 130,200 145,320" stroke="url(#goldGradLeft3)" strokeWidth="1" opacity="0.2" />
              <defs>
                <linearGradient id="goldGradLeft1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c5a15a" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c5a15a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="goldGradLeft2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="goldGradLeft3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ecd8ad" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ecd8ad" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="hlt-journey-bg-accent hlt-journey-bg-right" aria-hidden="true">
            <svg viewBox="0 0 320 320" fill="none">
              <path d="M320,0 C190,40 130,140 100,320" stroke="url(#goldGradRight1)" strokeWidth="1.5" opacity="0.4" />
              <path d="M320,45 C210,85 160,170 135,320" stroke="url(#goldGradRight2)" strokeWidth="1.2" opacity="0.3" />
              <path d="M320,95 C230,135 190,200 175,320" stroke="url(#goldGradRight3)" strokeWidth="1" opacity="0.2" />
              <defs>
                <linearGradient id="goldGradRight1" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c5a15a" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c5a15a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="goldGradRight2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="goldGradRight3" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ecd8ad" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ecd8ad" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="hlt-container">
            <div className="hlt-journey-heading">
              <div className="hlt-journey-emblem-wrap">
                <Icon type="emblem" className="hlt-journey-emblem" />
              </div>
              <p className="hlt-journey-kicker">Seamless from start to finish</p>
              <h2>Door-to-Door Private Transfer</h2>
              <div className="hlt-journey-ornament" />
              <p className="hlt-journey-sub">{journey.leadIn}</p>
            </div>

            <div className="hlt-journey-transit">
              <article className="hlt-journey-point">
                <span className="hlt-journey-point-badge">
                  <Icon type="pagoda" />
                </span>
                <div className="hlt-journey-point-info">
                  <p>Pick-up in</p>
                  <h3>Hanoi / Noi Bai</h3>
                  <small>Hotels, Residences or<br />Noi Bai Airport</small>
                </div>
              </article>

              <div className="hlt-journey-path" aria-hidden="true">
                <span className="hlt-journey-path-pin"><Icon type="marker" /></span>
                <span className="hlt-journey-path-line" />
                <span className="hlt-journey-path-car"><Icon type="carFront" /></span>
                <span className="hlt-journey-path-line" />
                <span className="hlt-journey-path-pin"><Icon type="marker" /></span>
              </div>

              <article className="hlt-journey-point">
                <span className="hlt-journey-point-badge">
                  <Icon type={journey.badgeIcon} />
                </span>
                <div className="hlt-journey-point-info">
                  <p>Drop-off in</p>
                  <h3>{journey.name}</h3>
                  <small>{journey.dropoffNote}</small>
                </div>
              </article>
            </div>

            <div className="hlt-journey-features">
              {journeyFeatures.map(([icon, title, text]) => (
                <article key={title} className="hlt-journey-feature-col">
                  <div className="hlt-journey-feature-icon-wrap">
                    <Icon type={icon} className="hlt-journey-feature-icon" />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hlt-journey-section hlt-journey-vehicles">
          <div className="hlt-container">
            <p className="hlt-journey-kicker hlt-journey-kicker-center">Our Vehicles</p>
            <div className="hlt-journey-vehicle-grid">
              {journeyVehicles.map((vehicle) => (
                <article key={vehicle.name}>
                  <div className="hlt-journey-vehicle-img">
                    <img src={fleetImages[vehicle.image]} alt={vehicle.name} />
                  </div>
                  <h3>{vehicle.name}</h3>
                  <div className="hlt-journey-vehicle-specs">
                    <span><Icon type="passengers" />{vehicle.passengers}</span>
                    <span><Icon type="luggage" />{vehicle.luggage}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hlt-journey-section hlt-journey-experience">
          <div className="hlt-container">
            <div className="hlt-journey-heading">
              <p className="hlt-journey-kicker">Our Promise</p>
              <h2 className="hlt-journey-title-serif">Journey Experience</h2>
              <p className="hlt-journey-sub">
                Scenic routes, exceptional comfort, and personalized service
                for a journey that&apos;s as memorable as your destination.
              </p>
            </div>

            <div className="hlt-journey-experience-grid">
              {journeyExperience.map(([icon, title, text], index) => (
                <article key={title}>
                  <img src={experienceImages[index]} alt="" />
                  <div className="hlt-journey-experience-body">
                    <span><Icon type={icon} /></span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hlt-journey-stats">
              <div className="hlt-journey-stat hlt-journey-stat-rating">
                <p>Exceptional service,<br />every time</p>
                <strong>{journey.stats.rating}</strong>
                <div className="hlt-journey-stars" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((star) => <Icon type="star" key={star} />)}
                </div>
                <small>{journey.stats.ratingNote}</small>
              </div>

              {/* Luôn hiện: bảng phải đủ 4 cột ở mọi tuyến. */}
              <div className="hlt-journey-stat">
                <Icon type="route" className="hlt-journey-stat-icon" />
                <strong>{journey.stats.transfers}</strong>
                <span>{journey.stats.transfersLabel}</span>
              </div>

              <div className="hlt-journey-stat">
                <Icon type="globe" className="hlt-journey-stat-icon" />
                <strong>{journey.stats.countries}</strong>
                <span>Countries<br />Served</span>
              </div>

              <div className="hlt-journey-stat">
                <Icon type="headset" className="hlt-journey-stat-icon" />
                <strong>{journey.stats.support}</strong>
                <span>Customer<br />Support</span>
              </div>
            </div>
          </div>
        </section>

        <section className="hlt-journey-section hlt-journey-details">
          <div className="hlt-container hlt-journey-details-grid">
            <div>
              <h2 className="hlt-journey-small-heading">What&apos;s Included</h2>
              <ul className="hlt-journey-included">
                {journeyIncluded.map(([icon, text]) => (
                  <li key={text}>
                    <span><Icon type={icon} /></span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="hlt-journey-small-heading">FAQ</h2>
              <div className="hlt-journey-faq">
                {journeyFaq.map(([question, answer]) => (
                  <details key={question}>
                    <summary>
                      {question}
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Dùng đúng khối CTA của trang chủ. Nó phải là anh em liền kề với
          <Footer /> vì CSS có rule `.hlt-journey-cta + .hlt-footer`. */}
      <JourneyCallToAction />
      <Footer />
    </div>
  );
}
