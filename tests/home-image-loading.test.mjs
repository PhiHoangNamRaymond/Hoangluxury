import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

test("Home defers background/map media, preserves content, and preloads only the next visible hero slide", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://fixture.invalid/" });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const observers = [];
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
    observe(target) { this.targets.add(target); }
    disconnect() { this.targets.clear(); }
    unobserve(target) { this.targets.delete(target); }
  };
  const requests = [];
  globalThis.Image = class {
    set src(url) { this.url = url; requests.push(this); }
  };
  const timers = new Map();
  let id = 0;
  window.setTimeout = (callback, delay) => { timers.set(++id, { callback, delay }); return id; };
  window.clearTimeout = (key) => timers.delete(key);
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  const root = createRoot(document.getElementById("root"));
  const intersect = async (target, visible) => {
    const observer = observers.find((item) => item.targets.has(target));
    assert.ok(observer, "target is observed");
    await act(() => observer.callback([{ target, isIntersecting: visible }]));
  };
  try {
    const { default: Services } = await server.ssrLoadModule("/src/components/home/Services.jsx");
    const { default: Fleet } = await server.ssrLoadModule("/src/components/home/Fleet.jsx");
    const { default: BookingProcess } = await server.ssrLoadModule("/src/components/home/BookingProcess.jsx");
    await act(() => root.render(React.createElement(React.Fragment, null,
      React.createElement(Services), React.createElement(Fleet), React.createElement(BookingProcess))));
    const services = document.getElementById("services");
    const routes = document.getElementById("routes");
    const booking = document.getElementById("contact");
    assert.equal(services.style.getPropertyValue("--services-bg"), "none");
    assert.equal(booking.style.getPropertyValue("--booking-process-bg"), "none");
    assert.equal(routes.querySelector("image").getAttribute("href"), null);
    assert.equal(routes.querySelectorAll("h3").length, 9);
    for (const img of document.querySelectorAll(".hlt-service-image img, .hlt-fleet-img img")) {
      assert.equal(img.getAttribute("loading"), "lazy");
      assert.ok(img.getAttribute("src"), "SEO content photo keeps its source");
      assert.ok(Number(img.getAttribute("width")) > 0);
      assert.ok(Number(img.getAttribute("height")) > 0);
      assert.match(img.getAttribute("srcset"), /320w.*640w.*960w.*1280w/);
      assert.ok(img.getAttribute("sizes"));
    }
    const serviceFrame = document.querySelector(".hlt-service-image");
    const failedPhoto = serviceFrame.querySelector("img");
    await act(() => failedPhoto.dispatchEvent(new window.Event("error")));
    assert.equal(serviceFrame.querySelector("img"), null);
    assert.match(serviceFrame.querySelector('[role="img"]').getAttribute("aria-label"), /Airport Transfer/);
    assert.equal(serviceFrame.children.length, 1, "fallback stays inside the same reserved frame");
    await intersect(services, true);
    await intersect(routes, true);
    await intersect(booking, true);
    assert.match(services.style.getPropertyValue("--services-bg"), /url\(/);
    assert.match(booking.style.getPropertyValue("--booking-process-bg"), /url\(/);
    assert.ok(routes.querySelector("image").getAttribute("href"));

    const { default: Hero } = await server.ssrLoadModule("/src/components/home/Hero.jsx");
    await act(() => root.render(React.createElement(Hero)));
    const hero = document.getElementById("home");
    assert.equal(requests.length, 0);
    // JSDOM starts hidden unless the visibility property is overridden.
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    await act(() => document.dispatchEvent(new window.Event("visibilitychange")));
    await intersect(hero, true);
    const preload = [...timers.values()].find((timer) => timer.delay === 1500);
    assert.ok(preload);
    await act(() => preload.callback());
    assert.equal(requests.length, 1, "not all four alternative banners");
    assert.equal(requests[0].fetchPriority, "low");
    await act(() => requests[0].onload());
    assert.equal(document.querySelectorAll(".hlt-hero-slide-image[style]").length, 2);
    await intersect(hero, false);
    assert.equal(timers.size, 0, "off-screen hero stops its timers");
  } finally {
    await act(() => root.unmount());
    await server.close();
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.Image;
  }
});

test("background skeleton does not start off-screen image requests", async () => {
  const dom = new JSDOM('<section style="background-image:url(/below-fold.jpg)"></section>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.HTMLImageElement = window.HTMLImageElement;
  globalThis.MutationObserver = window.MutationObserver;
  const section = document.querySelector("section");
  // JSDOM 29's selector engine fails a substring selector containing "(".
  // Supply the same target a native browser returns for this fixture.
  const queryAll = document.body.querySelectorAll.bind(document.body);
  document.body.querySelectorAll = (selector) => selector === '[style*="url("]'
    ? [section] : queryAll(selector);
  section.getBoundingClientRect = () => ({ top: 5000, bottom: 5500 });
  let observer;
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(target) { this.target = target; }
    unobserve() {}
  };
  window.getComputedStyle = (element) => ({
    backgroundImage: element.style.backgroundImage,
    animationName: "none", color: "rgb(0, 0, 0)",
  });
  const requests = [];
  globalThis.Image = class {
    set src(value) { this.url = value; requests.push(this); }
  };
  try {
    const { setupImageSkeletons } = await import("../src/lib/image-skeleton.js");
    setupImageSkeletons();
    assert.equal(requests.length, 0);
    assert.equal(observer.target, section);
    observer.callback([{ target: section, isIntersecting: true }]);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "/below-fold.jpg");
    requests[0].onload();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(section.classList.contains("hlt-bg-pending"), false);
  } finally {
    dom.window.close();
    for (const key of ["window", "document", "HTMLElement", "HTMLImageElement", "MutationObserver", "Image"]) delete globalThis[key];
  }
});
