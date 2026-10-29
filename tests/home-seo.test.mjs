import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

test("Home renders the requested SEO heading hierarchy and matching metadata", async () => {
  const dom = new JSDOM("<html></html>", { url: "https://hoangluxury.travel/" });
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  let rendered;
  try {
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    rendered = new JSDOM(renderToStaticMarkup(React.createElement(App)));
    const page = rendered.window.document;
    const text = (element) => element.textContent.replace(/\s+/g, " ").trim();
    const headings = (selector) => [...page.querySelectorAll(selector)].map(text);
    assert.deepEqual(headings("h1"), ["Private Car Transfer"]);
    for (const expected of [
      "Why Choose Hoang Luxury Travel?",
      "Our Services - Private Car Transfer",
      "Our Fleet - Premium Vehicle Selection",
      "Your Journey - Private Transfer Routes",
      "Booking Process",
      "Ready To Start Your Journey?",
    ]) assert.ok(headings("h2").includes(expected), expected);
    assert.deepEqual(headings(".hlt-why-card h3"), [
      "Privacy & Professionalism", "Our Fleet. Our Responsibility",
      "24/7 WhatsApp Support", "Flexible Payment Methods",
    ]);
    assert.deepEqual(headings(".hlt-service-card h3"), [
      "Airport Transfer", "Long-Distance Private Transfer",
      "Custom Private Trip", "Business & Partner Transfer",
    ]);
    assert.deepEqual(headings(".hlt-fleet-card h3"), ["Limo Lux", "Limo Prime", "VF9 Luxury"]);
    assert.deepEqual(headings(".hlt-route-card h3"), [
      "Sapa", "Halong", "Ninh Binh", "Ha Giang", "Cat Ba", "Cao Bang",
      "Moc Chau", "Mu Cang Chai", "Ta Xua",
    ].map((destination) => `Hanoi/Noi Bai to ${destination}`));
    assert.deepEqual(headings(".hlt-process-step h3"), [
      "01. Contact Us", "02. Plan Your Trip", "03. Confirm Booking", "04. Enjoy Journey",
    ]);
    // Mobile dùng chính dải CTA của PC (27/10/2026), không còn thẻ riêng.
    assert.deepEqual(headings("#journey-cta-title, #journey-cta-title-mobile"), [
      "Ready To Start Your Journey?",
    ]);

    const shell = new JSDOM(await readFile(new URL("../index.html", import.meta.url), "utf8"));
    const title = "Private Car Transfer From Hanoi Or Noi Bai Airport | Hoang Luxury Travel";
    const description = "Hoang Luxury Travel provides private transfer and car-with-driver services across Northern Vietnam. We specialize in long-distance journeys from Hanoi and Noi Bai International Airport to Sa Pa, Ha Long Bay, Ninh Binh, Ha Giang and other famous destinations.";
    assert.equal(shell.window.document.title, title);
    assert.equal(shell.window.document.querySelector('meta[name="description"]').content, description);
    assert.equal(shell.window.document.querySelector('meta[property="og:title"]').content, title);
    assert.equal(shell.window.document.querySelector('meta[property="og:description"]').content, description);
    const entry = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
    assert.ok(entry.includes(JSON.stringify(title)));
    assert.ok(entry.includes(JSON.stringify(description)));
    shell.window.close();
  } finally {
    await server.close();
    rendered?.window.close();
    dom.window.close();
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});
