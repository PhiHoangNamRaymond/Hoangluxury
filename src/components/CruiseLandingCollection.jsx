import React, { useState } from "react";
import { cruiseLanding } from "../config/cruises.js";
import { cruiseCollection, cruiseCollectionEntries, cruiseHighlights, cruiseTiers } from "../config/cruise-collection.js";
import { cruiseImages } from "../config/assets.js";
import { whatsappLink } from "../data.js";
import GoldSwoosh from "./GoldSwoosh.jsx";
import standardBadge from "../../assets/cruise-icons/tier-standard.png";
import deluxeBadge from "../../assets/cruise-icons/tier-deluxe.png";
import luxuryBadge from "../../assets/cruise-icons/tier-luxury.png";
import curatedSelection from "../../assets/cruise-icons/curated-selection-gold.png";
import dining from "../../assets/cruise-icons/amenity-dining.png";
import spa from "../../assets/cruise-icons/amenity-spa.png";
import kayak from "../../assets/cruise-icons/amenity-kayak.png";
import activities from "../../assets/cruise-icons/amenity-activities.png";
import sightseeing from "../../assets/cruise-icons/amenity-sightseeing.png";
import scenic from "../../assets/cruise-icons/amenity-scenic.png";

const amenityIcons = { dining, spa, kayak, activities, sightseeing, scenic };

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
  pin: <><path d="M12 21.5s7-6.6 7-11.8a7 7 0 1 0-14 0c0 5.2 7 11.8 7 11.8Z" /><circle cx="12" cy="9.7" r="2.4" /></>,
  ship: <><path d="M3 14.5h18l-2.6 5H5.6L3 14.5Z" /><path d="M6 14.5v-4h12v4M9 10.5V7.5h6v3M12 7.5V4.5" /></>,
};

/* Nhãn hạng trên ảnh du thuyền (theo mẫu huy hiệu khách gửi 23/11/2026). */
const tierBadges = { Luxury: luxuryBadge, Deluxe: deluxeBadge, Standard: standardBadge };

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
        <GoldSwoosh className="hlt-cruise-v1-swoosh" />
      </header>
      <div className="hlt-cruise-v1-collection">
        <div className="hlt-cruise-v1-filters">
          <fieldset className="hlt-cruise-v1-filter">
            <legend><svg className="hlt-cruise-v1-legend-icon" viewBox="0 0 24 24" aria-hidden="true">{collectionIcons.pin}</svg>Destination</legend>
            <div className="hlt-cruise-v1-pills">
              {bays.map((label) => <label key={label} className={bay === label ? "is-selected" : undefined}>
                <input type="radio" name="cruise-bay" checked={bay === label} onChange={() => selectBay(label)} />
                {label}
              </label>)}
            </div>
          </fieldset>
          <span className="hlt-cruise-v1-filters-divider" aria-hidden="true" />
          <fieldset className="hlt-cruise-v1-tiers">
            <legend><svg className="hlt-cruise-v1-legend-icon" viewBox="0 0 24 24" aria-hidden="true">{collectionIcons.ship}</svg>Cruise Category</legend>
            {tiers.map((label) => <label key={label} className={tier === label ? "is-selected" : undefined}>
              <input type="radio" name="cruise-tier" checked={tier === label} onChange={() => selectTier(label)} />
              {label}
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
          <img className="hlt-cruise-v1-curated" src={curatedSelection} alt="Curated Selection" width="480" height="101" />
        </div>
        {matching.length === 0 && <p className="hlt-cruise-v1-empty">No {tier} cruises are listed for {bay}. Please choose another tier.</p>}
        <div className="hlt-cruise-v1-cards">
          {matching.slice(0, limit).map((item) => {
            const highlight = cruiseHighlights[item.name];
            return <article className="hlt-cruise-v1-card" key={item.name}>
              <div className="hlt-cruise-v1-photo">
                <img src={cruisePhotos[item.photoIndex] || bayArtwork[item.bay]} alt={`${item.name} cruise`} loading="lazy" decoding="async" />
                <span className="hlt-cruise-v1-tier-badge">
                  <img src={tierBadges[item.tier]} alt={item.tier} />
                </span>
              </div>
              <div className="hlt-cruise-v1-body">
                <h3>{item.name}</h3>
                {highlight && <p className={`hlt-cruise-v1-description${highlight.amenities ? "" : " is-plain"}`}>{highlight.description}</p>}
                {highlight?.amenities && <ul className="hlt-cruise-v1-amenities">
                  {highlight.amenities.map(([icon, label]) => <li key={label}>
                    <img src={amenityIcons[icon]} alt="" width="22" height="22" />{label}
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
