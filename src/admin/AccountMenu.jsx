import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";

/** Chữ cái đầu của tên để làm huy hiệu tròn. */
function initial(profile) {
  const source = (profile.full_name || profile.email || "?").trim();
  return source.charAt(0).toLocaleUpperCase("vi-VN");
}

export default function AccountMenu({ profile, onChangePassword }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = (action) => {
    setOpen(false);
    action();
  };

  return (
    <div className="hlt-admin-me" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="hlt-admin-me-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="hlt-admin-avatar" aria-hidden="true">{initial(profile)}</span>
        <span className="hlt-admin-me-text">
          <strong>{profile.full_name || profile.email}</strong>
          <small>{profile.role === "admin" ? "Admin" : "Writer"}</small>
        </span>
        <svg className="hlt-admin-me-caret" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 2.5 6 6.5l5-4" />
        </svg>
      </button>

      {open && (
        <div className="hlt-admin-menu" role="menu">
          <p className="hlt-admin-menu-head">
            <strong>{profile.full_name || "(chưa đặt tên)"}</strong>
            <small>{profile.email}</small>
          </p>
          <button type="button" role="menuitem" onClick={() => run(onChangePassword)}>
            Đổi mật khẩu
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => run(() => supabase.auth.signOut())}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
