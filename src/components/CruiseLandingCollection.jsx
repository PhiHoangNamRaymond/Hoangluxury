import React, { useState } from "react";
import { cruiseLanding } from "../config/cruises.js";
import { cruiseCollection, cruiseCollectionEntries, cruiseTiers } from "../config/cruise-collection.js";
import { cruiseImages } from "../config/assets.js";
import { whatsappLink } from "../data.js";

const allBays = "All Bays";
const allTiers = "All Tiers";
const bays = [allBays, ...cruiseCollection.map(({ bay }) => bay)];
const tiers = [allTiers, ...cruiseTiers];
const batchSize = 6;
const bayArtwork = { "Ha Long Bay": cruiseImages.ctaSunset, "Lan Ha Bay": cruiseImages.expKayaking };

export function cruiseInquiry(topic) {
  return whatsappLink(`Hello Hoang Luxury Travel, I'd like to inquire about ${topic}.`);
}

function WhatsAppAction({ topic, children }) {
  return <a className="hlt-cruise-v1-btn" href={cruiseInquiry(topic)} target="_blank" rel="noopener noreferrer">
    {children}
  </a>;
}

function SectionHeading({ id, children, subtitle }) {
  return <header className="hlt-cruise-v1-heading">
    <h2 id={id}>{children}</h2>
    {subtitle && <p>{subtitle}</p>}
  </header>;
}

export default function CruiseLandingCollection() {
  const [bay, setBay] = useState(allBays);
  const [tier, setTier] = useState(allTiers);
  const [limit, setLimit] = useState(batchSize);
  const bayEntries = cruiseCollectionEntries.filter((item) => bay === allBays || item.bay === bay);
  const matching = bayEntries.filter((item) => tier === allTiers || item.tier === tier);
  const selectBay = (value) => { setBay(value); setLimit(batchSize); };
  const selectTier = (value) => { setTier(value); setLimit(batchSize); };

  return <div className="hlt-cruise-v1">
    <section className="hlt-container hlt-cruise-v1-section" aria-labelledby="cruise-types">
      <SectionHeading id="cruise-types" subtitle="Four ways to experience Ha Long Bay and Lan Ha Bay.">Choose Your Cruise Experience</SectionHeading>
      <div className="hlt-cruise-v1-types">
        {cruiseLanding.types.map((item, index) => <article className="hlt-cruise-v1-card" key={item.id}>
          <div className="hlt-cruise-v1-photo">
            <img src={cruiseImages[item.image]} alt="" loading="lazy" decoding="async" />
            <span className="hlt-cruise-v1-badge">{item.badge}</span>
          </div>
          <div className="hlt-cruise-v1-body">
            <h3>{String(index + 1).padStart(2, "0")}. {item.title}</h3>
            <p className="hlt-cruise-v1-emphasis">{item.schedule}</p>
            <p>{item.text}</p>
            {item.id === "overnight"
              ? <a className="hlt-cruise-v1-type-link" href="#cruise-collection">Explore overnight cruises <span aria-hidden="true">↗</span></a>
              : <a className="hlt-cruise-v1-type-link" href={cruiseInquiry(item.title.toLowerCase())} target="_blank" rel="noopener noreferrer">Ask about {item.title.toLowerCase()} <span aria-hidden="true">↗</span></a>}
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
            <span>{label}</span><small>({cruiseCollectionEntries.filter((item) => label === allBays || item.bay === label).length})</small>
          </label>)}
        </fieldset>
        <div className="hlt-cruise-v1-results">
          <fieldset className="hlt-cruise-v1-tiers">
            <legend>Cruise Tier</legend>
            {tiers.map((label) => <label key={label} className={tier === label ? "is-selected" : undefined}>
              <input type="radio" name="cruise-tier" checked={tier === label} onChange={() => selectTier(label)} />
              {label} <small>({bayEntries.filter((item) => label === allTiers || item.tier === label).length})</small>
            </label>)}
          </fieldset>
          <label className="hlt-cruise-mobile-only hlt-cruise-mobile-destination">Destination:
            <select value={bay} onChange={(event) => selectBay(event.target.value)}>
              {bays.map((label) => <option key={label}>{label}</option>)}
            </select>
          </label>
          <p className="hlt-cruise-v1-results-note" aria-live="polite">{matching.length} {matching.length === 1 ? "cruise" : "cruises"} · {bay} · {tier}</p>
          {matching.length === 0 && <p className="hlt-cruise-v1-empty">No {tier} cruises are listed for {bay}. <button type="button" onClick={() => selectTier(allTiers)}>Show all tiers</button></p>}
          <div className="hlt-cruise-v1-cards">
            {matching.slice(0, limit).map((item) => <article className="hlt-cruise-v1-card" key={item.name}>
              <div className="hlt-cruise-v1-photo">
                <img src={bayArtwork[item.bay]} alt="" loading="lazy" decoding="async" />
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
