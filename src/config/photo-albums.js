// Ghép ảnh/video vào danh sách album ở photo-album-list.js. Mỗi album chỉ dùng
// ảnh chụp thật của chính nó; không còn mượn ảnh tạm từ kho chung.
import { albumCoverBySlug, albumPhotosBySlug } from "./assets.js";
import { photoAlbumRows, photoAlbumVideosBySlug } from "./photo-album-list.js";

export {
  ALL_PHOTO_CATEGORIES,
  photoAlbumsPath,
  photoAlbumUrl,
  photoCategories,
  photoCategoryFromSlug,
  photoCategoryPageDescription,
  photoCategoryPageTitle,
  photoCategoryPath,
  photoPagePath,
} from "./photo-album-list.js";

/* Album ảnh: ảnh đầu tiên làm ảnh bìa. Album video: ảnh bìa riêng, danh sách
   video ngang (films) và dọc (shorts). */
export const photoAlbums = photoAlbumRows.map((row) => {
  const photos = albumPhotosBySlug[row.slug] || [];
  const videos = photoAlbumVideosBySlug[row.slug] || null;
  return {
    ...row,
    image: albumCoverBySlug[row.slug] || photos[0],
    photos,
    videos,
  };
});

export const photoAlbumBySlug = Object.fromEntries(
  photoAlbums.map((album) => [album.slug, album]),
);
