import React, { useState } from "react";
import { cruiseLanding } from "../config/cruises.js";
import { cruiseCollection, cruiseCollectionEntries, cruiseHighlights, cruiseTiers } from "../config/cruise-collection.js";
import { cruiseImages } from "../config/assets.js";
import { whatsappLink } from "../data.js";

// Không có lựa chọn "All Bays" / "All Tiers" (khách bỏ 22/11/2026): luôn lọc theo
// một vịnh và một hạng, mở sẵn vịnh và hạng đầu tiên.
const bays = cruiseCollection.map(({ bay }) => bay);
const tiers = cruiseTiers;
const batchSize = 6;
const bayArtwork = { "Ha Long Bay": cruiseImages.ctaSunset, "Lan Ha Bay": cruiseImages.expKayaking };
const photoFiles = import.meta.glob("../assets/cruise-collection/optimized/*", { eager: true, query: "?url", import: "default" });
const cruisePhotos = Object.fromEntries(Object.entries(photoFiles).map(([path, url]) => [Number(path.match(/\/(\d{2})-/)?.[1]), url]));

export function cruiseInquiry(topic) {
  return whatsappLink(`Hello Hoang Luxury Travel, I'd like to inquire about ${topic}.`);
}

function WhatsAppAction({ topic, children }) {
  return <a className="hlt-cruise-v1-btn" href={cruiseInquiry(topic)} target="_blank" rel="noopener noreferrer">
    {children}
  </a>;
}

/* Icon nhãn 4 loại du thuyền, theo thiết kế khách gửi (22/11/2026). */
const typeBadgeIcons = {
  day: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></>,
  overnight: <path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6Z" />,
  dinner: <><path d="M6.5 3v6.2a2.3 2.3 0 0 0 4.6 0V3M8.8 3v18" /><path d="M17.5 21V3c-2.2 1.3-3.3 3.8-3.3 7v3.4h3.3" /></>,
  sunset: <><path d="M5.5 16a6.5 6.5 0 0 1 13 0M2.5 16h19M5 19.5h14M12 4.5v2.5M5.2 8.7l1.7 1.7M18.8 8.7l-1.7 1.7" /></>,
};

/* Icon khối "Introducing the Cruise Collection" (thiết kế 23/11/2026). */
const collectionIcons = {
  swoosh: <path d="M4 11c8-6 17-7 26-3 6 3 11 4 16 1M30 13c9 3 18 2 26-3 5-3 11-4 20-1M37 9c2-3 6-4 9-2" />,
  pin: <><path d="M12 21.5s7-6.6 7-11.8a7 7 0 1 0-14 0c0 5.2 7 11.8 7 11.8Z" /><circle cx="12" cy="9.7" r="2.4" /></>,
  ship: <><path d="M3 14.5h18l-2.6 5H5.6L3 14.5Z" /><path d="M6 14.5v-4h12v4M9 10.5V7.5h6v3M12 7.5V4.5" /></>,
  diamond: <><path d="M6.6 4h10.8L21 9.2 12 20 3 9.2 6.6 4Z" /><path d="M3 9.2h18M9.6 4 8.4 9.2 12 20l3.6-10.8L14.4 4" /></>,
  crown: <path d="M3.5 17.5 2.5 7l5 4.2L12 4.5l4.5 6.7 5-4.2-1 10.5h-17ZM4.5 20.5h15" />,
  laurel: <path d="M14 21c-5-2.5-8-7.5-7-14M8.6 9.6C6.4 9.7 5.2 8.4 5 6.3c2.2 0 3.5 1.2 3.6 3.3Zm-.9 3.9c-2 .5-3.6-.4-4.3-2.4 2-.5 3.6.4 4.3 2.4Zm1.6 3.6c-1.8 1-3.6.5-4.8-1.2 1.8-1 3.6-.5 4.8 1.2Zm2.6 2.7c-1.5 1.3-3.4 1.2-4.9-.2 1.5-1.3 3.4-1.2 4.9.2Z" />,
  dining: <path d="M6.5 3v6.2a2.3 2.3 0 0 0 4.6 0V3M8.8 3v18M17.5 21V3c-2.2 1.3-3.3 3.8-3.3 7v3.4h3.3" />,
  spa: <path d="M12 19c-2.6-1.6-3.6-4.3-3.2-7.4 2.4 1.2 3.4 3.7 3.2 7.4Zm0 0c2.6-1.6 3.6-4.3 3.2-7.4-2.4 1.2-3.4 3.7-3.2 7.4Zm0 0c-3.7.3-6.8-1.3-8.5-4.4 3.3-.5 6.2 1 8.5 4.4Zm0 0c3.7.3 6.8-1.3 8.5-4.4-3.3-.5-6.2 1-8.5 4.4ZM12 10.6c-1.2-1.9-1.2-3.9 0-5.9 1.2 2 1.2 4 0 5.9Z" />,
  kayak: <path d="M3 16.5c5 2.6 11.5 2.2 17-1.5M4.5 20.5 19.5 4.5M17 3.5l3.5 3.5-2 .8-2.3-2.3.8-2Z" />,
  activities: <><circle cx="7" cy="15.5" r="3.5" /><circle cx="17" cy="15.5" r="3.5" /><path d="M10.5 15h3M4.2 13.2 6.5 6h3.3v7.2M19.8 13.2 17.5 6h-3.3v7.2" /></>,
  sightseeing: <path d="M2.5 19.5 9.5 7l4.5 7 2.5-3.5 5 9h-19ZM7.6 10.4 9.8 12l2-1.7" />,
  scenic: <path d="M3 8.5c3-2 6 2 9 0s6-2 9 0M3 13.5c3-2 6 2 9 0s6-2 9 0M3 18.5c3-2 6 2 9 0s6-2 9 0" />,
};

/* Nhãn hạng trên ảnh du thuyền (theo mẫu huy hiệu khách gửi 23/11/2026). */
const tierBadgeIcons = { Luxury: collectionIcons.crown, Deluxe: collectionIcons.diamond, Standard: collectionIcons.ship };

function SectionHeading({ id, children, subtitle }) {
  return <header className="hlt-cruise-v1-heading">
    <h2 id={id}>{children}</h2>
    {subtitle && <p>{subtitle}</p>}
  </header>;
}

export default function CruiseLandingCollection() {
  const [bay, setBay] = useState(bays[0]);
  const [tier, setTier] = useState(tiers[0]);
  const [limit, setLimit] = useState(batchSize);
  const bayEntries = cruiseCollectionEntries.filter((item) => item.bay === bay);
  const matching = bayEntries.filter((item) => item.tier === tier);
  const selectBay = (value) => { setBay(value); setLimit(batchSize); };
  const selectTier = (value) => { setTier(value); setLimit(batchSize); };

  return <div className="hlt-cruise-v1">
    <section className="hlt-container hlt-cruise-v1-section" aria-labelledby="cruise-types">
      <SectionHeading id="cruise-types" subtitle="Four ways to experience Ha Long Bay and Lan Ha Bay.">Choose Your Cruise Experience</SectionHeading>
      <div className="hlt-cruise-v1-types">
        {cruiseLanding.types.map((item, index) => <article className="hlt-cruise-v1-card" key={item.id}>
          <div className="hlt-cruise-v1-photo">
            <img src={cruiseImages[item.image]} alt="" loading="lazy" decoding="async" />
            <span className="hlt-cruise-v1-badge">
              {typeBadgeIcons[item.id] && <svg className="hlt-cruise-v1-badge-icon" viewBox="0 0 24 24" aria-hidden="true">{typeBadgeIcons[item.id]}</svg>}
              {item.badge}
            </span>
          </div>
          <div className="hlt-cruise-v1-body">
            <h3>{String(index + 1).padStart(2, "0")}. {item.title}</h3>
            {item.schedule && <p className="hlt-cruise-v1-emphasis">{item.schedule}</p>}
            <p>{item.text}</p>
          </div>
        </article>)}
      </div>
    </section>

    <section id="cruise-collection" className="hlt-container hlt-cruise-v1-section hlt-cruise-v1-collection-section" aria-labelledby="cruise-collection-title">
      <header className="hlt-cruise-v1-heading is-collection">
        <h2 id="cruise-collection-title">Introducing the Cruise Collection</h2>
        <p>Experience a journey aboard some of the finest luxury cruises in Halong Bay.</p>
        <svg className="hlt-cruise-v1-swoosh" viewBox="0 0 80 18" aria-hidden="true">{collectionIcons.swoosh}</svg>
      </header>
      <div className="hlt-cruise-v1-collection">
        <div className="hlt-cruise-v1-filters">
          <fieldset className="hlt-cruise-v1-filter">
            <legend><svg className="hlt-cruise-v1-legend-icon" viewBox="0 0 24 24" aria-hidden="true">{collectionIcons.pin}</svg>Destination</legend>
            <div className="hlt-cruise-v1-pills">
              {bays.map((label) => <label key={label} className={bay === label ? "is-selected" : undefined}>
                <input type="radio" name="cruise-bay" checked={bay === label} onChange={() => selectBay(label)} />
                {bay === label && <span className="hlt-cruise-v1-check" aria-hidden="true">✓</span>}
                {label} <small>({cruiseCollectionEntries.filter((item) => item.bay === label).length})</small>
              </label>)}
            </div>
          </fieldset>
          <span className="hlt-cruise-v1-filters-divider" aria-hidden="true" />
          <fieldset className="hlt-cruise-v1-tiers">
            <legend><svg className="hlt-cruise-v1-legend-icon" viewBox="0 0 24 24" aria-hidden="true">{collectionIcons.ship}</svg>Cruise Category</legend>
            {tiers.map((label) => <label key={label} className={tier === label ? "is-selected" : undefined}>
              <input type="radio" name="cruise-tier" checked={tier === label} onChange={() => selectTier(label)} />
              {tier === label && <span className="hlt-cruise-v1-check" aria-hidden="true">✓</span>}
              {label} <small>({bayEntries.filter((item) => item.tier === label).length})</small>
            </label>)}
          </fieldset>
        </div>
        <label className="hlt-cruise-mobile-only hlt-cruise-mobile-destination">Destination:
          <select value={bay} onChange={(event) => selectBay(event.target.value)}>
            {bays.map((label) => <option key={label}>{label}</option>)}
          </select>
        </label>
        <div className="hlt-cruise-v1-results-head">
          <p className="hlt-cruise-v1-results-note" aria-live="polite">{matching.length} {matching.length === 1 ? "Cruise" : "Cruises"} · {bay} · {tier} Collection</p>
          <span className="hlt-cruise-v1-results-line" aria-hidden="true" />
          <span className="hlt-cruise-v1-curated">
            <svg viewBox="0 0 24 24" aria-hidden="true">{collectionIcons.laurel}</svg>
            Curated Selection
            <svg className="is-mirrored" viewBox="0 0 24 24" aria-hidden="true">{collectionIcons.laurel}</svg>
          </span>
        </div>
        {matching.length === 0 && <p className="hlt-cruise-v1-empty">No {tier} cruises are listed for {bay}. Please choose another tier.</p>}
        <div className="hlt-cruise-v1-cards">
          {matching.slice(0, limit).map((item) => {
            const highlight = cruiseHighlights[item.name];
            return <article className="hlt-cruise-v1-card" key={item.name}>
              <div className="hlt-cruise-v1-photo">
                <img src={cruisePhotos[item.photoIndex] || bayArtwork[item.bay]} alt={`${item.name} cruise`} loading="lazy" decoding="async" />
                <span className="hlt-cruise-v1-badge is-tier">
                  <svg className="hlt-cruise-v1-badge-icon" viewBox="0 0 24 24" aria-hidden="true">{tierBadgeIcons[item.tier]}</svg>
                  {item.tier}
                </span>
              </div>
              <div className="hlt-cruise-v1-body">
                <h3>{item.name}</h3>
                {highlight && <p className={`hlt-cruise-v1-description${highlight.amenities ? "" : " is-plain"}`}>{highlight.description}</p>}
                {highlight?.amenities && <ul className="hlt-cruise-v1-amenities">
                  {highlight.amenities.map(([icon, label]) => <li key={label}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">{collectionIcons[icon]}</svg>{label}
                  </li>)}
                </ul>}
                <WhatsAppAction topic={item.name}>View Details</WhatsAppAction>
              </div>
            </article>;
          })}
        </div>
        {matching.length > limit && <button className="hlt-cruise-v1-btn hlt-cruise-v1-more" type="button" onClick={() => setLimit(limit + batchSize)}>Show more cruises</button>}
      </div>
    </section>
  </div>;
}
