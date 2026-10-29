import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

test("experience gallery admits decoded photos only, fills failed-image gaps and retries without stopping smooth playback", async () => {
  const dom = new JSDOM('<div id="root"></div>', { pretendToBeVisual: true });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const observers = [];
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() {}
  };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const frames = new Map(); let frameId = 0;
  window.requestAnimationFrame = (callback) => { frames.set(++frameId, callback); return frameId; };
  window.cancelAnimationFrame = (id) => frames.delete(id);
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  const root = createRoot(document.getElementById("root"));
  try {
    const { default: Slider } = await server.ssrLoadModule("/src/components/home/ExperienceSlider.jsx");
    await act(() => root.render(React.createElement(Slider)));
    assert.equal(document.querySelectorAll("#experience img").length, 0, "no footer downloads at page entry");
    await act(() => observers.forEach((observer) => observer.callback([{ isIntersecting: true }])));
    const preloads = [...document.querySelectorAll("#experience [hidden] img")];
    assert.ok(preloads.length > 5);
    assert.equal(document.querySelectorAll(".hlt-experience-track img").length, 0);
    let decode;
    preloads[0].decode = () => new Promise((resolve) => { decode = resolve; });
    await act(() => {
      preloads[0].dispatchEvent(new window.Event("load"));
      preloads.slice(1).forEach((img) => img.dispatchEvent(new window.Event("error")));
    });
    assert.equal(document.querySelectorAll(".hlt-experience-track img").length, 0, "load event alone is not decode readiness");
    await act(async () => decode());
    const displayed = [...document.querySelectorAll(".hlt-experience-track img")];
    assert.ok(displayed.length >= 6, "repeat surviving photos to cover desktop, not empty slots");
    assert.ok(displayed.every((img) => img.src === preloads[0].src));
    assert.ok(frames.size > 0, "smooth animation scheduled");
    await act(() => document.querySelector(".hlt-experience-retry button").click());
    assert.ok(document.querySelectorAll(".hlt-experience-track img").length >= 6, "retry retains the working gallery");
    assert.ok(frames.size > 0, "retry does not pause the track");
    await act(() => [...document.querySelectorAll("#experience [hidden] img")].slice(1).forEach((img) => img.dispatchEvent(new window.Event("load"))));
    assert.equal(document.querySelector(".hlt-experience-retry"), null);
    assert.equal(new Set([...document.querySelectorAll(".hlt-experience-track img")].map((img) => img.src)).size, preloads.length);
  } finally {
    await act(() => root.unmount());
    assert.equal(frames.size, 0, "animation cleanup");
    await server.close(); dom.window.close();
    for (const key of ["window", "document", "ResizeObserver", "IS_REACT_ACT_ENVIRONMENT"]) delete globalThis[key];
  }
});
