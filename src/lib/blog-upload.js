const extensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
export const blogImageAccept = Object.keys(extensions).join(",");

/* Cùng một con số với file_size_limit của bucket blog-images trong 01-schema.sql.
   Trình duyệt chặn trước cho người dùng biết lý do; Storage vẫn chặn lần nữa. */
export const blogImageMaxBytes = 5 * 1024 * 1024;
const blogImageMaxLabel = "5 MB";
export const blogImageHint = "JPG, PNG, WebP hoặc GIF, tối đa 5 MB.";

/** Dung lượng dạng người đọc được, để báo lỗi nói rõ ảnh nặng bao nhiêu. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Trả về chuỗi lỗi để hiển thị, hoặc "" nếu ảnh hợp lệ. Không ném lỗi. */
export function blogImageError(file) {
  if (!file || !extensions[file.type]) return "Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF; không nhận SVG/HTML.";
  if (!file.size) return "Tệp rỗng, không có dữ liệu ảnh.";
  if (file.size > blogImageMaxBytes) {
    return `Ảnh này nặng ${formatBytes(file.size)}, vượt giới hạn ${blogImageMaxLabel}. Hãy nén lại hoặc chọn ảnh nhỏ hơn rồi thử lại.`;
  }
  return "";
}

export function blogImageExtension(file) {
  const invalid = blogImageError(file);
  if (invalid) throw new Error(invalid);
  return extensions[file.type];
}
