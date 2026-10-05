import React, { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { logoGoldUrl } from "../config/assets.js";

export default function LoginScreen({ notice }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signIn"); // signIn | reset
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (status.state === "loading") return;
    setStatus({ state: "loading", message: "" });
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin/?type=recovery`,
        });
        setStatus(
          error
            ? { state: "error", message: "Không gửi được yêu cầu. Hãy thử lại sau hoặc liên hệ quản trị viên." }
            : { state: "success", message: "Nếu email có tài khoản, bạn sẽ nhận được link đặt lại mật khẩu. Hãy kiểm tra hộp thư." },
        );
        return;
      }

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

        {mode === "signIn" && (
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
        )}

        <button type="submit" disabled={status.state === "loading"}>
          {status.state === "loading"
            ? "Đang xử lý…"
            : mode === "signIn"
              ? "Đăng nhập"
              : "Gửi email đặt lại mật khẩu"}
        </button>

        {status.message && (
          <p className={`hlt-admin-note is-${status.state}`} role="status">
            {status.message}
          </p>
        )}

        <button
          type="button"
          className="hlt-admin-link-btn"
          onClick={() => {
            setMode(mode === "signIn" ? "reset" : "signIn");
            setStatus({ state: "idle", message: "" });
          }}
        >
          {mode === "signIn" ? "Quên mật khẩu?" : "Quay lại đăng nhập"}
        </button>
      </form>
    </div>
  );
}
