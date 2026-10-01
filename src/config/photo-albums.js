// Ghép ảnh vào danh sách album ở photo-album-list.js. Ảnh hiện lấy từ kho ảnh
// sẵn có của site, thay bằng ảnh chụp thật khi có bộ ảnh của từng album.
import { experienceImages, journeyCardImages } from "./assets.js";
import { photoAlbumRows } from "./photo-album-list.js";

export {
  ALL_PHOTO_CATEGORIES,
  photoAlbumUrl,
  photoCategories,
} from "./photo-album-list.js";

/* Ảnh bìa, cùng thứ tự với photoAlbumRows. */
const covers = [
  journeyCardImages[0],
  experienceImages[9].src,
  experienceImages[15].src,
  journeyCardImages[2],
  journeyCardImages[7],
  experienceImages[13].src,
  journeyCardImages[6],
  experienceImages[5].src,
  experienceImages[6].src,
  journeyCardImages[3],
  experienceImages[16].src,
  journeyCardImages[1],
  journeyCardImages[8],
  journeyCardImages[5],
  journeyCardImages[4],
  experienceImages[11].src,
];

/* Kho ảnh chung để xếp thành nội dung từng album. */
const pool = [...journeyCardImages, ...experienceImages.map((item) => item.src)];

/* Mỗi album lấy ảnh bìa rồi thêm 5 ảnh khác trong kho; bước nhảy lệch nhau để
   hai album cạnh nhau không ra cùng một bộ ảnh. */
function galleryFor(cover, seed) {
  const photos = [cover];
  for (let step = 1; photos.length < 6 && step < pool.length * 2; step += 1) {
    const candidate = pool[(seed * 5 + step * 3) % pool.length];
    if (!photos.includes(candidate)) photos.push(candidate);
  }
  return photos;
}

export const photoAlbums = photoAlbumRows.map((row, index) => ({
  ...row,
  image: covers[index],
  photos: galleryFor(covers[index], index + 1),
}));

export const photoAlbumBySlug = Object.fromEntries(
  photoAlbums.map((album) => [album.slug, album]),
);
