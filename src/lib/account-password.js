// Mật khẩu khởi tạo do admin phát cho người viết. Sinh trong trình duyệt bằng
// crypto.getRandomValues rồi gửi thẳng cho hàm máy chủ — không lưu ở đâu khác.

// Bỏ các ký tự dễ đọc nhầm (0/O, 1/l/I) vì admin phải đọc lại qua tin nhắn.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Lấy mẫu có loại bỏ phần dư để mọi ký tự có xác suất bằng nhau. */
export function generatePassword(length = 20, random = (buffer) => crypto.getRandomValues(buffer)) {
  const ceiling = Math.floor(0xffffffff / ALPHABET.length) * ALPHABET.length;
  const buffer = new Uint32Array(1);
  let password = "";
  while (password.length < length) {
    random(buffer);
    if (buffer[0] >= ceiling) continue;
    password += ALPHABET[buffer[0] % ALPHABET.length];
  }
  return password;
}

/** Cùng một luật với supabase/functions/invite-writer/index.js. */
export function accountPasswordError(password) {
  if (typeof password !== "string" || password.length < 15) return "Mật khẩu cần ít nhất 15 ký tự.";
  if (password.length > 128) return "Mật khẩu không được dài hơn 128 ký tự.";
  if (/[\u0000-\u001F\u007F]/.test(password)) return "Mật khẩu không được chứa ký tự điều khiển.";
  return "";
}
