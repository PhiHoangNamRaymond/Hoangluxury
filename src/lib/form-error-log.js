/* Log lỗi gửi form (Booking, Feedback) về tab "Errors" trong Google Sheet.
   Khi khách gửi form thất bại, website gửi một bản log nhỏ qua forms-proxy tới
   Apps Script; Apps Script ghi một dòng vào tab Errors của file Sheet booking.
   Xem google-apps-script/README.md.

   Bản log KHÔNG chứa dữ liệu khách nhập: chỉ form nào, nhóm lỗi, mã HTTP, thiết
   bị, đường dẫn trang, thời điểm và một mã ngẫu nhiên để chống ghi trùng.

   Mất mạng (hoặc máy chủ log cũng lỗi): bản log được giữ trong localStorage của
   trình duyệt và gửi lại ở lần tải trang sau / khi có mạng trở lại. */

import { bookingDevice, validFormsProxy } from "./forms.js";

export const errorCategories = ["validation", "server", "network", "unknown"];
const QUEUE_KEY = "hlt-form-error-log";
const MAX_QUEUE = 10;
const MAX_AGE_MS = 7 * 24 * 3600 * 1000;

const uuid = (win) => (win.crypto || globalThis.crypto)?.randomUUID?.() || "";

export function buildErrorReport({ form, category, status = "" }, win = window, now = new Date()) {
  return {
    form: "error-log",
    sourceForm: form === "feedback" ? "feedback" : "booking",
    category: errorCategories.includes(category) ? category : "unknown",
    status: /^\d{3}$/.test(String(status)) ? String(status) : "",
    device: bookingDevice(win.navigator || {}),
    // Chỉ đường dẫn, bỏ ?query và #hash (có thể chứa mã chiến dịch hay token).
    page: String(win.location?.pathname || "/").replace(/[^A-Za-z0-9/_-]/g, "").slice(0, 200) || "/",
    occurredAt: now.toISOString(),
    reportId: uuid(win),
  };
}

function readQueue(win) {
  try {
    const saved = JSON.parse(win.localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeQueue(win, queue) {
  try {
    if (queue.length) win.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
    else win.localStorage.removeItem(QUEUE_KEY);
  } catch { /* chế độ ẩn danh / bộ nhớ bị chặn: bỏ qua */ }
}

/* "sent" = đã ghi; "retry" = mất mạng / máy chủ lỗi tạm (5xx), giữ lại gửi sau;
   "drop" = máy chủ từ chối hẳn (4xx), không gửi lại vô ích. */
async function sendReport(endpoint, report, fetcher) {
  try {
    const response = await fetcher(endpoint, {
      method: "POST", credentials: "omit", keepalive: true,
      body: new URLSearchParams(report), signal: AbortSignal.timeout(15000),
    });
    if (response.status >= 400 && response.status < 500) return "drop";
    return response.ok && (await response.json()).ok === true ? "sent" : "retry";
  } catch {
    return "retry";
  }
}

/* Gửi log cho một lần gửi form thất bại. Không bao giờ ném lỗi ra ngoài. */
export async function reportFormError(endpoint, details, { win = window, fetcher = (...args) => globalThis.fetch(...args) } = {}) {
  try {
    if (!validFormsProxy(endpoint)) return false;
    const report = buildErrorReport(details, win);
    if (!report.reportId) return false;
    const result = await sendReport(endpoint, report, fetcher);
    if (result === "retry") writeQueue(win, [...readQueue(win), report]);
    return result === "sent";
  } catch {
    return false;
  }
}

/* Gửi lại các log còn kẹt (gọi khi tải trang và khi có mạng trở lại). */
export async function flushFormErrorQueue(endpoint, { win = window, fetcher = (...args) => globalThis.fetch(...args), now = Date.now() } = {}) {
  try {
    if (!validFormsProxy(endpoint)) return 0;
    const queue = readQueue(win).filter((item) => item && item.form === "error-log" && now - Date.parse(item.occurredAt) < MAX_AGE_MS);
    if (!queue.length) { writeQueue(win, []); return 0; }
    const remaining = [];
    let sent = 0;
    for (const report of queue) {
      const result = await sendReport(endpoint, report, fetcher);
      if (result === "sent") sent += 1;
      else if (result === "retry") remaining.push(report);
    }
    writeQueue(win, remaining);
    return sent;
  } catch {
    return 0;
  }
}
