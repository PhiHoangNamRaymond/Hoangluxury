import React from "react";
import { whyIconImages } from "../../config/assets.js";
import { whyItems } from "../../data.js";

export default function WhyChoose() {
  return (
    <section className="hlt-section hlt-why" aria-labelledby="why-title">
      <div className="hlt-container hlt-why-layout">
        <div className="hlt-why-intro">
          <h2 id="why-title">
            <span className="hlt-why-eyebrow">Why Choose </span>
            <span className="hlt-why-eyebrow-line" aria-hidden="true" />
            <span className="hlt-why-title-gold">Hoang Luxury </span>
            <span className="hlt-why-title-ink">Travel?</span>
          </h2>
          <div className="hlt-gold-line" />
          <p>
            <strong>Hoang Luxury Travel</strong> is a trusted 5-star private transfer service from Hanoi and Noi Bai International Airport to popular destinations across Northern Vietnam. We offer flexible, door-to-door transportation tailored to your individual needs. Every journey is designed to provide a comfortable, convenient, and stress-free travel experience, allowing you to save time and enjoy the journey.
          </p>
        </div>

        <div className="hlt-why-cards">
          {whyItems.map((item) => (
            <article className="hlt-why-card" key={item.icon}>
              <div className="hlt-icon">
                <img src={whyIconImages[item.icon]} alt="" />
              </div>
              <div className="hlt-why-card-content">
                <h3>
                  {Array.isArray(item.title)
                    ? item.title.map((line, index) => (
                        <span key={line} style={{ display: "block", whiteSpace: "nowrap" }}>{line}{index === 0 ? ". " : ""}</span>
                      ))
                    : item.title}
                </h3>
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
