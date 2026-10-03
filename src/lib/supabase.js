import { createClient } from "@supabase/supabase-js";
import { readAuthFlow } from "./auth-flow.js";
import { publicConfigError } from "./public-config.js";

/* Hai biến này nằm công khai trong mã nguồn web là đúng thiết kế: mọi quyền
   truy cập đều bị luật RLS chặn ngay trong cơ sở dữ liệu, khoá anon không mở
   thêm được gì. Khoá service_role tuyệt đối không xuất hiện ở đây. */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigError = publicConfigError(url, anonKey);
export const supabaseReady = Boolean(url && anonKey && !supabaseConfigError);
// Đọc trước khi SDK tiêu thụ/loại fragment của email callback.
export const initialAuthFlow = typeof window === "undefined"
  ? { flow: "", error: "" }
  : readAuthFlow(window.location.href);

export const supabase = supabaseReady
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Tuyệt đối không dùng phiên admin/writer khi đọc blog công khai.
export const publicSupabase = supabaseReady
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "hlt-public-blog" },
    })
  : null;

/** Đường dẫn công khai của một ảnh trong kho blog-images. */
export function blogImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")) return "";
  return supabase?.storage.from("blog-images").getPublicUrl(path).data.publicUrl || "";
}
