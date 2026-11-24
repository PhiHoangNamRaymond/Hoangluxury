// Record only a coarse device category. A narrow PC window is still a PC.
export function bookingDevice(browser) {
  const agent = browser.userAgent || "";
  const ipadDesktopMode = /Macintosh/i.test(agent) && browser.maxTouchPoints > 1;
  return browser.userAgentData?.mobile || /Android|iPhone|iPad|iPod|Mobile/i.test(agent) || ipadDesktopMode
    ? "Mobile"
    : "PC";
}

export function validFormsProxy(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && ["hoangluxury.travel", "www.hoangluxury.travel"].includes(url.hostname) && url.pathname === "/api/forms" && !url.search && !url.hash && !url.port && !url.username && !url.password) return true;
    return url.protocol === "https:" && /^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) &&
      url.pathname === "/functions/v1/forms-proxy" && !url.search && !url.hash && !url.port && !url.username && !url.password;
  } catch { return false; }
}

export function requestIdFor(reference, fields) {
  const snapshot = JSON.stringify(Object.entries(fields).sort(([a],[b]) => a.localeCompare(b)));
  if (reference.current?.snapshot !== snapshot) reference.current = { snapshot, id:crypto.randomUUID() };
  return reference.current.id;
}

// Lỗi gửi form kèm nhóm lỗi để ghi log (tab Errors trong Sheet, xem form-error-log.js):
// "network" khi không có phản hồi (mất mạng, DNS, CORS, quá 30 giây), "server" khi máy
// chủ trả lỗi hoặc không xác nhận ok (status = mã HTTP), "unknown" khi chưa cấu hình.
// Thông báo hiển thị cho khách giữ nguyên như trước.
export class FormSubmitError extends Error {
  constructor(message, category, status = "") {
    super(message);
    this.name = "FormSubmitError";
    this.category = category;
    this.status = status;
  }
}

const notConfirmed = "We could not confirm your request. Please retry or contact us via WhatsApp.";

export async function submitForm(endpoint, fields, fetcher = fetch) {
  if (!validFormsProxy(endpoint)) throw new FormSubmitError("Online forms are being configured. Please contact us via WhatsApp.", "unknown");
  let response;
  try {
    response = await fetcher(endpoint,{method:"POST",credentials:"omit",body:new URLSearchParams(fields),signal:AbortSignal.timeout(30000)});
  } catch (error) {
    const network = error instanceof TypeError || ["TimeoutError", "AbortError", "NetworkError"].includes(error?.name);
    throw new FormSubmitError(notConfirmed, network ? "network" : "unknown");
  }
  const status = String(response.status || "");
  if (!response.ok) throw new FormSubmitError(notConfirmed, "server", status);
  let body = null;
  try { body = await response.json(); } catch { /* phản hồi không phải JSON: máy chủ lỗi */ }
  if (body?.ok !== true) throw new FormSubmitError(notConfirmed, "server", status);
}
