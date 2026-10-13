import React, { useState } from "react";

export default function PasswordField({ label, ...props }) {
  const [shown, setShown] = useState(false);
  return <label className="hlt-admin-password-field"><span>{label}</span><div className="hlt-admin-password-control">
    <input aria-label={label} {...props} type={shown ? "text" : "password"} />
    <button type="button" className="hlt-admin-password-toggle" aria-label={`${shown ? "Ẩn" : "Hiện"} ${label.toLocaleLowerCase("vi")}`} aria-pressed={shown} disabled={props.disabled} onClick={() => setShown((value) => !value)}>{shown ? "Ẩn" : "Hiện"}</button>
  </div></label>;
}
