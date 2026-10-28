import React from "react";
import ContentImage from "../ContentImage.jsx";
import useNearViewport from "../../hooks/useNearViewport.js";
import { servicePhotoProps, serviceIconProps } from "../../config/home-responsive-images.js";
import {
  serviceIconImages,
  serviceImages,
  servicesBackgroundUrl,
} from "../../config/assets.js";
import { catalogPageUrl, services as serviceItems } from "../../data.js";

export default function Services() {
  const [sectionRef, near] = useNearViewport();
  return (
    <section
      id="services"
      ref={sectionRef}
      className="hlt-section hlt-services"
      style={{ "--services-bg": near ? `url(${servicesBackgroundUrl})` : "none" }}
    >
      <div className="hlt-container">
        <div className="hlt-services-heading">
          <h2><span className="hlt-seo-kicker">Our Services<span className="hlt-seo-sep"> - </span></span><span className="hlt-seo-heading-main">Private Car Transfer</span></h2>
          <div className="hlt-services-ornament" />
        </div>

        <div className="hlt-service-grid">
          {serviceItems.map((service, index) => (
            <article className="hlt-service-card" key={service.title}>
              <div className="hlt-service-media">
                <div className="hlt-service-image">
                  <ContentImage src={serviceImages[service.image]} {...servicePhotoProps(service.image, serviceImages[service.image])} alt={service.alt} loading="lazy" decoding="async" />
                </div>
                <div className="hlt-service-icon hlt-service-icon-desktop">
                  <img src={serviceIconImages[index]} {...serviceIconProps(index, serviceIconImages[index])} alt="" aria-hidden="true" loading="lazy" />
                </div>
              </div>
              <div className="hlt-service-body">
                <div className="hlt-service-title-row">
                  <div className="hlt-service-icon hlt-service-icon-mobile">
                    <img src={serviceIconImages[index]} {...serviceIconProps(index, serviceIconImages[index])} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                  <h3>{service.title === "Business / Partner Transfer" ? "Business & Partner Transfer" : service.title}</h3>
                </div>
                <span className="hlt-service-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="hlt-services-cta">
          <a href={catalogPageUrl}>
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
