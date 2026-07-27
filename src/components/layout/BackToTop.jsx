import React, { useEffect, useRef, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const animationFrame = useRef(null);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 520);
    const cancelScrollAnimation = () => {
      if (!animationFrame.current) return;

      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("wheel", cancelScrollAnimation, { passive: true });
    window.addEventListener("touchstart", cancelScrollAnimation, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("wheel", cancelScrollAnimation);
      window.removeEventListener("touchstart", cancelScrollAnimation);
      cancelScrollAnimation();
    };
  }, []);

  const scrollToTop = () => {
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);

    const startPosition = window.scrollY;
    const duration = 900;
    let startTime;

    const easeInOutCubic = (progress) =>
      progress < 0.5
        ? 4 * progress ** 3
        : 1 - (-2 * progress + 2) ** 3 / 2;

    const animateScroll = (time) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);

      window.scrollTo({
        top: startPosition * (1 - easeInOutCubic(progress)),
        behavior: "instant",
      });

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animateScroll);
      } else {
        animationFrame.current = null;
      }
    };

    animationFrame.current = requestAnimationFrame(animateScroll);
  };

  return (
    <button
      className={`hlt-back-to-top${visible ? " is-visible" : ""}`}
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={scrollToTop}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 14 6-6 6 6" />
      </svg>
    </button>
  );
}
