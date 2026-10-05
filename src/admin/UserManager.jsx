import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { generatePassword, accountPasswordError } from "../lib/account-password.js";

/** Chỉ admin thấy màn hình này. Tạo tài khoản và đặt lại mật khẩu phải đi qua hàm
    máy chủ vì hai thao tác đó cần khoá service_role, không được để trong trình duyệt. */
export default function UserManager({ profile }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("writer");
  const [password, setPassword] = useState(() => generatePassword());
  const [issued, setIssued] = useState(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
        if (error) setStatus({ state: "error", message: error.message });
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
      const details = await error.context?.json?.().catch(() => null);
      throw new Error(details?.error || "Không gọi được chức năng quản lý tài khoản. Kiểm tra đã deploy invite-writer và cấu hình CORS trong Supabase.");
    }
    if (!result?.ok) throw new Error(result?.error || "Thao tác không thành công.");
    return result;
  };

  const create = async (event) => {
    event.preventDefault();
    const invalid = accountPasswordError(password);
    if (invalid) {
      setStatus({ state: "error", message: invalid });
      return;
    }

    setBusy(true);
    setIssued(null);
    setStatus({ state: "loading", message: "Đang tạo tài khoản…" });
    try {
      const result = await callServer({ email: email.trim(), fullName: fullName.trim(), role, password });
      setIssued({ email: result.email, password, label: "Tài khoản mới" });
      setCopied(false);
      setEmail("");
      setFullName("");
      setRole("writer");
      setPassword(generatePassword());
      setStatus({ state: "idle", message: "" });
      setReloadKey((value) => value + 1);
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (person) => {
    if (!window.confirm(`Đặt lại mật khẩu cho ${person.email}? Mật khẩu cũ sẽ không dùng được nữa.`)) return;

    const next = generatePassword();
    setBusy(true);
    setIssued(null);
    setStatus({ state: "loading", message: "Đang đặt lại mật khẩu…" });
    try {
      await callServer({ action: "reset", userId: person.id, password: next });
      setIssued({ email: person.email, password: next, label: "Mật khẩu mới" });
      setCopied(false);
      setStatus({ state: "idle", message: "" });
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const copyIssued = async () => {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(`Trang viết bài: ${window.location.origin}/admin/\nEmail: ${issued.email}\nMật khẩu: ${issued.password}`);
      setCopied(true);
    } catch {
      setStatus({ state: "error", message: "Trình duyệt chặn sao chép. Hãy bôi đen và chép tay." });
    }
  };

  const setActive = async (person, active) => {
    const verb = active ? "mở khoá" : "khoá";
    if (!window.confirm(`Bạn chắc muốn ${verb} tài khoản ${person.email}?`)) return;
    const { error } = await supabase.from("profiles").update({ active }).eq("id", person.id).select("id").single();
    if (error) setStatus({ state: "error", message: error.message });
    else setReloadKey((value) => value + 1);
  };

  const setRoleOf = async (person, nextRole) => {
    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", person.id).select("id").single();
    if (error) setStatus({ state: "error", message: error.message });
    else setReloadKey((value) => value + 1);
  };

  return (
    <div className="hlt-admin-users">
      <h2>Tài khoản</h2>

      <form className="hlt-admin-invite" onSubmit={create}>
        <h3>Thêm người viết</h3>
        <div className="hlt-admin-invite-row">
          <label className="hlt-admin-field">
            <span>Email</span>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="hlt-admin-field">
            <span>Họ tên</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Hiện dưới bài viết" />
          </label>
          <label className="hlt-admin-field">
            <span>Vai trò</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="writer">Writer — chỉ bài của mình</option>
              <option value="admin">Admin — toàn quyền</option>
            </select>
          </label>
          <button type="submit" className="hlt-admin-btn" disabled={busy}>
            Tạo tài khoản
          </button>
        </div>

        <label className="hlt-admin-field hlt-admin-pass">
          <span>Mật khẩu ban đầu</span>
          <div className="hlt-admin-pass-row">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="off"
              spellCheck="false"
              aria-describedby="hlt-admin-pass-hint"
            />
            <button type="button" className="hlt-admin-btn is-ghost" onClick={() => setPassword(generatePassword())}>
              Tạo lại
            </button>
          </div>
        </label>

        <small id="hlt-admin-pass-hint">
          Hệ thống không gửi email. Bạn chuyển email và mật khẩu này cho người viết,
          họ đăng nhập rồi tự đổi mật khẩu trong menu tài khoản.
        </small>
      </form>

      {issued && (
        <div className="hlt-admin-issued" role="status">
          <p className="hlt-admin-issued-head">
            <strong>{issued.label}</strong>
            <span>Chép lại ngay — rời khỏi trang là không xem lại được.</span>
          </p>
          <dl>
            <div>
              <dt>Trang viết bài</dt>
              <dd>{window.location.origin}/admin/</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{issued.email}</dd>
            </div>
            <div>
              <dt>Mật khẩu</dt>
              <dd className="hlt-admin-issued-secret">{issued.password}</dd>
            </div>
          </dl>
          <div className="hlt-admin-issued-tools">
            <button type="button" className="hlt-admin-btn" onClick={copyIssued}>
              {copied ? "Đã sao chép" : "Sao chép cả ba dòng"}
            </button>
            <button type="button" className="hlt-admin-link-btn" onClick={() => setIssued(null)}>
              Ẩn đi
            </button>
          </div>
        </div>
      )}

      {status.message && <p className={`hlt-admin-note is-${status.state}`} role="status">{status.message}</p>}
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
                  <select
                    value={person.role}
                    disabled={self}
                    onChange={(event) => setRoleOf(person, event.target.value)}
                  >
                    <option value="writer">Writer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{person.active ? "Đang hoạt động" : "Đã khoá"}</td>
                <td>
                  <div className="hlt-admin-row-tools">
                    {!self && (
                      <button type="button" className="hlt-admin-link-btn" disabled={busy} onClick={() => resetPassword(person)}>
                        Đặt lại mật khẩu
                      </button>
                    )}
                    {!self && (
                      <button type="button" className="hlt-admin-link-btn" onClick={() => setActive(person, !person.active)}>
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
    </div>
  );
}
