import React, { useEffect } from "react";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import { whatsappUrl } from "./data.js";
import { fleetImages, heroBannerUrl, serviceImages } from "./config/assets.js";
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
  const shapes = {
    pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    car: <><path d="m5 16-2-2v-3l2-5h14l2 5v3l-2 2" /><path d="M4 11h16M7 16v2M17 16v2" /><circle cx="7" cy="14" r="1" /><circle cx="17" cy="14" r="1" /></>,
    tag: <><path d="M3 12V4h8l9 9-8 8-9-9Z" /><circle cx="7.5" cy="7.5" r="1.4" /></>,
    seat: <><circle cx="8.6" cy="4.8" r="2" /><path d="M6.6 8.8c-1.4.7-2.1 2-2.1 3.7V17" /><path d="M4.5 17h7l5.2 2.6M11 12.4h3.2M3 20.4h14.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M7 13.5h.01M12 13.5h.01M17 13.5h.01M7 17.5h.01M12 17.5h.01M17 17.5h.01" /></>,
    driver: <><path d="M7.6 7.4c0-2.4 1.9-3.9 4.4-3.9s4.4 1.5 4.4 3.9" /><path d="M6.2 7.6h11.6" /><circle cx="12" cy="11.6" r="2.7" /><path d="M6 20.5a6 6 0 0 1 12 0" /></>,
    // Cổng chùa - đại diện điểm đón Hà Nội
    pagoda: <><path d="M5 8.6 12 4.4l7 4.2" /><path d="M3.4 9.2h17.2" /><path d="M7 12.4h10M6 18.4h12M3.6 21h16.8" /><path d="M8.2 12.4v6M15.8 12.4v6" /><path d="M10.4 18.4v-3a1.6 1.6 0 0 1 3.2 0v3" /></>,
    mountain: <><path d="m3 18.4 5.6-8.2 3.4 4.9 3-4.4 5.6 7.7H3Z" /><path d="m8.6 10.2 2 2.9M17 10.7l-1.8 2.6" /><path d="M3 21h18" /></>,
    // Vịnh đảo - dùng cho tuyến Hạ Long
    bay: <><path d="M3.6 15.4c1.8 0 1.6-6.4 4.4-6.4s2.6 6.4 4.4 6.4" /><path d="M13.4 15.4c1.4 0 1.3-4.2 3.2-4.2s1.9 4.2 3.4 4.2" /><path d="M3 18.4c1.6 0 1.6 1.2 3.2 1.2s1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2" /></>,
    // Ghim bản đồ kèm vòng tròn ở chân, dùng cho hai đầu đường nối
    marker: <><path d="M12 2.4a4.6 4.6 0 0 1 4.6 4.6c0 3.3-4.6 7.2-4.6 7.2S7.4 10.3 7.4 7A4.6 4.6 0 0 1 12 2.4Z" /><circle cx="12" cy="7" r="1.5" /><circle cx="12" cy="19.4" r="2.6" /></>,
    carFront: <><path d="M4.2 16.4v-3.6c0-.5.2-1 .6-1.4l1.9-1.9c.6-.6 1.3-.9 2.1-.9h6.4c.8 0 1.5.3 2.1.9l1.9 1.9c.4.4.6.9.6 1.4v3.6a1 1 0 0 1-1 1H5.2a1 1 0 0 1-1-1Z" /><path d="M6.6 11.4h10.8" /><circle cx="7.4" cy="14.2" r=".9" /><circle cx="16.6" cy="14.2" r=".9" /><path d="M7.2 17.4v1.4M16.8 17.4v1.4" /></>,
    price: <><circle cx="12" cy="12" r="9" /><path d="M15 9c-.7-.7-1.8-1-3-1-1.7 0-3 .8-3 1.9s1.1 1.7 3 2.1 3 1 3 2.1-1.3 2-3 2c-1.2 0-2.3-.3-3-1M12 6v12" /></>,
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

        <section className="hlt-journey-section">
          <div className="hlt-container">
            <div className="hlt-journey-heading">
              <p className="hlt-journey-kicker">Seamless from start to finish</p>
              <h2>Door-to-Door Private Transfer</h2>
              <p className="hlt-journey-sub">{journey.leadIn}</p>
            </div>

            <div className="hlt-journey-transit">
              <article className="hlt-journey-point">
                <span className="hlt-journey-point-badge">
                  <Icon type="pagoda" />
                </span>
                <div>
                  <p>Pick-up in</p>
                  <h3>Hanoi / Noi Bai</h3>
                  <small>Hotels, Residences or<br />Noi Bai Airport</small>
                </div>
              </article>

              <div className="hlt-journey-path" aria-hidden="true">
                <Icon type="marker" className="hlt-journey-path-pin" />
                <svg className="hlt-journey-path-curve" viewBox="0 0 100 26" preserveAspectRatio="none">
                  <path d="M0 21C34 21 44 5 100 5" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="hlt-journey-path-car"><Icon type="carFront" /></span>
                <svg className="hlt-journey-path-curve" viewBox="0 0 100 26" preserveAspectRatio="none">
                  <path d="M0 5C56 5 66 21 100 21" vectorEffect="non-scaling-stroke" />
                </svg>
                <Icon type="marker" className="hlt-journey-path-pin" />
              </div>

              <article className="hlt-journey-point">
                <span className="hlt-journey-point-badge">
                  <Icon type={journey.badgeIcon} />
                </span>
                <div>
                  <p>Drop-off in</p>
                  <h3>{journey.name}</h3>
                  <small>{journey.dropoffNote}</small>
                </div>
              </article>
            </div>

            <div className="hlt-journey-features">
              {journeyFeatures.map(([icon, title, text]) => (
                <article key={title}>
                  <Icon type={icon} className="hlt-journey-feature-icon" />
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

              {journey.stats.transfers && (
                <div className="hlt-journey-stat">
                  <Icon type="route" className="hlt-journey-stat-icon" />
                  <strong>{journey.stats.transfers}</strong>
                  <span>{journey.stats.transfersLabel}</span>
                </div>
              )}

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
