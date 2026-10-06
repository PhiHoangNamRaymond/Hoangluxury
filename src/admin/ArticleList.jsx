import React, { useEffect, useMemo, useState } from "react";
import { supabase, blogImageUrl } from "../lib/supabase.js";

function statusOf(article) {
  if (article.status !== "published") return { label: "Nháp", tone: "draft", key: "draft" };
  if (article.publish_at && new Date(article.publish_at) > new Date()) {
    return { label: "Hẹn lịch", tone: "scheduled", key: "scheduled" };
  }
  return { label: "Đang hiện", tone: "live", key: "live" };
}

/** Tách ngày và giờ ra hai dòng cho cột hẹp. */
function formatWhen(article) {
  const value = article.publish_at || article.updated_at;
  if (!value) return { date: "", time: "" };
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return { date: "", time: "" };
  return {
    date: at.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: at.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  };
}

const statusFilters = [
  ["all", "Tất cả"],
  ["live", "Đang hiện"],
  ["scheduled", "Hẹn lịch"],
  ["draft", "Nháp"],
];

export default function ArticleList({ profile, onEdit, onNew, reloadKey }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scope, setScope] = useState("mine");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let alive = true;
    setLoading(true);

    supabase
      .from("articles")
      .select("id, slug, title, cover_path, destinations, topics, status, publish_at, updated_at, author_id")
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

  // Cả nhóm biên tập đọc được mọi bài; bộ lọc này chỉ để xem cho gọn.
  const scoped = useMemo(
    () => (scope === "all" ? articles : articles.filter((item) => item.author_id === profile.id)),
    [articles, scope, profile.id],
  );

  const visible = useMemo(() => {
    const text = query.trim().toLocaleLowerCase();
    return scoped.filter((article) => {
      if (statusFilter !== "all" && statusOf(article).key !== statusFilter) return false;
      if (!text) return true;
      return `${article.title} ${(article.destinations || []).join(" ")} ${(article.topics || []).join(" ")}`
        .toLocaleLowerCase()
        .includes(text);
    });
  }, [scoped, query, statusFilter]);

  const counts = useMemo(() => {
    const result = { all: scoped.length, live: 0, scheduled: 0, draft: 0 };
    scoped.forEach((article) => { result[statusOf(article).key] += 1; });
    return result;
  }, [scoped]);

  const filtering = Boolean(query.trim()) || statusFilter !== "all";

  return (
    <div className="hlt-admin-list">
      <div className="hlt-admin-list-bar">
        <h2>
          Bài viết
          {!loading && <span className="hlt-admin-count">{counts.all}</span>}
        </h2>
        <button type="button" className="hlt-admin-btn" onClick={onNew}>
          Viết bài mới
        </button>
      </div>

      {Boolean(scoped.length) && (
        <div className="hlt-admin-toolbar">
          <div className="hlt-admin-scope" role="group" aria-label="Phạm vi">
            <button type="button" className={scope === "mine" ? "is-on" : ""} onClick={() => setScope("mine")}>
              Bài của tôi
            </button>
            <button type="button" className={scope === "all" ? "is-on" : ""} onClick={() => setScope("all")}>
              Tất cả bài
            </button>
          </div>

          <div className="hlt-admin-chips" role="group" aria-label="Lọc theo trạng thái">
            {statusFilters.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={statusFilter === key ? "is-on" : ""}
                onClick={() => setStatusFilter(key)}
              >
                {label}
                <b>{counts[key]}</b>
              </button>
            ))}
          </div>

          <label className="hlt-admin-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              type="search"
              placeholder="Tìm theo tiêu đề, điểm đến, chủ đề…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
      )}

      {error && <p className="hlt-admin-note is-error">{error}</p>}
      {loading && <p className="hlt-admin-note is-loading">Đang tải…</p>}

      {!loading && !error && !scoped.length && (
        <div className="hlt-admin-empty">
          <p>Chưa có bài nào.</p>
          <button type="button" className="hlt-admin-btn" onClick={onNew}>Viết bài đầu tiên</button>
        </div>
      )}

      {!loading && !error && Boolean(scoped.length) && !visible.length && (
        <div className="hlt-admin-empty">
          <p>Không có bài nào khớp bộ lọc.</p>
          <button
            type="button"
            className="hlt-admin-btn is-ghost"
            onClick={() => { setQuery(""); setStatusFilter("all"); }}
          >
            Bỏ bộ lọc
          </button>
        </div>
      )}

      {Boolean(visible.length) && (
        <div className="hlt-admin-grid">
          <div className="hlt-admin-grid-head" aria-hidden="true">
            <span>Bài viết</span>
            <span>Trạng thái</span>
            <span>{filtering ? "Thời gian" : "Cập nhật"}</span>
            <span />
          </div>

          <ul className="hlt-admin-rows">
            {visible.map((article) => {
              const badge = statusOf(article);
              const when = formatWhen(article);
              const tags = [...(article.destinations || []), ...(article.topics || [])];

              return (
                <li key={article.id} className="hlt-admin-row">
                  <button
                    className="hlt-admin-row-main"
                    type="button"
                    onClick={() => onEdit(article)}
                  >
                    {article.cover_path ? (
                      <img src={blogImageUrl(article.cover_path)} alt="" loading="lazy" />
                    ) : (
                      <span className="hlt-admin-thumb-blank" aria-hidden="true" />
                    )}
                    <span className="hlt-admin-row-copy">
                      <strong>{article.title || "(chưa có tiêu đề)"}</strong>
                      <small>
                        {tags.length ? tags.slice(0, 3).join(" · ") : "Chưa gắn điểm đến hay chủ đề"}
                      </small>
                    </span>
                  </button>

                  <span className="hlt-admin-row-status">
                    <span className={`hlt-admin-badge is-${badge.tone}`}>{badge.label}</span>
                  </span>

                  <span className="hlt-admin-row-when">
                    <b>{when.date}</b>
                    <i>{when.time}</i>
                  </span>

                  <span className="hlt-admin-row-actions">
                    {badge.tone === "live" ? (
                      <a href={`/blog/${article.slug}/`} target="_blank" rel="noopener noreferrer">
                        Xem
                      </a>
                    ) : (
                      <span className="hlt-admin-row-dash" aria-hidden="true">—</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
