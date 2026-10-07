import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderMarkdown } from "../lib/markdown.js";
import { blogImageAccept, blogImageExtension, blogImageError, blogImageHint } from "../lib/blog-upload.js";
import { supabase, blogImageUrl } from "../lib/supabase.js";
import { blogDestinations, blogTopics } from "../config/blog-taxonomy.js";
import { slugify } from "../lib/slugify.js";

/* Giờ Việt Nam: input datetime-local không mang múi giờ nên phải tự quy đổi. */
function toLocalInput(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* Mốc sớm nhất cho ô hẹn lịch: chặn người viết chọn nhầm giờ đã qua. */
function nowLocalInput() {
  return toLocalInput(new Date().toISOString());
}

function fromLocalInput(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const emptyArticle = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  cover_path: "",
  cover_alt: "",
  destinations: [],
  topics: [],
  featured: false,
  status: "draft",
  publish_at: null,
};

export default function ArticleEditor({ article, profile, onDone, onCancel }) {
  const [form, setForm] = useState({ ...emptyArticle, ...(article || {}) });
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef(null);
  const isNew = !article?.id;

  /* Danh sách bài chỉ lấy vài cột cho nhẹ, nên khi mở sửa phải nạp đủ bản ghi,
     nếu không lúc lưu sẽ ghi đè mất nội dung và các thẻ phân loại. */
  const [ready, setReady] = useState(isNew);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    if (isNew) return undefined;
    let alive = true;
    supabase
      .from("articles")
      .select("*")
      .eq("id", article.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        if (data) setForm({ ...emptyArticle, ...data });
        if (error || !data) {
          setLoadFailed(true);
          setStatus({ state: "error", message: error?.message || "Bài không còn tồn tại hoặc bạn không có quyền truy cập." });
        }
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [article?.id, isNew]);

  const previewHtml = useMemo(() => renderMarkdown(form.body), [form.body]);

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));

  const changeTitle = (value) => {
    update({ title: value, ...(slugTouched ? {} : { slug: slugify(value) }) });
  };

  const toggleTag = (field, value) => {
    const list = form[field] || [];
    update({ [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] });
  };

  /** Tải ảnh lên kho blog-images và trả về đường dẫn trong kho. */
  const uploadImage = async (file) => {
    const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    const ext = blogImageExtension(file);
    const path = `${profile.id}/${crypto.randomUUID()}-${safeName.slice(0, 80)}${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    return path;
  };

  /* Báo ngay cạnh chỗ chọn ảnh. Dải trạng thái nằm trên đầu trang, người đang
     cuộn xuống cuối bài sẽ không nhìn thấy nó. */
  const [uploadError, setUploadError] = useState({ where: "", message: "" });
  const rejectUpload = (where, file) => {
    const invalid = blogImageError(file);
    if (invalid) setUploadError({ where, message: invalid });
    else setUploadError({ where: "", message: "" });
    return invalid;
  };

  const onCoverChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || rejectUpload("cover", file)) return;
    setStatus({ state: "loading", message: "Đang tải ảnh bìa…" });
    try {
      const path = await uploadImage(file);
      update({ cover_path: path });
      setStatus({ state: "idle", message: "" });
    } catch (error) {
      setStatus({ state: "idle", message: "" });
      setUploadError({ where: "cover", message: `Không tải được ảnh: ${error.message}` });
    }
  };

  /** Chèn ảnh vào đúng vị trí con trỏ trong nội dung. */
  const onInlineImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || rejectUpload("inline", file)) return;
    setStatus({ state: "loading", message: "Đang tải ảnh…" });
    try {
      const path = await uploadImage(file);
      const markdown = `\n![Mô tả ảnh](${blogImageUrl(path)})\n`;
      const area = bodyRef.current;
      const cursor = area?.selectionStart;
      setForm((current) => {
        const at = cursor == null ? current.body.length : Math.min(cursor, current.body.length);
        return { ...current, body: current.body.slice(0, at) + markdown + current.body.slice(at) };
      });
      setStatus({ state: "idle", message: "" });
    } catch (error) {
      setStatus({ state: "idle", message: "" });
      setUploadError({ where: "inline", message: `Không tải được ảnh: ${error.message}` });
    }
  };

  const save = async (nextStatus) => {
    if (!ready || loadFailed || status.state === "loading") return;
    if (!form.title.trim()) {
      setStatus({ state: "error", message: "Chưa có tiêu đề." });
      return;
    }
    if (!slugify(form.slug) || slugify(form.slug).length > 120) {
      setStatus({ state: "error", message: "Đường dẫn phải có chữ/số, không quá 120 ký tự." });
      return;
    }
    if (nextStatus === "published" && !form.body.trim()) {
      setStatus({ state: "error", message: "Cần nội dung trước khi đăng bài." });
      return;
    }
    if (form.title.trim().length > 200 || form.excerpt.length > 2000 ||
        new TextEncoder().encode(form.body).byteLength > 800000 ||
        form.cover_path.length > 2048 || form.cover_alt.length > 300 ||
        form.destinations.length > 20 || form.topics.length > 20) {
      setStatus({ state: "error", message: "Nội dung vượt giới hạn: tiêu đề 200, tóm tắt 2.000, mô tả ảnh 300 ký tự; bài viết tối đa 800 KB." });
      return;
    }

    if (nextStatus === "published" && form.publish_at && new Date(form.publish_at) <= new Date()) {
      const when = new Date(form.publish_at).toLocaleString("vi-VN");
      const message = `Giờ hẹn ${when} đã trôi qua nên bài sẽ hiện trên web ngay bây giờ.\n\nBấm OK để đăng ngay, hoặc Cancel để chọn lại giờ khác.`;
      if (!window.confirm(message)) {
        setStatus({ state: "error", message: "Giờ hẹn đã qua. Hãy chọn một mốc trong tương lai rồi lưu lại." });
        return;
      }
    }

    setStatus({ state: "loading", message: "Đang lưu…" });

    const payload = {
      slug: slugify(form.slug),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body,
      cover_path: form.cover_path,
      cover_alt: form.cover_alt.trim(),
      destinations: form.destinations,
      topics: form.topics,
      featured: form.featured,
      status: nextStatus || form.status,
      publish_at: form.publish_at || ((nextStatus || form.status) === "published" ? new Date().toISOString() : null),
    };

    const query = isNew
      ? supabase.from("articles").insert({ ...payload, author_id: profile.id })
      : supabase.from("articles").update(payload).eq("id", article.id);

    const { error } = await query.select("id").single();

    if (error) {
      setStatus({
        state: "error",
        message:
          error.code === "23505"
            ? "Đường dẫn này đã có bài khác dùng. Đổi sang đường dẫn khác."
            : error.message,
      });
      return;
    }

    onDone();
  };

  const remove = async () => {
    if (!window.confirm(`Xoá hẳn bài "${form.title}"? Không khôi phục được.`)) return;
    setStatus({ state: "loading", message: "Đang xoá…" });
    const { error } = await supabase.from("articles").delete().eq("id", article.id).select("id").single();
    if (error) {
      setStatus({ state: "error", message: error.message });
      return;
    }
    onDone();
  };

  /* Giờ hẹn có thể trôi qua trong lúc đang soạn bài, nên nhãn và nút phải
     tự tính lại theo đồng hồ chứ không chỉ khi form thay đổi. */
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  const scheduled = Boolean(form.publish_at) && new Date(form.publish_at).getTime() > clock;
  const stalePlan = Boolean(form.publish_at) && !scheduled;

  /* Cả nhóm cùng sửa được mọi bài, nhưng xoá thì vẫn chỉ tác giả hoặc admin. */
  const canDelete = isNew || profile.role === "admin" || (article?.author_id || profile.id) === profile.id;

  if (!ready) return <p className="hlt-admin-note is-loading">Đang tải bài…</p>;
  if (loadFailed) return <div><p className="hlt-admin-note is-error">{status.message}</p><button type="button" className="hlt-admin-btn" onClick={onCancel}>Về danh sách</button></div>;

  return (
    <div className="hlt-admin-editor">
      <div className="hlt-admin-editor-bar">
        <button type="button" className="hlt-admin-link-btn" onClick={onCancel}>
          ← Danh sách bài
        </button>
        <div className="hlt-admin-editor-actions">
          <button type="button" className="hlt-admin-btn is-ghost" onClick={() => save("draft")} disabled={status.state === "loading"}>
            Lưu nháp
          </button>
          <button type="button" className="hlt-admin-btn" onClick={() => save("published")} disabled={status.state === "loading"}>
            {scheduled ? "Lưu và hẹn lịch" : "Đăng bài"}
          </button>
        </div>
      </div>

      {status.message && (
        <p className={`hlt-admin-note is-${status.state}`} role="status">{status.message}</p>
      )}

      <div className="hlt-admin-editor-grid">
        <div className="hlt-admin-editor-main">
          <label className="hlt-admin-field">
            <span>Tiêu đề</span>
            <input value={form.title} onChange={(event) => changeTitle(event.target.value)} placeholder="The Ultimate Sapa Travel Guide" />
          </label>

          <label className="hlt-admin-field">
            <span>Đường dẫn bài viết</span>
            <input
              value={form.slug}
              onChange={(event) => { setSlugTouched(true); update({ slug: event.target.value }); }}
            />
            <small>hoangluxury.travel/blog/<b>{slugify(form.slug) || "duong-dan"}</b>/</small>
          </label>

          <label className="hlt-admin-field">
            <span>Tóm tắt</span>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(event) => update({ excerpt: event.target.value })}
              placeholder="Một hai câu hiện ở thẻ bài và trên kết quả tìm kiếm Google."
            />
            <small>{form.excerpt.length}/160 ký tự nên dùng cho Google</small>
          </label>

          <div className="hlt-admin-field">
            <span className="hlt-admin-field-head">
              Nội dung
              <span className="hlt-admin-field-tools">
                <label className="hlt-admin-upload" title={blogImageHint}>
                  Chèn ảnh
                  <input type="file" accept={blogImageAccept} onChange={onInlineImage} disabled={status.state === "loading"} />
                </label>
                <button type="button" className="hlt-admin-link-btn" onClick={() => setPreview(!preview)}>
                  {preview ? "Quay lại soạn thảo" : "Xem thử"}
                </button>
              </span>
            </span>
            {uploadError.where === "inline" && (
              <p className="hlt-admin-note is-error" role="alert">{uploadError.message}</p>
            )}
            {preview ? (
              <div className="hlt-admin-preview hlt-article-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <textarea
                ref={bodyRef}
                className="hlt-admin-body"
                rows={24}
                value={form.body}
                onChange={(event) => update({ body: event.target.value })}
                placeholder={"## Đầu mục\n\nĐoạn văn. Cách một dòng trống để sang đoạn mới.\n\n- Gạch đầu dòng\n\n> Câu trích dẫn\n\n[Chữ hiển thị](/journey/hanoi-to-sapa-private-transfer/)"}
              />
            )}
          </div>
        </div>

        <aside className="hlt-admin-editor-side">
          <div className="hlt-admin-panel">
            <h3>Đăng bài</h3>
            <label className="hlt-admin-field">
              <span>Trạng thái</span>
              <select value={form.status} onChange={(event) => update({ status: event.target.value })}>
                <option value="draft">Nháp — không hiện trên web</option>
                <option value="published">Đã đăng</option>
              </select>
            </label>
            <label className="hlt-admin-field">
              <span>Giờ đăng</span>
              <input
                type="datetime-local"
                min={nowLocalInput()}
                value={toLocalInput(form.publish_at)}
                onChange={(event) => update({ publish_at: fromLocalInput(event.target.value) })}
              />
              <small>
                Để trống = đăng ngay. Giờ hiển thị theo múi giờ thiết bị. Bài hẹn lịch được đọc công khai sau giờ hẹn; trang đang mở tự cập nhật khoảng mỗi phút.
                Đừng hẹn sát quá — mốc giờ có thể trôi qua trong lúc bạn còn đang soạn bài.
              </small>
            </label>
            {scheduled && (
              <p className="hlt-admin-note is-info">Bài sẽ tự lên web vào {new Date(form.publish_at).toLocaleString("vi-VN")}.</p>
            )}
            {stalePlan && (
              <p className="hlt-admin-note is-error">
                Giờ hẹn {new Date(form.publish_at).toLocaleString("vi-VN")} đã trôi qua. Lưu bây giờ là bài lên web ngay;
                muốn hẹn tiếp thì chọn lại một mốc xa hơn.
              </p>
            )}
            <label className="hlt-admin-check">
              <input type="checkbox" checked={form.featured} onChange={(event) => update({ featured: event.target.checked })} />
              <span>Đặt làm bài nổi bật ở đầu trang blog</span>
            </label>
          </div>

          <div className="hlt-admin-panel">
            <h3>Ảnh bìa</h3>
            {form.cover_path ? (
              <div className="hlt-admin-cover">
                <img src={blogImageUrl(form.cover_path)} alt="" />
                <button type="button" className="hlt-admin-link-btn" onClick={() => update({ cover_path: "" })}>
                  Bỏ ảnh
                </button>
              </div>
            ) : (
              <label className="hlt-admin-upload is-block">
                Chọn ảnh bìa
                <input type="file" accept={blogImageAccept} onChange={onCoverChange} disabled={status.state === "loading"} />
              </label>
            )}
            <p className="hlt-admin-field-note">{blogImageHint}</p>
            {uploadError.where === "cover" && (
              <p className="hlt-admin-note is-error" role="alert">{uploadError.message}</p>
            )}
            <label className="hlt-admin-field">
              <span>Mô tả ảnh</span>
              <input value={form.cover_alt} onChange={(event) => update({ cover_alt: event.target.value })} placeholder="Ruộng bậc thang Sapa lúc bình minh" />
            </label>
          </div>

          <div className="hlt-admin-panel">
            <h3>Điểm đến</h3>
            <div className="hlt-admin-tags">
              {blogDestinations.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={form.destinations.includes(item) ? "is-on" : ""}
                  onClick={() => toggleTag("destinations", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="hlt-admin-panel">
            <h3>Chủ đề</h3>
            <div className="hlt-admin-tags">
              {blogTopics.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={form.topics.includes(item) ? "is-on" : ""}
                  onClick={() => toggleTag("topics", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {!isNew && (
            <div className="hlt-admin-panel">
              {canDelete ? (
                <button type="button" className="hlt-admin-btn is-danger" onClick={remove} disabled={status.state === "loading"}>
                  Xoá bài này
                </button>
              ) : (
                <p className="hlt-admin-field-note">
                  Bài này do người khác viết. Bạn sửa được nhưng không xoá được — nhờ tác giả hoặc admin xoá giúp.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
