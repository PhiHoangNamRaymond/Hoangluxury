import React from "react";
import {
  serviceIconImages,
  serviceImages,
  servicesBackgroundUrl,
} from "../../config/assets.js";
import { services as serviceItems } from "../../data.js";

export default function Services() {
  return (
    <section
      id="services"
      className="hlt-section hlt-services"
      style={{ "--services-bg": `url(${servicesBackgroundUrl})` }}
    >
      <div className="hlt-container">
        <div className="hlt-services-heading">
          <p>Our Services</p>
          <h2>Private Luxury Transfer</h2>
          <div className="hlt-services-ornament" />
        </div>

        <div className="hlt-service-grid" data-scroll-anchor>
          {serviceItems.map((service, index) => (
            <article className="hlt-service-card" key={service.title}>
              <div className="hlt-service-media">
                <div className="hlt-service-image">
                  <img src={serviceImages[service.image]} alt={service.title} />
                </div>
                <div className="hlt-service-icon">
                  <img src={serviceIconImages[index]} alt="" aria-hidden="true" />
                </div>
              </div>
              <div className="hlt-service-body">
                <span className="hlt-service-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="hlt-services-cta">
          <a href="#contact">
            <span>View All Services</span>
            <svg className="hlt-services-chev" viewBox="0 0 18 18" aria-hidden="true">
              <path d="m6.5 3.8 5 5.2-5 5.2" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
