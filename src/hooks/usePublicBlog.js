import { useEffect, useState } from "react";
import { publicSupabase, blogImageUrl } from "../lib/supabase.js";
import { fetchPublicBlog } from "../lib/public-blog.js";

export default function usePublicBlog(slug) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ articles: [], article: null, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    let alive = true;
    setState((current) => ({ ...current, loading: true, error: "" }));
    fetchPublicBlog(publicSupabase, { slug, signal: controller.signal, imageUrl: blogImageUrl })
      .then((result) => { if (alive) setState({ ...result, loading: false, error: "" }); })
      .catch(() => {
        if (alive) setState({ articles: [], article: null, loading: false, error: "We couldn't load the articles. Please try again." });
      });
    return () => { alive = false; controller.abort(); };
  }, [slug, revision]);
  useEffect(() => {
    const refresh = () => { if (!document.hidden) setRevision((value) => value + 1); };
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  return { ...state, retry: () => setRevision((value) => value + 1) };
}
