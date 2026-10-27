/* Quay lại lưới album đúng chỗ cũ: khi khách bấm vào một album ở
   /photo/albums/, lưu địa chỉ lưới (kèm ?style=&page=) và vị trí cuộn. Nút
   "All albums" của trang album dẫn về đúng địa chỉ đó, và lưới (dù về bằng nút
   đó hay nút Back của trình duyệt) cuộn lại đến album vừa xem. */

const KEY = "hlt-album-return";

function read() {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function write(value) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* Trình duyệt chặn sessionStorage: về lưới mặc định. */
  }
}

export function rememberAlbumReturn() {
  write({ url: window.location.pathname + window.location.search, y: Math.round(window.scrollY) });
}

export function albumReturnUrl(fallback) {
  return read()?.url || fallback;
}

/* Nút All albums gọi trước khi rời trang album. Không dựa vào document.referrer
   vì site gửi Referrer-Policy: no-referrer nên trên bản thật nó luôn rỗng. */
export function markAlbumReturn() {
  const saved = read();
  if (saved) write({ ...saved, back: true });
}

/* Chỉ khi thật sự quay về từ album: nút All albums hoặc nút Back/Forward. Vào
   lưới từ menu ở trang khác thì mở từ đầu như thường. */
function cameFromAlbum(saved) {
  return saved.back === true
    || window.performance?.getEntriesByType?.("navigation")[0]?.type === "back_forward";
}

/* Vị trí cuộn cần khôi phục nếu lưới đang mở đúng địa chỉ đã lưu; dùng một lần
   (giữ lại địa chỉ cho nút All albums lần sau). */
export function takeAlbumReturnScroll() {
  const saved = read();
  if (!saved || saved.url !== window.location.pathname + window.location.search) return null;
  if (!cameFromAlbum(saved)) return null;
  write({ url: saved.url });
  return Number.isFinite(saved.y) ? saved.y : null;
}
