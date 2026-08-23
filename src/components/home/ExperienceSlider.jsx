import React from "react";
import { experienceImages } from "../../config/assets.js";

export default function ExperienceSlider() {
  const slides = [...experienceImages, ...experienceImages];

  return (
    <section
      id="experience"
      className="hlt-experience-slider"
      aria-labelledby="experience-slider-title"
    >
      <header className="hlt-experience-heading">
        <div className="hlt-experience-title-row">
          <span aria-hidden="true" />
          <h2 id="experience-slider-title">The Hoang Luxury Experience</h2>
          <span aria-hidden="true" />
        </div>
        <p>Private journeys. Exceptional destinations.</p>
      </header>

      <div className="hlt-experience-viewport">
        <div className="hlt-experience-track">
          {slides.map((image, index) => {
            const isDuplicate = index >= experienceImages.length;

            return (
              <figure
                className="hlt-experience-slide"
                key={`${image.src}-${index}`}
                aria-hidden={isDuplicate || undefined}
              >
                <img
                  src={image.src}
                  alt={isDuplicate ? "" : image.alt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
