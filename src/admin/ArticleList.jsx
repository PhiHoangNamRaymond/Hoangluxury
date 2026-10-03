import React, { useEffect, useMemo, useState } from "react";
import { supabase, blogImageUrl } from "../lib/supabase.js";

function statusOf(article) {
  if (article.status !== "published") return { label: "Nháp", tone: "draft" };
  if (article.publish_at && new Date(article.publish_at) > new Date()) {
    return { label: "Hẹn lịch", tone: "scheduled" };
  }
  return { label: "Đang hiện", tone: "live" };
}

function formatWhen(article) {
  const value = article.publish_at || article.updated_at;
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArticleList({ profile, onEdit, onNew, reloadKey }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scope, setScope] = useState("mine");

  const isAdmin = profile.role === "admin";

  useEffect(() => {
    let alive = true;
    setLoading(true);

    supabase
      .from("articles")
      .select("id, slug, title, excerpt, cover_path, status, publish_at, updated_at, author_id, profiles!articles_author_id_fkey (full_name, email)")
      .order("updated_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!alive) return;
        setArticles(data || []);
        setError(queryError ? queryError.message : "");
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const visible = useMemo(
    () => (isAdmin && scope === "all" ? articles : articles.filter((item) => item.author_id === profile.id)),
    [articles, scope, isAdmin, profile.id],
  );

  return (
    <div className="hlt-admin-list">
      <div className="hlt-admin-list-bar">
        <div>
          <h2>Bài viết</h2>
          {isAdmin && (
            <div className="hlt-admin-scope" role="group" aria-label="Phạm vi">
              <button type="button" className={scope === "mine" ? "is-on" : ""} onClick={() => setScope("mine")}>
                Bài của tôi
              </button>
              <button type="button" className={scope === "all" ? "is-on" : ""} onClick={() => setScope("all")}>
                Tất cả bài
              </button>
            </div>
          )}
        </div>
        <button type="button" className="hlt-admin-btn" onClick={onNew}>
          Viết bài mới
        </button>
      </div>

      {error && <p className="hlt-admin-note is-error">{error}</p>}
      {loading && <p className="hlt-admin-note is-loading">Đang tải…</p>}

      {!loading && !error && !visible.length && (
        <div className="hlt-admin-empty">
          <p>Chưa có bài nào.</p>
          <button type="button" className="hlt-admin-btn" onClick={onNew}>Viết bài đầu tiên</button>
        </div>
      )}

      <ul className="hlt-admin-rows">
        {visible.map((article) => {
          const badge = statusOf(article);
          const mine = article.author_id === profile.id;
          return (
            <li key={article.id} className="hlt-admin-row">
              <button className="hlt-admin-row-edit" type="button" onClick={() => onEdit(article)} disabled={!mine && !isAdmin}>
                {article.cover_path ? (
                  <img src={blogImageUrl(article.cover_path)} alt="" loading="lazy" />
                ) : (
                  <span className="hlt-admin-thumb-blank" />
                )}
                <span className="hlt-admin-row-copy">
                  <strong>{article.title || "(chưa có tiêu đề)"}</strong>
                  <small>
                    <span className={`hlt-admin-badge is-${badge.tone}`}>{badge.label}</span>
                    {formatWhen(article)}
                    {isAdmin && !mine && article.profiles && <> · {article.profiles.full_name || article.profiles.email}</>}
                  </small>
                </span>
              </button>
                {badge.tone === "live" && (
                  <a
                    className="hlt-admin-row-link"
                    href={`/blog/${article.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Xem trên web
                  </a>
                )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
