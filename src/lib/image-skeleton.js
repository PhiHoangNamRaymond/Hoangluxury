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

  // Ảnh sinh thêm về sau (đổi trang ảnh, slider, lọc danh mục...).
  new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(scan));
  }).observe(document.body, { childList: true, subtree: true });
}
