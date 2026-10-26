// Danh sách album ảnh, chỉ chữ - không import ảnh, để script sinh HTML tĩnh
// (chạy bằng Node thuần) cũng đọc được. Ảnh gắn vào ở photo-albums.js.

export const ALL_PHOTO_CATEGORIES = "All";

/* Thứ tự này cũng là thứ tự nút lọc trên /photo/albums/. Tên trùng đúng tiêu
   đề 6 thẻ phong cách chụp trên /photo/ (khách duyệt 26/10/2026). */
export const photoCategories = [
  ALL_PHOTO_CATEGORIES,
  "Nature & Landscapes",
  "Couples & Honeymoons",
  "Local Culture",
  "Family Moments",
  "Cinematic Travel",
  "Proposals & Celebrations",
];

function slugifyAlbum(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* [tiêu đề, địa điểm, danh mục] - thứ tự hiện trên lưới /photo/albums/ và
   trong từng bộ lọc. Danh mục có thể là mảng khi một album thuộc nhiều mục;
   phần tử dạng [tên mục, vị trí] ghim album vào đúng ô đó (đếm từ 1) trong mục. Ảnh
   từng album nằm ở assets/photo-albums/<slug>/ (ghép trong assets.js). Album
   bản địa đứng đầu. */
const rows = [
  // Album bản địa, thứ tự khách sắp ngày 26/10/2026 (Melody of the Mountains
  // nằm ở nhóm cặp đôi bên dưới nhưng cũng hiện trong Local Culture).
  ["Spring Blossom", "Ha Giang", "Local Culture"],
  ["Lavender Whispers", "Sapa", "Local Culture"],
  ["Village Charm", "Ha Giang", "Local Culture"],
  ["Waterfall Muse", "Sapa", "Local Culture"],
  ["Woven Elegance", "Sapa", "Local Culture"],
  // Album cặp đôi, thứ tự khách sắp ngày 26/10/2026.
  ["Sunset Together", "Moc Chau", "Couples & Honeymoons"],
  ["Melody of the Mountains", "Ha Giang", ["Couples & Honeymoons", "Local Culture"]],
  ["Garden of Vows", "Hanoi", ["Couples & Honeymoons", ["Proposals & Celebrations", 4]]],
  ["The Love Bicycle", "Hanoi", "Couples & Honeymoons"],
  ["Emerald Romance", "Hanoi", "Couples & Honeymoons"],
  ["Love in Bloom", "Moc Chau", "Couples & Honeymoons"],
  // Album gia đình, thứ tự khách sắp ngày 26/10/2026.
  ["Simple Happiness", "Ha Giang", "Family Moments"],
  ["Springtime Together", "Moc Chau", "Family Moments"],
  ["A Happy Morning", "Ninh Binh", "Family Moments"],
  // Album kỷ niệm, thứ tự khách sắp ngày 26/10/2026.
  ["Sweet Darling", "Hanoi", "Proposals & Celebrations"],
  ["Timeless Love", "Hanoi", "Proposals & Celebrations"],
  ["Fairy of Light", "Hanoi", "Proposals & Celebrations"],
  ["Warrior Goddess", "Hanoi", "Proposals & Celebrations"],
  ["Eternal Moment", "Hanoi", "Proposals & Celebrations"],
  // Album chân dung đơn, thứ tự khách sắp ngày 26/10/2026.
  ["Lotus Sunset", "Hanoi", "Nature & Landscapes"],
  ["Dreamy Garden", "Hanoi", "Nature & Landscapes"],
  ["Little Princess", "Hanoi", "Nature & Landscapes"],
  ["Ao Dai Elegance", "Hanoi", "Nature & Landscapes"],
  ["A Rosy Dream", "Hanoi", "Nature & Landscapes"],
  ["Youthful Days", "Hanoi", "Nature & Landscapes"],
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

export const photoAlbumRows = rows.map(([title, place, category]) => {
  const entries = Array.isArray(category) ? category : [category];
  const categories = entries.map((entry) => (Array.isArray(entry) ? entry[0] : entry));
  const categoryPositions = Object.fromEntries(entries.filter(Array.isArray));
  return {
    slug: slugifyAlbum(title),
    title,
    place,
    categories,
    categoryPositions,
    // Nhãn hiển thị / mô tả SEO.
    category: categories.join(" / "),
  };
});

export const photoAlbumUrl = (slug) => `/photo/albums/${slug}/`;
