// Danh sách album ảnh, chỉ chữ - không import ảnh, để script sinh HTML tĩnh
// (chạy bằng Node thuần) cũng đọc được. Ảnh gắn vào ở photo-albums.js.

export const ALL_PHOTO_CATEGORIES = "All";

/* Thứ tự này cũng là thứ tự nút lọc trên /photo/albums/. */
export const photoCategories = [
  ALL_PHOTO_CATEGORIES,
  "Natural Journey",
  "Couple & Honeymoon",
  "Local Heritage",
  "Family Memories",
  "Cinematic Travel",
  "Proposal & Celebration",
  // Ảnh chân dung một người (thư mục "Abum đơn"), không hợp danh mục nào ở trên.
  "Solo Portraits",
];

function slugifyAlbum(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* [tiêu đề, địa điểm, danh mục] - thứ tự hiện trên lưới /photo/albums/. Ảnh
   từng album nằm ở assets/photo-albums/<slug>/ (ghép trong assets.js). Album
   bản địa đứng đầu; Natural Journey hiện chưa có album. */
const rows = [
  ["Peach Blossom Season", "Ha Giang", "Local Heritage"],
  ["Lavender Hmong Portraits", "Sapa", "Local Heritage"],
  ["By the Waterfall", "Sapa", "Local Heritage"],
  ["Flowers of the Highlands", "Ha Giang", "Local Heritage"],
  ["Sunset in the Village", "Sapa", "Local Heritage"],
  ["Melody of the Mountains", "Ha Giang", "Local Heritage"],
  ["Garden of Vows", "Hanoi", "Couple & Honeymoon"],
  ["A Vintage Ride", "Hanoi", "Couple & Honeymoon"],
  ["Golden Hour Together", "Moc Chau", "Couple & Honeymoon"],
  ["Blossom Days Together", "Moc Chau", "Family Memories"],
  ["Birthday Wishes", "Hanoi", "Proposal & Celebration"],
  ["Little Princess", "Hanoi", "Solo Portraits"],
  ["Golden Garden Glow", "Hanoi", "Solo Portraits"],
  ["Lotus Pond Dreams", "Hanoi", "Solo Portraits"],
  ["School Days", "Hanoi", "Solo Portraits"],
  ["Ao Dai Elegance", "Hanoi", "Solo Portraits"],
  ["Royal Afternoon", "Hanoi", "Solo Portraits"],
  ["Northern Vietnam on Film", "Mu Cang Chai, Ta Xua & Sapa", "Cinematic Travel"],
];

/* Album video: mã video YouTube. `films` là video ngang (16:9), `shorts` là
   video dọc (9:16). Link khách gửi có hai lần cùng một video (số 1 và 13) nên
   chỉ giữ một. */
export const photoAlbumVideosBySlug = {
  "northern-vietnam-on-film": {
    films: ["MF50DWOr7hY"],
    // Thứ tự hiển thị do khách sắp xếp (20/10/2026).
    shorts: [
      "9T8KPo6en8w", // cưỡi ngựa giữa ruộng bậc thang
      "WX6QSh9iAm4", // cô gái áo đỏ cầm điều khiển flycam
      "Vve3EMpaegQ", // ruộng bậc thang vàng lúc hoàng hôn
      "74A19Is37O4", // hoa hồng phấn lúc hoàng hôn
      "ZF6uhygFtFk", // cặp đôi áo trắng
      "FQTVUhcuSXg", // dang tay trước biển mây
      "-TT6XZmDQuM", // cô gái áo hồng ngồi trên ruộng
      "jVCrtbwXZz4", // dang tay giữa ruộng, nhìn từ trên cao
      "gGLpaOfTmDw", // cưỡi ngựa trong sương
      "dKXktVGiqHo", // ruộng mâm xôi
      "Pbo0tdWxk8g", // đứng trên mỏm đá
      "DaKN_EBCFN8", // hoàng hôn đỏ, lối mòn giữa ruộng
      "_Ws8xK7Iu2s", // cô gái váy đỏ trên ruộng bậc thang
      "Ngw9M_iN8YQ", // video thêm ngày 20/10, đứng giữa váy đỏ và áo vàng
      "oox30OODoOU", // cô gái áo vàng dang tay trên ruộng
    ],
  },
};

export const photoAlbumRows = rows.map(([title, place, category]) => ({
  slug: slugifyAlbum(title),
  title,
  place,
  category,
}));

export const photoAlbumUrl = (slug) => `/photo/albums/${slug}/`;
