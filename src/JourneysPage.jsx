import React from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import usePageEntered from "./hooks/usePageEntered.js";
import { whatsappUrl, catalogPageUrl } from "./data.js";
import { journeyCardImages, journeyIconImages, journeyPickupIconUrl } from "./config/assets.js";

const allRoutesData = [
  {
    num: "01",
    name: "SA PA",
    slug: "sapa",
    image: journeyCardImages[0],
    icon: journeyIconImages[0],
    routeLine: "Hanoi → Sa Pa",
    time: "5-6 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Sa Pa",
    dropoffNote: "Hotels, Resorts or Town Center",
  },
  {
    num: "02",
    name: "HA LONG",
    slug: "ha-long",
    image: journeyCardImages[1],
    icon: journeyIconImages[1],
    routeLine: "Hanoi → Ha Long",
    time: "2.5-3.0 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Ha Long",
    dropoffNote: "Hotels, Resorts or Cruise Harbour",
  },
  {
    num: "03",
    name: "NINH BINH",
    slug: "ninh-binh",
    image: journeyCardImages[2],
    icon: journeyIconImages[2],
    routeLine: "Hanoi → Ninh Binh",
    time: "1.5-2.0 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Ninh Binh",
    dropoffNote: "Hotels, Resorts or Tam Coc / Trang An",
  },
  {
    num: "04",
    name: "HA GIANG",
    slug: "ha-giang",
    image: journeyCardImages[3],
    icon: journeyIconImages[3],
    routeLine: "Hanoi → Ha Giang",
    time: "6.0-7.0 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Ha Giang",
    dropoffNote: "Hotels, Homestays or City Center",
  },
  {
    num: "05",
    name: "CAT BA",
    slug: "cat-ba",
    image: journeyCardImages[4],
    icon: journeyIconImages[4],
    routeLine: "Hanoi → Cat Ba",
    time: "3.5-4.0 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Cat Ba Island",
    dropoffNote: "Hotels, Resorts or Town Center",
  },
  {
    num: "06",
    name: "CAO BANG",
    slug: "cao-bang",
    image: journeyCardImages[5],
    icon: journeyIconImages[5],
    routeLine: "Hanoi → Cao Bang",
    time: "6.0-7.0 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Cao Bang",
    dropoffNote: "Hotels, Homestays or Ban Gioc Area",
  },
  {
    num: "07",
    name: "MU CANG CHAI",
    slug: "mu-cang-chai",
    image: journeyCardImages[6],
    icon: journeyIconImages[6],
    routeLine: "Hanoi → Mu Cang Chai",
    time: "6.5-7.5 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Mu Cang Chai",
    dropoffNote: "Hotels, Resorts or Terraced Valleys",
  },
  {
    num: "08",
    name: "MOC CHAU",
    slug: "moc-chau",
    image: journeyCardImages[7],
    icon: journeyIconImages[7],
    routeLine: "Hanoi → Moc Chau",
    time: "4.0-4.5 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Moc Chau",
    dropoffNote: "Hotels, Resorts or Farmstay Areas",
  },
  {
    num: "09",
    name: "TA XUA",
    slug: "ta-xua",
    image: journeyCardImages[8],
    icon: journeyIconImages[8],
    routeLine: "Hanoi → Ta Xua",
    time: "4.5-5.5 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Ta Xua",
    dropoffNote: "Hotels, Homestays or Town Center",
  },
];

// "MU CANG CHAI" -> "Mu Cang Chai" cho bố cục gọn trên mobile.
const titleCase = (value) =>
  value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

function CompactIcon({ type }) {
  const shapes = {
    time: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.4 2" /></>,
    vehicle: <><path d="M4.4 16.2v-3.4c0-.5.2-1 .5-1.3l1.8-1.8c.5-.5 1.2-.8 2-.8h6.6c.8 0 1.5.3 2 .8l1.8 1.8c.3.3.5.8.5 1.3v3.4a1 1 0 0 1-1 1H5.4a1 1 0 0 1-1-1Z" /><path d="M6.8 11.3h10.4" /><circle cx="7.6" cy="14" r=".85" /><circle cx="16.4" cy="14" r=".85" /></>,
    service: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2.1" /></>,
  };

  return (
    <span className="hlt-jcard-compact-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">{shapes[type]}</svg>
    </span>
  );
}

const guarantees = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Private & Safe",
    desc: "Professional drivers and reliable journey",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Flexible Schedule",
    desc: "Depart anytime that suits your plans",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.6 5H8.4a2 2 0 0 0-1.9 1.3L5 10 3 8" />
        <rect x="3" y="10" width="18" height="8" rx="2" />
        <path d="M7 14h.01M17 14h.01M5 18v2M19 18v2" />
      </svg>
    ),
    title: "Door-to-Door",
    desc: "Pick-up and drop-off at your exact location",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <circle cx="10" cy="9" r="1.5" />
      </svg>
    ),
    title: "Clear Quotations",
    desc: "Everything confirmed before your journey",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    title: "24/7 Support",
    desc: "We're here to assist you anytime",
  },
];

export default function JourneysPage() {
  const pageEntered = usePageEntered();

  return (
    <div
      className={`hlt-site hlt-journeys-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}
    >
      <Header />

      <main
        className="hlt-journeys-main"
      >
        <div className="hlt-container">
          <header className="hlt-journeys-header">
            <p className="hlt-journeys-kicker">POPULAR ROUTES</p>
            <h1 className="hlt-journeys-title">Private Transfers to Top Destinations</h1>
            <p className="hlt-journeys-lead">
              Discover stunning landscapes and cultural wonders with our <span className="hlt-nobrk">door-to-door</span> private transfer service from Hanoi or Noi Bai Airport.
            </p>
          </header>

          <div className="hlt-journeys-grid">
            {allRoutesData.map((item) => {
              const whatsappRouteUrl = `${whatsappUrl}&text=${encodeURIComponent(
                `Hello Hoang Luxury Travel, I would like to book a private transfer from Hanoi to ${item.name}.`
              )}`;

              return (
                <article className="hlt-jcard" key={item.num}>
                  {/* Bố cục gọn - CSS chỉ bật khối này ở mobile, PC vẫn dùng
                      nguyên thẻ đầy đủ bên dưới. */}
                  <div className="hlt-jcard-compact">
                    <a
                      className="hlt-jcard-compact-media"
                      href={`/journey/${item.slug}/`}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <img src={item.image} alt="" />
                      <span className="hlt-jcard-compact-badge">{item.num}</span>
                    </a>
                    <div className="hlt-jcard-compact-body">
                      <h2>Hanoi to {titleCase(item.name)}</h2>
                      <ul>
                        <li><CompactIcon type="time" />{item.time}</li>
                        <li><CompactIcon type="vehicle" />{item.vehicle}</li>
                        <li><CompactIcon type="service" />{item.service}</li>
                      </ul>
                      <a className="hlt-jcard-compact-link" href={`/journey/${item.slug}/`}>
                        View Route
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 12h15M13 6l6 6-6 6" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="hlt-jcard-media">
                    <img src={item.image} alt={`Hanoi to ${item.name}`} />
                    <span className="hlt-jcard-badge">{item.num}</span>
                    <div className="hlt-jcard-overlay">
                      <h2>HANOI TO<br />{item.name}</h2>
                    </div>

                    <div className="hlt-jcard-stats">
                      <div className="hlt-jcard-stat hlt-jcard-stat-route">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /></svg>
                          <span>ROUTE</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">
                          {/* Khoảng trắng sau "→" thành không ngắt: tuyến dài chỉ xuống dòng
                              trước mũi tên ("Hanoi" / "→ Mu Cang Chai"). */}
                          <span className="hlt-jcard-route-name">{item.routeLine.replace(/ (?=[^→]*$)/g, "\u00a0")}</span>
                          <span className="hlt-jcard-route-approx">{item.approxTime}</span>
                        </strong>
                      </div>
                      <div className="hlt-jcard-stat">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          <span>TIME</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">{item.time}</strong>
                      </div>
                      <div className="hlt-jcard-stat">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 512 512" fill="currentColor"><path d="M499.99 176h-59.87l-16.64-41.6C406.38 91.63 349.57 64 303.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91m-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85s-28.8 15.95-48 15.95m320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9s-12.8 31.9-32 31.9" /></svg>
                          <span>VEHICLE</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">{item.vehicle}</strong>
                      </div>
                      <div className="hlt-jcard-stat">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                          <span>SERVICE</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">{item.service}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="hlt-jcard-route">
                    <div className="hlt-jcard-point">
                      <span className="hlt-jcard-point-icon">
                        <img src={journeyPickupIconUrl} alt="" loading="lazy" />
                      </span>
                      <div className="hlt-jcard-point-text">
                        <small>PICK-UP IN</small>
                        <strong>Hanoi / Noi Bai</strong>
                        <p>Hotels, Residences or Noi Bai Airport</p>
                      </div>
                    </div>

                    <div className="hlt-jcard-route-sep" aria-hidden="true" />

                    <div className="hlt-jcard-point">
                      <span className="hlt-jcard-point-icon">
                        <img src={item.icon} alt="" loading="lazy" />
                      </span>
                      <div className="hlt-jcard-point-text">
                        <small>DROP-OFF IN</small>
                        <strong>{item.dropoffPlace}</strong>
                        <p>{item.dropoffNote}</p>
                      </div>
                    </div>
                  </div>

                  <div className="hlt-jcard-actions">
                    <a
                      href={`/journey/${item.slug}/`}
                      className="hlt-jcard-btn hlt-jcard-btn-detail"
                    >
                      <span className="hlt-jcard-stars">★★★★★</span>
                      <span className="hlt-jcard-btn-dest">
                        <span>{item.name}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </a>
                    <a
                      href={whatsappRouteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hlt-jcard-btn hlt-jcard-btn-book"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.1 4.9A9.8 9.8 0 0 0 12 2a9.9 9.9 0 0 0-8.6 14.9L2 22l5.3-1.4a9.9 9.9 0 0 0 4.7 1.2A9.9 9.9 0 0 0 19.1 4.9Z" /></svg>
                      <span>BOOK VIA WHATSAPP</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Tiêu đề chỉ hiện ở mobile — bản PC giữ nguyên như cũ. */}
          <p className="hlt-journeys-kicker hlt-journeys-why-kicker">
            Why Travelers Choose Us
          </p>

          <div id="journeys-guarantees" className="hlt-journeys-guarantees">
            {guarantees.map((g) => (
              <div className="hlt-journeys-guarantee-item" key={g.title}>
                <div className="hlt-journeys-guarantee-icon">{g.icon}</div>
                <div className="hlt-journeys-guarantee-text">
                  <strong>{g.title}</strong>
                  <p>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <JourneyCallToAction />
      <ExperienceSlider />
      <Footer />
    </div>
  );
}
