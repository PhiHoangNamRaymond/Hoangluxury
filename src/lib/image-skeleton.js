/* Khung xương (skeleton) cho ảnh.

   Ảnh trên web tải xong từng cái một, nên nếu để trống thì trang nhìn như bị
   vỡ trong lúc chờ. Mỗi ảnh chưa tải xong được gắn class `hlt-img-pending` để
   hiện nền vàng nhạt có vệt sáng chạy qua; tải xong thì đổi sang `is-loaded`
   và ảnh hiện dần lên.

   Không dùng opacity: 0 làm mặc định trong CSS — nếu script lỗi thì ảnh vẫn
   hiện bình thường, chỉ là không có hiệu ứng. */

const SKIP_PATTERN = /icon|logo|watermark|flag|ornament|crown|qr|artwork|decoration/i;
const MIN_SIZE = 64;

const isPhoto = (img) => {
  if (img.dataset.hltSkeleton) return false;
  if (SKIP_PATTERN.test(img.className) || SKIP_PATTERN.test(img.alt || "")) return false;
  if (img.closest?.(".hlt-icon, .hlt-brand, .hlt-header, .hlt-footer-qr, [data-no-skeleton]")) return false;

  // Ảnh nhỏ (icon đặt trong thẻ img) thì bỏ qua cho khỏi nhấp nháy vụn vặt.
  const width = Number(img.getAttribute("width")) || img.clientWidth;
  const height = Number(img.getAttribute("height")) || img.clientHeight;

  return !(width && height && (width < MIN_SIZE || height < MIN_SIZE));
};

const settle = (img) => {
  img.classList.remove("hlt-img-pending");
  img.classList.add("is-loaded");
};

const track = (img) => {
  if (!isPhoto(img)) return;

  img.dataset.hltSkeleton = "1";

  if (img.complete && img.naturalWidth > 0) {
    // Ảnh đã nằm sẵn trong cache: hiện luôn, không cần hiệu ứng.
    img.classList.add("is-loaded");
    return;
  }

  img.classList.add("hlt-img-pending");
};

/* ---------- Ảnh nền CSS (banner, nền các dải) ----------

   Ảnh nền không có sự kiện load riêng nên tự tải lại URL bằng new Image() để
   biết khi nào xong. Trong lúc chờ, phần tử (hoặc ::before / ::after của nó)
   được gắn class pending để CSS thay ảnh bằng nền skeleton; tải xong thì gỡ
   class, ảnh gốc cùng lớp phủ màu hiện lại như cũ.

   Mọi ảnh nền của site đều đi qua style inline (`--x: url(...)` hoặc
   `background-image: url(...)`), có khi được dùng ở phần tử con. Vì vậy chỉ
   quét các khối có style inline chứa `url(` cùng phần bên trong của chúng,
   không quét cả trang và không phản ứng với style chỉ đổi transform (dải ảnh
   chạy cập nhật transform mỗi khung hình). */

const BG_CLASS = { "": "hlt-bg-pending", "::before": "hlt-bg-pending-before", "::after": "hlt-bg-pending-after" };
const URL_HOST = '[style*="url("]';
const loadedUrls = new Set();
const loadingUrls = new Map();
/* element → { pseudo: chuỗi URL đang chờ } để nhận ra ảnh đổi giữa chừng. */
const pendingKeys = new WeakMap();

const urlsOf = (value) =>
  [...value.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)]
    .map((match) => match[1])
    .filter((url) => !url.startsWith("data:"));

/* Promise xong khi URL tải xong (hoặc lỗi); null nếu đã có sẵn trong cache. */
function whenLoaded(url) {
  if (loadedUrls.has(url)) return null;
  if (loadingUrls.has(url)) return loadingUrls.get(url);
  const img = new Image();
  img.src = url;
  if (img.complete && img.naturalWidth > 0) {
    loadedUrls.add(url);
    return null;
  }
  const promise = new Promise((resolve) => {
    img.onload = img.onerror = () => {
      loadedUrls.add(url);
      loadingUrls.delete(url);
      resolve();
    };
  });
  loadingUrls.set(url, promise);
  return promise;
}

/* Chữ trên khối là màu sáng (banner tối, chữ trắng) thì dùng skeleton tối để
   chữ vẫn đọc được; còn lại (trang nền kem, lớp hoạ tiết mờ) dùng skeleton sáng. */
const isLightText = (color) => {
  const [r, g, b] = (color.match(/\d+(\.\d+)?/g) || []).map(Number);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
};

// dataset.hltBgStaticBefore ↔ data-hlt-bg-static-before trong CSS.
const datasetKey = (base, pseudo) => {
  const suffix = pseudo.replace(/:/g, "");
  return `${base}${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
};

function trackBackground(element) {
  if (!(element instanceof HTMLElement) || element.closest("[data-no-skeleton], .hlt-header")) return;
  const keys = pendingKeys.get(element) || {};
  for (const [pseudo, className] of Object.entries(BG_CLASS)) {
    // Gỡ tạm class pending (nếu có) để đọc được ảnh nền gốc hiện tại.
    const wasPending = element.classList.contains(className);
    if (wasPending) element.classList.remove(className);
    const style = window.getComputedStyle(element, pseudo || null);
    const urls = style.backgroundImage && style.backgroundImage !== "none" ? urlsOf(style.backgroundImage) : [];
    const key = urls.join("|");
    const staticKey = datasetKey("hltBgStatic", pseudo);
    const toneKey = datasetKey("hltBgTone", pseudo);

    // Vẫn là ảnh đang chờ: giữ nguyên skeleton.
    if (wasPending && keys[pseudo] === key) {
      element.classList.add(className);
      continue;
    }

    const pending = urls.map(whenLoaded).filter(Boolean);
    if (!pending.length) {
      delete keys[pseudo];
      delete element.dataset[staticKey];
      delete element.dataset[toneKey];
      continue;
    }

    // Phần tử đã có hiệu ứng riêng (banner phóng chậm, trượt vào trang): không
    // chạy vệt sáng để khỏi đè mất hiệu ứng đó, chỉ hiện nền skeleton tĩnh.
    if (style.animationName && style.animationName !== "none") element.dataset[staticKey] = "1";
    else delete element.dataset[staticKey];
    if (isLightText(window.getComputedStyle(element).color)) element.dataset[toneKey] = "dark";
    else delete element.dataset[toneKey];

    keys[pseudo] = key;
    element.classList.add(className);
    Promise.all(pending).then(() => {
      // Ảnh đã đổi sang URL khác trong lúc chờ thì để lần quét mới xử lý.
      if (keys[pseudo] !== key) return;
      delete keys[pseudo];
      element.classList.remove(className);
      delete element.dataset[staticKey];
      delete element.dataset[toneKey];
    });
  }
  pendingKeys.set(element, keys);
}

/* Quét khối chứa ảnh nền: chính nó (nếu có style url) hoặc nằm trong một khối
   như vậy, cùng mọi khối có style url bên trong. */
const scanBackgrounds = (root) => {
  if (!(root instanceof HTMLElement)) return;
  const host = root.closest(URL_HOST);
  const targets = host ? [root, ...root.querySelectorAll("*")] : [];
  for (const inner of root.querySelectorAll(URL_HOST)) {
    if (host) break; // đã quét toàn bộ cây con ở trên
    targets.push(inner, ...inner.querySelectorAll("*"));
  }
  new Set(targets).forEach(queueBackground);
};

// A loading placeholder must not eagerly preload every off-screen background.
let backgroundObserver;
const observedBackgrounds = new WeakSet();
function queueBackground(element) {
  if (!(element instanceof HTMLElement)) return;
  const rect = element.getBoundingClientRect();
  if (!("IntersectionObserver" in window) ||
      (rect.bottom >= -500 && rect.top <= window.innerHeight + 500)) {
    trackBackground(element);
    return;
  }
  if (observedBackgrounds.has(element)) return;
  backgroundObserver ||= new window.IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      backgroundObserver.unobserve(entry.target);
      observedBackgrounds.delete(entry.target);
      if (entry.target.isConnected) trackBackground(entry.target);
    }
  }, { rootMargin: "500px" });
  observedBackgrounds.add(element);
  backgroundObserver.observe(element);
}

export function setupImageSkeletons() {
  if (typeof document === "undefined") return;

  // load/error không nổi bọt nên phải bắt ở pha capture.
  document.addEventListener("load", (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && target.dataset.hltSkeleton) settle(target);
  }, true);

  document.addEventListener("error", (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && target.dataset.hltSkeleton) settle(target);
  }, true);

  const scan = (root) => {
    if (root instanceof HTMLImageElement) {
      track(root);
      return;
    }
    root.querySelectorAll?.("img").forEach(track);
  };

  scan(document.body);
  scanBackgrounds(document.body);

  // Ảnh sinh thêm về sau (đổi trang ảnh, slider, lọc danh mục...), và ảnh nền
  // gắn sau qua style inline (slide banner chỉ gắn ảnh khi tới lượt). Gom các
  // thay đổi lại xử lý một lần mỗi nhịp để không tính style liên tục.
  let queued = new Set();
  let flushTimer = null;
  const flush = () => {
    flushTimer = null;
    const nodes = queued;
    queued = new Set();
    nodes.forEach((node) => {
      if (node.isConnected) scanBackgrounds(node);
    });
  };
  new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === "childList") {
        record.addedNodes.forEach((node) => {
          scan(node);
          if (node instanceof HTMLElement) queued.add(node);
        });
      } else if (record.target instanceof HTMLElement && record.target.matches(URL_HOST)) {
        // Chỉ khi style inline có ảnh nền; đổi transform/kích thước thì bỏ qua.
        queued.add(record.target);
      }
    });
    if (queued.size && flushTimer === null) flushTimer = window.setTimeout(flush, 30);
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
}
