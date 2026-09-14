import React, { useEffect } from "react";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import usePageEntered from "./hooks/usePageEntered.js";
import { catalogPageUrl, whatsappUrl } from "./data.js";
import {
  catalogBackgroundUrl,
  fleetImages,
  heroBannerUrl,
  journeyExperienceImages,
  journeyFactIcons,
} from "./config/assets.js";
import {
  journeyExperience,
  journeyExperienceStats,
  journeyFaq,
  journeyFeatures,
  journeyHighlights,
  journeyVehicles,
  journeys,
} from "./config/journeys.js";

// Icon nét dày bo tròn theo bộ icon khách gửi (điểm đón / trả, dải điểm mạnh),
// vẽ lại bằng SVG để sắc nét; màu và độ dày nét do CSS của từng chỗ quyết định.
function LineIcon({ type, className }) {
  const shapes = {
    shield: (
      <>
        <path d="M50 11C43 18 32 24 18 25v19c0 22 15 36 32 44 17-8 32-22 32-44V25c-14-1-25-7-32-14Z" />
        <path d="m36 51 10 10 20-20" />
      </>
    ),
    calendar: (
      <>
        <rect x="10" y="23" width="80" height="68" rx="9" />
        <path d="M10 40h80" />
        <rect x="24" y="11" width="9" height="23" rx="4.5" />
        <rect x="67" y="11" width="9" height="23" rx="4.5" />
        <rect x="22.5" y="51" width="11.5" height="11.5" rx="1.5" />
        <rect x="44.2" y="51" width="11.5" height="11.5" rx="1.5" />
        <rect x="66" y="51" width="11.5" height="11.5" rx="1.5" />
        <rect x="22.5" y="70" width="11.5" height="11.5" rx="1.5" />
        <rect x="44.2" y="70" width="11.5" height="11.5" rx="1.5" />
        <rect x="66" y="70" width="11.5" height="11.5" rx="1.5" />
      </>
    ),
    chauffeur: (
      <>
        <path d="M24 22 47 13q3-1 6 0l23 9q5 3 1 7l-5 3.5H28L23 29q-4-4 1-7Z" />
        <circle cx="50" cy="23.5" r="3.2" />
        <path d="M28 32.5v4q22-5 44 0v-4M30 37.5q20 7 40 0" />
        <path d="M31 40.5v2.5q-4 0-3.5 5t4.5 5q3 12 18 12.5 15-.5 18-12.5 4 0 4.5-5t-3.5-5v-2.5" />
        <path d="M38 65 22 71q-10 4-10 14v6h76v-6q0-10-10-14l-16-6" />
        <path d="m38 66 5 12-4 3 7 9M62 66l-5 12 4 3-7 9" />
        <path d="M46.5 69h7l2 3-3 5 2 13h-7l2-13-3-5Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="50" cy="50" r="38" />
        <path d="M50 27v23l14 11" />
      </>
    ),
    passenger: (
      <>
        <circle cx="50" cy="32" r="18.5" />
        <path d="M22 87q-4 0-4-4v-5c0-15 14-26 32-26s32 11 32 26v5q0 4-4 4Z" />
      </>
    ),
    luggage: (
      <>
        <path d="M40 28.5V14a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v14.5" />
        <rect x="26.5" y="28.5" width="47" height="55.5" rx="7" />
        <path d="M37.6 41v32M50 41v32M62.4 41v32" />
        <circle cx="34" cy="89" r="3.5" />
        <circle cx="66" cy="89" r="3.5" />
      </>
    ),
    // Xe nhìn chính diện + vòng tròn dấu tích ở góc dưới phải
    carCheck: (
      <>
        <path d="M22 40 29 25q3-5 8-5h26q5 0 8 5l7 15M19 40h61" />
        <rect x="10" y="34" width="8" height="6.5" rx="2" />
        <rect x="81" y="34" width="8" height="6.5" rx="2" />
        <path d="M20 41 13 47.5V74q0 3 3 3h20.5M81 41l6.5 6.5V59" />
        <path d="M13 74v6.5q0 3 3 3h6q3 0 3-3V77" />
        <path d="M15 50.5 31 51.5l2.8 7.4-15.5-.8Z" />
        <path d="M66 51.5 81 50.5l-1.4 5" />
        <path d="M34 51h29l-4.5 11.2h-20Z" />
        <path d="M38.2 55.3h20.6M39.8 58.7h17.4" />
        <rect x="36.5" y="65.5" width="23" height="8.5" rx="2" />
        <circle cx="77.4" cy="71.4" r="15.5" />
        <path d="m70 72.2 4.7 4.8 10.3-10.4" />
      </>
    ),
    star: <path d="M50 10 61.8 34l26.4 3.8-19.1 18.6 4.5 26.3L50 70.3 26.4 82.7l4.5-26.3-19.1-18.6L38.2 34Z" />,
    globe: (
      <>
        <circle cx="50" cy="50" r="38" />
        <path d="M12 50h76M50 12c11 11 16 24 16 38s-5 27-16 38c-11-11-16-24-16-38s5-27 16-38ZM17 31h66M17 69h66" />
      </>
    ),
    headset: (
      <>
        <path d="M18 58v-8a32 32 0 0 1 64 0v8" />
        <rect x="12" y="52" width="14" height="24" rx="6" />
        <rect x="74" y="52" width="14" height="24" rx="6" />
        <path d="M81 76v4a10 10 0 0 1-10 10H58" />
        <rect x="44" y="85.5" width="14" height="9" rx="4.5" />
      </>
    ),
    // ----- Service Highlights -----
    thumbsUp: (
      <>
        <rect x="12" y="44" width="18" height="44" rx="3" />
        <path d="M30 48 44 22q3-7 9-5 6 3 4 11l-4 14h24q8 1 7 9l-5 28q-2 8-10 8H30" />
      </>
    ),
    car: (
      <>
        <path d="M22 40 29 25q3-5 8-5h26q5 0 8 5l7 15M19 40h62" />
        <rect x="10" y="34" width="8" height="6.5" rx="2" />
        <rect x="82" y="34" width="8" height="6.5" rx="2" />
        <path d="M20 41 13 47.5V74q0 3 3 3h68q3 0 3-3V47.5L80 41" />
        <path d="M13 74v6.5q0 3 3 3h6q3 0 3-3V77M87 74v6.5q0 3-3 3h-6q-3 0-3-3V77" />
        <path d="M15 50.5 31 51.5l2.8 7.4-15.5-.8ZM85 50.5 69 51.5l-2.8 7.4 15.5-.8Z" />
        <path d="M38 65h24" />
      </>
    ),
    noPickup: (
      <>
        <circle cx="41" cy="40" r="13.5" />
        <path d="M16 86q-4 0-4-4c0-15 13-26 29-26s29 11 29 26q0 4-4 4Z" />
        <circle cx="75.4" cy="32.7" r="16.5" />
        <path d="m68.4 25.7 14 14M82.4 25.7l-14 14" />
      </>
    ),
    bottle: (
      <>
        <rect x="40" y="7" width="20" height="10" rx="3" />
        <path d="M46 9.5v5M50 9.5v5M54 9.5v5M44 17v4h12v-4" />
        <path d="M44 21 36 30q-2 3-2 6v50q0 5 5 5h22q5 0 5-5V36q0-3-2-6l-8-9" />
        <path d="M34 40h32M34 61h32" />
        <path d="M50 44c-4 5-6 8-6 10.5a6 6 0 0 0 12 0C56 52 54 49 50 44Z" />
        <path d="M34 72q8-4 16 0t16 0M34 81q8-4 16 0t16 0" />
      </>
    ),
    music: (
      <>
        <path d="M36.8 74V24.5L85 13.5v55M36.8 38.5 85 27.5" />
        <circle cx="26" cy="75" r="11" />
        <circle cx="75" cy="68.5" r="11" />
      </>
    ),
    tagPlus: (
      <>
        <path d="M60 15.5h23a5 5 0 0 1 5 5v22q0 3-2 5L42 91q-3 3-6 0L15 70q-3-3 0-6L57 18q1.5-2.5 3-2.5Z" />
        <circle cx="72.6" cy="31.5" r="5" />
        <path d="M50 43v21.5M39.3 53.8h21.4" />
      </>
    ),
    // Hai mũi tên xoay vòng (khứ hồi)
    roundTrip: (
      <>
        <path d="M16.5 43.5C20 28 34 17 50 17s27 7 35 22" />
        <path d="M88.7 29v18l-16.5-7.5" />
        <path d="M83.5 56.5C80 72 66 83 50 83s-27-7-35-22" />
        <path d="M11.3 71V53l16.5 7.5" />
      </>
    ),
    // Hai ghim bản đồ nối bằng đường nét đứt (hành trình tự chọn)
    routePins: (
      <>
        <path d="M22.6 82c-8-9-14-16-14-23.5a14 14 0 0 1 28 0c0 7.5-6 14.5-14 23.5Z" />
        <circle cx="22.6" cy="58.5" r="5.2" />
        <ellipse cx="22.6" cy="85" rx="13.5" ry="4" />
        <path d="M78.7 44c-7-8-12.5-14-12.5-20.8a12.5 12.5 0 0 1 25 0c0 6.8-5.5 12.8-12.5 20.8Z" />
        <circle cx="78.7" cy="23.2" r="4.6" />
        <ellipse cx="78.7" cy="47" rx="12.3" ry="3.6" />
        <path d="M37 81c18-2 35-9 41.5-26" strokeDasharray="5 8" />
      </>
    ),
    pagoda: (
      <>
        <path d="M50 7v8M43.5 16.5h13" />
        <path d="M43.5 16.5Q38 26 26 26q-4 0-3-6M56.5 16.5Q62 26 74 26q4 0 3-6M28 28.5h44" />
        <rect x="34" y="31" width="32" height="7.5" rx="1.5" />
        <path d="M34 38.5Q26 47 15 46q-4 0-2.5-6M66 38.5Q74 47 85 46q4 0 2.5-6M19 51h62" />
        <path d="M28.5 51v24M35.5 51v24M64.5 51v24M71.5 51v24" />
        <path d="M43 75V63a7 7 0 0 1 14 0v12" />
        <rect x="19" y="75" width="62" height="6" rx="1.5" />
        <rect x="11" y="81" width="78" height="10" rx="2" />
      </>
    ),
    mountain: (
      <>
        <path d="M10.5 73h82L66.2 38.3 51.8 57" />
        <path d="M10.5 73 45.5 26.3 59.4 44.7" />
        <path d="M26.3 73 45 48.6 63.8 73" />
      </>
    ),
    bay: (
      <>
        <path d="M14 68c4 0 5-26 15-28 10 2 11 28 16 28" />
        <path d="M44 68c4 0 5-16 13-18 8 2 9 18 14 18" />
        <path d="M70 68c3 0 4-10 9-11 5 1 6 11 9 11" />
        <path d="M10 79q5-4 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      {shapes[type] || shapes.mountain}
    </svg>
  );
}

export default function JourneyPage({ slug }) {
  const journey = journeys[slug];
  const pageEntered = usePageEntered();

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

  // Dải thông tin dưới banner. Cột thứ 5 (href) biến cả ô thành liên kết.
  const facts = [
    [journeyFactIcons.route, "Route", `Hanoi to ${journey.name},`, journey.distance],
    [journeyFactIcons.time, "Time", journey.duration, journey.durationNote],
    [journeyFactIcons.vehicle, "Vehicle", "Limo Lux / Limo Prime /", "VIP Luxury"],
    [journeyFactIcons.rates, "Rates", "View Official Catalog /", "Transparent pricing", catalogPageUrl],
  ];

  // 4 gói hành trình (theo mẫu); "car" dùng icon xe vàng của dải thông tin.
  const journeyOptions = [
    { icon: "car", title: "One-Way Transfer", lines: [`Hanoi / Noi Bai → ${journey.name}`, "Flexible departure."] },
    { icon: "roundTrip", title: "Round Trip", lines: ["Two scheduled transfers", "Return date confirmed."] },
    { icon: "calendar", title: "3 Days 2 Nights", lines: ["Dedicated vehicle throughout", "1 full local service day."], featured: true },
    { icon: "routePins", title: "Custom Trip", lines: ["Built around your plans", "Flexible dates & itinerary."] },
  ];

  return (
    <div
      className={`hlt-site hlt-journey-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}
    >
      <Header />

      <main className="hlt-journey">
        <section
          className="hlt-journey-hero"
          style={{ "--journey-hero-img": `url(${heroBannerUrl})` }}
        >
          <div className="hlt-journey-hero-main">
          <div className="hlt-container">
            <div className="hlt-journey-hero-content">
              <p className="hlt-journey-eyebrow">Private Luxury Transfer</p>
              <h1>
                <span>Hanoi</span>
                <span className="hlt-journey-title-to">to</span>
                {/* --dest-len: CSS co cỡ chữ để tên dài ("Mu Cang Chai") vẫn nằm 1 dòng */}
                <span
                  className="hlt-journey-title-accent"
                  style={{ "--dest-len": journey.name.length }}
                >
                  {journey.name}
                </span>
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
          </div>

          {/* Dải thông tin xanh đậm gắn liền đáy banner */}
          <div className="hlt-journey-hero-facts">
            <div className="hlt-container">
              <div className="hlt-journey-facts">
                {facts.map(([icon, label, value, note, href]) => {
                  const Tag = href ? "a" : "div";
                  return (
                    <Tag className="hlt-journey-fact" key={label} {...(href ? { href } : {})}>
                      <img className="hlt-journey-fact-icon" src={icon} alt="" />
                      <div>
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <small>{note}</small>
                      </div>
                    </Tag>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="hlt-journey-section hlt-journey-transit-section">
          <div className="hlt-container">
            {/* Theo mẫu: chỉ tiêu đề có vạch vàng hai bên + một dòng mô tả */}
            <div className="hlt-journey-heading hlt-journey-heading-lined">
              <h2>Door-to-Door Private Transfer</h2>
              <p className="hlt-journey-sub">{journey.leadIn}</p>
            </div>

            <div className="hlt-journey-transit">
              <article className="hlt-journey-point">
                <p className="hlt-journey-point-label">Pick-up in</p>
                <div className="hlt-journey-point-row">
                  <LineIcon type="pagoda" className="hlt-journey-point-icon" />
                  <div className="hlt-journey-point-info">
                    <h3>Hanoi / Noi Bai</h3>
                    <small>Hotels, Residences or Noi Bai Airport</small>
                  </div>
                </div>
              </article>

              <div className="hlt-journey-path" aria-hidden="true">
                <span className="hlt-journey-path-line is-start" />
                <span className="hlt-journey-path-car">
                  <img src={journeyFactIcons.vehicle} alt="" />
                </span>
                <span className="hlt-journey-path-line is-end" />
              </div>

              <article className="hlt-journey-point">
                <p className="hlt-journey-point-label">Drop-off in</p>
                <div className="hlt-journey-point-row">
                  <LineIcon type={journey.badgeIcon} className="hlt-journey-point-icon" />
                  <div className="hlt-journey-point-info">
                    <h3>{journey.name}</h3>
                    <small>{journey.dropoffNote}</small>
                  </div>
                </div>
              </article>
            </div>

            <div className="hlt-journey-features">
              {journeyFeatures.map(([icon, title, text]) => (
                <article key={title} className="hlt-journey-feature-col">
                  <LineIcon type={icon} className="hlt-journey-feature-icon" />
                  <div className="hlt-journey-feature-text">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hlt-journey-section hlt-journey-vehicles">
          <div className="hlt-container">
            <div className="hlt-journey-heading hlt-journey-heading-lined">
              <h2>Our Vehicles</h2>
            </div>
            <div className="hlt-journey-vehicle-grid">
              {journeyVehicles.map((vehicle) => (
                <article className="hlt-journey-vehicle-card" key={vehicle.name}>
                  <div className="hlt-journey-vehicle-img">
                    <img src={fleetImages[vehicle.image]} alt={vehicle.name} />
                  </div>
                  <div className="hlt-journey-vehicle-body">
                    <h3>{vehicle.name}</h3>
                    <div className="hlt-journey-vehicle-specs">
                      <div className="hlt-journey-vehicle-spec">
                        <LineIcon type="passenger" className="hlt-journey-vehicle-icon" />
                        <div>
                          <strong>{vehicle.passengers}</strong>
                          <small>Passengers</small>
                        </div>
                      </div>
                      <div className="hlt-journey-vehicle-spec">
                        <LineIcon type="luggage" className="hlt-journey-vehicle-icon" />
                        <div>
                          <strong>{vehicle.luggage}</strong>
                          <small>Luggage</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="hlt-journey-vehicle-note">
              <LineIcon type="carCheck" className="hlt-journey-vehicle-note-icon" />
              Your vehicle details are confirmed before departure
            </p>
          </div>
        </section>

        {/* Theo mẫu: 4 gói hành trình, dẫn tới bảng giá hoặc WhatsApp */}
        <section className="hlt-journey-section hlt-journey-options">
          <div className="hlt-container">
            <div className="hlt-journey-heading hlt-journey-heading-lined">
              {/* --title-len: mobile tự thu cỡ chữ để tiêu đề nằm 1 dòng (như mẫu) */}
              <h2 style={{ "--title-len": `Choose Your ${journey.name} Journey`.length }}>
                Choose Your {journey.name} Journey
              </h2>
              <p className="hlt-journey-sub">
                Choose a direct transfer or keep your private vehicle and driver throughout your stay.
              </p>
            </div>

            <div className="hlt-journey-options-grid">
              {journeyOptions.map((option) => (
                <article
                  className={`hlt-journey-option${option.featured ? " is-featured" : ""}`}
                  key={option.title}
                >
                  {option.featured && <span className="hlt-journey-option-badge">Most Popular</span>}
                  {option.icon === "car" ? (
                    <img className="hlt-journey-option-icon" src={journeyFactIcons.vehicle} alt="" />
                  ) : (
                    <LineIcon type={option.icon} className="hlt-journey-option-icon" />
                  )}
                  <h3>{option.title}</h3>
                  <p>{option.lines[0]}<br />{option.lines[1]}</p>
                </article>
              ))}
            </div>

            <p className="hlt-journey-options-note">Detailed rates are available in our official catalog.</p>
            <div className="hlt-journey-options-actions">
              <a className="hlt-btn hlt-btn-gold" href={catalogPageUrl}>View Pricing Catalog</a>
              <a
                className="hlt-btn hlt-journey-btn-dark"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Customize via WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Theo mẫu: nền xanh đậm, 4 thẻ ảnh + dải số liệu dùng chung mọi tuyến */}
        <section className="hlt-journey-section hlt-journey-experience">
          <div className="hlt-container">
            <div className="hlt-journey-heading hlt-journey-heading-lined is-light">
              <h2>Journey Experience</h2>
            </div>

            <div className="hlt-journey-experience-grid">
              {journeyExperience.map(([title, text], index) => (
                <article className="hlt-journey-experience-card" key={title}>
                  <img src={journeyExperienceImages[index]} alt="" loading="lazy" />
                  <div className="hlt-journey-experience-body">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hlt-journey-xstats">
              {journeyExperienceStats.map(([icon, value, label]) => (
                <div className="hlt-journey-xstat" key={label}>
                  <LineIcon type={icon} className="hlt-journey-xstat-icon" />
                  <div>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hlt-journey-section hlt-journey-details">
          <div className="hlt-container">
            {/* Service Highlights (theo mẫu): 6 ô icon + nhãn trong khung viền vàng */}
            <div className="hlt-journey-heading hlt-journey-heading-lined">
              <h2>Service Highlights</h2>
            </div>
            <div className="hlt-journey-highlights">
              {journeyHighlights.map(([icon, text]) => (
                <div className="hlt-journey-highlight" key={text}>
                  <LineIcon type={icon} className="hlt-journey-highlight-icon" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* FREQUENTLY ASKED QUESTIONS (2 cột theo mẫu) */}
            <div className="hlt-jfaq-section">
              <div className="hlt-journey-heading hlt-journey-heading-lined">
                <h2>Frequently Asked Questions</h2>
              </div>

              <div className="hlt-jfaq-grid">
                <div className="hlt-jfaq-col">
                  {journeyFaq.slice(0, Math.ceil(journeyFaq.length / 2)).map(([question, answer]) => (
                    <details key={question} className="hlt-jfaq-item">
                      <summary className="hlt-jfaq-summary">
                        <span>{question}</span>
                        <span className="hlt-jfaq-plus" aria-hidden="true">+</span>
                      </summary>
                      <div className="hlt-jfaq-answer">
                        <p>{answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
                <div className="hlt-jfaq-col">
                  {journeyFaq.slice(Math.ceil(journeyFaq.length / 2)).map(([question, answer]) => (
                    <details key={question} className="hlt-jfaq-item">
                      <summary className="hlt-jfaq-summary">
                        <span>{question}</span>
                        <span className="hlt-jfaq-plus" aria-hidden="true">+</span>
                      </summary>
                      <div className="hlt-jfaq-answer">
                        <p>{answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <JourneyCallToAction />
      <ExperienceSlider />
      <Footer />
    </div>
  );
}
