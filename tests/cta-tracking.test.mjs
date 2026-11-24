// Data Layer H1-01 (WhatsApp) và H1-02 (Booking Form): một lượt nhấn = một sự kiện, đủ trường, không lộ dữ liệu.
import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import {
  WHATSAPP_EVENT,
  isWhatsAppHref,
  routeIdFromJourneyKey,
  setupCtaTracking,
  waCta,
  BOOKING_EVENT,
  bookingCta,
  isBookingHref,
} from "../src/lib/cta-tracking.js";

const waHref = "https://wa.me/84839779888?text=Hello%20from%20Hanoi%20to%20SAPA";
const attrs = (props) => Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(" ");

function page(html, context) {
  const dom = new JSDOM(`<body>${html}</body>`, { url: "https://hoangluxury.travel/routes/hanoi-to-sapa-private-transfer/" });
  dom.window.dataLayer = [];
  setupCtaTracking(context, dom.window);
  const click = (selector) => {
    const node = dom.window.document.querySelector(selector);
    // Không điều hướng thật trong jsdom.
    node.closest("a")?.addEventListener("click", (event) => event.preventDefault(), { once: true });
    node.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
  };
  return { win: dom.window, click, events: () => dom.window.dataLayer.filter((item) => item.event === WHATSAPP_EVENT) };
}

test("route ids and WhatsApp URL detection", () => {
  assert.equal(routeIdFromJourneyKey("sapa"), "hanoi_to_sapa");
  assert.equal(routeIdFromJourneyKey("sapa-to-ha-long"), "sapa_to_ha_long");
  assert.equal(routeIdFromJourneyKey(null), null);
  for (const href of [waHref, "https://api.whatsapp.com/send?phone=1", "https://web.whatsapp.com/", "whatsapp://send?text=x"]) {
    assert.equal(isWhatsAppHref(href), true, href);
  }
  for (const href of ["/booking/", "mailto:info@hoangluxury.travel", "https://wa.me.evil.test/", "tel:+84839779888"]) {
    assert.equal(isWhatsAppHref(href), false, href);
  }
});

test("one click pushes exactly one complete event with the clicked button's data", () => {
  const { click, events } = page(`
    <a id="pricing" href="${waHref}" ${attrs(waCta("pricing", "whatsapp_route_pricing"))}><svg></svg><span>Book via   WhatsApp</span></a>
    <a id="bottom" href="${waHref}" ${attrs(waCta("bottom_cta", "whatsapp_route_bottom_cta"))}>Book via WhatsApp</a>`,
  { pageType: "route_detail", serviceType: "private_transfer", routeId: "hanoi_to_sapa" });
  click("#pricing span");
  assert.deepEqual(events(), [{
    event: "hlt_whatsapp_click",
    page_type: "route_detail",
    service_type: "private_transfer",
    route_id: "hanoi_to_sapa",
    cta_location: "pricing",
    cta_id: "whatsapp_route_pricing",
    cta_text: "Book via WhatsApp",
  }]);
  click("#bottom");
  assert.equal(events().length, 2);
  assert.equal(events()[1].cta_location, "bottom_cta");
  assert.equal(events()[1].route_id, "hanoi_to_sapa");
});

test("no URL, message or phone digits leak; non-WhatsApp links and repeated setup do not push", () => {
  const { win, click, events } = page(`
    <a id="wa" href="${waHref}" ${attrs(waCta("header", "whatsapp_header"))}>WhatsApp Now</a>
    <a id="form" href="/booking/">Book via Form</a>`,
  { pageType: "home", serviceType: "private_transfer", routeId: null });
  setupCtaTracking({ pageType: "home" }, win);
  assert.equal(events().length, 0, "render/setup alone must not push");
  click("#form");
  click("#wa");
  assert.equal(events().length, 1);
  const serialized = JSON.stringify(events());
  assert.doesNotMatch(serialized, /wa\.me|text=|Hello|84839779888/);
});

test("per-button overrides: route cards, general contact, photo packages, icon-only links", () => {
  const { click, events } = page(`
    <a id="card" href="${waHref}" ${attrs(waCta("route_card", "whatsapp_route_card", { route: "hanoi_to_ha_long" }))}>BOOK VIA WHATSAPP</a>
    <a id="general" href="${waHref}" ${attrs(waCta("bottom_cta", "whatsapp_policy_help", { service: null }))}>Contact us now</a>
    <a id="half" href="${waHref}" ${attrs(waCta("package_card", "whatsapp_photo_half_day"))}>Book Half-Day</a>
    <a id="qr" href="${waHref}" ${attrs(waCta("footer", "whatsapp_footer_qr", { text: "WhatsApp QR" }))}><img alt=""></a>
    <footer><a id="plain" href="https://wa.me/84839779888">Chat</a></footer>`,
  { pageType: "route_list", serviceType: "private_transfer", routeId: null });
  ["#card", "#general", "#half", "#qr img", "#plain"].forEach(click);
  const [card, general, half, qr, plain] = events();
  assert.equal(card.route_id, "hanoi_to_ha_long");
  assert.equal(general.service_type, null);
  assert.equal(half.cta_id, "whatsapp_photo_half_day");
  assert.equal(qr.cta_text, "WhatsApp QR");
  assert.equal(plain.cta_location, "footer");
  assert.equal(plain.cta_id, "whatsapp_footer");
  assert.equal(plain.route_id, null);
});

// Mọi nút WhatsApp trong mã giao diện phải có nhãn tracking riêng (waCta).
test("every WhatsApp link in the site source carries waCta tracking attributes", async () => {
  const files = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== "admin") await walk(path); } else if (path.endsWith(".jsx")) files.push(path);
    }
  };
  await walk("src");
  const missing = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/<a\b[^>]*?href=\{(?:whatsapp\w*|item\.whatsappUrl|cruiseInquiry\([^)]*\)|getCustomInquiryUrl\([^)]*\))\}[^>]*>/gs)) {
      if (!match[0].includes("waCta(")) missing.push(`${file}: ${match[0].slice(0, 90)}`);
    }
  }
  assert.deepEqual(missing, []);
});

function bookingPage(html, context, url = "https://hoangluxury.travel/routes/hanoi-to-sapa-private-transfer/") {
  const dom = new JSDOM(`<body>${html}</body>`, { url });
  dom.window.dataLayer = [];
  setupCtaTracking(context, dom.window);
  const click = (selector) => {
    const node = dom.window.document.querySelector(selector);
    node.closest("a")?.addEventListener("click", (event) => event.preventDefault(), { once: true });
    node.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
  };
  return { click, all: () => dom.window.dataLayer, events: () => dom.window.dataLayer.filter((item) => item.event === BOOKING_EVENT) };
}

test("booking link detection: same-site /booking only", () => {
  for (const href of ["/booking/", "/booking", "/booking/?src=RKS002", "https://hoangluxury.travel/booking/#form"]) {
    assert.equal(isBookingHref(href), true, href);
  }
  for (const href of ["/catalog/", "/booking-guide/", "https://evil.test/booking/", "#booking", "https://wa.me/84839779888"]) {
    assert.equal(isBookingHref(href), false, href);
  }
});

test("booking clicks push exactly one 5-field event with the clicked button's route and location", () => {
  const { click, events, all } = bookingPage(`
    <header><a id="nav" href="/booking/" ${attrs(bookingCta("header", "booking_header", { route: null }))}>Booking</a></header>
    <a id="pricing" href="/booking/" ${attrs(bookingCta("pricing", "booking_route_pricing"))}><span>Book via Form</span></a>
    <a id="bottom" href="/booking/" ${attrs(bookingCta("bottom_cta", "booking_route_bottom_cta"))}>Book via Form</a>
    <a id="catalog" href="/catalog/" ${attrs(bookingCta("hero", "booking_route_hero"))}>View Catalog</a>
    <footer><a id="plain" href="/booking/">Booking</a></footer>`,
  { pageType: "route_detail", serviceType: "private_transfer", routeId: "hanoi_to_sapa" });
  click("#pricing span");
  assert.deepEqual(events(), [{
    event: "hlt_booking_form_click",
    page_type: "route_detail",
    route_id: "hanoi_to_sapa",
    cta_location: "pricing",
    cta_id: "booking_route_pricing",
    cta_text: "Book via Form",
  }]);
  click("#bottom");
  click("#nav");
  click("#catalog");
  click("#plain");
  const [, bottom, nav, plain] = events();
  assert.equal(events().length, 4, "catalog link must not count as booking");
  assert.equal(all().length, 4, "no WhatsApp event for booking links");
  assert.equal(bottom.cta_location, "bottom_cta");
  assert.equal(bottom.route_id, "hanoi_to_sapa");
  assert.deepEqual([nav.cta_location, nav.cta_id, nav.route_id], ["header", "booking_header", null]);
  assert.deepEqual([plain.cta_location, plain.cta_id, plain.route_id], ["footer", "booking_footer", null]);
  assert.equal("service_type" in nav, false);
});

test("booking links on the Booking page itself and WhatsApp links do not push booking events", () => {
  const { click, events, all } = bookingPage(`
    <a id="nav" href="/booking/" ${attrs(bookingCta("header", "booking_header", { route: null }))}>Booking</a>
    <a id="wa" href="https://wa.me/84839779888?text=x" ${attrs(waCta("package_card", "whatsapp_photo_half_day"))}>Book Half-Day</a>`,
  { pageType: "booking", serviceType: "private_transfer", routeId: null }, "https://hoangluxury.travel/booking/");
  click("#nav");
  click("#wa");
  assert.equal(events().length, 0);
  assert.equal(all().length, 1);
  assert.equal(all()[0].event, "hlt_whatsapp_click");
});

// Mọi link /booking/ trong mã giao diện phải có nhãn bookingCta.
test("every Booking Form link in the site source carries bookingCta tracking attributes", async () => {
  const files = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== "admin") await walk(path); } else if (path.endsWith(".jsx")) files.push(path);
    }
  };
  await walk("src");
  const missing = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/<a\b[^>]*?href=(?:"\/booking\/"|\{[^}]*"\/booking\/"[^}]*\})[^>]*>/gs)) {
      if (!match[0].includes("bookingCta(")) missing.push(`${file}: ${match[0].slice(0, 90)}`);
    }
  }
  assert.deepEqual(missing, []);
});

// H1-04: hoàn thành từng bước Booking Form mobile.
test("booking steps 1-4 push once per form attempt; step 5 never; reset starts a new sequence", async () => {
  const { createBookingStepTracker, BOOKING_STEP_EVENT } = await import("../src/lib/booking-step-tracking.js");
  const win = { dataLayer: [] };
  const tracker = createBookingStepTracker(win);
  const steps = () => win.dataLayer.filter((item) => item.event === BOOKING_STEP_EVENT);
  [1, 2, 1, 2, 3, 3, 4, 5].forEach((step) => tracker.complete(step)); // Back rồi Continue lại: không trùng
  assert.deepEqual(steps(), [
    { event: "hlt_booking_step_complete", form_id: "transfer_booking", step_number: 1, step_name: "journey_route" },
    { event: "hlt_booking_step_complete", form_id: "transfer_booking", step_number: 2, step_name: "flight_details" },
    { event: "hlt_booking_step_complete", form_id: "transfer_booking", step_number: 3, step_name: "passenger_details" },
    { event: "hlt_booking_step_complete", form_id: "transfer_booking", step_number: 4, step_name: "ride_preferences" },
  ]);
  tracker.reset();
  tracker.complete(1);
  assert.equal(steps().length, 5);
});
