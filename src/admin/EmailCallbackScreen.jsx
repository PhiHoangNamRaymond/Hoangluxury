import React, { useState } from "react";
import { callbackSupabase, supabase } from "../lib/supabase.js";
import { acceptEmailCallback, installEmailSession } from "../lib/email-callback.js";
import { rememberPasswordSetup } from "../lib/auth-flow.js";

export default function EmailCallbackScreen({ callback, session, onAccepted, onCancel }) {
  const [candidate, setCandidate] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const verify = async () => {
    if (status.loading) return;
    setStatus({ loading: true, error: "" });
    try {
      setCandidate(await acceptEmailCallback(callbackSupabase, callback));
      setStatus({ loading: false, error: "" });
    } catch { setStatus({ loading: false, error: "Link không hợp lệ, đã dùng hoặc hết hạn. Hãy yêu cầu email mới." }); }
  };
  const confirm = async () => {
    if (status.loading || !candidate) return;
    setStatus({ loading: true, error: "" });
    try {
      const accepted = await installEmailSession(supabase, candidate);
      rememberPasswordSetup(accepted, callback.type);
      onAccepted(accepted, callback.type);
    } catch { setStatus({ loading: false, error: "Không mở được phiên. Hãy yêu cầu email mới." }); }
  };
  return <div className="hlt-admin-login"><div className="hlt-admin-login-card">
    <h1>Xác nhận link email</h1>
    {session?.user?.email && <p>Phiên hiện tại: <strong>{session.user.email}</strong></p>}
    {!candidate ? <><p>Chỉ tiếp tục nếu chính bạn yêu cầu email đặt mật khẩu hoặc đang nhận lời mời của quản trị viên.</p>
      <button type="button" disabled={status.loading} onClick={verify}>Kiểm tra link email</button></> : <>
      <p>Link này dành cho: <strong>{candidate.user.email}</strong></p>
      <p>Tiếp tục sẽ mở tài khoản trên để {callback.type === "invite" ? "đặt mật khẩu lần đầu" : "đặt lại mật khẩu"}. Không tiếp tục nếu bạn không nhận ra tài khoản này.</p>
      <button type="button" disabled={status.loading} onClick={confirm}>Tôi xác nhận tài khoản này</button></>}
    {status.error && <p role="alert" className="hlt-admin-note is-error">{status.error}</p>}
    <button type="button" disabled={status.loading} className="hlt-admin-link-btn" onClick={onCancel}>Huỷ, giữ phiên hiện tại</button>
  </div></div>;
}
