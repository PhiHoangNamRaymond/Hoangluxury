import React, { useEffect } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import { experienceImages, journeyCardImages, journeyCtaMountainsUrl, photoLandingBannerUrl } from "./config/assets.js";
import { whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

/* Trang giới thiệu dịch vụ chụp ảnh. Lưới album ảnh thật nằm ở /photo/albums/;
   mũi tên trên mỗi thẻ phong cách dẫn sang đó kèm sẵn bộ lọc tương ứng. */

const albumsUrl = "/photo/albums/";

/* 6 phong cách chụp. `title` là chữ hiện trên thẻ; `category` là khoá lọc nên
   phải khớp đúng tên danh mục trong photo-album-list.js, không đổi theo tiêu đề. */
const styles = [
  {
    title: "Nature & Landscapes",
    category: "Natural Journey",
    text: "Preserve your experiences set against beautiful mountains, forests and open landscapes.",
    image: journeyCardImages[0],
  },
  {
    title: "Couples & Honeymoons",
    category: "Couple & Honeymoon",
    text: "Romantic photos keep memories of your love story and the joy of travelling together.",
    image: experienceImages[9].src,
  },
  {
    title: "Local Culture",
    category: "Local Heritage",
    text: "Immerse in local culture with traditional attire and authentic settings.",
    image: experienceImages[15].src,
  },
  {
    title: "Family Moments",
    category: "Family Memories",
    text: "Natural family photos filled with laughter, love and the joy of being together.",
    image: journeyCardImages[2],
  },
  {
    title: "Cinematic Travel",
    category: "Cinematic Travel",
    text: "Epic landscapes, drone perspectives and cinematic atmosphere.",
    image: journeyCardImages[6],
  },
  {
    title: "Proposals & Celebrations",
    category: "Proposal & Celebration",
    text: "Capture life’s special moments including proposals, anniversaries, birthdays and more.",
    image: experienceImages[13].src,
  },
];

/* Hai gói dịch vụ. Giá niêm yết bằng USD theo yêu cầu của khách (chỉ hiện ký
   hiệu $, không kèm chữ USD). */
const packages = [
  {
    id: "half-day",
    name: "Half-Day Photo Experience",
    meta: ["Morning or afternoon", "Up to 4 hours"],
    text: "A relaxed photo experience designed to capture the highlights of your journey. Enjoy each destination naturally while we take care of the photography.",
    includes: [
      ["photographer", "Your own photographer"],
      ["pin", "Up to 2 locations (The places in the itinerary have been agreed upon)"],
      ["drone", "Video clips included"],
      ["retouch", "20 fully retouched photos delivered within 24 hours"],
      ["clock", "One complimentary framed photo"],
    ],
    price: "$230",
    button: "Book Half-Day",
    script: ["A few hours.", "Beautiful memories"],
    image: journeyCardImages[7],
  },
  {
    id: "full-day",
    name: "Full-Day Photo Experience",
    meta: ["More time to explore", "Up to 8 hours"],
    text: "Follow the day at your own pace and let every part of your journey become part of the story. With more time and more locations, we capture the scenery, the details and the natural moments in between.",
    includes: [
      ["photographer", "Your own photographer"],
      ["pin", "Up to 4 locations (The places in the itinerary have been agreed upon)"],
      ["drone", "Video clips included"],
      ["retouch", "30 fully retouched photos delivered within 24 hours"],
      ["clock", "Two complimentary framed photos"],
    ],
    price: "$385",
    button: "Book Full-Day",
    script: ["More time.", "More moments to remember"],
    image: journeyCardImages[3],
  },
];

const reasons = [
  ["camera", "No Posing Experience Needed", "You do not need to know how to pose. The photographer guides you throughout the shoot so you can feel comfortable and be yourself."],
  ["weather", "Flexible When the Weather Changes", "If the weather changes, we can adjust the time or location whenever possible."],
  ["heart", "A Relaxed Photo Experience", "We keep the photo shoot easy and relaxed, so you can enjoy the day as well as the photos."],
  ["whatsapp", "24/7 WhatsApp Support", "We respond quickly, answer your questions and help you plan every detail of your photo shoot."],
];

const preparations = [
  ["outfit", "Outfit Advice", "We suggest colors and outfits that suit the location and the style of photos you want."],
  ["attire", "Local Outfit Arrangement", "We can help arrange traditional or local outfits where available."],
  ["makeup", "Makeup & Hair", "Professional makeup and hairstyling (on request)."],
  ["sun", "Best Time for Photos", "We suggest the best time based on the light and weather."],
  ["location", "Location Suggestions", "We help you choose photo locations that suit your trip and the style you want."],
  ["route", "Route Planning", "We coordinate with you and your driver to fit the photo shoot into your itinerary."],
];

const ctaPoints = [
  ["chat", "Quick response"],
  ["check", "Personal planning"],
  ["calendar", "Flexible scheduling"],
];

/* Icon nét mảnh dùng chung cho mọi dải của trang; màu và cỡ do CSS quyết định. */
function LineIcon({ type, className = "hlt-pl-ic" }) {
  const shapes = {
    photographer: (
      <>
        <path d="M3.5 8.5h3.2l1.5-2.4h7.6l1.5 2.4h3.2a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 18.5v-8A1.5 1.5 0 0 1 3.5 8.5Z" />
        <circle cx="12" cy="13.6" r="3.4" />
      </>
    ),
    camera: (
      <>
        <path d="M3.5 8.5h3.2l1.5-2.4h7.6l1.5 2.4h3.2a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 18.5v-8A1.5 1.5 0 0 1 3.5 8.5Z" />
        <circle cx="12" cy="13.6" r="3.4" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21.5s6.5-6 6.5-11.5a6.5 6.5 0 0 0-13 0C5.5 15.5 12 21.5 12 21.5Z" />
        <circle cx="12" cy="9.8" r="2.4" />
      </>
    ),
    drone: (
      <>
        <rect x="8.5" y="9.5" width="7" height="5" rx="1.6" />
        <path d="M8.5 11 4.6 7.1M15.5 11l3.9-3.9M8.5 13l-3.9 3.9M15.5 13l3.9 3.9" />
        <circle cx="3.6" cy="6.1" r="1.8" />
        <circle cx="20.4" cy="6.1" r="1.8" />
        <circle cx="3.6" cy="17.9" r="1.8" />
        <circle cx="20.4" cy="17.9" r="1.8" />
      </>
    ),
    gallery: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="m3.6 15.5 4.6-4.3 3.6 3.2 3.1-2.6 5.5 4.7" />
        <circle cx="8.4" cy="9.6" r="1.4" />
      </>
    ),
    retouch: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="m3.6 15.5 4.6-4.3 3.6 3.2 3.1-2.6 5.5 4.7" />
        <path d="m16.6 4.2.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6.6V12l3.6 2.2" />
      </>
    ),
    weather: (
      <>
        <path d="M7.4 14.5a4 4 0 0 1 .3-8 5.4 5.4 0 0 1 10.2 1.6 3.4 3.4 0 0 1-.6 6.4" />
        <path d="M8.4 17.4 7.6 20M12 17.4 11.2 20M15.6 17.4 14.8 20" />
      </>
    ),
    heart: <path d="M12 20.3s-7.6-4.6-7.6-9.6a4.3 4.3 0 0 1 7.6-2.7 4.3 4.3 0 0 1 7.6 2.7c0 5-7.6 9.6-7.6 9.6Z" />,
    whatsapp: (
      <>
        <path d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.9 21.1l4.6-1.2A9.2 9.2 0 1 0 12 2.8Z" />
        <path d="M9 7.9c.3-.3.7-.3.9 0l1.1 1.6c.2.3.2.7-.1 1l-.6.6c.6 1.2 1.6 2.3 2.9 2.9l.6-.6c.3-.3.7-.3 1-.1l1.6 1.1c.3.2.3.6 0 .9l-.8.8c-.5.5-1.2.7-1.9.4a9.4 9.4 0 0 1-5-5c-.3-.7-.1-1.4.4-1.9l.9-.7Z" />
      </>
    ),
    outfit: (
      <>
        <path d="M9 3.5h6l-1 3.5 3.6 13H6.4L10 7l-1-3.5Z" />
        <path d="M8.8 10.6h6.4" />
      </>
    ),
    attire: (
      <>
        <rect x="3.5" y="9.5" width="17" height="4" rx="1" />
        <path d="M5 13.5v6.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6.5M12 9.5v11.5" />
        <path d="M12 9.5S10.6 4.3 8.2 4.3a2.2 2.2 0 0 0 0 4.4h3.8Zm0 0s1.4-5.2 3.8-5.2a2.2 2.2 0 0 1 0 4.4H12Z" />
      </>
    ),
    makeup: (
      <>
        <path d="M14.4 3.6 20 9.2l-9.6 9.6-4.2 1.4 1.4-4.2 6.8-12.4Z" />
        <path d="m12.6 6.4 5 5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
      </>
    ),
    location: (
      <>
        <path d="M12 21.5s6.5-6 6.5-11.5a6.5 6.5 0 0 0-13 0C5.5 15.5 12 21.5 12 21.5Z" />
        <path d="M9.4 10.4 12 8l2.6 2.4v3.4H9.4Z" />
      </>
    ),
    route: (
      <>
        <path d="M12 21.5s6.5-6 6.5-11.5a6.5 6.5 0 0 0-13 0C5.5 15.5 12 21.5 12 21.5Z" />
        <circle cx="12" cy="9.8" r="2.4" />
        <path d="M6.2 17.5H4.6a1.6 1.6 0 0 0 0 3.2h14.8" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9.2" />
        <path d="m7.9 12.2 2.8 2.8 5.4-5.9" />
      </>
    ),
    chat: (
      <path d="M21 12c0 4-4 7.2-9 7.2a11 11 0 0 1-3.3-.5L3.5 20.3l1.6-3.6A6.6 6.6 0 0 1 3 12c0-4 4-7.2 9-7.2S21 8 21 12Z" />
    ),
    calendar: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2.4" />
        <path d="M3.5 10h17M8 2.9v4M16 2.9v4M8.5 14h7" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {shapes[type]}
    </svg>
  );
}

function SectionHead({ eyebrow, title, lead, id, wide }) {
  return (
    <div className={wide ? "hlt-pl-head is-wide" : "hlt-pl-head"}>
      <p className="hlt-pl-eyebrow">
        <span aria-hidden="true" />
        {eyebrow}
        <span aria-hidden="true" />
      </p>
      <h2 id={id}>{title}</h2>
      <p className="hlt-pl-lead">{lead}</p>
    </div>
  );
}

export default function PhotoPage() {
  const pageEntered = usePageEntered();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Photo Experience | Hoang Luxury Travel";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className={`hlt-site hlt-photo-landing hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />

      <main className="hlt-pl-main">
        {/* Banner đầu trang. Chữ viết tay bên phải nằm sẵn trong ảnh nền. */}
        <section
          className="hlt-pl-hero"
          style={{ "--pl-hero": `url(${photoLandingBannerUrl})` }}
          aria-labelledby="photo-hero-title"
        >
          <div className="hlt-container hlt-pl-hero-inner">
            <p className="hlt-pl-hero-kicker">Hoang Photo</p>
            <h1 id="photo-hero-title">Preserve cherished memories</h1>
            <p className="hlt-pl-hero-lead">
              Private photography experiences across Northern Vietnam,
              featuring a variety of creative concepts.
            </p>
            <div className="hlt-pl-hero-actions">
              <a
                className="hlt-btn hlt-btn-gold"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LineIcon type="whatsapp" className="hlt-pl-ic hlt-pl-btn-ic" />
                Book a Photo Experience
              </a>
              <a className="hlt-btn hlt-btn-outline" href={albumsUrl}>
                View Album
              </a>
            </div>
          </div>
        </section>

        {/* 6 phong cách chụp */}
        <section className="hlt-pl-styles" aria-labelledby="photo-styles-title">
          <div className="hlt-container">
            <SectionHead
              id="photo-styles-title"
              eyebrow="Find Your Photo Style"
              title="How Would You Like to Remember Your Journey?"
              lead="From spontaneous moments to special occasions, explore six photo experiences and choose the one that is the best choice for you."
              wide
            />

            <div className="hlt-pl-style-grid">
              {styles.map((style, index) => (
                <article className="hlt-pl-style" key={style.category}>
                  <a
                    className="hlt-pl-style-media"
                    href={`${albumsUrl}?style=${encodeURIComponent(style.category)}`}
                    aria-label={`See ${style.title} photos`}
                  >
                    <img src={style.image} alt={style.title} loading="lazy" />
                  </a>
                  <div className="hlt-pl-style-body">
                    <span className="hlt-pl-style-no" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="hlt-pl-style-text">
                      <h3>{style.title}</h3>
                      <p>{style.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Hai gói dịch vụ */}
        <section className="hlt-pl-plans" aria-labelledby="photo-plans-title">
          <div className="hlt-container">
            <SectionHead
              id="photo-plans-title"
              eyebrow="Choose Your Experience"
              title="One Journey. Two Ways to Experience It."
              lead="Choose how you would like to enjoy the moments, places and stories along the way."
            />

            <div className="hlt-pl-plan-grid">
              {packages.map((item) => (
                <article className="hlt-pl-plan" key={item.id}>
                  <div className="hlt-pl-plan-media">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <div className="hlt-pl-plan-body">
                    <h3>{item.name}</h3>
                    <p className="hlt-pl-plan-meta">
                      {item.meta.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </p>
                    <p className="hlt-pl-plan-text">{item.text}</p>
                    <ul className="hlt-pl-plan-list">
                      {item.includes.map(([icon, label]) => (
                        <li key={label}>
                          <LineIcon type={icon} className="hlt-pl-ic hlt-pl-plan-ic" />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="hlt-pl-plan-foot">
                      <p className="hlt-pl-plan-price">{item.price}</p>
                      <a
                        className="hlt-pl-plan-btn"
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LineIcon type="whatsapp" className="hlt-pl-ic hlt-pl-btn-ic" />
                        {item.button}
                      </a>
                      <p className="hlt-pl-plan-script" aria-hidden="true">
                        {item.script.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Vì sao chọn Hoang Photo */}
        <section className="hlt-pl-why" aria-labelledby="photo-why-title">
          <div className="hlt-container">
            <SectionHead
              id="photo-why-title"
              eyebrow="Why Choose Hoang Photo?"
              title="A Photo Experience Made for You"
              lead="Enjoy Northern Vietnam while we capture the moments you want to remember."
            />

            <div className="hlt-pl-why-grid">
              {reasons.map(([icon, title, text]) => (
                <article key={title}>
                  <LineIcon type={icon} className="hlt-pl-ic hlt-pl-why-ic" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Chuẩn bị trước buổi chụp */}
        <section className="hlt-pl-prep" aria-labelledby="photo-prep-title">
          <div className="hlt-container">
            <SectionHead
              id="photo-prep-title"
              eyebrow="Planning Your Photo Shoot"
              title="From Outfits and Locations to Timing and Travel."
              lead="We help plan the time, location, outfits and travel details before your photo shoot."
            />

            <div className="hlt-pl-prep-grid">
              {preparations.map(([icon, title, text]) => (
                <article key={title}>
                  <LineIcon type={icon} className="hlt-pl-ic hlt-pl-prep-ic" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA cuối trang */}
        <section
          className="hlt-pl-cta"
          style={{ "--pl-cta-bg": `url(${journeyCtaMountainsUrl})` }}
          aria-labelledby="photo-cta-title"
        >
          <div className="hlt-container hlt-pl-cta-inner">
            <p className="hlt-pl-cta-script" aria-hidden="true">
              Beautiful Places
              <span>Memorable Moments</span>
              <span>Photos to Keep Forever</span>
            </p>
            <div className="hlt-pl-cta-copy">
              <h2 id="photo-cta-title">Ready to Plan Your Photo Shoot?</h2>
              <p>Let&rsquo;s plan your photo experience today.</p>
              <a className="hlt-pl-cta-btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <LineIcon type="whatsapp" className="hlt-pl-ic hlt-pl-btn-ic" />
                Chat on WhatsApp
                <svg className="hlt-pl-cta-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </a>
              <ul className="hlt-pl-cta-points">
                {ctaPoints.map(([icon, label]) => (
                  <li key={label}>
                    <LineIcon type={icon} className="hlt-pl-ic hlt-pl-cta-ic" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
