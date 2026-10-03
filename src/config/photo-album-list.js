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

/* [tiêu đề, địa điểm, danh mục] - thứ tự phải khớp với mảng ảnh bìa ở
   photo-albums.js. */
const rows = [
  ["Sapa Sunrise Story", "Sapa", "Natural Journey"],
  ["Mountain Love Story", "Ha Giang", "Couple & Honeymoon"],
  ["Colors of Local Life", "Ha Giang", "Local Heritage"],
  ["A Family Day in Ninh Binh", "Ninh Binh", "Family Memories"],
  ["Dreamy Moments in Moc Chau", "Moc Chau", "Natural Journey"],
  ["She Said Yes", "Sapa", "Proposal & Celebration"],
  ["Golden Terraces", "Mu Cang Chai", "Cinematic Travel"],
  ["People Make the Journey", "Sapa", "Local Heritage"],
  ["A Peaceful Escape", "Ha Long", "Natural Journey"],
  ["On the Road to Ha Giang", "Ha Giang", "Cinematic Travel"],
  ["Little Smiles, Big Stories", "Sapa", "Family Memories"],
  ["Sunset Memories in Ha Long", "Ha Long", "Natural Journey"],
  ["Morning Mist in Ta Xua", "Ta Xua", "Cinematic Travel"],
  ["Ban Gioc in Bloom", "Cao Bang", "Natural Journey"],
  ["Island Days in Cat Ba", "Cat Ba", "Family Memories"],
  ["A Toast to the View", "Sapa", "Couple & Honeymoon"],
];

export const photoAlbumRows = rows.map(([title, place, category]) => ({
  slug: slugifyAlbum(title),
  title,
  place,
  category,
}));

export const photoAlbumUrl = (slug) => `/photo/albums/${slug}/`;
