import React, { useEffect } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import {
  journeyCtaMountainsUrl,
  journeyFactIcons,
  photoLandingBannerUrl,
  photoPlanImages,
  photoPrepImages,
  photoStyleImages,
  photoWhyImages,
} from "./config/assets.js";
import { formatVnd, VND_PER_USD } from "./config/journeys.js";
import { whatsappPhotoUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

/* Trang giới thiệu dịch vụ chụp ảnh. Lưới album ảnh thật nằm ở /photo/albums/;
   mũi tên trên mỗi thẻ phong cách dẫn sang đó kèm sẵn bộ lọc tương ứng. */

const albumsUrl = "/photo/albums/";

/* 6 phong cách chụp. `title` vừa là chữ trên thẻ vừa là tên nút lọc ở
   /photo/albums/ (photo-album-list.js) - đổi một bên phải đổi cả bên kia. */
const styles = [
  {
    title: "Nature & Landscapes",
    text: "Preserve your experiences set against beautiful mountains, forests and open landscapes.",
    image: photoStyleImages.nature,
  },
  {
    title: "Couples & Honeymoons",
    text: "Romantic photos keep memories of your love story and the joy of travelling together.",
    image: photoStyleImages.couples,
  },
  {
    title: "Local Culture",
    text: "Immerse in local culture with traditional attire and authentic settings.",
    image: photoStyleImages.culture,
  },
  {
    title: "Family Moments",
    text: "Natural family photos filled with laughter, love and the joy of being together.",
    image: photoStyleImages.family,
  },
  {
    title: "Cinematic Travel",
    text: "Epic landscapes, drone perspectives and cinematic atmosphere.",
    image: photoStyleImages.cinematic,
  },
  {
    title: "Proposals & Celebrations",
    text: "Capture life’s special moments including proposals, anniversaries, birthdays and more.",
    image: photoStyleImages.celebrations,
  },
];

/* Hai gói dịch vụ. Giá niêm yết bằng USD theo yêu cầu của khách (chỉ hiện ký
   hiệu $, không kèm chữ USD). Theo ảnh mẫu, thẻ đi thẳng từ tiêu đề vào danh
   sách, không có dòng meta hay đoạn giới thiệu. */
const packages = [
  {
    id: "half-day",
    name: "Half-Day Photography with Private Car",
    includes: [
      ["car", "Private car and motorbike with driver"],
      ["photographer", "Private photographer with modern digital camera equipment"],
      ["group", "Up to 5 people"],
      ["sun", "Morning or afternoon session"],
      ["brush", "Hair & makeup for one person"],
      ["route", "Multiple photo stops along your planned route"],
      ["gallery", "View your selected photo gallery via Google Drive within 12 hours of the shoot"],
      ["retouch", "20 professionally retouched photos, delivered within 24 hours of your selection"],
      ["ticket", "All photographer entrance and location fees included"],
      ["gift", "2 complimentary framed photos"],
      ["outfit", "One traditional local outfit of your choice"],
      ["drone", "2–3 complimentary short video clips to capture fun moments, with drone footage upon request where permitted"],
    ],
    price: 299,
    button: "Book Half-Day",
    script: ["A few hours.", "Beautiful memories"],
    image: photoPlanImages.halfDay,
    focus: "58%", // cô gái hơi lệch phải
  },
  {
    id: "full-day",
    name: "Full-Day Photography with Private Car",
    includes: [
      ["car", "Private car and motorbike with driver"],
      ["photographer", "Private photographer with modern digital camera equipment"],
      ["group", "Up to 5 people"],
      ["sun", "Full day"],
      ["brush", "Hair & makeup for one person"],
      ["route", "Multiple photo stops along your planned route"],
      ["gallery", "View your selected photo gallery via Google Drive within 12 hours of the shoot"],
      ["retouch", "30 professionally retouched photos, delivered within 24 hours of your selection"],
      ["ticket", "All photographer entrance and location fees included"],
      ["gift", "2 complimentary framed photos"],
      ["outfit", "One traditional local outfit of your choice"],
      ["drone", "2–3 complimentary short video clips to capture fun moments, with drone footage upon request where permitted"],
    ],
    price: 379,
    button: "Book Full-Day",
    script: ["More time.", "More moments to remember"],
    image: photoPlanImages.fullDay,
    mobileImage: photoPlanImages.fullDayMobile,
    focus: "62%", // cặp đôi giữa đồi hoa: giữ cả hai khuôn mặt và bó hoa
    focusY: "8%", // hai khuôn mặt nằm cao trong ảnh
  },
];

const reasons = [
  // Icon là tên LineIcon, hoặc { src } cho ảnh: hai thẻ đầu dùng đúng icon xe /
  // nhãn giá của dải thông số trang cung đường.
  [{ src: journeyFactIcons.vehicle }, "Private Transport, Hotel Pick-up", "Hoang Luxury Travel picks you up at your hotel and takes care of transport between photo locations."],
  [{ src: journeyFactIcons.rates }, "Transparent Pricing", "All inclusions and optional extras are clearly explained before you book."],
  // Mảng 2 phần: phần đầu chỉ hiện trên PC (mobile bỏ cho ngắn — khách yêu cầu 28/10/2026).
  ["camera", "No Posing Experience Needed", ["You do not need to know how to pose. ", "The photographer guides you throughout the shoot so you can feel comfortable and be yourself."]],
  ["weather", "Flexible When the Weather Changes", "If the weather changes, we can adjust the time or location whenever possible."],
];

/* Ảnh tròn của từng bước lấy theo đúng thứ tự từ photoPrepImages (assets.js). */
const preparations = [
  ["Your Preferences", "Share your photo style, group size and special requests."],
  ["Photo Locations", "Choose places suited to your style and package."],
  ["Best Time to Shoot", "Find the ideal time based on lighting, weather and your schedule."],
  ["Outfit Selection", "Choose your favorite traditional local outfit and get helpful styling tips."],
  ["Makeup & Hair", "Choose your preferred makeup and hairstyle for the shoot."],
  ["Final Plan & Confirmation", "Review your itinerary and booking confirmation before the shoot."],
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
    // Chiếc ô (theo mẫu khách gửi 28/10/2026): tán 4 múi + cán móc.
    weather: (
      <>
        <path d="M3 12.2a9 9 0 0 1 18 0c-1.2-1-2.8-1-4 0-1.2-1-2.8-1-4 0-1.2-1-2.8-1-4 0-1.2-1-2.8-1-4 0Z" />
        <path d="M12 3.2c-2.2 2.3-3 5.3-3 8.9M12 3.2c2.2 2.3 3 5.3 3 8.9" />
        <path d="M12 2.2v1M12 12.2v6.3a2 2 0 0 1-4 0" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.9 21.1l4.6-1.2A9.2 9.2 0 1 0 12 2.8Z" />
        <path d="M9 7.9c.3-.3.7-.3.9 0l1.1 1.6c.2.3.2.7-.1 1l-.6.6c.6 1.2 1.6 2.3 2.9 2.9l.6-.6c.3-.3.7-.3 1-.1l1.6 1.1c.3.2.3.6 0 .9l-.8.8c-.5.5-1.2.7-1.9.4a9.4 9.4 0 0 1-5-5c-.3-.7-.1-1.4.4-1.9l.9-.7Z" />
      </>
    ),
    car: (
      <>
        <path d="M4 16.2v-3.6l1.9-4.5a1.8 1.8 0 0 1 1.7-1.1h8.8a1.8 1.8 0 0 1 1.7 1.1l1.9 4.5v3.6a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8Z" />
        <path d="M4.3 12.6h15.4" />
        <circle cx="7.8" cy="17" r="1.7" />
        <circle cx="16.2" cy="17" r="1.7" />
      </>
    ),
    group: (
      <>
        <circle cx="9" cy="8.2" r="3" />
        <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
        <circle cx="16.6" cy="9.2" r="2.4" />
        <path d="M15.4 14.2a4.6 4.6 0 0 1 5.6 4.5" />
      </>
    ),
    sun: (
      <>
        <path d="M3 17.5h18M7 17.5a5 5 0 0 1 10 0" />
        <path d="M12 6.5v2.2M5.6 9.1l1.5 1.5M18.4 9.1l-1.5 1.5M2.9 13.6h2M19.1 13.6h2" />
      </>
    ),
    brush: (
      <>
        <path d="M11.4 14.8c3.4.2 7.8-2.6 8.6-10.8-8.2.8-11 5.2-10.8 8.6Z" />
        <path d="m8.6 12.4 3 3M4 20l5.4-5.4" />
      </>
    ),
    route: (
      <>
        <circle cx="5.8" cy="18" r="2.1" />
        <path d="M18 11.6s3.5-3.2 3.5-6.1a3.5 3.5 0 0 0-7 0c0 2.9 3.5 6.1 3.5 6.1Z" />
        <circle cx="18" cy="5.5" r="1.2" />
        <path d="M8.4 18h6.4a3 3 0 0 0 0-6H9.2a3 3 0 0 1 0-6h2.4" strokeDasharray="2 2.2" />
      </>
    ),
    ticket: (
      <>
        <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h14a1.5 1.5 0 0 1 1.5 1.5v2.3a2.2 2.2 0 0 0 0 4.4v2.3A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5v-2.3a2.2 2.2 0 0 0 0-4.4V7.5Z" />
        <path d="M14.5 6.8v10.4" strokeDasharray="1.6 1.9" />
      </>
    ),
    gift: (
      <>
        <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
        <path d="M5 12.5V20h14v-7.5M12 8.5V20" />
        <path d="M12 8.5C10.4 5 6.8 4.6 6.8 6.8c0 1.4 2.2 1.7 5.2 1.7Zm0 0c1.6-3.5 5.2-3.9 5.2-1.7 0 1.4-2.2 1.7-5.2 1.7Z" />
      </>
    ),
    outfit: (
      <>
        <path d="M10.1 5.4a1.9 1.9 0 1 1 2.9 1.6c-.6.4-1 .8-1 1.5" />
        <path d="M12 8.5 3.2 14.6a1 1 0 0 0 .6 1.8h16.4a1 1 0 0 0 .6-1.8L12 8.5Z" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {shapes[type]}
    </svg>
  );
}

/* heading: phần nào nằm trong thẻ h2 (cấu trúc SEO khách duyệt 28/10/2026) —
   "both": dòng nhỏ + tiêu đề, nối bằng " - " ẩn (vd. "Find Your Photo Style -
   How Would You Like…"); "eyebrow": chỉ dòng nhỏ, tiêu đề lớn là chữ thường;
   "title": chỉ tiêu đề lớn. Giao diện như nhau ở cả ba kiểu. */
function SectionHead({ eyebrow, title, lead, id, wide, heading = "title" }) {
  const eyebrowEl = (
    <span className="hlt-pl-eyebrow">
      <span aria-hidden="true" />
      {eyebrow}
      <span aria-hidden="true" />
    </span>
  );
  return (
    <div className={wide ? "hlt-pl-head is-wide" : "hlt-pl-head"}>
      {heading === "both" && (
        <h2 id={id}>
          {eyebrowEl}
          <span className="hlt-seo-sep"> - </span>
          <span className="hlt-pl-head-title">{title}</span>
        </h2>
      )}
      {heading === "eyebrow" && (
        <>
          <h2 id={id}>{eyebrowEl}</h2>
          <p className="hlt-pl-head-title">{title}</p>
        </>
      )}
      {heading === "title" && (
        <>
          <div>{eyebrowEl}</div>
          <h2 id={id}><span className="hlt-pl-head-title">{title}</span></h2>
        </>
      )}
      {lead && <p className="hlt-pl-lead">{lead}</p>}
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
            {/* H1 theo khách (28/10/2026): "Hoang Photo - Private Photo Shoots in
                Northern Vietnam"; dấu " - " ẩn, giao diện vẫn là dòng nhỏ + tiêu đề. */}
            <h1 id="photo-hero-title">
              <span className="hlt-pl-hero-kicker">Hoang Photo</span>
              <span className="hlt-seo-sep"> - </span>
              <span className="hlt-pl-hero-title">Private Photo Shoots in Northern Vietnam</span>
            </h1>
            <p className="hlt-pl-hero-lead">
              Private photography experiences across Northern Vietnam,
              featuring a variety of creative concepts.
            </p>
            <div className="hlt-pl-hero-actions">
              <a
                className="hlt-btn hlt-btn-gold"
                href={whatsappPhotoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LineIcon type="whatsapp" className="hlt-pl-ic hlt-pl-btn-ic" />
                Book via Photo
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
              title="How Would You Like To Remember Your Journey?"
              wide
              heading="both"
            />

            <div className="hlt-pl-style-grid">
              {styles.map((style, index) => (
                <article className="hlt-pl-style" key={style.title}>
                  <a
                    className="hlt-pl-style-media"
                    href={`${albumsUrl}?style=${encodeURIComponent(style.title)}`}
                    aria-label={`See ${style.title} photos`}
                  >
                    <img src={style.image} alt={style.title} loading="lazy" />
                  </a>
                  <div className="hlt-pl-style-body">
                    <span className="hlt-pl-style-no" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="hlt-pl-style-text">
                      <h3>
                        <span className="hlt-seo-sep">{String(index + 1).padStart(2, "0")}. </span>
                        {style.title}
                      </h3>
                      <p>{style.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <a className="hlt-pl-view-all-photos" href={albumsUrl}>
              View All Photos
            </a>
          </div>
        </section>

        {/* Hai gói dịch vụ */}
        <section className="hlt-pl-plans" aria-labelledby="photo-plans-title">
          <div className="hlt-container">
            <SectionHead
              id="photo-plans-title"
              eyebrow="Choose Your Experience"
              title="One Journey. Two Ways To Experience It"
              heading="both"
            />

            <div className="hlt-pl-plan-grid">
              {packages.map((item) => (
                <article className="hlt-pl-plan" key={item.id}>
                  <div className="hlt-pl-plan-media" style={{ "--plan-focus": item.focus, "--plan-focus-y": item.focusY }}>
                    {item.mobileImage ? (
                      <picture className="hlt-pl-plan-mobile-picture">
                        <source media="(max-width: 640px)" srcSet={item.mobileImage} />
                        <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                      </picture>
                    ) : (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    )}
                  </div>
                  <div className="hlt-pl-plan-body">
                    <h3>{item.name}</h3>
                    <ul className="hlt-pl-plan-list">
                      {item.includes.map(([icon, label]) => (
                        <li key={label}>
                          <LineIcon type={icon} className="hlt-pl-ic hlt-pl-plan-ic" />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="hlt-pl-plan-foot">
                      <p className="hlt-pl-plan-price">
                        ${item.price}
                        <span className="hlt-pl-plan-vnd">≈ {formatVnd(item.price * VND_PER_USD)}</span>
                      </p>
                      <a
                        className="hlt-pl-plan-btn"
                        href={whatsappPhotoUrl}
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

            <p className="hlt-pl-plan-note">
              <LineIcon type="camera" className="hlt-pl-ic hlt-pl-plan-note-ic" />
              Guest entrance fees at attractions and photo locations are not included in the package price.
            </p>
          </div>
        </section>

        {/* Vì sao chọn Hoang Photo */}
        <section className="hlt-pl-why" aria-labelledby="photo-why-title">
          <div className="hlt-container hlt-pl-why-layout">
            {/* Cụm ảnh trang trí theo ảnh mẫu: hai khung polaroid và dòng chữ viết tay. */}
            <div className="hlt-pl-why-media" aria-hidden="true">
              <img className="hlt-pl-why-photo is-main" src={photoWhyImages.main} alt="" loading="lazy" decoding="async" />
              <img className="hlt-pl-why-photo is-side" src={photoWhyImages.side} alt="" loading="lazy" decoding="async" />
              <p className="hlt-pl-why-script">
                <span>More</span>
                <span>Than a Trip</span>
                <span>A Story to Keep</span>
              </p>
            </div>

            <div className="hlt-pl-why-body">
              <SectionHead
                id="photo-why-title"
                eyebrow="Why Choose Hoang Photo?"
                title="A Photo Experience Made For You"
                heading="eyebrow"
                lead="More than just photos, we create a seamless and meaningful experience so you can simply be present and enjoy every moment."
              />

              <div className="hlt-pl-why-grid">
                {reasons.map(([icon, title, text]) => (
                  <article key={title}>
                    <span className="hlt-pl-why-ring" aria-hidden="true">
                      {typeof icon === "object" ? (
                        <span className="hlt-pl-why-ic is-mask" style={{ "--why-icon": `url(${icon.src})` }} />
                      ) : (
                        <LineIcon type={icon} className="hlt-pl-ic hlt-pl-why-ic" />
                      )}
                    </span>
                    <h3>{title}</h3>
                    <p>
                      {Array.isArray(text) ? (
                        <>
                          <span className="hlt-pl-desktop-only">{text[0]}</span>
                          {text[1]}
                        </>
                      ) : (
                        text
                      )}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Chuẩn bị trước buổi chụp */}
        <section className="hlt-pl-prep" aria-labelledby="photo-prep-title">
          <div className="hlt-container">
            <SectionHead
              id="photo-prep-title"
              eyebrow="Planning Your Photo Shoot"
              title="How We Prepare For Your Photo Shoot"
              lead="We plan your photo shoot around your preferences, covering everything from locations and timing to outfits, makeup and travel arrangements."
              wide
            />

            <div className="hlt-pl-prep-grid">
              {preparations.map(([title, text], index) => (
                <article key={title}>
                  <div className="hlt-pl-prep-media">
                    <img src={photoPrepImages[index]} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="hlt-pl-prep-text">
                    <h3>
                      <span className="hlt-pl-prep-no">{String(index + 1).padStart(2, "0")}</span>
                      <span className="hlt-seo-sep">. </span>
                      {title}
                    </h3>
                    <p>{text}</p>
                  </div>
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
              <h2 id="photo-cta-title">Ready To Plan Your Photo Shoot?</h2>
              <p>Let&rsquo;s plan your photo experience today.</p>
              <a className="hlt-pl-cta-btn" href={whatsappPhotoUrl} target="_blank" rel="noopener noreferrer">
                <LineIcon type="whatsapp" className="hlt-pl-ic hlt-pl-btn-ic" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <ExperienceSlider />
      <Footer />
    </div>
  );
}
