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
   class, ảnh gốc cùng lớp phủ màu hiện lại như cũ. */

const BG_CLASS = { "": "hlt-bg-pending", "::before": "hlt-bg-pending-before", "::after": "hlt-bg-pending-after" };
const loadedUrls = new Set();
const loadingUrls = new Map();

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

function trackBackground(element) {
  if (!(element instanceof HTMLElement) || element.closest("[data-no-skeleton], .hlt-header")) return;
  for (const [pseudo, className] of Object.entries(BG_CLASS)) {
    // Đang chờ thì bỏ qua: class pending đang đè ảnh nên không đọc được ảnh gốc.
    if (element.classList.contains(className)) continue;
    const style = window.getComputedStyle(element, pseudo || null);
    const value = style.backgroundImage;
    if (!value || value === "none") continue;
    const pending = urlsOf(value).map(whenLoaded).filter(Boolean);
    if (!pending.length) continue;
    // Phần tử đã có hiệu ứng riêng (banner phóng chậm, trượt vào trang): không
    // chạy vệt sáng để khỏi đè mất hiệu ứng đó, chỉ hiện nền skeleton tĩnh.
    // dataset.hltBgStaticBefore ↔ data-hlt-bg-static-before trong CSS.
    const suffix = pseudo.replace(/:/g, "");
    const flag = `hltBgStatic${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
    if (style.animationName && style.animationName !== "none") element.dataset[flag] = "1";
    element.classList.add(className);
    Promise.all(pending).then(() => {
      element.classList.remove(className);
      delete element.dataset[flag];
    });
  }
}

const scanBackgrounds = (root) => {
  if (!(root instanceof HTMLElement)) return;
  trackBackground(root);
  root.querySelectorAll("*").forEach(trackBackground);
};

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
      } else if (record.target instanceof HTMLElement) {
        queued.add(record.target);
      }
    });
    if (queued.size && flushTimer === null) flushTimer = window.setTimeout(flush, 30);
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
}
