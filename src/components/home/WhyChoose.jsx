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
            <span className="hlt-why-title-gold">Hoang Luxury</span>
            <span className="hlt-why-title-ink">Travel?</span>
          </h2>
          <div className="hlt-gold-line" />
          <p>
            <strong>Hoang Luxury Travel</strong> is a trusted 5-star private transportation provider in Vietnam, specializing in private car with driver services, tailored to each journey for greater flexibility, comfort and personalization from Hanoi/Noi Bai Airport to destinations across Northern Vietnam.
          </p>
        </div>

        <div className="hlt-why-cards">
          {whyItems.map((item) => (
            <article className="hlt-why-card" key={item.title}>
              <div className="hlt-icon">
                <img src={whyIconImages[item.icon]} alt="" />
              </div>
              <div className="hlt-why-card-content">
                <h3>{item.title}</h3>
                <div className="hlt-why-card-line" aria-hidden="true" />
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
