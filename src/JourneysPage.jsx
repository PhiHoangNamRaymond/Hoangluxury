import React from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { whatsappUrl, catalogPageUrl } from "./data.js";
import { routeArtwork, whyVehicleIconUrl, whyWhatsappIconUrl } from "./config/assets.js";

const allRoutesData = [
  {
    num: "01",
    name: "SA PA",
    slug: "sapa",
    image: routeArtwork[0],
    routeLine: "Hanoi → Sa Pa",
    approxTime: "approx. 5-6 hrs",
    time: "5-6 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Sa Pa",
    dropoffNote: "Hotels, Resorts or Town Center",
  },
  {
    num: "02",
    name: "HA LONG",
    slug: "ha-long",
    image: routeArtwork[1],
    routeLine: "Hanoi → Ha Long",
    approxTime: "approx. 2.5-3 hrs",
    time: "2.5-3.0 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Ha Long",
    dropoffNote: "Hotels, Resorts or Cruise Harbour",
  },
  {
    num: "03",
    name: "NINH BINH",
    slug: "ninh-binh",
    image: routeArtwork[2],
    routeLine: "Hanoi → Ninh Binh",
    approxTime: "approx. 1.5-2 hrs",
    time: "1.5-2.0 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Ninh Binh",
    dropoffNote: "Hotels, Resorts or Tam Coc / Trang An",
  },
  {
    num: "04",
    name: "HA GIANG",
    slug: "ha-giang",
    image: routeArtwork[3],
    routeLine: "Hanoi → Ha Giang",
    approxTime: "approx. 6-7 hrs",
    time: "6.0-7.0 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Ha Giang",
    dropoffNote: "Hotels, Homestays or City Center",
  },
  {
    num: "05",
    name: "CAT BA",
    slug: "cat-ba",
    image: routeArtwork[4],
    routeLine: "Hanoi → Cat Ba",
    approxTime: "approx. 3.5-4 hrs",
    time: "3.5-4.0 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Cat Ba Island",
    dropoffNote: "Hotels, Resorts or Town Center",
  },
  {
    num: "06",
    name: "CAO BANG",
    slug: "cao-bang",
    image: routeArtwork[5],
    routeLine: "Hanoi → Cao Bang",
    approxTime: "approx. 6-7 hrs",
    time: "6.0-7.0 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Cao Bang",
    dropoffNote: "Hotels, Homestays or Ban Gioc Area",
  },
  {
    num: "07",
    name: "MU CANG CHAI",
    slug: "mu-cang-chai",
    image: routeArtwork[6],
    routeLine: "Hanoi → Mu Cang Chai",
    approxTime: "approx. 6.5-7.5 hrs",
    time: "6.5-7.5 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Mu Cang Chai",
    dropoffNote: "Hotels, Resorts or Terraced Valleys",
  },
  {
    num: "08",
    name: "MOC CHAU",
    slug: "moc-chau",
    image: routeArtwork[7],
    routeLine: "Hanoi → Moc Chau",
    approxTime: "approx. 4-4.5 hrs",
    time: "4.0-4.5 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Moc Chau",
    dropoffNote: "Hotels, Resorts or Farmstay Areas",
  },
  {
    num: "09",
    name: "TA XUA",
    slug: "ta-xua",
    image: routeArtwork[8],
    routeLine: "Hanoi → Ta Xua",
    approxTime: "approx. 4.5-5.5 hrs",
    time: "4.5-5.5 Hours",
    vehicle: "Limousine / VIP Luxury",
    service: "Private Transfer Door-to-Door",
    dropoffPlace: "Ta Xua",
    dropoffNote: "Hotels, Homestays or Town Center",
  },
];

const guarantees = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "PRIVATE & SAFE",
    desc: "Professional drivers, clean and reliable journey",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "FLEXIBLE SCHEDULE",
    desc: "Depart anytime that suits your plans",
  },
  {
    icon: (
      <img src={whyVehicleIconUrl} alt="Door-to-Door Vehicle" className="hlt-journeys-guarantee-img" />
    ),
    title: "DOOR-TO-DOOR",
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
    title: "CLEAR QUOTATION",
    desc: "Everything confirmed before your journey",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    title: "24/7 SUPPORT",
    desc: "We're here to assist you anytime",
  },
];

export default function JourneysPage() {
  return (
    <div className="hlt-site hlt-journeys-site">
      <Header />

      <main className="hlt-journeys-main">
        <div className="hlt-container">
          <header className="hlt-journeys-header">
            <p className="hlt-journeys-kicker">POPULAR ROUTES</p>
            <h1 className="hlt-journeys-title">Private Transfers to Top Destinations</h1>
            <p className="hlt-journeys-lead">
              Discover stunning landscapes and cultural wonders with our door-to-door<br className="hlt-journeys-lead-br" />private transfer service from Hanoi or Noi Bai Airport.
            </p>
          </header>

          <div className="hlt-journeys-grid">
            {allRoutesData.map((item) => {
              const whatsappRouteUrl = `${whatsappUrl}&text=${encodeURIComponent(
                `Hello Hoang Luxury Travel, I would like to book a private transfer from Hanoi to ${item.name}.`
              )}`;

              return (
                <article className="hlt-jcard" key={item.num}>
                  <div className="hlt-jcard-media">
                    <img src={item.image} alt={`Hanoi to ${item.name}`} />
                    <span className="hlt-jcard-badge">{item.num}</span>
                    <div className="hlt-jcard-overlay">
                      <h2>HANOI TO<br />{item.name}</h2>
                    </div>

                    <div className="hlt-jcard-stats">
                      <div className="hlt-jcard-stat hlt-jcard-stat-route">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>
                          <span>ROUTE</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">
                          <span className="hlt-jcard-route-name">{item.routeLine}</span>
                          <span className="hlt-jcard-route-approx">{item.approxTime}</span>
                        </strong>
                      </div>
                      <div className="hlt-jcard-stat">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span>TIME</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">{item.time}</strong>
                      </div>
                      <div className="hlt-jcard-stat">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 512 512" fill="currentColor"><path d="M499.99 176h-59.87l-16.64-41.6C406.38 91.63 349.57 64 303.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91m-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85s-28.8 15.95-48 15.95m320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9s-12.8 31.9-32 31.9"/></svg>
                          <span>VEHICLE</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">{item.vehicle}</strong>
                      </div>
                      <div className="hlt-jcard-stat">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                          <span>SERVICE</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">{item.service}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="hlt-jcard-route">
                    <div className="hlt-jcard-point">
                      <span className="hlt-jcard-point-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M3 10h18 M3.5 9.5 L12 4 L20.5 9.5 Z M6 10.5 v8 M10 10.5 v8 M14 10.5 v8 M18 10.5 v8 M2.5 20.5 h19" />
                        </svg>
                      </span>
                      <div className="hlt-jcard-point-text">
                        <small>PICK-UP IN</small>
                        <strong>Hanoi / Noi Bai</strong>
                        <p>Hotels, Residences or<br />Noi Bai Airport</p>
                      </div>
                    </div>

                    <div className="hlt-jcard-route-sep" aria-hidden="true" />

                    <div className="hlt-jcard-point">
                      <span className="hlt-jcard-point-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M3 18.5 L8.5 9 L12.5 14 L15.5 9.5 L21 18.5 Z M2 19 h20" />
                        </svg>
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
                      <span>5-STAR SERVICE</span>
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

          <div className="hlt-journeys-guarantees">
            {guarantees.map((g) => (
              <div className="hlt-journeys-guarantee-item" key={g.title}>
                <div className="hlt-journeys-guarantee-icon">{g.icon}</div>
                <div>
                  <strong>{g.title}</strong>
                  <p>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="hlt-journeys-cta-section">
          <div className="hlt-container">
            <div className="hlt-journeys-cta">
              <h2>READY TO START YOUR JOURNEY?</h2>
              <p>We are here to make your trip comfortable, safe and unforgettable.</p>
              <div className="hlt-journeys-cta-btns">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hlt-jcta-btn hlt-jcta-btn-gold"
                >
                  <img src={whyWhatsappIconUrl} alt="WhatsApp" className="hlt-jcta-btn-icon-img" />
                  <span>BOOK VIA WHATSAPP</span>
                </a>
                <a
                  href={catalogPageUrl}
                  className="hlt-jcta-btn hlt-jcta-btn-outline"
                >
                  VIEW CATALOG
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
