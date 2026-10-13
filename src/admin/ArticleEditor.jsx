import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderMarkdown } from "../lib/markdown.js";
import { blogImageAccept, blogImageExtension, blogImageError, blogImageHint } from "../lib/blog-upload.js";
import { supabase, blogImageUrl } from "../lib/supabase.js";
import { blogDestinations, blogTopics } from "../config/blog-taxonomy.js";
import { slugify } from "../lib/slugify.js";
import RichTextEditor from "./RichTextEditor.jsx";

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

const editableSnapshot = (form) => JSON.stringify(Object.fromEntries(Object.keys(emptyArticle).map((key) => [key, form[key]])));

export default function ArticleEditor({ article, profile, onDone, onCancel, onDirtyChange, onBusyChange }) {
  const [form, setForm] = useState({ ...emptyArticle, ...(article || {}) });
  const [baseline, setBaseline] = useState(() => editableSnapshot({ ...emptyArticle, ...(article || {}) }));
  const publicationBaseline = useRef({ status: article?.status, publish_at: article?.publish_at });
  const actionBarRef = useRef(null);
  const coverInputRef = useRef(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [preview, setPreview] = useState(false);
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
        if (data) {
          const loaded = { ...emptyArticle, ...data };
          setBaseline(editableSnapshot(loaded));
          publicationBaseline.current = { status: loaded.status, publish_at: loaded.publish_at };
          setForm(loaded);
        }
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
  const dirty = ready && !loadFailed && editableSnapshot(form) !== baseline;
  const busy = status.state === "loading";
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => () => { onDirtyChange?.(false); onBusyChange?.(false); }, [onDirtyChange, onBusyChange]);
  useEffect(() => {
    if (!dirty && !busy) return undefined;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, busy]);
  const cancel = () => {
    if (busy) return;
    if (!dirty || window.confirm("Bạn có thay đổi chưa lưu. Rời trang và bỏ các thay đổi này?")) onCancel();
  };

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));
  useEffect(() => {
    const bar = actionBarRef.current;
    if (!bar || !window.ResizeObserver) return undefined;
    const measure = () => bar.closest('.hlt-admin-editor').style.setProperty('--ad-editor-bar-height', `${Math.ceil(bar.getBoundingClientRect().height) + 8}px`);
    const observer = new window.ResizeObserver(measure); observer.observe(bar); measure();
    return () => observer.disconnect();
  }, [ready, loadFailed]);

  const changeTitle = (value) => {
    update({ title: value, ...(slugTouched ? {} : { slug: slugify(value).slice(0,120).replace(/-$/, "") }) });
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

  /** Ảnh trong thân bài: tải lên rồi trả đường dẫn để bộ soạn thảo tự đặt khung
      ảnh vào chỗ con trỏ. Trả null khi ảnh bị từ chối hoặc tải lỗi. */
  const onBodyImage = async (file) => {
    if (rejectUpload("inline", file)) return null;
    setStatus({ state: "loading", message: "Đang tải ảnh…" });
    try {
      const path = await uploadImage(file);
      setStatus({ state: "idle", message: "" });
      return blogImageUrl(path);
    } catch (error) {
      setStatus({ state: "idle", message: "" });
      setUploadError({ where: "inline", message: `Không tải được ảnh: ${error.message}` });
      return null;
    }
  };

  /* Ổn định qua các lần render để bộ soạn thảo không phải gắn lại handler. */
  const onBodyChange = useCallback((body) => setForm((current) => ({ ...current, body })), []);

  const save = async (nextStatus) => {
    if (!ready || loadFailed || status.state === "loading") return;
    if (nextStatus === "draft" && form.status === "published" && !window.confirm("Chuyển bài về nháp? Bài sẽ không còn hiển thị công khai trên blog.")) return;
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

    const existingPublication = publicationBaseline.current.status === "published" && form.publish_at === publicationBaseline.current.publish_at;
    if (nextStatus === "published" && form.publish_at && new Date(form.publish_at) <= new Date() && !existingPublication) {
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

    setBaseline(editableSnapshot(form));
    publicationBaseline.current = { status: nextStatus || form.status, publish_at: payload.publish_at };
    setStatus({ state: "success", message: "Đã lưu bài." });
    onDirtyChange?.(false);
    onBusyChange?.(false);
    onDone();
  };

  useEffect(() => {
    const onSaveShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (!document.querySelector('[role="dialog"]')) save(form.status);
    };
    window.addEventListener('keydown', onSaveShortcut);
    return () => window.removeEventListener('keydown', onSaveShortcut);
  });

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
  const stalePlan = Boolean(form.publish_at) && !scheduled && !(publicationBaseline.current.status === "published" && form.publish_at === publicationBaseline.current.publish_at);

  /* Cả nhóm cùng sửa được mọi bài, nhưng xoá thì vẫn chỉ tác giả hoặc admin. */
  const canDelete = isNew || profile.role === "admin" || (article?.author_id || profile.id) === profile.id;

  if (!ready) return <p className="hlt-admin-note is-loading">Đang tải bài…</p>;
  if (loadFailed) return <div><p className="hlt-admin-note is-error">{status.message}</p><button type="button" className="hlt-admin-btn" onClick={onCancel}>Về danh sách</button></div>;

  return (
    <div className="hlt-admin-editor">
      <div className="hlt-admin-editor-heading"><p className="hlt-admin-eyebrow">Không gian biên tập</p><h1>{isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}</h1><p className="hlt-admin-description">Soạn nội dung trước, hoàn thiện thông tin bài và chọn cách đăng khi sẵn sàng.</p></div>
      <div className="hlt-admin-editor-bar" ref={actionBarRef}>
        <button type="button" className="hlt-admin-link-btn" onClick={cancel} disabled={busy}>
          ← Danh sách bài
        </button>
        <div className="hlt-admin-editor-actions">
          <button type="button" className="hlt-admin-btn is-ghost" onClick={() => save("draft")} disabled={status.state === "loading"}>
            {form.status === "published" ? "Chuyển về nháp" : "Lưu nháp"}
          </button>
          <button type="button" className="hlt-admin-btn" onClick={() => save("published")} disabled={status.state === "loading"}>
            {scheduled ? "Lưu và hẹn lịch" : form.status === "published" ? "Lưu thay đổi" : "Đăng bài"}
          </button>
        </div>
      </div>

      {status.message && (
        <p className={`hlt-admin-note is-${status.state}`} role="status">{status.message}</p>
      )}

      <p className={`hlt-admin-save-state${dirty ? " is-dirty" : ""}`} role="status">
        {busy ? status.message : dirty ? "Có thay đổi chưa lưu — hãy Lưu nháp trước khi rời trang." : isNew ? "Bài mới — chưa lưu lên máy chủ." : "Chưa có thay đổi mới."}
      </p>

      <fieldset className="hlt-admin-editor-fields" aria-label="Nội dung và thiết lập bài viết" disabled={busy}>
      <div className="hlt-admin-editor-grid">
        <div className="hlt-admin-editor-main">
          <label className="hlt-admin-field">
            <span>Tiêu đề</span>
            <input className="hlt-admin-title-input" name="title" maxLength={200} value={form.title} onChange={(event) => changeTitle(event.target.value)} placeholder="Đặt tiêu đề cho câu chuyện của bạn…" />
            <small>{form.title.length}/200 ký tự</small>
          </label>

          <details className="hlt-admin-editor-meta"><summary>Tóm tắt & đường dẫn <span>Thông tin hiển thị trên thẻ bài và tìm kiếm</span></summary><div>
          <label className="hlt-admin-field">
            <span>Đường dẫn bài viết</span>
            <input
              value={form.slug}
              maxLength={120}
              onChange={(event) => { setSlugTouched(true); update({ slug: event.target.value }); }}
            />
            <small>hoangluxury.travel/blog/<b>{slugify(form.slug) || "duong-dan"}</b>/</small>
          </label>

          <label className="hlt-admin-field">
            <span>Tóm tắt</span>
            <textarea
              rows={2}
              maxLength={2000}
              value={form.excerpt}
              onChange={(event) => update({ excerpt: event.target.value })}
              placeholder="Một hai câu hiện ở thẻ bài và trên kết quả tìm kiếm Google."
            />
            <small className={form.excerpt.length > 160 ? "is-warning" : ""}>{form.excerpt.length}/160 ký tự khuyến nghị · tối đa 2.000 ký tự</small>
          </label>
          </div></details>

          <div className="hlt-admin-field">
            <span className="hlt-admin-field-head">
              Nội dung
              <span className="hlt-admin-field-tools">
                <button type="button" className="hlt-admin-link-btn" onClick={() => setPreview(!preview)}>
                  {preview ? "Quay lại soạn thảo" : "Xem thử"}
                </button>
              </span>
            </span>
            {uploadError.where === "inline" && (
              <p className="hlt-admin-note is-error" role="alert">{uploadError.message}</p>
            )}
            {preview && (
              <div className="hlt-admin-preview hlt-article-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            )}
            <div hidden={preview}>
              <RichTextEditor
                value={form.body}
                onChange={onBodyChange}
                onImageFile={onBodyImage}
                imageAccept={blogImageAccept}
                imageHint={blogImageHint}
                disabled={status.state === "loading"}
                placeholder="Bắt đầu viết bài… Chọn chữ rồi dùng thanh công cụ để in đậm, đổi cỡ tiêu đề hoặc gắn link."
              />
            </div>
            <p className="hlt-admin-editor-help">Ctrl+S để lưu {form.status === "published" ? "thay đổi" : "nháp"} · Ctrl+Z để hoàn tác. Nội dung chỉ được lưu lên máy chủ khi bạn bấm lưu.</p>
          </div>
        </div>

        <aside className="hlt-admin-editor-side">
          <div className="hlt-admin-panel">
            <h3>Đăng bài</h3>
            <label className="hlt-admin-field">
              <span>Trạng thái</span>
              <span className={`hlt-admin-badge is-${form.status !== "published" ? "draft" : scheduled ? "scheduled" : "live"}`}>{form.status !== "published" ? "Nháp — chưa công khai" : scheduled ? "Đã hẹn lịch" : "Đang hiện trên blog"}</span>
            </label>
            <details className="hlt-admin-schedule" open={scheduled || stalePlan}><summary>Hẹn giờ đăng <span>Tuỳ chọn</span></summary>
            <label className="hlt-admin-field">
              <span>Giờ đăng</span>
              <input
                type="datetime-local"
                min={nowLocalInput()}
                value={toLocalInput(form.publish_at)}
                onChange={(event) => update({ publish_at: fromLocalInput(event.target.value) })}
              />
              <small>
                Để trống để đăng ngay. Giờ theo múi giờ thiết bị; nên chọn ít nhất 10 phút sau hiện tại.
              </small>
            </label>
            </details>
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
              <button type="button" className="hlt-admin-upload is-block" onClick={() => coverInputRef.current?.click()} disabled={busy}>Chọn ảnh bìa</button>
            )}
            <input ref={coverInputRef} type="file" hidden aria-label="Tải ảnh bìa" accept={blogImageAccept} onChange={onCoverChange} disabled={busy} />
            <p className="hlt-admin-field-note">{blogImageHint}</p>
            {uploadError.where === "cover" && (
              <p className="hlt-admin-note is-error" role="alert">{uploadError.message}</p>
            )}
            <label className="hlt-admin-field">
              <span>Mô tả ảnh</span>
              <input maxLength={300} value={form.cover_alt} onChange={(event) => update({ cover_alt: event.target.value })} placeholder="Ví dụ: Ruộng bậc thang Sapa lúc bình minh" />
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
                  aria-pressed={form.destinations.includes(item)}
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
                  aria-pressed={form.topics.includes(item)}
                  onClick={() => toggleTag("topics", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {!isNew && (
            <details className="hlt-admin-panel hlt-admin-danger-zone"><summary>Thao tác xoá bài</summary>
              {canDelete ? (
                <button type="button" className="hlt-admin-btn is-danger" onClick={remove} disabled={status.state === "loading"}>
                  Xoá bài này
                </button>
              ) : (
                <p className="hlt-admin-field-note">
                  Bài này do người khác viết. Bạn sửa được nhưng không xoá được — nhờ tác giả hoặc admin xoá giúp.
                </p>
              )}
            </details>
          )}
        </aside>
      </div>
      </fieldset>
    </div>
  );
}
