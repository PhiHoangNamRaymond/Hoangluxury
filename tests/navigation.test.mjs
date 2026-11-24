// Real shared header with deterministic scroll frames; no network/navigation.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { transformWithEsbuild } from "vite";
import { approxUsd, intercityTransfers, journeys } from "../src/config/journeys.js";
import { cruisesPagePath, journeyKeyFromSlug, journeyPagePath } from "../src/config/journey-paths.js";
import { cruiseSeo } from "../src/config/cruise-seo.js";
import { policyPageSeo, privacyPolicyPath, termsPath } from "../src/config/policies.js";

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url: "http://fixture.invalid/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const dataSource = (await readFile(new URL("../src/data.js", import.meta.url), "utf8"))
  .replace('from "./lib/public-config.js"', `from ${JSON.stringify(new URL("../src/lib/public-config.js", import.meta.url).href)}`)
  .replace('from "./config/journey-paths.js"', `from ${JSON.stringify(new URL("../src/config/journey-paths.js", import.meta.url).href)}`)
  .replace('from "./config/photo-album-list.js"', `from ${JSON.stringify(new URL("../src/config/photo-album-list.js", import.meta.url).href)}`)
  .replace('from "./lib/blog-article.js"', `from ${JSON.stringify(new URL("../src/lib/blog-article.js", import.meta.url).href)}`)
  .replace("import.meta.env.VITE_CATALOG_URL", "undefined");
const { navLinks, routesMenu, whatsappUrl, whatsappInquiryUrl, whatsappTransferRouteUrl } = await import(`data:text/javascript;base64,${Buffer.from(dataSource).toString("base64")}`);
const source = (await readFile(new URL("../src/components/layout/Header.jsx", import.meta.url), "utf8"))
  .replace('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
  .replace('import { logoUrl } from "../../config/assets.js";', 'const logoUrl = "/fixture.png";')
  .replace('import { navLinks, routesMenu, whatsappUrl } from "../../data.js";',
    `const navLinks = ${JSON.stringify(navLinks)}; const routesMenu = ${JSON.stringify(routesMenu)}; const whatsappUrl = ${JSON.stringify(whatsappUrl)};`)
  .replace('import BackToTop from "./BackToTop.jsx";', 'const BackToTop = () => null;')
  .replace(/from "(?:\.\.?\/)+lib\/cta-tracking\.js"/, `from ${JSON.stringify(new URL("../src/lib/cta-tracking.js", import.meta.url).href)}`);
const { code } = await transformWithEsbuild(source, "Header.jsx", { loader: "jsx", jsx: "transform" });
const Header = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;

let frames, timers, writes, y, nextId;
function reset(url) {
  window.history.replaceState(null, "", url);
  document.body.innerHTML = '<div id="root"></div><section id="home"></section><section id="services"><h2 class="hlt-services-heading">Services</h2></section><section id="fleet"><h2 class="hlt-fleet-heading">Fleet</h2></section><section id="routes"><h2 class="hlt-route-heading">Routes</h2></section>';
  frames = new Map(); timers = new Map(); writes = []; y = 300; nextId = 0;
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => y });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  window.scrollTo = ({ top }) => { y = top; writes.push(top); };
  globalThis.requestAnimationFrame = (callback) => { const id = ++nextId; frames.set(id, callback); return id; };
  globalThis.cancelAnimationFrame = (id) => frames.delete(id);
  window.setTimeout = (callback) => { const id = ++nextId; timers.set(id, callback); return id; };
  window.clearTimeout = (id) => timers.delete(id);
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { top: (this.classList.contains("hlt-route-heading") ? 3000 : this.classList.contains("hlt-fleet-heading") ? 2000 : 1000) - y,
      height: this.classList.contains("hlt-header") ? 90 : 40 };
  };
}
function frame(time) {
  const pending = [...frames.values()]; frames.clear();
  pending.forEach((callback) => callback(time));
}
function finish() { for (let time = 0; time <= 1400; time += 100) frame(time); }

test("WhatsApp header uses the inquiry message only when the page supplies it", async () => {
  reset("/");
  const root = createRoot(document.getElementById("root"));
  const readLink = () => new URL(document.querySelector(".hlt-header-cta").href);
  try {
    await act(async () => root.render(React.createElement(Header, { whatsappHref: whatsappInquiryUrl })));
    assert.equal(readLink().origin + readLink().pathname, "https://wa.me/84839779888");
    assert.deepEqual(readLink().searchParams.getAll("text"), ["Hello Hoang Luxury Travel, I'd like to inquire about a private transfer."]);
    await act(async () => root.render(React.createElement(Header)));
    assert.equal(readLink().href, whatsappUrl);
  } finally { await act(async () => root.unmount()); }
});

test("each transfer WhatsApp link has one text parameter and the correct route direction", () => {
  for (const [key, { origin, destination, routeLabel }] of Object.entries(journeys)) {
    assert.equal(`${origin} ↔ ${destination}`, routeLabel, key);
    const url = new URL(whatsappTransferRouteUrl(origin, destination));
    assert.equal(url.hostname, "wa.me");
    assert.deepEqual([...url.searchParams], [["text", `Hello Hoang Luxury Travel, I'd like to inquire about a private transfer from ${origin} to ${destination}.`]], key);
  }
  assert.equal(new URL(whatsappTransferRouteUrl("HANOI", "SAPA")).searchParams.get("text"),
    "Hello Hoang Luxury Travel, I'd like to inquire about a private transfer from HANOI to SAPA.");
});

test("Mu Cang Chai to Sapa is in the routes menu and shares the updated round-direction fare", () => {
  const key = "mu-cang-chai-to-sapa";
  const path = "/routes/mu-cang-chai-to-sapa-private-car/";
  assert.equal(journeyPagePath(key),path);
  assert.equal(journeyKeyFromSlug(path.split("/")[2]),key);
  assert.deepEqual(routesMenu.routes.find(([title]) => title === "Mu Cang Chai to Sapa"),["Mu Cang Chai to Sapa",path]);
  assert.equal(journeys[key].seoTitle,"Mu Cang Chai To Sapa Private Transfer | Hoang Luxury travel");
  const fare = intercityTransfers.find(({ id }) => id === journeys[key].intercityId);
  assert.equal(fare.id, journeys["sapa-to-mu-cang-chai"].intercityId);
  assert.equal(fare.price,3_900_000);
  assert.equal(approxUsd(fare.price),"≈ $150 USD");
});

test("desktop and mobile keep Feedback before Photo with the correct links and active state", async () => {
  const pageLinks = navLinks.filter(([, href]) => !href.startsWith("#"));
  assert.deepEqual(pageLinks.map(([label]) => label), ["Catalog", "Booking", "Feedback", "Photo", "Blog", "About Us"]);
  for (const [label, path] of [["Feedback", "/feedback/"], ["Photo", "/hoangphoto/"]]) {
    reset(path);
    const root = createRoot(document.getElementById("root"));
    try {
      await act(async () => root.render(React.createElement(Header)));
      for (const selector of [".hlt-nav", ".hlt-mobile-drawer"]) {
        const container = document.querySelector(selector);
        assert.ok(container);
        const links = [...container.querySelectorAll("a")].filter((link) => ["/feedback/", "/hoangphoto/"].includes(link.getAttribute("href")));
        assert.deepEqual(links.map((link) => link.textContent.trim()), ["Feedback", "Photo"]);
        assert.ok(links.find((link) => link.textContent.trim() === label).classList.contains("is-active"));
      }
    } finally { await act(async () => root.unmount()); }
  }
});

test("incoming Home Fleet/Services/Routes starts at top and uses the same animated landing as Home clicks", async () => {
  for (const section of ["services", "fleet", "routes"]) {
    const expected = ({services:1000, fleet:2000, routes:3000}[section]) - 90 - 25;
    reset(`/#${section}`);
    const root = createRoot(document.getElementById("root"));
    try {
      await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(Header))));
      assert.equal(y, 0, "return to Home top before animation");
      window.dispatchEvent(new window.Event("load"));
      finish();
      assert.ok(writes.some((top) => top > 0 && top < expected), "scroll has intermediate frames, not one jump");
      assert.equal(y, expected);
    } finally { await act(async () => root.unmount()); }

    reset("/"); y = 0;
    const homeRoot = createRoot(document.getElementById("root"));
    try {
      await act(async () => homeRoot.render(React.createElement(Header)));
      await act(async () => document.querySelector(`.hlt-nav a[href='#${section}']`).click());
      finish();
      assert.equal(y, expected);
      assert.equal(window.location.hash, `#${section}`);
    } finally { await act(async () => homeRoot.unmount()); }
  }
});

test("all secondary pages link both desktop and mobile Fleet/Services/Routes to Home", async () => {
  for (const path of ["/about-us/", "/booking/", "/catalog/", "/hoangphoto/", "/blog/", "/journeys/", "/routes/hanoi-to-sapa-private-transfer/"]) {
    reset(path);
    const root = createRoot(document.getElementById("root"));
    try {
      await act(async () => root.render(React.createElement(Header)));
      for (const section of ["services", "fleet", "routes"]) {
        assert.equal(document.querySelectorAll(`#root a[href='/#${section}']`).length, 2);
      }
      assert.equal(writes.length, 0, "secondary page is not scrolled");
    } finally { await act(async () => root.unmount()); }
  }
});

test("mobile Routes label scrolls to Home section while its separate arrow still opens the routes menu", async () => {
  reset("/"); y = 0;
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(Header)));
    await act(async () => document.querySelector(".hlt-menu-toggle").click());
    const toggle = document.querySelector(".hlt-mobile-route-toggle");
    await act(async () => toggle.click());
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.equal(writes.length, 0, "arrow only expands the menu");
    await act(async () => document.querySelector(".hlt-mobile-route-row a").click());
    finish();
    assert.equal(window.location.hash, "#routes");
    assert.equal(y, 2885);
    assert.doesNotMatch(document.querySelector(".hlt-mobile-drawer").className, /is-open/);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
  } finally { await act(async () => root.unmount()); }
});

test("mobile closes drawer and lands at the same heading; manual scroll cancels incoming alignment", async () => {
  reset("/"); y = 0;
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(Header)));
    await act(async () => document.querySelector(".hlt-menu-toggle").click());
    assert.match(document.querySelector(".hlt-mobile-drawer").className, /is-open/);
    await act(async () => document.querySelector(".hlt-mobile-drawer a[href='#fleet']").click());
    finish();
    assert.equal(y, 1885);
    assert.doesNotMatch(document.querySelector(".hlt-mobile-drawer").className, /is-open/);
  } finally { await act(async () => root.unmount()); }

  reset("/#fleet");
  const incomingRoot = createRoot(document.getElementById("root"));
  try {
    await act(async () => incomingRoot.render(React.createElement(Header)));
    frame(0); frame(100); frame(400);
    window.dispatchEvent(new window.Event("wheel"));
    y = 500;
    for (const callback of timers.values()) callback();
    finish();
    assert.equal(y, 500, "manual user scroll is not overridden");
  } finally { await act(async () => incomingRoot.unmount()); }
});

/* Tiêu đề và mô tả chạy thật phải khớp HTML tĩnh sinh lúc build: main.jsx ghi đè
   thẻ meta sau khi tải, nên thiếu một mục là trang đó mang nhầm nội dung trang chủ. */
test("every routed page has its own SEO title matching the static build", async () => {
  const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
  const generator = await readFile(new URL("../scripts/generate-static-routes.mjs", import.meta.url), "utf8");

  const slice = (text, start) => text.slice(text.indexOf(start), text.indexOf("\n};", text.indexOf(start)));
  const routeSeo = new Map();
  for (const entry of slice(main, "const routeSeo = {").matchAll(/"(\/[^"]*)":\s*\{\s*title:\s*"([^"]+)"/g)) {
    routeSeo.set(entry[1], entry[2]);
  }
  const pagePaths = [...slice(main, "const pages = {").matchAll(/"(\/[^"]*)":/g)].map((entry) => entry[1]);
  const aliases = new Set([...slice(main, "const canonicalPathByAlias = {").matchAll(/"(\/[^"]*)":/g)].map((entry) => entry[1]));
  const staticTitles = new Map();
  for (const entry of generator.matchAll(/path:\s*"(\/[^"]*)",\s*\n\s*title:\s*"([^"]+)"/g)) {
    staticTitles.set(entry[1].replace(/\/$/, "") || "/", entry[2]);
  }
  const cruisePath = cruisesPagePath.slice(0, -1);
  assert.ok(slice(main, "const routeSeo = {").includes(`"${cruisePath}": cruiseSeo`));
  assert.match(generator, /path: cruisesPagePath,\s*\.\.\.cruiseSeo,/);
  routeSeo.set(cruisePath, cruiseSeo.title);
  staticTitles.set(cruisePath, cruiseSeo.title);
  // Hai trang chính sách lấy tiêu đề từ config/policies.js cho cả runtime và HTML tĩnh.
  for (const [kind, path] of [["privacy", privacyPolicyPath], ["terms", termsPath]]) {
    const route = path.slice(0, -1);
    assert.ok(slice(main, "const routeSeo = {").includes(`"${route}": policyPageSeo.${kind}`));
    assert.ok(generator.includes(`{ path: ${kind === "privacy" ? "privacyPolicyPath" : "termsPath"}, ...policyPageSeo.${kind}`));
    routeSeo.set(route, policyPageSeo[kind].title);
    staticTitles.set(route, policyPageSeo[kind].title);
  }

  assert.ok(routeSeo.size > 5 && pagePaths.length > 5 && staticTitles.size > 5, "không đọc được cấu hình route");
  for (const path of pagePaths) {
    if (aliases.has(path)) continue;
    assert.ok(routeSeo.has(path), `${path} thiếu mục trong routeSeo nên sẽ mang tiêu đề trang chủ`);
    if (staticTitles.has(path)) {
      assert.equal(routeSeo.get(path), staticTitles.get(path), `${path} lệch tiêu đề giữa runtime và HTML tĩnh`);
    }
  }
  assert.equal(new Set(routeSeo.values()).size, routeSeo.size, "có hai trang dùng trùng tiêu đề");
});
