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
];

function slugifyAlbum(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* [tiêu đề, địa điểm, danh mục] - thứ tự hiện trên lưới /photo/albums/. Ảnh
   từng album nằm ở assets/photo-albums/<slug>/ (ghép trong assets.js). Hiện chỉ
   có album bản địa và album video; các danh mục khác để trống chờ ảnh thật. */
const rows = [
  ["Peach Blossom Season", "Ha Giang", "Local Heritage"],
  ["Lavender Hmong Portraits", "Sapa", "Local Heritage"],
  ["By the Waterfall", "Sapa", "Local Heritage"],
  ["Flowers of the Highlands", "Ha Giang", "Local Heritage"],
  ["Sunset in the Village", "Sapa", "Local Heritage"],
  ["Northern Vietnam on Film", "Mu Cang Chai, Ta Xua & Sapa", "Cinematic Travel"],
];

/* Album video: mã video YouTube. `films` là video ngang (16:9), `shorts` là
   video dọc (9:16). Link khách gửi có hai lần cùng một video (số 1 và 13) nên
   chỉ giữ một. */
export const photoAlbumVideosBySlug = {
  "northern-vietnam-on-film": {
    films: ["MF50DWOr7hY"],
    shorts: [
      "9T8KPo6en8w", "Vve3EMpaegQ", "gGLpaOfTmDw", "74A19Is37O4", "-TT6XZmDQuM",
      "FQTVUhcuSXg", "jVCrtbwXZz4", "ZF6uhygFtFk", "WX6QSh9iAm4", "dKXktVGiqHo",
      "Pbo0tdWxk8g", "DaKN_EBCFN8", "oox30OODoOU", "_Ws8xK7Iu2s",
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
