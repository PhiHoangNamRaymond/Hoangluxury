// H1-05 / H1-08: dựng BookingPage thật trong jsdom (máy chủ, Turnstile, header/footer
// được thay bằng bản giả), bấm REQUEST A QUOTE và kiểm tra Data Layer.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { transformWithEsbuild } from "vite";
import { FormSubmitError, submitForm } from "../src/lib/forms.js";

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url: "https://hoangluxury.travel/booking/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
for (const name of ["HTMLElement", "HTMLInputElement", "HTMLSelectElement", "HTMLTextAreaElement", "Node", "Event", "MouseEvent"]) globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const fileUrl = (path) => JSON.stringify(new URL(path, import.meta.url).href);
const endpoint = "https://hoangluxury.travel/api/forms";

const source = (await readFile(new URL("../src/BookingPage.jsx", import.meta.url), "utf8"))
  .replace('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
  .replace('import Footer from "./components/layout/Footer.jsx";', "const Footer = () => null;")
  .replace('import Header from "./components/layout/Header.jsx";', "const Header = () => null;")
  .replace('import ExperienceSlider from "./components/home/ExperienceSlider.jsx";', "const ExperienceSlider = () => null;")
  .replace('import { whatsappInquiryUrl } from "./data.js";', 'const whatsappInquiryUrl = "https://wa.me/fixture";')
  .replace(/import \{[^}]+\} from "\.\/config\/assets\.js";/, "const bookingDepartureDateIconUrl = '', bookingSupportIconUrl = '', bookingOnTimeIconUrl = '', bookingPaymentIconUrl = '', bookingPrivateCarIconUrl = '', bookingSafeIconUrl = '', catalogBackgroundUrl = '';")
  .replace('import { getBookingSource } from "./config/booking-source.js";', 'const getBookingSource = () => "RKS001";')
  // Turnstile giả: cấp ngay mã thử (chỉ trong test, không gọi Cloudflare).
  .replace('import Turnstile from "./components/Turnstile.jsx";', 'const Turnstile = ({ onToken, resetKey }) => { React.useEffect(() => { onToken("test-token"); }, [resetKey]); return null; };')
  .replace('from "./config/countries.js"', `from ${fileUrl("../src/config/countries.js")}`)
  .replace('from "./config/dial-codes.js"', `from ${fileUrl("../src/config/dial-codes.js")}`)
  .replace('from "./lib/public-config.js"', `from ${fileUrl("../src/lib/public-config.js")}`)
  .replace('from "./lib/forms.js"', `from ${fileUrl("../src/lib/forms.js")}`)
  .replace('from "./lib/cta-tracking.js"', `from ${fileUrl("../src/lib/cta-tracking.js")}`)
  .replace('from "./lib/booking-step-tracking.js"', `from ${fileUrl("../src/lib/booking-step-tracking.js")}`)
  .replace('from "./lib/booking-submit-tracking.js"', `from ${fileUrl("../src/lib/booking-submit-tracking.js")}`)
  .replace("import.meta.env.VITE_FORMS_PROXY_URL", JSON.stringify(endpoint))
  .replace(/^import ["'][^"']+\.css["'];$/gm, "");
const { code } = await transformWithEsbuild(source, "BookingPage.jsx", { loader: "jsx", jsx: "transform" });
const BookingPage = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;

const tomorrow = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

async function mount() {
  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(BookingPage)));
  await flush();
  return root;
}

function setField(name, value) {
  const el = document.querySelector(`.hlt-book-form [name="${name}"]`);
  const proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new window.Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
}

async function fillValidForm() {
  await act(async () => {
    setField("departureDate", tomorrow);
    setField("pickup", "Old Quarter hotel");
    setField("dropoff", "Sapa town");
    document.querySelector('.hlt-book-form [name="noFlight"]').click();
    setField("fullName", "Test Guest");
    setField("phone", "912345678");
    setField("country", [...document.querySelector('[name="country"]').options].find((o) => o.value).value);
    setField("passengers", [...document.querySelector('[name="passengers"]').options].find((o) => o.value).value);
    setField("journeyType", [...document.querySelector('[name="journeyType"]').options].find((o) => o.value).value);
    setField("luggage", "2 suitcases");
  });
}

const submitButton = () => document.querySelector('.hlt-book-form button[type="submit"]');
const events = () => (window.dataLayer || []).filter((item) => /^hlt_booking_(form_submit_success|submit_error)$/.test(item.event));
async function clickSubmit(times = 1) {
  await act(async () => { for (let i = 0; i < times; i += 1) submitButton().click(); });
  await flush();
  await flush();
}

test("submitForm reports network, server and unknown categories without changing its messages", async () => {
  const proxy = "https://hoangluxury.travel/api/forms";
  const category = async (fetcher, url = proxy) => submitForm(url, {}, fetcher).then(() => "ok", (error) => error instanceof FormSubmitError && error.category);
  assert.equal(await category(async () => { throw new TypeError("Failed to fetch"); }), "network");
  assert.equal(await category(async () => { throw new DOMException("timeout", "TimeoutError"); }), "network");
  assert.equal(await category(async () => Response.json({ ok: true }, { status: 500 })), "server");
  assert.equal(await category(async () => Response.json({ ok: false })), "server");
  assert.equal(await category(async () => new Response("<html>bad gateway</html>")), "server");
  assert.equal(await category(async () => Response.json({ ok: true }), "https://evil.test/"), "unknown");
  assert.equal(await category(async () => Response.json({ ok: true })), "ok");
});

test("Booking Form: errors push one categorised event per failed submit, success pushes one generate_lead", async (t) => {
  const responses = [];
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push(Object.fromEntries(init.body));
    const next = responses.shift();
    if (next instanceof Error) throw next;
    // Chờ một nhịp để mô phỏng thời gian xử lý (bấm liên tục trong lúc đang gửi).
    await new Promise((resolve) => setTimeout(resolve, 5));
    return next;
  };
  window.dataLayer = [];
  const root = await mount();
  t.after(() => act(() => root.unmount()));

  // Trang vừa mở / đang điền: không phát gì.
  assert.deepEqual(events(), []);

  // 1. Bấm gửi khi còn thiếu ô bắt buộc (trình duyệt chặn): validation, không gửi đi.
  await clickSubmit();
  assert.deepEqual(events(), [{ event: "hlt_booking_submit_error", error_category: "validation" }]);
  assert.equal(requests.length, 0);

  await fillValidForm();
  assert.equal(events().length, 1, "filling the form must not push");

  // 2. Máy chủ báo lỗi: server.
  responses.push(Response.json({ ok: false }, { status: 500 }));
  await clickSubmit();
  assert.deepEqual(events().at(-1), { event: "hlt_booking_submit_error", error_category: "server" });
  assert.equal(events().length, 2);

  // 3. Mất mạng: network. Một lần gửi thất bại mới = một sự kiện mới.
  responses.push(new TypeError("Failed to fetch"));
  await clickSubmit();
  assert.deepEqual(events().at(-1), { event: "hlt_booking_submit_error", error_category: "network" });
  assert.equal(events().length, 3);

  // 4. Thành công, bấm liên tục 3 lần: chỉ một yêu cầu gửi đi và một generate_lead.
  responses.push(Response.json({ ok: true }));
  await clickSubmit(3);
  assert.equal(requests.length, 3, "only one extra request while sending");
  assert.deepEqual(events().at(-1), { event: "hlt_booking_form_submit_success" });
  assert.equal(events().filter((e) => e.event === "hlt_booking_form_submit_success").length, 1);
  assert.equal(events().length, 4);
  assert.match(document.body.textContent, /Your request was submitted/);

  // 5. Đóng/mở lại THANK YOU, render lại: không phát thêm.
  const close = [...document.querySelectorAll("button")].find((b) => /close|ok|got it|done/i.test(b.textContent || b.getAttribute("aria-label") || ""));
  if (close) await act(async () => close.click());
  await act(async () => root.render(React.createElement(BookingPage)));
  await flush();
  assert.equal(events().length, 4);

  // 6. Một yêu cầu mới thành công: phát sự kiện mới. Không có dữ liệu khách trong Data Layer.
  await fillValidForm();
  responses.push(Response.json({ ok: true }));
  await clickSubmit();
  assert.equal(events().filter((e) => e.event === "hlt_booking_form_submit_success").length, 2);
  assert.notEqual(requests[2].requestId, requests[3].requestId);
  const serialized = JSON.stringify(window.dataLayer);
  assert.doesNotMatch(serialized, /Test Guest|912345678|Old Quarter|Sapa town|suitcases|test-token/);
});
