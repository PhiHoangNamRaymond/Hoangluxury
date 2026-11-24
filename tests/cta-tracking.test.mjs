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
  assert.equal(all().filter((item) => item.event === "hlt_whatsapp_click").length, 0, "no WhatsApp event for booking links");
  assert.equal(all().filter((item) => item.event === "hlt_catalog_click").length, 1, "the /catalog/ link is a catalog click, not a booking click");
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

// H1-06: link tới trang Catalog nội bộ.
test("catalog clicks push one 6-field event; Drive/PDF, other pages and the Catalog page itself do not", async () => {
  const { CATALOG_EVENT, catalogCta, isCatalogHref } = await import("../src/lib/cta-tracking.js");
  for (const href of ["/catalog/", "/catalog", "https://hoangluxury.travel/catalog/?x=1"]) assert.equal(isCatalogHref(href), true, href);
  for (const href of ["/catalogue/", "https://drive.google.com/file/d/x/view", "/files/catalog.pdf", "https://evil.test/catalog/", "/services/"]) assert.equal(isCatalogHref(href), false, href);

  const route = bookingPage(`
    <header><a id="nav" href="/catalog/" ${attrs(catalogCta("header", "catalog_header_desktop"))}>Catalog</a></header>
    <a id="hero" href="/catalog/" ${attrs(catalogCta("hero", "catalog_route_hero"))}><span>View Catalog</span></a>
    <a id="services" href="/services/">View All Services</a>
    <footer><a id="plain" href="/catalog/">Catalog</a></footer>`,
  { pageType: "route_detail", serviceType: "private_transfer", pageServiceType: "private_transfer", routeId: "hanoi_to_sapa" });
  route.click("#hero span");
  const catalog = () => route.all().filter((item) => item.event === CATALOG_EVENT);
  assert.deepEqual(catalog(), [{
    event: "hlt_catalog_click", page_type: "route_detail", service_type: "private_transfer", route_id: "hanoi_to_sapa",
    cta_location: "hero", cta_id: "catalog_route_hero", cta_text: "View Catalog",
  }]);
  route.click("#services");
  route.click("#nav");
  route.click("#plain");
  assert.equal(route.all().length, 3, "the Services link is not a catalog click; one event per click");
  assert.deepEqual([catalog()[1].cta_id, catalog()[2].cta_location, catalog()[2].cta_id], ["catalog_header_desktop", "footer", "catalog_footer"]);

  const home = bookingPage(`<a id="nav" href="/catalog/" ${attrs(catalogCta("header", "catalog_header_desktop"))}>Catalog</a>`,
    { pageType: "home", serviceType: "private_transfer", pageServiceType: null, routeId: null }, "https://hoangluxury.travel/");
  home.click("#nav");
  assert.deepEqual(home.all()[0], { event: "hlt_catalog_click", page_type: "home", service_type: null, route_id: null, cta_location: "header", cta_id: "catalog_header_desktop", cta_text: "Catalog" });

  const onCatalog = bookingPage(`<a id="nav" href="/catalog/">Catalog</a><a id="pdf" href="https://drive.google.com/file/d/x/view">View PDF</a>`,
    { pageType: "catalog", pageServiceType: "private_transfer" }, "https://hoangluxury.travel/catalog/");
  onCatalog.click("#nav");
  onCatalog.click("#pdf");
  assert.equal(onCatalog.all().length, 0);
});

test("H1-07 tracks only marked Google Drive file links on Catalog, once per activation", async () => {
  const { CATALOG_OPEN_EVENT, catalogOpenCta } = await import("../src/lib/cta-tracking.js");
  const tag = attrs(catalogOpenCta("hlt_customer_catalog", "catalog_view_fleet_routes_pricing"));
  const dom = new JSDOM(`<body>
    <a id="document" href="https://drive.google.com/file/d/mock-id/view?resourcekey=never-send" target="_blank" rel="noopener noreferrer" ${tag}><span>View PDF</span></a>
    <a id="unmarked" href="https://drive.google.com/file/d/mock-id/view">Unmarked</a>
    <a id="folder" href="https://drive.google.com/drive/folders/mock-id" ${tag}>Folder</a>
    <a id="fallback" href="#catalog" ${tag}>Fallback</a>
    <a id="catalog" href="/catalog/" ${tag}>Internal Catalog</a>
    <a id="other" href="https://example.test/file/d/mock-id/view" ${tag}>Other</a>
    <a id="whatsapp" href="https://wa.me/123">WhatsApp</a>
  </body>`, { url: "https://hoangluxury.travel/catalog/" });
  const { window: win } = dom;
  const events = () => win.dataLayer?.filter(({ event }) => event === CATALOG_OPEN_EVENT) || [];
  const activate = (selector, type = "click", button = 0) => {
    const target = win.document.querySelector(selector);
    // Check that tracking does not cancel native navigation, then cancel it only in the test.
    target.addEventListener(type, (event) => {
      assert.equal(event.defaultPrevented, false);
      event.preventDefault();
    }, { once: true });
    target.dispatchEvent(new win.MouseEvent(type, { bubbles: true, cancelable: true, button }));
  };
  const expected = {
    event: "hlt_catalog_open", page_type: "catalog", catalog_id: "hlt_customer_catalog",
    cta_id: "catalog_view_fleet_routes_pricing", cta_location: "content",
  };
  assert.equal(setupCtaTracking({ pageType: "catalog" }, win), true);
  assert.equal(setupCtaTracking({ pageType: "catalog" }, win), false);
  assert.deepEqual(events(), []);
  for (const id of ["unmarked", "folder", "fallback", "catalog", "other", "whatsapp"]) activate(`#${id}`);
  activate("#document span", "auxclick", 2);
  assert.deepEqual(events(), []);
  activate("#document span");
  assert.deepEqual(events(), [expected]);
  activate("#document span", "auxclick", 1);
  assert.deepEqual(events(), [expected, expected]);
  assert.equal(win.dataLayer.some(({ event }) => event === "hlt_catalog_click"), false);
  setupCtaTracking({ pageType: "home" }, win);
  activate("#catalog");
  activate("#document span");
  assert.deepEqual(events(), [expected, expected]);
  assert.equal(win.dataLayer.at(-1).event, "hlt_catalog_click");
  win.close();
});

// Mọi link /catalog/ trong mã giao diện phải có nhãn catalogCta.
test("every Catalog link in the site source carries catalogCta tracking attributes", async () => {
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
    for (const match of source.matchAll(/<a\b[^>]*?href=(?:"\/catalog\/"|\{catalogPageUrl\}|\{[^}]*(?:catalogPageUrl|secondaryActionHref)[^}]*\})[^>]*>/gs)) {
      if (!match[0].includes("catalogCta(")) missing.push(`${file}: ${match[0].slice(0, 90)}`);
    }
  }
  assert.deepEqual(missing, []);
});

// H2-01: chọn tuyến / trang du thuyền.
test("destination select covers every route page and the cruise page, and skips /routes/ and the current page", async () => {
  const { DESTINATION_EVENT, destinationCta, destinationFromHref } = await import("../src/lib/cta-tracking.js");
  const { journeyPagePath, legacyJourneySlugByKey } = await import("../src/config/journey-paths.js");
  const keys = Object.keys(legacyJourneySlugByKey);
  assert.ok(keys.length >= 17, "all routes with a detail page, not only the 9 featured ones");
  for (const key of keys) {
    const expected = { destination_type: "private_transfer", destination_id: routeIdFromJourneyKey(key) };
    assert.deepEqual(destinationFromHref(journeyPagePath(key)), expected, key);
    assert.deepEqual(destinationFromHref(`/journey/${legacyJourneySlugByKey[key]}/`), expected, `legacy ${key}`);
  }
  for (const href of ["/routes/halong-bay-cruises/", "/routes/halong-bay-cruises", "/cruises/", "https://hoangluxury.travel/ha-long-cruises/"]) {
    assert.deepEqual(destinationFromHref(href), { destination_type: "cruise", destination_id: "halong_bay_cruises" }, href);
  }
  for (const href of ["/routes/", "/routes", "/#routes", "#routes", "/routes/unknown-place/", "/catalog/", "https://evil.test/routes/hanoi-to-sapa-private-transfer/"]) {
    assert.equal(destinationFromHref(href), null, href);
  }

  const sapa = journeyPagePath("sapa"), ninhBinh = journeyPagePath("ninh-binh"), sapaToHaLong = journeyPagePath("sapa-to-ha-long");
  const home = bookingPage(`
    <header>
      <a id="routes-scroll" href="/#routes">Routes</a>
      <a id="all-routes" href="/routes/">All Private Transfer Routes</a>
      <a id="menu-intercity" href="${sapaToHaLong}" ${attrs(destinationCta("header_mega_menu", "route_menu_link"))}>Sapa to Halong</a>
      <a id="explore" href="/routes/halong-bay-cruises/" ${attrs(destinationCta("header_mega_menu", "cruise_explore"))}><span>HA LONG BAY CRUISES</span><span>EXPLORE</span></a>
    </header>
    <a id="map" href="${sapa}" ${attrs(destinationCta("routes_map", "route_map_card"))}><span><img alt=""></span><span>Sapa</span></a>
    <a id="plain" href="${ninhBinh}">Ninh Binh</a>`,
  { pageType: "home", serviceType: "private_transfer", pageServiceType: null, routeId: null }, "https://hoangluxury.travel/");
  const events = () => home.all().filter((item) => item.event === DESTINATION_EVENT);
  home.click("#routes-scroll");
  home.click("#all-routes");
  assert.equal(home.all().length, 0, "scrolling to the map or opening /routes/ is not a selection");
  home.click("#map img");
  assert.deepEqual(events(), [{ event: "hlt_destination_select", page_type: "home", destination_type: "private_transfer", destination_id: "hanoi_to_sapa", cta_location: "routes_map", cta_id: "route_map_card" }]);
  home.click("#menu-intercity");
  home.click("#explore span:last-child");
  home.click("#plain");
  assert.equal(home.all().length, 4, "one event per click, nothing else fires");
  assert.deepEqual(events().slice(1).map((e) => [e.destination_type, e.destination_id, e.cta_location, e.cta_id]), [
    ["private_transfer", "sapa_to_ha_long", "header_mega_menu", "route_menu_link"],
    ["cruise", "halong_bay_cruises", "header_mega_menu", "cruise_explore"],
    ["private_transfer", "hanoi_to_ninh_binh", "content", "route_link"],
  ]);
  assert.deepEqual(Object.keys(events()[0]), ["event", "page_type", "destination_type", "destination_id", "cta_location", "cta_id"]);

  // Đang ở Hanoi to Sapa: chọn tuyến khác thì tính theo trang đích; bấm lại chính tuyến đang xem thì không.
  const route = bookingPage(`
    <a id="same" href="${sapa}" ${attrs(destinationCta("header_mega_menu", "route_menu_link"))}>Hanoi to Sapa</a>
    <a id="other" href="${ninhBinh}" ${attrs(destinationCta("header_mega_menu", "route_menu_link"))}>Hanoi to Ninh Binh</a>`,
  { pageType: "route_detail", routeId: "hanoi_to_sapa" });
  route.click("#same");
  route.click("#other");
  assert.deepEqual(route.all().map((e) => [e.page_type, e.destination_id]), [["route_detail", "hanoi_to_ninh_binh"]]);
  const cruise = bookingPage(`<a id="self" href="/routes/halong-bay-cruises/">Cruises</a>`, { pageType: "cruise" }, "https://hoangluxury.travel/routes/halong-bay-cruises/");
  cruise.click("#self");
  assert.equal(cruise.all().length, 0);
});

// Mọi link tới trang tuyến / du thuyền trong mã giao diện phải có nhãn destinationCta.
test("every route and cruise link in the site source carries destinationCta tracking attributes", async () => {
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
    for (const match of source.matchAll(/<a\b[^>]*?href=\{(?:journeyPagePath\([^)]*\)|getJourneyPageUrl\([^)]*\)|routePageUrl|routesMenu\.cruise\.url|childHref)\}[^>]*>/gs)) {
      if (!match[0].includes("destinationCta(")) missing.push(`${file}: ${match[0].slice(0, 90)}`);
    }
  }
  assert.deepEqual(missing, []);
});

// H2-02: mở FAQ trên trang tuyến và trang du thuyền.
test("FAQ data carries the 10 agreed faq_ids, shared questions keep the same id on both page types", async () => {
  const { faqIds } = await import("../src/lib/faq-tracking.js");
  const { journeyFaq } = await import("../src/config/journeys.js");
  const { cruiseData } = await import("../src/config/cruises.js").catch(() => ({}));
  assert.equal(journeyFaq.length, 8);
  const routeIds = journeyFaq.map(([, , id]) => id);
  assert.deepEqual(new Set(routeIds).size, 8);
  for (const id of routeIds) assert.ok(faqIds.includes(id), id);
  const cruiseSource = await readFile("src/config/cruises.js", "utf8");
  const cruiseFaqs = [...cruiseSource.matchAll(/id: "([a-z_]+)",\s*q: "([^"]+)"/g)].map(([, id, q]) => ({ id, q }));
  assert.equal(cruiseFaqs.length, 6, cruiseData ? "" : "parsed from source");
  const byQuestion = new Map(journeyFaq.map(([q, , id]) => [q, id]));
  const shared = cruiseFaqs.filter(({ q }) => byQuestion.has(q));
  assert.equal(shared.length, 4);
  for (const { q, id } of shared) assert.equal(id, byQuestion.get(q), q);
  assert.deepEqual(cruiseFaqs.filter(({ q }) => !byQuestion.has(q)).map(({ id }) => id), ["hotel_pickup", "cruise_departure_point"]);
  assert.equal(new Set([...routeIds, ...cruiseFaqs.map(({ id }) => id)]).size, 10);
});

test("FAQ <details>: one event per user open, none for closing, programmatic opening or re-renders", async () => {
  const { faqDetailsProps, trackFaqOpen } = await import("../src/lib/faq-tracking.js");
  const dom = new JSDOM(`<details><summary><h3>Q</h3><span class="plus">+</span></summary><p>A</p></details>`);
  const win = dom.window; win.dataLayer = [];
  const details = win.document.querySelector("details");
  const summary = win.document.querySelector("summary");
  const props = () => faqDetailsProps("all_inclusive_pricing", { pageType: "route_detail", routeId: "hanoi_to_sapa" }, win);
  // Mô phỏng trình duyệt: bấm summary → handler click → đổi open → sự kiện toggle.
  const userClick = (target, p = props()) => { p.summary.onClick({ currentTarget: summary, target }); details.open = !details.open; p.details.onToggle({ currentTarget: details }); };
  const events = () => win.dataLayer.filter(({ event }) => event === "hlt_faq_open");
  userClick(summary.querySelector(".plus"));
  assert.deepEqual(events(), [{ event: "hlt_faq_open", page_type: "route_detail", route_id: "hanoi_to_sapa", faq_id: "all_inclusive_pricing" }]);
  userClick(summary.querySelector("h3"));                 // đóng
  assert.equal(events().length, 1);
  details.open = true; props().details.onToggle({ currentTarget: details });   // mở bằng code / khôi phục
  assert.equal(events().length, 1);
  details.open = false; props().details.onToggle({ currentTarget: details });
  userClick(summary.querySelector("h3"), props());        // mở lại bằng tay (props mới = đã render lại)
  assert.equal(events().length, 2);
  assert.equal(trackFaqOpen({ faqId: "question 3", pageType: "cruise" }, win), false, "only the agreed ids");
  assert.deepEqual(Object.keys(events()[0]), ["event", "page_type", "route_id", "faq_id"]);
});

// H2-03 / H2-04: Hoang Photo.
test("photo concept and album ids are stable; an album in several concepts keeps one album_id", async () => {
  const { photoConceptId, photoAlbumId } = await import("../src/lib/cta-tracking.js");
  const { photoCategories, photoAlbumRows } = await import("../src/config/photo-album-list.js");
  assert.deepEqual(photoCategories.map(photoConceptId), ["all", "nature_landscapes", "couples_honeymoons", "local_culture", "family_moments", "cinematic_travel", "proposals_celebrations"]);
  assert.equal(photoAlbumId("spring-blossom"), "spring_blossom");
  const ids = photoAlbumRows.map((row) => photoAlbumId(row.slug));
  assert.equal(new Set(ids).size, ids.length, "one id per real album");
  const multi = photoAlbumRows.filter((row) => Object.keys(row.categoryPositions || {}).length > 1 || (Array.isArray(row.categories) && row.categories.length > 1));
  assert.ok(multi.length >= 1, "some albums appear in more than one concept");
});

test("photo gallery select and album open: one event per click, right ids, no cross-firing", async () => {
  const { galleryCta, albumCta, trackPhotoFilterSelect } = await import("../src/lib/cta-tracking.js");
  const landing = bookingPage(`
    <a id="hero" href="/hoangphoto/albums/" ${attrs(galleryCta("photo_hero", "view_album", "All"))}>View Album</a>
    <a id="card" href="/hoangphoto/nature-landscapes/" ${attrs(galleryCta("photo_concepts", "concept_card", "Nature & Landscapes"))}><img alt=""></a>
    <a id="all" href="/hoangphoto/albums/" ${attrs(galleryCta("photo_concepts", "view_all_album", "All"))}>View All Album</a>`,
  { pageType: "photo_landing", serviceType: "photography" }, "https://hoangluxury.travel/hoangphoto/");
  landing.click("#hero");
  landing.click("#card img");
  landing.click("#all");
  assert.deepEqual(landing.all(), [
    { event: "hlt_photo_gallery_select", page_type: "photo_landing", concept_id: "all", cta_location: "photo_hero", cta_id: "view_album" },
    { event: "hlt_photo_gallery_select", page_type: "photo_landing", concept_id: "nature_landscapes", cta_location: "photo_concepts", cta_id: "concept_card" },
    { event: "hlt_photo_gallery_select", page_type: "photo_landing", concept_id: "all", cta_location: "photo_concepts", cta_id: "view_all_album" },
  ]);

  const albums = bookingPage(`
    <a id="media" href="/hoangphoto/local-culture/melody-of-the-mountains/" ${attrs(albumCta("melody-of-the-mountains", "Local Culture"))}><img alt=""></a>
    <a id="caption" href="/hoangphoto/local-culture/melody-of-the-mountains/" ${attrs(albumCta("melody-of-the-mountains", "Couples & Honeymoons"))}>Melody of the Mountains</a>
    <a id="page2" href="/hoangphoto/albums/?page=2">2</a>`,
  { pageType: "photo_albums", serviceType: "photography" }, "https://hoangluxury.travel/hoangphoto/albums/");
  albums.click("#media img");
  albums.click("#caption");
  albums.click("#page2");
  assert.deepEqual(albums.all(), [
    { event: "hlt_album_open", album_id: "melody_of_the_mountains", concept_id: "local_culture" },
    { event: "hlt_album_open", album_id: "melody_of_the_mountains", concept_id: "couples_honeymoons" },
  ], "same album keeps one album_id; no gallery event on album open; pagination is silent");

  const win = { dataLayer: [] };
  trackPhotoFilterSelect("Proposals & Celebrations", win);
  assert.deepEqual(win.dataLayer, [{ event: "hlt_photo_gallery_select", page_type: "photo_albums", concept_id: "proposals_celebrations", cta_location: "album_filters", cta_id: "filter_tab" }]);
});

// H3-04: link tới About Us.
test("About Us clicks push one 5-field event from the source page; nothing on the About page itself", async () => {
  const { ABOUT_EVENT, aboutCta, isAboutHref } = await import("../src/lib/cta-tracking.js");
  for (const href of ["/about-us/", "/about-us", "/about/", "https://hoangluxury.travel/about-us/#team"]) assert.equal(isAboutHref(href), true, href);
  for (const href of ["/about-us/team/", "/blog/", "https://evil.test/about-us/", "#about"]) assert.equal(isAboutHref(href), false, href);
  const route = bookingPage(`
    <header><a id="nav" href="/about-us/" ${attrs(aboutCta("header_nav", "header_about_us"))}>About Us</a></header>
    <a id="discover" href="/about-us/" ${attrs(aboutCta("about_intro_section", "discover_more_about_us"))}><span>Discover more about us</span><svg></svg></a>
    <footer><a id="plain" href="/about-us/">About</a></footer>`,
  { pageType: "route_detail", serviceType: "private_transfer", pageServiceType: "private_transfer", routeId: "hanoi_to_sapa" });
  route.click("#nav");
  route.click("#discover span");
  route.click("#plain");
  assert.deepEqual(route.all(), [
    { event: "hlt_about_us_click", page_type: "route_detail", route_id: "hanoi_to_sapa", cta_location: "header_nav", cta_id: "header_about_us", cta_text: "About Us" },
    { event: "hlt_about_us_click", page_type: "route_detail", route_id: "hanoi_to_sapa", cta_location: "about_intro_section", cta_id: "discover_more_about_us", cta_text: "Discover more about us" },
    { event: "hlt_about_us_click", page_type: "route_detail", route_id: "hanoi_to_sapa", cta_location: "footer", cta_id: "about_footer", cta_text: "About" },
  ]);
  const blog = bookingPage(`<a id="story" href="/about-us/" ${attrs(aboutCta("blog_story_banner", "explore_our_story"))}>Explore Our Story</a>`, { pageType: "blog", routeId: null }, "https://hoangluxury.travel/blog/");
  blog.click("#story");
  assert.deepEqual(blog.all().map((e) => [e.event, e.page_type, e.route_id, e.cta_id]), [[ABOUT_EVENT, "blog", null, "explore_our_story"]]);
  const about = bookingPage(`<a id="self" href="/about-us/">About Us</a>`, { pageType: "about" }, "https://hoangluxury.travel/about-us/");
  about.click("#self");
  assert.equal(about.all().length, 0);
});

test("every About Us link in the site source carries aboutCta tracking attributes", async () => {
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
    for (const match of source.matchAll(/<a\b[^>]*?href=(?:"\/about(?:-us)?\/"|\{aboutPageUrl\})[^>]*>/gs)) {
      if (!match[0].includes("aboutCta(")) missing.push(`${file}: ${match[0].slice(0, 90)}`);
    }
  }
  assert.deepEqual(missing, []);
});
