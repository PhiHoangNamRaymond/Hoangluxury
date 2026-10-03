import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

/** Chỉ admin thấy màn hình này. Tạo tài khoản phải đi qua hàm máy chủ vì
    thao tác đó cần khoá service_role, không được để trong trình duyệt. */
export default function UserManager({ profile }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("writer");
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

  const invite = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Đang gửi lời mời…" });

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    try {
      if (!token) throw new Error("Phiên đăng nhập hết hạn. Hãy đăng nhập lại.");
      const { data: result, error } = await supabase.functions.invoke("invite-writer", {
        headers: { Authorization: `Bearer ${token}` },
        body: { email: email.trim(), fullName: fullName.trim(), role },
      });
      if (error) {
        const details = await error.context?.json?.().catch(() => null);
        throw new Error(details?.error || "Không gọi được chức năng mời. Kiểm tra đã deploy invite-writer và cấu hình CORS/SMTP trong Supabase.");
      }
      if (!result?.ok) throw new Error(result?.error || "Không gửi được lời mời.");

      setEmail("");
      setFullName("");
      setRole("writer");
      setStatus({ state: "success", message: `Đã gửi lời mời tới ${result.email}. Họ bấm link trong email để đặt mật khẩu.` });
      setReloadKey((value) => value + 1);
    } catch (error) {
      setStatus({ state: "error", message: error.message });
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

      <form className="hlt-admin-invite" onSubmit={invite}>
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
          <button type="submit" className="hlt-admin-btn" disabled={status.state === "loading"}>
            Gửi lời mời
          </button>
        </div>
        <small>Hệ thống gửi email mời. Người được mời bấm link để tự đặt mật khẩu — bạn không cần biết mật khẩu của họ.</small>
      </form>

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
                  {!self && (
                    <button type="button" className="hlt-admin-link-btn" onClick={() => setActive(person, !person.active)}>
                      {person.active ? "Khoá" : "Mở khoá"}
                    </button>
                  )}
                  {self && <span className="hlt-admin-self">Bạn</span>}
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
