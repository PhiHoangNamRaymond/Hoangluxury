import React, { useEffect, useRef, useState } from "react";
import { experienceImages } from "../../config/assets.js";

const DEFAULT_SCROLL_SPEED = 64;
const REDUCED_MOTION_SCROLL_SPEED = 28;

export default function ExperienceSlider() {
  const slides = [...experienceImages, ...experienceImages];
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const pointerRef = useRef({ active: false, id: null, x: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const normalizeOffset = () => {
    const loopWidth = loopWidthRef.current;
    if (!loopWidth) return;

    while (offsetRef.current <= -loopWidth) offsetRef.current += loopWidth;
    while (offsetRef.current > 0) offsetRef.current -= loopWidth;
  };

  const renderTrackPosition = () => {
    normalizeOffset();
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const measureTrack = () => {
      loopWidthRef.current = track.scrollWidth / 2;
      renderTrackPosition();
    };

    measureTrack();
    const resizeObserver = new ResizeObserver(measureTrack);
    resizeObserver.observe(track);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame;
    let previousTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = Math.min(currentTime - previousTime, 64);
      previousTime = currentTime;

      if (!pointerRef.current.active) {
        const speed = reducedMotion.matches
          ? REDUCED_MOTION_SCROLL_SPEED
          : DEFAULT_SCROLL_SPEED;
        offsetRef.current -= speed * (elapsed / 1000);
        renderTrackPosition();
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const startDragging = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pointerRef.current = {
      active: true,
      id: event.pointerId,
      x: event.clientX,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const dragTrack = (event) => {
    const pointer = pointerRef.current;
    if (!pointer.active || pointer.id !== event.pointerId) return;

    offsetRef.current += event.clientX - pointer.x;
    pointer.x = event.clientX;
    renderTrackPosition();
  };

  const stopDragging = (event) => {
    const pointer = pointerRef.current;
    if (!pointer.active || pointer.id !== event.pointerId) return;

    pointerRef.current = { active: false, id: null, x: 0 };
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const moveWithKeyboard = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const slideWidth = trackRef.current
      ?.querySelector(".hlt-experience-slide")
      ?.getBoundingClientRect().width;

    if (!slideWidth) return;
    offsetRef.current += event.key === "ArrowLeft" ? slideWidth : -slideWidth;
    renderTrackPosition();
  };

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

      <div
        ref={viewportRef}
        className={`hlt-experience-viewport${isDragging ? " is-dragging" : ""}`}
        role="region"
        aria-label="Experience gallery. Drag left or right, or use the arrow keys, to browse."
        tabIndex="0"
        onPointerDown={startDragging}
        onPointerMove={dragTrack}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={stopDragging}
        onKeyDown={moveWithKeyboard}
        onDragStart={(event) => event.preventDefault()}
      >
        <div ref={trackRef} className="hlt-experience-track">
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
                  draggable="false"
                />
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
