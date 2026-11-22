import React, { useState } from "react";
import { cruiseLanding } from "../config/cruises.js";
import { cruiseCollection, cruiseCollectionEntries, cruiseTiers } from "../config/cruise-collection.js";
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
  private: <><path d="M6.6 4h10.8L21 9.2 12 20 3 9.2 6.6 4Z" /><path d="M3 9.2h18M9.6 4 8.4 9.2 12 20l3.6-10.8L14.4 4" /></>,
};

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
            <p className="hlt-cruise-v1-emphasis">{item.schedule}</p>
            <p>{item.text}</p>
          </div>
        </article>)}
      </div>
    </section>

    <section id="cruise-collection" className="hlt-container hlt-cruise-v1-section" aria-labelledby="cruise-collection-title">
      <SectionHeading id="cruise-collection-title" subtitle="Compare selected Ha Long Bay and Lan Ha Bay cruises, then request availability for your dates.">Our Handpicked Cruise Collection</SectionHeading>
      <div className="hlt-cruise-v1-collection">
        <fieldset className="hlt-cruise-v1-filter">
          <legend>Destination</legend>
          {bays.map((label) => <label key={label} className={bay === label ? "is-selected" : undefined}>
            <input type="radio" name="cruise-bay" checked={bay === label} onChange={() => selectBay(label)} />
            <span>{label}</span><small>({cruiseCollectionEntries.filter((item) => item.bay === label).length})</small>
          </label>)}
        </fieldset>
        <div className="hlt-cruise-v1-results">
          <fieldset className="hlt-cruise-v1-tiers">
            <legend>Cruise Tier</legend>
            {tiers.map((label) => <label key={label} className={tier === label ? "is-selected" : undefined}>
              <input type="radio" name="cruise-tier" checked={tier === label} onChange={() => selectTier(label)} />
              {label} <small>({bayEntries.filter((item) => item.tier === label).length})</small>
            </label>)}
          </fieldset>
          <label className="hlt-cruise-mobile-only hlt-cruise-mobile-destination">Destination:
            <select value={bay} onChange={(event) => selectBay(event.target.value)}>
              {bays.map((label) => <option key={label}>{label}</option>)}
            </select>
          </label>
          <p className="hlt-cruise-v1-results-note" aria-live="polite">{matching.length} {matching.length === 1 ? "cruise" : "cruises"} · {bay} · {tier}</p>
          {matching.length === 0 && <p className="hlt-cruise-v1-empty">No {tier} cruises are listed for {bay}. Please choose another tier.</p>}
          <div className="hlt-cruise-v1-cards">
            {matching.slice(0, limit).map((item) => <article className="hlt-cruise-v1-card" key={item.name}>
              <div className="hlt-cruise-v1-photo">
                <img src={cruisePhotos[item.photoIndex] || bayArtwork[item.bay]} alt={`${item.name} cruise`} loading="lazy" decoding="async" />
                <span className="hlt-cruise-v1-badge">{item.bay}</span>
              </div>
              <div className="hlt-cruise-v1-body">
                <h3>{item.name}</h3>
                <p>{item.tier}</p>
                <WhatsAppAction topic={item.name}>Check Availability <span aria-hidden="true">→</span></WhatsAppAction>
              </div>
            </article>)}
          </div>
          {matching.length > limit && <button className="hlt-cruise-v1-btn hlt-cruise-v1-more" type="button" onClick={() => setLimit(limit + batchSize)}>Show more cruises</button>}
        </div>
      </div>
    </section>
  </div>;
}
