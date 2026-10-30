import React, { useEffect, useMemo, useRef, useState } from "react";
import useNearViewport from "../../hooks/useNearViewport.js";
import { experienceSliderImages as experienceImages } from "../../config/assets.js";

const DEFAULT_SCROLL_SPEED = 64;
// Tải theo cụm 5 ảnh (khách yêu cầu 30/10/2026): cụm đầu (ảnh bên trái) xong là
// dải chạy ngay, cụm sau tải nối tiếp và được gắn vào cuối dải — dải chạy sang
// trái nên ảnh mới luôn đi vào từ mép phải, không giật lại từ đầu.
const BATCH_SIZE = 5;
const imageBatches = Array.from(
  { length: Math.ceil(experienceImages.length / BATCH_SIZE) },
  (_, index) => experienceImages.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE),
);

export default function ExperienceSlider() {
  const [sectionRef, inViewport] = useNearViewport({ rootMargin: "0px", once: false });
  const [preloadRef, nearViewport] = useNearViewport({ rootMargin: "1200px", once: true });
  const [imageStates, setImageStates] = useState({});
  const [retryVersions, setRetryVersions] = useState({});
  const [loadingBatches, setLoadingBatches] = useState(1);
  const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(false);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const pointerRef = useRef({ active: false, id: null, x: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [slowNetwork, setSlowNetwork] = useState(false);
  const isSettled = (image) => ["ready", "error"].includes(imageStates[image.src]);
  const allSettled = experienceImages.every(isSettled);
  const readyCount = experienceImages.filter((image) => imageStates[image.src] === "ready").length;
  const failedImages = experienceImages.filter((image) => imageStates[image.src] === "error");
  let settledBatches = 0;
  while (settledBatches < imageBatches.length && imageBatches[settledBatches].every(isSettled)) settledBatches += 1;
  // Only whole batches join the track, in order, so a photo never appears in
  // front of ones already playing. Slow first batch: start with what decoded.
  // Never shrinks: retrying a failed photo must not pull its batch off the track.
  const [shownBatches, setShownBatches] = useState(0);
  const targetBatches = settledBatches || (slowNetwork ? 1 : 0);
  useEffect(() => {
    if (targetBatches > shownBatches) setShownBatches(targetBatches);
  }, [targetBatches, shownBatches]);
  // Never include an unloaded/broken photo in the moving track.
  const gallerySources = imageBatches.slice(0, shownBatches).flat()
    .filter((image) => imageStates[image.src] === "ready").map((image) => image.src).join("|");
  const galleryImages = useMemo(
    () => experienceImages.filter((image) => gallerySources.split("|").includes(image.src)),
    [gallerySources],
  );
  // Repeat enough decoded photos to fill even a wide desktop when some fail.
  const copies = Math.max(2, Math.ceil(6 / Math.max(1, galleryImages.length)) + 1);
  const slides = Array.from({ length: copies }, () => galleryImages).flat();

  useEffect(() => {
    // Start the next batch once the previous one has settled; on a slow
    // network request the rest straight away rather than waiting batch by batch.
    if (loadingBatches >= imageBatches.length) return;
    if (slowNetwork) setLoadingBatches(imageBatches.length);
    else if (settledBatches >= loadingBatches) setLoadingBatches(loadingBatches + 1);
  }, [settledBatches, loadingBatches, slowNetwork]);

  const setImageState = (src, state) => setImageStates((current) =>
    current[src] === state ? current : { ...current, [src]: state });
  const retryImage = (src) => {
    setImageState(src, "loading");
    setRetryVersions((current) => ({ ...current, [src]: (current[src] || 0) + 1 }));
  };

  // Mạng chậm không được làm dải ảnh đứng im: sau 6 giây chạy trước với ảnh đã
  // xong. Ảnh còn đang tải KHÔNG bị coi là lỗi (trước đây hết 15 giây là huỷ cả
  // dải, máy ở xa / mạng chậm vào lần đầu thấy "could not be loaded" - 29/10/2026).
  // Chỉ ảnh lỗi thật (onError) mới có nút thử lại.
  useEffect(() => {
    if (!nearViewport) return undefined;
    const timer = window.setTimeout(() => setSlowNetwork(true), 6000);
    return () => window.clearTimeout(timer);
  }, [nearViewport]);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(media.matches);
    onVisibility();
    onMotion();
    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", onMotion);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotion);
    };
  }, []);

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
      loopWidthRef.current = track.scrollWidth / copies;
      renderTrackPosition();
    };

    measureTrack();
    const resizeObserver = new ResizeObserver(measureTrack);
    resizeObserver.observe(track);

    return () => resizeObserver.disconnect();
  }, [copies, galleryImages]);

  useEffect(() => {
    if (!inViewport || !pageVisible || reducedMotion || isDragging || !galleryImages.length) return undefined;
    let animationFrame;
    let previousTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = Math.min(currentTime - previousTime, 64);
      previousTime = currentTime;

      if (!pointerRef.current.active) {
        offsetRef.current -= DEFAULT_SCROLL_SPEED * (elapsed / 1000);
        renderTrackPosition();
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [inViewport, pageVisible, reducedMotion, isDragging, galleryImages]);

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
      ref={(node) => { sectionRef.current = node; preloadRef.current = node; }}
      className="hlt-experience-slider"
      aria-labelledby="experience-slider-title"
    >
      <header className="hlt-experience-heading">
        <div className="hlt-experience-title-row">
          <span aria-hidden="true" />
          {/* Không dùng thẻ heading: dải này lặp ở mọi trang, tránh làm rối cấu trúc H2 (SEO). */}
          <div id="experience-slider-title" className="hlt-experience-title"><span className="hlt-experience-title-lead">Hoang Luxury Travel</span> Experience</div>
          <span aria-hidden="true" />
        </div>
        <p>Private journeys. Exceptional service.</p>
      </header>

      {/* Eager only near the footer; decode before admitting photos to the track.
          Native horizontal lazy loading cannot keep up with a moving carousel.
          Requested one batch at a time (see BATCH_SIZE). */}
      <div hidden data-no-skeleton>
        {nearViewport && imageBatches.slice(0, loadingBatches).flat().map((image) => imageStates[image.src] !== "error" && (
          <img key={`${image.src}-${retryVersions[image.src] || 0}`} src={image.src} alt="" loading="eager" decoding="async"
            onLoad={(event) => {
              const element = event.currentTarget;
              const done = () => { if (element.isConnected) setImageState(image.src, "ready"); };
              if (element.decode) element.decode().then(done, () => { if (element.isConnected) setImageState(image.src, "error"); });
              else done();
            }}
            onError={() => setImageState(image.src, "error")} />
        ))}
      </div>

      {!galleryImages.length && (
        <div className="hlt-experience-loading" role="status">
          {allSettled && !readyCount ? "Photos could not be loaded. Please try again." : `Preparing photos… ${readyCount}/${experienceImages.length}`}
        </div>
      )}
      {!!failedImages.length && (
        <div className="hlt-experience-retry">
          <button type="button" onClick={() => failedImages.forEach((image) => retryImage(image.src))}>Retry unavailable photos</button>
        </div>
      )}

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
            const isDuplicate = index >= galleryImages.length;

            return (
              <figure
                className="hlt-experience-slide"
                key={`${image.src}-${index}`}
                aria-hidden={isDuplicate || undefined}
              >
                {(
                  <img
                    key={retryVersions[image.src] || 0}
                    src={image.src}
                    alt={isDuplicate ? "" : image.alt}
                    loading="eager"
                    decoding="sync"
                    draggable="false"
                    onError={() => setImageState(image.src, "error")}
                    data-version={retryVersions[image.src] || 0}
                    style={image.focus ? { objectPosition: image.focus } : undefined}
                  />
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
