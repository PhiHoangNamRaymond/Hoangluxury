import React, { useEffect, useRef, useState } from "react";

let loading;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) loading = new Promise((resolve,reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Verification unavailable"));
    script.onerror = () => { script.remove(); loading = null; reject(new Error("Verification unavailable")); };
    document.head.append(script);
  });
  return loading;
}

export default function Turnstile({ action, onToken, resetKey }) {
  const host = useRef(null);
  const tokenCallback = useRef(onToken); tokenCallback.current = onToken;
  const [error,setError] = useState("");
  useEffect(() => {
    let alive = true; let widget;
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
    tokenCallback.current("");
    if (!sitekey) { setError("Online verification is being configured. Please contact us via WhatsApp."); return undefined; }
    setError("");
    loadTurnstile().then((api) => {
      if (!alive) return;
      widget = api.render(host.current,{sitekey,action,callback:(token) => { setError(""); tokenCallback.current(token); },
        "expired-callback":() => tokenCallback.current(""), "error-callback":() => { tokenCallback.current(""); setError("Verification failed. Please refresh or contact us via WhatsApp."); }});
    }).catch(() => { if (alive) setError("Verification unavailable. Please contact us via WhatsApp."); });
    return () => { alive = false; if (widget != null) window.turnstile?.remove(widget); };
  },[action,resetKey]);
  return <div><div ref={host} />{error && <p role="alert">{error}</p>}</div>;
}
