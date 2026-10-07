import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { generatePassword, accountPasswordError } from "../lib/account-password.js";
import AdminModal from "./AdminModal.jsx";

/** Chỉ admin thấy màn hình này. Tạo tài khoản và đặt lại mật khẩu phải đi qua hàm
    máy chủ vì hai thao tác đó cần khoá service_role, không được để trong trình duyệt. */
export default function UserManager({ profile }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  /* Một hộp thoại tại một thời điểm: "create" là biểu mẫu, "done" là kết quả. */
  const [dialog, setDialog] = useState(null);

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
    setDialog(null);
    const { error } = await supabase.from("profiles").update({ active }).eq("id", person.id).select("id").single();
    if (error) setListError(error.message);
    else setReloadKey((value) => value + 1);
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
    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", person.id).select("id").single();
    if (error) setListError(error.message);
    else setReloadKey((value) => value + 1);
  };

  return (
    <div className="hlt-admin-users">
      <div className="hlt-admin-list-bar">
        <h2>
          Tài khoản
          {!loading && <span className="hlt-admin-count">{people.length}</span>}
        </h2>
        <button type="button" className="hlt-admin-btn" onClick={() => setDialog({ mode: "create" })}>
          Thêm người viết
        </button>
      </div>

      {listError && <p className="hlt-admin-note is-error" role="status">{listError}</p>}
      {loading && <p className="hlt-admin-note is-loading">Đang tải…</p>}

      <table className="hlt-admin-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th aria-label="Thao tác" />
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const self = person.id === profile.id;
            return (
              <tr key={person.id} className={person.active ? "" : "is-off"}>
                <td>
                  <strong>{person.full_name || "(chưa đặt tên)"}</strong>
                  <small>{person.email}</small>
                </td>
                <td>
                  <select value={person.role} disabled={self} onChange={(event) => setRoleOf(person, event.target.value)}>
                    <option value="writer">Writer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{person.active ? "Đang hoạt động" : "Đã khoá"}</td>
                <td>
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
      </table>

      <p className="hlt-admin-hint">
        Khoá tài khoản là cách thu hồi quyền: người đó không viết, sửa hay xoá được gì nữa,
        nhưng các bài họ đã viết vẫn còn và vẫn ghi đúng tên tác giả.
      </p>

      {dialog?.mode === "create" && (
        <CreateAccountDialog
          callServer={callServer}
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
function CreateAccountDialog({ callServer, onCancel, onCreated }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("writer");
  const [password, setPassword] = useState(() => generatePassword());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
