// H1-05: dựng BookingPage thật trong jsdom (máy chủ, Turnstile, header/footer
// được thay bằng bản giả), bấm REQUEST A QUOTE và kiểm tra Data Layer.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { transformWithEsbuild } from "vite";

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
  .replace('from "./lib/form-error-log.js"', `from ${fileUrl("../src/lib/form-error-log.js")}`)
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
const events = () => (window.dataLayer || []).filter((item) => item.event === "hlt_booking_form_submit_success");
async function clickSubmit(times = 1) {
  await act(async () => { for (let i = 0; i < times; i += 1) submitButton().click(); });
  await flush();
  await flush();
}

test("Booking Form: failed submits send one error log and no Data Layer event; each success pushes one generate_lead", async (t) => {
  const responses = [];
  const requests = [];
  const errorLogs = [];
  globalThis.fetch = async (url, init) => {
    const body = Object.fromEntries(init.body);
    // Log lỗi gửi kèm (tab Errors): tách riêng khỏi các lần gửi booking.
    if (body.form === "error-log") { errorLogs.push(body); return Response.json({ ok: true }); }
    requests.push(body);
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

  // 1. Bấm gửi khi còn thiếu ô bắt buộc (trình duyệt chặn): không gửi đi, không phát.
  await clickSubmit();
  assert.equal(requests.length, 0);
  await fillValidForm();

  // 2–3. Máy chủ báo lỗi / mất mạng: không phát.
  responses.push(Response.json({ ok: false }, { status: 500 }));
  await clickSubmit();
  responses.push(new TypeError("Failed to fetch"));
  await clickSubmit();
  assert.equal(requests.length, 2);
  assert.deepEqual(events(), []);
  // Mỗi lần gửi lỗi kèm đúng một log, đúng nhóm lỗi, không có dữ liệu khách.
  assert.deepEqual(errorLogs.map((log) => [log.sourceForm, log.category, log.status, log.page]), [["booking", "server", "500", "/booking/"], ["booking", "network", "", "/booking/"]]);
  assert.doesNotMatch(JSON.stringify(errorLogs), /Test Guest|912345678|Old Quarter|Sapa town|suitcases|test-token/);

  // 4. Thành công: một generate_lead.
  responses.push(Response.json({ ok: true }));
  await clickSubmit();
  assert.deepEqual(events().at(-1), { event: "hlt_booking_form_submit_success" });
  assert.deepEqual(events(), [{ event: "hlt_booking_form_submit_success" }]);
  assert.match(document.body.textContent, /Your request was submitted/);

  // 5. Đóng/mở lại THANK YOU, render lại: không phát thêm.
  const close = [...document.querySelectorAll("button")].find((b) => /close|ok|got it|done/i.test(b.textContent || b.getAttribute("aria-label") || ""));
  if (close) await act(async () => close.click());
  await act(async () => root.render(React.createElement(BookingPage)));
  await flush();
  assert.equal(events().length, 1);

  // 6. Một yêu cầu mới thành công: phát sự kiện mới. Không có dữ liệu khách trong Data Layer.
  await fillValidForm();
  responses.push(Response.json({ ok: true }));
  await clickSubmit();
  assert.equal(events().length, 2);
  assert.equal(errorLogs.length, 2, "successful submits send no error log");
  assert.notEqual(requests.at(-2).requestId, requests.at(-1).requestId);
  const serialized = JSON.stringify(window.dataLayer);
  assert.doesNotMatch(serialized, /Test Guest|912345678|Old Quarter|Sapa town|suitcases|test-token/);
});

// H1-03: hlt_booking_form_start – một lần mỗi lượt điền form, lượt mới sau khi gửi thành công.
test("Booking Form start fires once on the first real input and again only for a new booking", async (t) => {
  const responses = [];
  globalThis.fetch = async (_url, init) => {
    const body = Object.fromEntries(init.body);
    if (body.form === "error-log") return Response.json({ ok: true });
    return responses.shift() ?? Response.json({ ok: true });
  };
  window.dataLayer = [];
  const starts = () => window.dataLayer.filter((item) => item.event === "hlt_booking_form_start");
  const root = await mount();
  t.after(() => act(() => root.unmount()));
  assert.deepEqual(starts(), [], "opening /booking/ and the default +84 dial code do not count");
  // Chỉ focus vào ô: chưa tính.
  await act(async () => { document.querySelector('.hlt-book-form [name="pickup"]').focus(); });
  assert.deepEqual(starts(), []);
  // Bot điền ô bẫy ẩn: không tính.
  await act(async () => setField("website", "spam"));
  assert.deepEqual(starts(), []);
  await act(async () => setField("website", ""));
  // Lần nhập đầu tiên: một sự kiện, chỉ có form_id.
  await act(async () => setField("pickup", "O"));
  assert.deepEqual(starts(), [{ event: "hlt_booking_form_start", form_id: "transfer_booking" }]);
  // Nhập tiếp, sửa, điền hết các ô, gửi lỗi, gửi lại: không phát thêm.
  await fillValidForm();
  await act(async () => setField("pickup", "Changed hotel"));
  responses.push(Response.json({ ok: false }, { status: 500 }));
  await clickSubmit();
  assert.equal(starts().length, 1);
  // Gửi thành công: vẫn 1; form xoá trắng, lượt mới bắt đầu khi khách điền lại.
  responses.push(Response.json({ ok: true }));
  await clickSubmit();
  assert.match(document.body.textContent, /Your request was submitted/);
  assert.equal(starts().length, 1);
  await act(async () => setField("dropoff", "Ha Long"));
  assert.equal(starts().length, 2, "a new booking after success records a new start");
  assert.doesNotMatch(JSON.stringify(starts()), /Ha Long|hotel|Guest|9123/);
});
