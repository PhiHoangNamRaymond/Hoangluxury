import React from "react";
import { serviceImages, servicesBackgroundUrl } from "../../config/assets.js";
import { services as serviceItems, whatsappUrl } from "../../data.js";

function ServiceIcon({ type }) {
  const icons = {
    plane: (
      <>
        <path d="M3.8 12.2 20 5.4l-6.9 16.1-2.4-7.1-6.9-2.2Z" />
        <path d="m10.7 14.4 4-4" />
      </>
    ),
    mountain: (
      <>
        <path d="M3.5 18.5 10 7l3.4 5.7 2-3.1 5.1 8.9H3.5Z" />
        <path d="m8.6 13.1 1.4 1.2 1.7-1.6" />
      </>
    ),
    route: (
      <>
        <path d="M3.5 18.5 10 7l3.4 5.7 2-3.1 5.1 8.9H3.5Z" />
        <path d="M6 18.5c3.2-3.4 7.4-4.6 12.7-4.1" />
      </>
    ),
    dots: (
      <>
        <circle cx="7.2" cy="8.3" r="2.1" />
        <circle cx="16.8" cy="8.3" r="2.1" />
        <circle cx="12" cy="16.3" r="2.1" />
        <path d="M9.1 9.4 10.5 14M14.9 9.4 13.5 14" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

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

        <div className="hlt-service-grid">
          {serviceItems.map((service, index) => (
            <article className="hlt-service-card" key={service.title}>
              <div className="hlt-service-media">
                <div className="hlt-service-image">
                  <img src={serviceImages[service.image]} alt={service.title} />
                </div>
                <div className="hlt-service-icon">
                  <ServiceIcon type={service.icon} />
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
