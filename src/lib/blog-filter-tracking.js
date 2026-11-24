/* Data Layer H3-01 – hlt_blog_filter (yêu cầu marketing 24/11/2026).
   Phát khi khách tự chọn một địa điểm (Destinations) hoặc chủ đề (Topics) trên trang
   Blog và bộ lọc thực sự đổi sang lựa chọn đó (kể cả khi danh sách có 0 bài). Không
   phát khi bỏ chọn, khi tải trang, khi render lại, khi tìm kiếm hay sắp xếp.
   Chỉ gửi mã đã chuẩn hoá, không gửi nội dung tìm kiếm. */

export const BLOG_FILTER_EVENT = "hlt_blog_filter";

// Tên hiển thị → mã marketing (blog-taxonomy.js gọi Hạ Long là "Ha Long").
const destinationIds = {
  "Sapa": "sapa",
  "Ha Long": "halong_bay",
  "Halong Bay": "halong_bay",
  "Ninh Binh": "ninh_binh",
  "Ha Giang": "ha_giang",
  "Cat Ba": "cat_ba",
  "Cao Bang": "cao_bang",
  "Pu Luong": "pu_luong",
  "Moc Chau": "moc_chau",
  "Mu Cang Chai": "mu_cang_chai",
  "Ta Xua": "ta_xua",
};

const slug = (value) => String(value || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export const blogFilterValue = (type, label) => (type === "destination" ? destinationIds[label] || slug(label) : slug(label));

export function trackBlogFilter(type, label, win = window) {
  if (type !== "destination" && type !== "topic") return false;
  const filter_value = blogFilterValue(type, label);
  if (!filter_value) return false;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ event: BLOG_FILTER_EVENT, filter_type: type, filter_value });
  return true;
}
