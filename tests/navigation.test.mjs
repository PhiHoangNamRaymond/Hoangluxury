// Real shared header with deterministic scroll frames; no network/navigation.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { transformWithEsbuild } from "vite";

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url: "http://fixture.invalid/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const source = (await readFile(new URL("../src/components/layout/Header.jsx", import.meta.url), "utf8"))
  .replace('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
  .replace('import { logoUrl } from "../../config/assets.js";', 'const logoUrl = "/fixture.png";')
  .replace('import { navLinks, routesMenu, whatsappUrl } from "../../data.js";',
    'const navLinks = [["Home", "#home"], ["Services", "#services"], ["Fleet", "#fleet"]]; const routesMenu = {routes: [], cruise: {}}; const whatsappUrl = "https://example.invalid/";')
  .replace('import BackToTop from "./BackToTop.jsx";', 'const BackToTop = () => null;');
const { code } = await transformWithEsbuild(source, "Header.jsx", { loader: "jsx", jsx: "transform" });
const Header = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;

let frames, timers, writes, y, nextId;
function reset(url) {
  window.history.replaceState(null, "", url);
  document.body.innerHTML = '<div id="root"></div><section id="home"></section><section id="services"><h2 class="hlt-services-heading">Services</h2></section><section id="fleet"><h2 class="hlt-fleet-heading">Fleet</h2></section>';
  frames = new Map(); timers = new Map(); writes = []; y = 300; nextId = 0;
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => y });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  window.scrollTo = ({ top }) => { y = top; writes.push(top); };
  globalThis.requestAnimationFrame = (callback) => { const id = ++nextId; frames.set(id, callback); return id; };
  globalThis.cancelAnimationFrame = (id) => frames.delete(id);
  window.setTimeout = (callback) => { const id = ++nextId; timers.set(id, callback); return id; };
  window.clearTimeout = (id) => timers.delete(id);
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { top: (this.classList.contains("hlt-fleet-heading") ? 2000 : 1000) - y,
      height: this.classList.contains("hlt-header") ? 90 : 40 };
  };
}
function frame(time) {
  const pending = [...frames.values()]; frames.clear();
  pending.forEach((callback) => callback(time));
}
function finish() { for (let time = 0; time <= 1400; time += 100) frame(time); }

test("incoming Home Fleet/Services starts at top and uses the same animated landing as Home clicks", async () => {
  for (const section of ["services", "fleet"]) {
    const expected = (section === "fleet" ? 2000 : 1000) - 90 - 25;
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

test("all secondary pages link both desktop and mobile Fleet/Services to Home", async () => {
  for (const path of ["/about/", "/booking/", "/catalog/", "/photo/", "/blog/", "/journeys/", "/journey/hanoi-to-sapa-private-transfer/"]) {
    reset(path);
    const root = createRoot(document.getElementById("root"));
    try {
      await act(async () => root.render(React.createElement(Header)));
      for (const section of ["services", "fleet"]) {
        assert.equal(document.querySelectorAll(`#root a[href='/#${section}']`).length, 2);
      }
      assert.equal(writes.length, 0, "secondary page is not scrolled");
    } finally { await act(async () => root.unmount()); }
  }
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
