import React from "react";
import {
  curatedMountainDecorationUrl,
  fleetImages,
  routeArtwork,
  routeViewAllButtonUrl,
  vietnamRoutesMapUrl,
} from "../../config/assets.js";
import { catalogPageUrl, fleet as fleetItems, popularRoutes } from "../../data.js";

function FleetSpecIcon({ spec }) {
  const type = spec.toLowerCase();

  if (type.includes("seat")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2" /></svg>;
  }

  if (type.includes("premium")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9L12 2.8Z" /></svg>;
  }

  if (type.includes("comfort")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3.5C12 4 6.2 8.3 5.5 15.6c3.9.9 8-.3 10.7-3.2C18.8 9.7 20 6.5 20 3.5Z" /><path d="M4 20c2.2-4.2 5.5-7.1 10.2-9.2" /></svg>;
  }

  if (type.includes("electric")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.5 2-8 11H12l-1.5 9 8-12H12l1.5-8Z" /></svg>;
  }

  if (type.includes("luxury")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Z" /><path d="M5 21h14" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V4h6v3M4 12h16M10 12v2h4v-2" /></svg>;
}

export default function Fleet() {
  return (
    <section id="fleet" className="hlt-section hlt-fleet">
      <div className="hlt-container">
        <div className="hlt-fleet-heading">
          <p className="hlt-fleet-kicker">Our Fleet</p>
          <h2>Premium Vehicle Selection</h2>
          <div className="hlt-fleet-heading-ornament" />
        </div>

        <div className="hlt-fleet-grid">
          {fleetItems.map((vehicle) => (
            <article className="hlt-fleet-card" key={vehicle.name}>
              <h3>{vehicle.name}</h3>
              <div className="hlt-fleet-img">
                <img src={fleetImages[vehicle.image]} alt={vehicle.name} />
              </div>
              <div className="hlt-fleet-body">
                <div className="hlt-fleet-specs">
                  {vehicle.specs.map((spec) => (
                    <span key={spec}>
                      <FleetSpecIcon spec={spec} />
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hlt-fleet-divider" aria-hidden="true" />

        <div className="hlt-route-showcase" id="routes">
          <img
            className="hlt-route-landscape-decoration"
            src={curatedMountainDecorationUrl}
            alt=""
            aria-hidden="true"
          />

          <div className="hlt-route-map" aria-hidden="true">
            <img src={vietnamRoutesMapUrl} alt="" />
          </div>

          <div className="hlt-route-content">
            <div className="hlt-route-heading">
              <p>Curated Journeys</p>
              <h2>Popular Transfer Routes</h2>
              <div className="hlt-route-heading-ornament" />
            </div>

            <div className="hlt-route-grid">
              {popularRoutes.map((route, index) => (
                <article className="hlt-route-card" key={route}>
                  <span className="hlt-route-number">{String(index + 1).padStart(2, "0")}</span>
                  {routeArtwork[index] ? (
                    <span className="hlt-route-artwork" aria-hidden="true">
                      <img src={routeArtwork[index]} alt="" />
                    </span>
                  ) : (
                    <span className="hlt-route-mountain" aria-hidden="true">
                      <svg viewBox="0 0 80 42">
                        <path d="M3 37 22 14l10 12L45 6l32 31H3Z" />
                        <path d="m16 37 14-16 10 10 9-12 16 18" />
                      </svg>
                    </span>
                  )}
                  <h3>Hanoi / Noi Bai</h3>
                  <p>{route}</p>
                  <span className="hlt-route-card-ornament" aria-hidden="true" />
                </article>
              ))}
            </div>

            <a
              className="hlt-route-cta hlt-route-cta-button"
              href="/journeys/"
              aria-label="View All Routes"
            >
              <span className="hlt-route-cta-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M12 4 L13.8 10.2 L20 12 L13.8 13.8 L12 20 L10.2 13.8 L4 12 L10.2 10.2 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="hlt-route-cta-label">VIEW ALL ROUTES</span>
              <span className="hlt-route-cta-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
