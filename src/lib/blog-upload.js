const extensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
export const blogImageAccept = Object.keys(extensions).join(",");
export function blogImageExtension(file) {
  if (!extensions[file.type]) throw new Error("Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF; không nhận SVG/HTML.");
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("Ảnh phải có dung lượng lớn hơn 0 và không quá 5 MB.");
  return extensions[file.type];
}
