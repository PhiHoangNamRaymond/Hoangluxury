import { useEffect, useState } from "react";
import { supabase, supabaseReady, initialAuthFlow } from "../lib/supabase.js";
import { clearPasswordSetup, passwordSetupAllowed } from "../lib/auth-flow.js";

/**
 * Theo dõi phiên đăng nhập và hồ sơ (vai trò) của người đang dùng.
 * Trả về { loading, session, profile, error }.
 */
export default function useSession() {
  const [identity, setIdentity] = useState({ loading: true, session: null, error: "", flow: "" });
  const [callback, setCallback] = useState(initialAuthFlow.callback);
  const [revision, setRevision] = useState(0);
  const userId = identity.session?.user.id;
  const [state, setState] = useState({
    loading: true,
    session: null,
    profile: null,
    error: "",
  });

  useEffect(() => {
    if (!supabaseReady) {
      setState({
        loading: false,
        session: null,
        profile: null,
        error: "Chưa khai báo VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.",
      });
      return undefined;
    }

    let alive = true;
    let events = 0;
    supabase.auth.getSession().then(({ data, error }) => {
      if (alive && events === 0) setIdentity((current) => ({ ...current, loading: false, session: data.session, error: error?.message || initialAuthFlow.error }));
    }).catch(() => { if (alive) setIdentity((current) => ({ ...current, loading: false, error: "Không tải được phiên đăng nhập." })); });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Callback phải đồng bộ: gọi DB/Auth ở đây có thể deadlock SDK.
      events += 1;
      if (event === "SIGNED_OUT") clearPasswordSetup();
      if (alive) setIdentity((current) => ({ loading: false, session, error: event === "INITIAL_SESSION" ? initialAuthFlow.error : "",
        flow: passwordSetupAllowed(session, current.flow) ? current.flow : "" }));
    });

    return () => {
      alive = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabaseReady) return undefined;
    if (identity.loading) return undefined;
    if (!identity.session) {
      setState({ loading: false, session: null, profile: null, error: identity.error });
      return undefined;
    }
    let alive = true;
    setState({ loading: true, session: identity.session, profile: null, error: "" });
    supabase.from("profiles").select("id, email, full_name, role, active").eq("id", identity.session.user.id).maybeSingle()
      .then(({ data, error }) => { if (alive) setState({ loading: false, session: identity.session, profile: data || null, error: error?.message || "" }); })
      .catch(() => { if (alive) setState({ loading: false, session: identity.session, profile: null, error: "Không tải được hồ sơ. Hãy thử lại." }); });
    return () => { alive = false; };
  // Refresh token/USER_UPDATED cùng user không unmount editor hoặc mất bài đang soạn.
  }, [userId, identity.loading, identity.error, revision]);

  return { ...state, session: supabaseReady ? identity.session : null,
    loading: supabaseReady ? identity.loading || state.loading || Boolean(userId && userId !== state.session?.user.id) : false,
    flow: passwordSetupAllowed(identity.session, identity.flow) ? identity.flow : "", authError: identity.error,
    callback,
    acceptCallback: (session, flow) => { setCallback(null); setIdentity({ loading: false, session, flow, error: "" }); },
    clearFlow: () => { clearPasswordSetup(); setCallback(null); window.history.replaceState(null, "", "/admin/"); setIdentity((current) => ({ ...current, flow: "", error: "" })); },
    retry: () => setRevision((value) => value + 1) };
}
