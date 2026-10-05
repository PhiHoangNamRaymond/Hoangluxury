import React, { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { passwordError, passwordSetupAllowed, clearPasswordSetup } from "../lib/auth-flow.js";

export default function PasswordScreen({ flow, session, onDone }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const changing = !passwordSetupAllowed(session, flow);
  const submit = async (event) => {
    event.preventDefault();
    if (status.state === "loading") return;
    const validation = passwordError(password, confirmation);
    if (validation) { setStatus({ state: "error", message: validation }); return; }
    setStatus({ state: "loading", message: "Đang lưu mật khẩu…" });
    try {
      const requiresCurrentPassword = !passwordSetupAllowed(session, flow);
      if (requiresCurrentPassword) {
        if (!currentPassword) throw new Error("Hãy nhập mật khẩu hiện tại hoặc mở lại link email hợp lệ.");
        const { error } = await supabase.auth.signInWithPassword({ email: session.user.email, password: currentPassword });
        if (error) throw new Error("Mật khẩu hiện tại không đúng hoặc phiên không hợp lệ.");
      }
      const { error } = await supabase.auth.updateUser({ password, ...(requiresCurrentPassword ? { current_password: currentPassword } : {}) });
      if (error) throw error;
      setPassword(""); setConfirmation(""); setCurrentPassword("");
      clearPasswordSetup();
      setStatus({ state: "success", message: "Đã lưu mật khẩu. Bạn có thể vào trang quản trị." });
    } catch (error) { setStatus({ state: "error", message: error.message }); }
  };
  return <div className="hlt-admin-login"><form className="hlt-admin-login-card" onSubmit={submit}>
    <h1>{changing ? "Đổi mật khẩu" : flow === "invite" ? "Đặt mật khẩu tài khoản" : "Đặt lại mật khẩu"}</h1>
    <p className="hlt-admin-login-sub">{session.user.email}</p>
    {status.state !== "success" && <>
      {changing && <label><span>Mật khẩu hiện tại</span><input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>}
      <label><span>Mật khẩu mới (ít nhất 15 ký tự)</span><input required type="password" minLength={15} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <label><span>Nhập lại mật khẩu mới</span><input required type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
      <button type="submit" disabled={status.state === "loading"}>Lưu mật khẩu</button>
    </>}
    {status.message && <p className={`hlt-admin-note is-${status.state}`} role="status">{status.message}</p>}
    {status.state === "success" && <button type="button" onClick={onDone}>Vào trang quản trị</button>}
    {changing && status.state !== "success" && <button type="button" className="hlt-admin-link-btn" onClick={onDone}>Huỷ</button>}
    {!changing && status.state !== "success" && <button type="button" className="hlt-admin-link-btn" onClick={() => supabase.auth.signOut()}>Đăng xuất</button>}
  </form></div>;
}
