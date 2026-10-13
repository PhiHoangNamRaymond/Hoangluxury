import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { generatePassword, accountPasswordError } from "../lib/account-password.js";
import AdminModal from "./AdminModal.jsx";
import { adminSearchText } from "../lib/admin-search.js";

/** Chỉ admin thấy màn hình này. Tạo tài khoản và đặt lại mật khẩu phải đi qua hàm
    máy chủ vì hai thao tác đó cần khoá service_role, không được để trong trình duyệt. */
export default function UserManager({ profile, onBusyChange }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  /* Một hộp thoại tại một thời điểm: "create" là biểu mẫu, "done" là kết quả. */
  const [dialog, setDialog] = useState(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [query, filter, reloadKey]);
  const busy = creating || dialog?.mode === "working";
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  useEffect(() => {
    if (!busy) return undefined;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [busy]);
  const matches = people.filter((person) => (filter === "all" || (filter === "locked" ? !person.active : person.active)) && adminSearchText(`${person.full_name} ${person.email}`).includes(adminSearchText(query.trim())));
  const pages = Math.max(1, Math.ceil(matches.length / 20));
  const currentPage = Math.min(page, pages);
  const pagePeople = matches.slice((currentPage - 1) * 20, currentPage * 20);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, email, full_name, role, active, created_at")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!alive) return;
        setPeople(data || []);
        setListError(error ? error.message : "");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  /** Gọi hàm máy chủ kèm vé đăng nhập hiện tại; ném lỗi đã dịch sẵn cho người dùng. */
  const callServer = async (body) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("Phiên đăng nhập hết hạn. Hãy đăng nhập lại.");

    const { data: result, error } = await supabase.functions.invoke("invite-writer", {
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    if (error) {
      /* Khi hàm từ chối tên miền gọi tới, phản hồi không kèm Access-Control-Allow-Origin
         nên trình duyệt chặn luôn, không đọc được JSON. Nêu rõ origin hiện tại để biết
         phải thêm gì vào BLOG_ALLOWED_ORIGINS thay vì chỉ báo chung chung. */
      const details = await error.context?.json?.().catch(() => null);
      throw new Error(details?.error
        || `Không gọi được chức năng quản lý tài khoản. Thường gặp nhất: ${window.location.origin} chưa có trong BLOG_ALLOWED_ORIGINS của Edge Function. Cũng kiểm tra hàm invite-writer đã deploy chưa.`);
    }
    if (!result?.ok) throw new Error(result?.error || "Thao tác không thành công.");
    return result;
  };

  const runReset = async (person) => {
    const next = generatePassword();
    setDialog({ mode: "working", label: "Đang đặt lại mật khẩu…" });
    try {
      await callServer({ action: "reset", userId: person.id, password: next });
      setDialog({ mode: "done", title: "Đã đặt lại mật khẩu", email: person.email, password: next });
    } catch (error) {
      setDialog({ mode: "failed", title: "Không đặt lại được mật khẩu", message: error.message });
    }
  };

  const askReset = (person) => setDialog({
    mode: "confirm",
    title: "Đặt lại mật khẩu",
    body: `Cấp mật khẩu mới cho ${person.email}. Mật khẩu hiện tại sẽ ngừng hoạt động ngay, người đó phải dùng mật khẩu mới để đăng nhập.`,
    confirmLabel: "Đặt lại mật khẩu",
    danger: true,
    onConfirm: () => runReset(person),
  });

  const runActive = async (person, active) => {
    setDialog({ mode: "working", label: active ? "Đang mở khoá…" : "Đang khoá tài khoản…" });
    try {
      const { error } = await supabase.from("profiles").update({ active }).eq("id", person.id).select("id").single();
      if (error) throw error;
      setDialog(null); setSuccess(active ? "Đã mở khoá tài khoản." : "Đã khoá tài khoản."); setReloadKey((value) => value + 1);
    } catch (error) { setDialog({ mode: "failed", title: "Không cập nhật được tài khoản", message: error.message }); }
  };

  const askActive = (person, active) => setDialog({
    mode: "confirm",
    title: active ? "Mở khoá tài khoản" : "Khoá tài khoản",
    body: active
      ? `Mở khoá ${person.email}. Họ viết, sửa và đăng bài lại được bình thường.`
      : `Khoá ${person.email}. Họ không viết, sửa hay xoá được gì nữa, nhưng các bài đã đăng vẫn còn và vẫn ghi đúng tên tác giả.`,
    confirmLabel: active ? "Mở khoá" : "Khoá tài khoản",
    danger: !active,
    onConfirm: () => runActive(person, active),
  });

  const setRoleOf = async (person, nextRole) => {
    setDialog({ mode: "working", label: "Đang cập nhật vai trò…" });
    try {
      const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", person.id).select("id").single();
      if (error) throw error;
      setDialog(null); setSuccess("Đã cập nhật vai trò tài khoản."); setReloadKey((value) => value + 1);
    } catch (error) { setDialog({ mode: "failed", title: "Không đổi được vai trò", message: error.message }); }
  };
  const askRole = (person, nextRole) => {
    if (nextRole === person.role) return;
    setDialog({ mode: "confirm", title: "Thay đổi vai trò", body: `${person.email} sẽ thành ${nextRole === "admin" ? "Admin — có quyền quản lý tài khoản và xoá mọi bài viết" : "Writer — chỉ xoá được bài của mình"}. Bạn muốn tiếp tục?`, confirmLabel: "Xác nhận đổi vai trò", danger: nextRole === "admin", onConfirm: () => setRoleOf(person, nextRole) });
  };

  return (
    <div className="hlt-admin-users">
      <div className="hlt-admin-list-bar">
        <div><p className="hlt-admin-eyebrow">Quản lý đội ngũ</p><h1>
          Tài khoản
          {!loading && <span className="hlt-admin-count">{people.length}</span>}
        </h1><p className="hlt-admin-description">Cấp quyền và quản lý người viết. Chỉ quản trị viên được truy cập mục này.</p></div>
        <button type="button" className="hlt-admin-btn" onClick={() => setDialog({ mode: "create" })}>
          Thêm người viết
        </button>
      </div>

      <div className="hlt-admin-toolbar">
        <label className="hlt-admin-search"><input type="search" aria-label="Tìm tài khoản" placeholder="Tìm theo tên hoặc email…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="hlt-admin-scope" role="group" aria-label="Lọc tài khoản">
          {[["all", "Tất cả"], ["active", "Hoạt động"], ["locked", "Đã khoá"]].map(([key,label]) => <button key={key} type="button" aria-pressed={filter === key} className={filter === key ? "is-on" : ""} onClick={() => setFilter(key)}>{label}</button>)}
        </div>
      </div>

      {listError && !loading && <div className="hlt-admin-note is-error" role="alert"><p>{listError}</p><button type="button" className="hlt-admin-btn is-ghost" onClick={() => setReloadKey((value) => value + 1)}>Thử lại</button></div>}
      {success && <p className="hlt-admin-note is-success" role="status">{success}</p>}
      {loading && <p className="hlt-admin-note is-loading" role="status">Đang tải tài khoản…</p>}
      {!loading && !listError && <p className="hlt-admin-description" role="status">{matches.length} / {people.length} tài khoản</p>}
      {!loading && !listError && !matches.length && <div className="hlt-admin-empty"><p>Không có tài khoản phù hợp.</p><button type="button" className="hlt-admin-btn is-ghost" onClick={() => {setQuery("");setFilter("all");}}>Bỏ bộ lọc</button></div>}

      {!loading && !listError && Boolean(matches.length) && <table className="hlt-admin-table" role="table" aria-label="Danh sách tài khoản">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th aria-label="Thao tác" />
          </tr>
        </thead>
        <tbody>
          {pagePeople.map((person) => {
            const self = person.id === profile.id;
            return (
              <tr role="row" key={person.id} className={person.active ? "" : "is-off"}>
                <td role="cell" data-label="Người dùng">
                  <strong>{person.full_name || "(chưa đặt tên)"}</strong>
                  <small>{person.email}</small>
                </td>
                <td role="cell" data-label="Vai trò">
                  <select aria-label={`Vai trò của ${person.full_name || person.email}`} value={person.role} disabled={self || busy} onChange={(event) => askRole(person, event.target.value)}>
                    <option value="writer">Writer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td role="cell" data-label="Trạng thái"><span className={`hlt-admin-badge is-${person.active ? "live" : "draft"}`}>{person.active ? "Đang hoạt động" : "Đã khoá"}</span></td>
                <td role="cell" data-label="Thao tác">
                  <div className="hlt-admin-row-tools">
                    {!self && (
                      <button type="button" className="hlt-admin-link-btn" onClick={() => askReset(person)}>
                        Đặt lại mật khẩu
                      </button>
                    )}
                    {!self && (
                      <button type="button" className="hlt-admin-link-btn" onClick={() => askActive(person, !person.active)}>
                        {person.active ? "Khoá" : "Mở khoá"}
                      </button>
                    )}
                    {self && <span className="hlt-admin-self">Bạn</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>}
      {!loading && !listError && pages > 1 && <nav className="hlt-admin-pagination" aria-label="Phân trang tài khoản">
        <button className="hlt-admin-btn is-ghost" type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>← Trước</button>
        <span>Trang {currentPage} / {pages}</span>
        <button className="hlt-admin-btn is-ghost" type="button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Tiếp →</button>
      </nav>}

      <p className="hlt-admin-hint">
        Khoá tài khoản là cách thu hồi quyền: người đó không viết, sửa hay xoá được gì nữa,
        nhưng các bài họ đã viết vẫn còn và vẫn ghi đúng tên tác giả.
      </p>

      {dialog?.mode === "create" && (
        <CreateAccountDialog
          callServer={callServer}
          onBusyChange={setCreating}
          onCancel={() => setDialog(null)}
          onCreated={(created) => {
            setDialog({ mode: "done", title: "Đã tạo tài khoản", ...created });
            setReloadKey((value) => value + 1);
          }}
        />
      )}

      {dialog?.mode === "confirm" && (
        <AdminModal title={dialog.title} onClose={() => setDialog(null)}>
          <div className="hlt-admin-modal-body">
            <p className="hlt-admin-confirm">{dialog.body}</p>
            <div className="hlt-admin-modal-foot">
              <button type="button" className="hlt-admin-btn is-ghost" onClick={() => setDialog(null)}>Huỷ</button>
              <button
                type="button"
                className={dialog.danger ? "hlt-admin-btn is-danger" : "hlt-admin-btn"}
                onClick={dialog.onConfirm}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {dialog?.mode === "working" && (
        <AdminModal title={dialog.label}>
          <p className="hlt-admin-note is-loading">Đang xử lý, đừng đóng cửa sổ.</p>
        </AdminModal>
      )}

      {dialog?.mode === "failed" && (
        <AdminModal title={dialog.title} onClose={() => setDialog(null)}>
          <p className="hlt-admin-note is-error" role="alert">{dialog.message}</p>
          <div className="hlt-admin-modal-foot">
            <button type="button" className="hlt-admin-btn" onClick={() => setDialog(null)}>Đóng</button>
          </div>
        </AdminModal>
      )}

      {dialog?.mode === "done" && (
        <CredentialsDialog title={dialog.title} email={dialog.email} password={dialog.password} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}

/** Biểu mẫu tạo tài khoản, nằm trong hộp thoại. */
function CreateAccountDialog({ callServer, onCancel, onCreated, onBusyChange }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("writer");
  const [password, setPassword] = useState(() => generatePassword());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { onBusyChange?.(busy); return () => onBusyChange?.(false); }, [busy, onBusyChange]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const invalid = accountPasswordError(password);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await callServer({ email: email.trim(), fullName: fullName.trim(), role, password });
      onCreated({ email: result.email, password });
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  };

  return (
    <AdminModal title="Thêm người viết" onClose={busy ? undefined : onCancel}>
      <form className="hlt-admin-modal-body" onSubmit={submit}>
        <label className="hlt-admin-field">
          <span>Email</span>
          <input required type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="hlt-admin-field">
          <span>Họ tên</span>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Hiện dưới bài viết" />
        </label>

        <label className="hlt-admin-field">
          <span>Vai trò</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="writer">Writer — chỉ xoá được bài của mình</option>
            <option value="admin">Admin — toàn quyền</option>
          </select>
        </label>

        <label className="hlt-admin-field hlt-admin-pass">
          <span>Mật khẩu ban đầu</span>
          <div className="hlt-admin-pass-row">
            <input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="off" spellCheck="false" />
            <button type="button" className="hlt-admin-btn is-ghost" onClick={() => setPassword(generatePassword())}>
              Tạo lại
            </button>
          </div>
        </label>

        <p className="hlt-admin-field-note">
          Hệ thống không gửi email. Tạo xong, bạn chuyển email và mật khẩu cho người viết;
          họ đăng nhập rồi tự đổi mật khẩu trong menu tài khoản.
        </p>

        {error && <p className="hlt-admin-note is-error" role="alert">{error}</p>}

        <div className="hlt-admin-modal-foot">
          <button type="button" className="hlt-admin-btn is-ghost" onClick={onCancel} disabled={busy}>
            Huỷ
          </button>
          <button type="submit" className="hlt-admin-btn" disabled={busy}>
            {busy ? "Đang tạo…" : "Tạo tài khoản"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

/** Màn báo thành công kèm thông tin đăng nhập để admin chuyển cho người viết. */
function CredentialsDialog({ title, email, password, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const link = `${window.location.origin}/admin/`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Trang viết bài: ${link}\nEmail: ${email}\nMật khẩu: ${password}`);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError("Trình duyệt chặn sao chép. Hãy bôi đen và chép tay.");
    }
  };

  return (
    <AdminModal title={title} onClose={onClose}>
      <div className="hlt-admin-modal-body">
        <p className="hlt-admin-done" role="status">
          <span className="hlt-admin-done-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
          </span>
          Chép lại ba dòng dưới đây gửi cho người viết. Đóng cửa sổ là không xem lại được mật khẩu.
        </p>

        <dl className="hlt-admin-issued">
          <div>
            <dt>Trang viết bài</dt>
            <dd>{link}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{email}</dd>
          </div>
          <div>
            <dt>Mật khẩu</dt>
            <dd className="hlt-admin-issued-secret">{password}</dd>
          </div>
        </dl>

        {copyError && <p className="hlt-admin-note is-error" role="alert">{copyError}</p>}

        <div className="hlt-admin-modal-foot">
          <button type="button" className="hlt-admin-btn is-ghost" onClick={copy}>
            {copied ? "Đã sao chép" : "Sao chép cả ba dòng"}
          </button>
          <button type="button" className="hlt-admin-btn" onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
