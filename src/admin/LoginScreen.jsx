import React, { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { logoGoldUrl } from "../config/assets.js";

export default function LoginScreen({ notice }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (status.state === "loading") return;
    setStatus({ state: "loading", message: "" });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setStatus({ state: "error", message: "Không đăng nhập được. Kiểm tra thông tin hoặc thử lại sau." });
      }
      // Đăng nhập thành công thì useSession tự chuyển màn hình.
    } catch {
      setStatus({ state: "error", message: "Không kết nối được hệ thống đăng nhập. Vui lòng thử lại sau." });
    }
  };

  return (
    <div className="hlt-admin-login">
      <form className="hlt-admin-login-card" onSubmit={submit}>
        <img src={logoGoldUrl} alt="" className="hlt-admin-login-logo" />
        <h1>Hoang Luxury Travel</h1>
        <p className="hlt-admin-login-sub">Trang quản trị blog</p>

        {notice && <p className="hlt-admin-note is-error">{notice}</p>}

        <label>
          <span>Email</span>
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          <span>Mật khẩu</span>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit" disabled={status.state === "loading"}>
          {status.state === "loading" ? "Đang xử lý…" : "Đăng nhập"}
        </button>

        {status.message && (
          <p className={`hlt-admin-note is-${status.state}`} role="status">
            {status.message}
          </p>
        )}

        <p className="hlt-admin-login-help">
          Quên mật khẩu? Nhờ quản trị viên đặt lại giúp trong mục Tài khoản.
        </p>
      </form>
    </div>
  );
}
