import React, { useEffect, useState } from "react";
import { supabase, supabaseReady, supabaseConfigError } from "../lib/supabase.js";
import { logoGoldUrl } from "../config/assets.js";
import useSession from "./useSession.js";
import LoginScreen from "./LoginScreen.jsx";
import PasswordScreen from "./PasswordScreen.jsx";
import ArticleList from "./ArticleList.jsx";
import ArticleEditor from "./ArticleEditor.jsx";
import UserManager from "./UserManager.jsx";
import "../styles/admin.css";

export default function AdminApp() {
  const { loading, session, profile, error, flow, authError, clearFlow, retry } = useSession();
  const [changePassword, setChangePassword] = useState(false);
  const [view, setView] = useState({ name: "articles" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Quản trị blog | Hoang Luxury Travel";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.append(robots);
    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, []);

  if (!supabaseReady) {
    return (
      <div className="hlt-admin hlt-admin-setup">
        <div className="hlt-admin-setup-card">
          <h1>Chưa cấu hình</h1>
          <p>
            {supabaseConfigError || <>Thiếu <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code>.</>}
            Làm theo hướng dẫn trong <code>supabase/README.md</code>, rồi tải lại trang này.
          </p>
        </div>
      </div>
    );
  }

  if (flow && authError) return <LoginScreen notice={authError} />;
  if ((flow || changePassword) && session) return <PasswordScreen flow={changePassword ? "change" : flow} session={session}
    onDone={() => { setChangePassword(false); clearFlow(); }} />;

  if (loading) {
    return (
      <div className="hlt-admin hlt-admin-setup">
        <p className="hlt-admin-note is-loading">Đang tải…</p>
      </div>
    );
  }

  if (!session) return <LoginScreen notice={error} />;

  if (!profile) {
    return (
      <div className="hlt-admin hlt-admin-setup">
        <div className="hlt-admin-setup-card">
          <h1>Tài khoản chưa có hồ sơ</h1>
          <p>{error || "Liên hệ quản trị viên để được cấp quyền viết bài."}</p>
          {error && <button type="button" className="hlt-admin-btn" onClick={retry}>Thử lại</button>}
          <button type="button" className="hlt-admin-btn is-ghost" onClick={() => supabase.auth.signOut()}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  if (!profile.active) {
    return (
      <div className="hlt-admin hlt-admin-setup">
        <div className="hlt-admin-setup-card">
          <h1>Tài khoản đã bị khoá</h1>
          <p>Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.</p>
          <button type="button" className="hlt-admin-btn is-ghost" onClick={() => supabase.auth.signOut()}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = profile.role === "admin";
  const done = () => {
    setReloadKey((value) => value + 1);
    setView({ name: "articles" });
  };

  return (
    <div className="hlt-admin">
      <header className="hlt-admin-top">
        <div className="hlt-admin-brand">
          <img src={logoGoldUrl} alt="" />
          <span>
            <strong>Hoang Luxury Travel</strong>
            <small>Quản trị blog</small>
          </span>
        </div>

        <nav className="hlt-admin-nav">
          <button
            type="button"
            className={view.name !== "users" ? "is-on" : ""}
            onClick={() => setView({ name: "articles" })}
          >
            Bài viết
          </button>
          {isAdmin && (
            <button
              type="button"
              className={view.name === "users" ? "is-on" : ""}
              onClick={() => setView({ name: "users" })}
            >
              Tài khoản
            </button>
          )}
          <a href="/blog/" target="_blank" rel="noopener noreferrer">Xem blog</a>
        </nav>

        <div className="hlt-admin-me">
          <button type="button" className="hlt-admin-link-btn" onClick={() => setChangePassword(true)}>Đổi mật khẩu</button>
          <span>
            <strong>{profile.full_name || profile.email}</strong>
            <small>{isAdmin ? "Admin" : "Writer"}</small>
          </span>
          <button type="button" className="hlt-admin-link-btn" onClick={() => supabase.auth.signOut()}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="hlt-admin-main">
        {view.name === "users" && isAdmin && <UserManager profile={profile} />}

        {view.name === "articles" && (
          <ArticleList
            profile={profile}
            reloadKey={reloadKey}
            onNew={() => setView({ name: "editor", article: null })}
            onEdit={(article) => setView({ name: "editor", article })}
          />
        )}

        {view.name === "editor" && (
          <ArticleEditor
            key={view.article?.id || "new"}
            article={view.article}
            profile={profile}
            onDone={done}
            onCancel={() => setView({ name: "articles" })}
          />
        )}
      </main>
    </div>
  );
}
