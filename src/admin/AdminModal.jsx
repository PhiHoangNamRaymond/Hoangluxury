import React, { useEffect, useRef } from "react";

/** Hộp thoại dùng chung cho trang quản trị. `onClose` để trống nghĩa là đang bận,
    lúc đó Escape và bấm ra ngoài đều không đóng để tránh mất thao tác dở dang. */
export default function AdminModal({ title, onClose, children, labelId = "hlt-admin-modal-title" }) {
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    openerRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    /* Con trỏ vào ô nhập đầu tiên. Phải tìm ô nhập trước rồi mới tới nút, vì nút
       đóng nằm trên đầu DOM và sẽ giành mất con trỏ của ô Email. */
    const panel = panelRef.current;
    const field = panel?.querySelector(".hlt-admin-modal-body input, .hlt-admin-modal-body select, .hlt-admin-modal-body textarea");
    const fallback = panel?.querySelector(".hlt-admin-modal-foot button");
    (field || fallback || panel)?.focus();

    return () => {
      document.body.style.overflow = overflow;
      /* Không dùng `instanceof HTMLElement`: hằng số đó không phải biến toàn cục ở
         mọi môi trường, chỉ cần biết phần tử còn trên trang và có hàm focus. */
      const opener = openerRef.current;
      if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
    };
  }, []);

  useEffect(() => {
    if (!onClose) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="hlt-admin-modal-wrap"
      onMouseDown={(event) => {
        if (onClose && event.target === event.currentTarget) onClose();
      }}
    >
      <div className="hlt-admin-modal" role="dialog" aria-modal="true" aria-labelledby={labelId} ref={panelRef} tabIndex={-1}>
        <div className="hlt-admin-modal-head">
          <h3 id={labelId}>{title}</h3>
          {onClose && (
            <button type="button" className="hlt-admin-modal-x" onClick={onClose} aria-label="Đóng">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
