// Data Layer nút WhatsApp: một lượt nhấn = một sự kiện, đủ trường, không lộ URL/tin nhắn.
import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import {
  WHATSAPP_EVENT,
  isWhatsAppHref,
  routeIdFromJourneyKey,
  setupWhatsAppTracking,
  waCta,
} from "../src/lib/whatsapp-tracking.js";

const waHref = "https://wa.me/84839779888?text=Hello%20from%20Hanoi%20to%20SAPA";
const attrs = (props) => Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(" ");

function page(html, context) {
  const dom = new JSDOM(`<body>${html}</body>`, { url: "https://hoangluxury.travel/routes/hanoi-to-sapa-private-transfer/" });
  dom.window.dataLayer = [];
  setupWhatsAppTracking(context, dom.window);
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
  setupWhatsAppTracking({ pageType: "home" }, win);
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
