import React from "react";
import { whyIconImages } from "../../config/assets.js";
import { whyItems } from "../../data.js";

export default function WhyChoose() {
  return (
    <section className="hlt-section hlt-why" aria-labelledby="why-title">
      <div className="hlt-container hlt-why-layout">
        <div className="hlt-why-intro">
          <p className="hlt-why-eyebrow">Why choose</p>
          <div className="hlt-why-eyebrow-line" aria-hidden="true" />
          <h2 id="why-title">
            <span className="hlt-why-title-gold">Hoang<br />Luxury</span>
            <span className="hlt-why-title-ink">Travel?</span>
          </h2>
          <div className="hlt-gold-line" />
          <p>
            <strong>Hoang Luxury Travel</strong> is a 5-star personalized transfer service in Vietnam,
            offering private and comfortable journeys from professional airport pick-ups to Northwest
            mountain tours.
          </p>
        </div>

        <div className="hlt-why-cards">
          {whyItems.map((item) => (
            <article className="hlt-why-card" key={item.title}>
              <div className="hlt-icon">
                <img src={whyIconImages[item.icon]} alt="" />
              </div>
              <h3>{item.title}</h3>
              <div className="hlt-why-card-line" aria-hidden="true" />
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
