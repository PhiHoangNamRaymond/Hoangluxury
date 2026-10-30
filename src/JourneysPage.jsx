import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import usePageEntered from "./hooks/usePageEntered.js";
import { whatsappUrl, getJourneyPageUrl } from "./data.js";
import {
  journeyCardImages,
  journeyIconImages,
  journeyPickupIconUrl,
  journeysOutroWheelUrl,
} from "./config/assets.js";

const allRoutesData = [
  {
    num: "01",
    name: "SA PA",
    seoName: "Sapa",
    slug: "sapa",
    image: journeyCardImages[0],
    alt: "Scenic mountain valleys and colorful flower fields in Sapa, a popular destination for private transfers from Hanoi",
    icon: journeyIconImages[0],
    routeLine: "Hanoi → Sa Pa",
    time: "5.0-5.5 Hours",
    vehicle: "Limo Lux",
    service: "Private Transfer",
    dropoffPlace: "Sa Pa",
    dropoffNote: "Hotels, Resorts or Town Center",
  },
  {
    num: "02",
    name: "HA LONG",
    // Tên trong heading (SEO) theo khách: "Hanoi to Halong"; hiển thị vẫn HA LONG.
    seoName: "Halong",
    slug: "ha-long",
    image: journeyCardImages[1],
    alt: "Traditional cruise boat sailing among the limestone islands of Halong Bay",
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
    alt: "Peaceful riverside temple surrounded by towering limestone mountains in Ninh Binh",
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
    alt: "Winding mountain road through the dramatic green valleys of Ha Giang",
    icon: journeyIconImages[3],
    routeLine: "Hanoi → Ha Giang",
    time: "5.0-5.5 Hours",
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
    alt: "Traditional boats cruising through the turquoise waters and limestone islands near Cat Ba",
    icon: journeyIconImages[4],
    routeLine: "Hanoi → Cat Ba",
    time: "3.5-4.5 Hours",
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
    alt: "Majestic waterfall cascading through lush green mountains in Cao Bang",
    icon: journeyIconImages[5],
    routeLine: "Hanoi → Cao Bang",
    time: "6.0-6.5 Hours",
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
    alt: "Golden terraced rice fields cascading down the mountainsides of Mu Cang Chai at sunset",
    icon: journeyIconImages[6],
    routeLine: "Hanoi → Mu Cang Chai",
    time: "6.0-6.5 Hours",
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
    alt: "Rolling green hills and peaceful farmland surrounded by mountains in Moc Chau",
    icon: journeyIconImages[7],
    routeLine: "Hanoi → Moc Chau",
    time: "4.0-5.0 Hours",
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
    alt: "A sea of clouds drifting between the mountain peaks of Ta Xua beneath a pink sunset sky",
    icon: journeyIconImages[8],
    routeLine: "Hanoi → Ta Xua",
    time: "5.0-5.5 Hours",
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
    // Xe nhìn ngang + mũi tên định hướng đặc (mẫu "Navigation" khách gửi 29/10/2026).
    vehicle: <><path d="M5.6 17H4a1 1 0 0 1-1-1v-3.2c0-.5.2-.9.5-1.2l1.9-3.1c.4-.6 1-1 1.7-1h9.8c.7 0 1.3.4 1.7 1l1.9 3.1c.3.3.5.7.5 1.2V16a1 1 0 0 1-1 1h-1.6" /><path d="M3.5 12h17M9.4 17h5.2" /><circle cx="7.5" cy="17" r="1.9" /><circle cx="16.5" cy="17" r="1.9" /></>,
    service: <path className="is-solid" d="M20.5 10.6 3.6 3.6l7 16.9 2-7.9Z" />,
  };

  return (
    <span className="hlt-jcard-compact-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">{shapes[type]}</svg>
    </span>
  );
}

/* Cùng mốc với CSS bật bố cục gọn (journeys-page.css). */
const COMPACT_CARDS_QUERY = "(max-width: 640px)";

/* Mỗi thẻ chỉ có một h2, đặt ở tên tuyến đang hiện: PC là chữ trên ảnh, mobile
   là tên trong bố cục gọn (khách yêu cầu 29/10/2026). */
function useCompactCards() {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_CARDS_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(COMPACT_CARDS_QUERY);
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}

/* seoName: tên trong code là "Sapa" / "Halong", màn hình vẫn hiện "Sa Pa" /
   "Ha Long" (vẽ bằng ::before từ data-display). */
function CardName({ item }) {
  if (!item.seoName) return titleCase(item.name);
  return (
    <span className="hlt-jcard-name" data-display={titleCase(item.name)}>
      <span className="hlt-seo-sep">{item.seoName}</span>
    </span>
  );
}

export default function JourneysPage() {
  const pageEntered = usePageEntered();
  const compactCards = useCompactCards();
  const CompactTitle = compactCards ? "h2" : "div";
  const CardTitle = compactCards ? "div" : "h2";

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
            {/* H1 theo khách (28/10/2026): "Popular Routes - Private Transfers To Top
                Destinations"; dấu " - " ẩn, giao diện vẫn là dòng nhỏ + tiêu đề. */}
            <h1 className="hlt-journeys-h1">
              <span className="hlt-journeys-kicker">Popular Routes</span>
              <span className="hlt-seo-sep"> - </span>
              <span className="hlt-journeys-title">Private Transfers To Top Destinations</span>
            </h1>
            <p className="hlt-journeys-lead">
              Discover stunning landscapes and cultural wonders with our <span className="hlt-nobrk">door-to-door</span> private transfer service from Hanoi or Noi Bai Airport.
            </p>
          </header>

          <div className="hlt-journeys-grid">
            {allRoutesData.map((item) => {
              const routePageUrl = getJourneyPageUrl(item.name);
              const whatsappRouteUrl = `${whatsappUrl}&text=${encodeURIComponent(
                `Hello Hoang Luxury Travel, I would like to book a private transfer from Hanoi to ${item.name}.`
              )}`;

              return (
                <article className="hlt-jcard" data-slug={item.slug} key={item.num}>
                  {/* Bố cục gọn - CSS chỉ bật khối này ở mobile, PC vẫn dùng
                      nguyên thẻ đầy đủ bên dưới. */}
                  <div className="hlt-jcard-compact">
                    <a
                      className="hlt-jcard-compact-media"
                      href={routePageUrl}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <img src={item.image} alt="" />
                      <span className="hlt-jcard-compact-badge">{item.num}</span>
                    </a>
                    <div className="hlt-jcard-compact-body">
                      <CompactTitle className="hlt-jcard-compact-title">
                        Hanoi to <CardName item={item} />
                      </CompactTitle>
                      <ul>
                        <li><CompactIcon type="time" />{item.time}</li>
                        <li><CompactIcon type="vehicle" />{item.vehicle}</li>
                        <li><CompactIcon type="service" />{item.service}</li>
                      </ul>
                      <a className="hlt-jcard-compact-link" href={routePageUrl}>
                        View Route
                      </a>
                    </div>
                  </div>

                  <div className="hlt-jcard-media">
                    <img src={item.image} alt={item.alt} />
                    <span className="hlt-jcard-badge">{item.num}</span>
                    {/* Bấm vào cả vùng ảnh (gồm tên tuyến và dải thông số) cũng mở trang
                        tuyến, như nút sao bên dưới (khách yêu cầu 29/10/2026). */}
                    <a
                      className="hlt-jcard-media-link"
                      href={routePageUrl}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <div className="hlt-jcard-overlay">
                      {/* Code viết thường ("Hanoi to Sapa"), CSS in hoa như cũ. */}
                      <CardTitle className="hlt-jcard-title">
                        Hanoi to <br />
                        <CardName item={item} />
                      </CardTitle>
                    </div>

                    <div className="hlt-jcard-stats">
                      <div className="hlt-jcard-stat hlt-jcard-stat-route">
                        <span className="hlt-jcard-stat-label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /></svg>
                          <span>ROUTE</span>
                        </span>
                        <strong className="hlt-jcard-stat-val">
                          {/* Khoảng trắng sau "→" thành không ngắt: tuyến dài chỉ xuống dòng
                              trước mũi tên ("Hanoi" / "→ Mu Cang Chai"). --len để thẻ rộng
                              co chữ cho vừa một dòng (journeys-page.css). */}
                          <span className="hlt-jcard-route-name" style={{ "--len": item.routeLine.length }}>{item.routeLine.replace(/ (?=[^→]*$)/g, "\u00a0")}</span>
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
                      href={routePageUrl}
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

        </div>

        {/* Khối khép lại danh sách tuyến, dẫn khách sang form đặt xe. */}
        <section className="hlt-journeys-outro">
          <div className="hlt-container">
            <img className="hlt-journeys-outro-mark" src={journeysOutroWheelUrl} width="216" height="216" loading="lazy" decoding="async" alt="" aria-hidden="true" />

            <div className="hlt-journeys-outro-title">
              Looking for another destination?
            </div>

            <p className="hlt-journeys-outro-text">
              We also arrange private transfers and custom journeys across Northern Vietnam.
            </p>

            <a className="hlt-journeys-outro-btn" href="/booking/">
              <span>Request a custom journey</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <line x1="4" y1="12" x2="19" y2="12" />
                <polyline points="12.5 5.5 19 12 12.5 18.5" />
              </svg>
            </a>
          </div>
        </section>

      </main>

      <JourneyCallToAction secondary="form" headingLevel="h2" title="Ready To Start Your Journey?" />
      <ExperienceSlider />
      <Footer />
    </div>
  );
}
