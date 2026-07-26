import React from "react";
import { stickyBookDriveIconUrl } from "../../config/assets.js";

export default function StickyActions() {
  return (
    <aside className="hlt-sticky-actions" aria-label="Quick contact actions">
      <a
        href="/booking/"
        className="hlt-sticky-book"
        title="Book Your Drive"
      >
        <img src={stickyBookDriveIconUrl} alt="" aria-hidden="true" />
        <span>Book Your Drive</span>
      </a>
      <a className="hlt-sticky-phone" href="tel:+84839779888" title="Call +84.839.779.888" aria-label="Call +84.839.779.888">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.3 22.1 1.9 13.7 1.9 3.4c0-.7.6-1.3 1.3-1.3h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.7.6 4 .1.4 0 .8-.3 1.2l-1.7 2.2Z" />
        </svg>
      </a>
    </aside>
  );
}
