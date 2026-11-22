import React, { useEffect } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import usePageEntered from "./hooks/usePageEntered.js";

/* Trang 404 cho đường dẫn không tồn tại (trước đây hiện nhầm trang chủ — lỗi
   "soft 404" khách báo 11/11/2026). Dùng lại khung "không tìm thấy" của trang bài
   blog (blog-article.css) cho cùng giao diện. noindex để Google không lưu trang. */
export default function NotFoundPage() {
  const pageEntered = usePageEntered();

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, follow";
    document.head.append(robots);
    return () => robots.remove();
  }, []);

  return (
    <div className={`hlt-site hlt-blog-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />
      <main className="hlt-article-main">
        <div className="hlt-article-missing">
          <span className="hlt-article-missing-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M24 42s13-11.3 13-22a13 13 0 0 0-26 0c0 10.7 13 22 13 22Z" />
              <path d="m19.5 15.5 9 9M28.5 15.5l-9 9" />
            </svg>
          </span>
          <h1>Page not found</h1>
          <p>The page you are looking for may have been moved, or the address may be incorrect.</p>
          <div className="hlt-article-missing-actions">
            <a className="hlt-article-cta" href="/routes/">
              View our routes
            </a>
            <a className="hlt-article-back" href="/">Back to homepage</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
