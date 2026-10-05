export function readAuthFlow(url) {
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.slice(1));
  const type = parsed.searchParams.get("type");
  const tokenHash = parsed.searchParams.get("token_hash");
  const admin = /^\/admin\/?$/.test(parsed.pathname);
  const legacy = hash.has("access_token") || hash.has("refresh_token") || parsed.searchParams.has("code");
  const valid = admin && ["invite", "recovery"].includes(type) && /^[a-zA-Z0-9_-]{20,256}$/.test(tokenHash || "");
  return {
    // URL intent is never proof of an authenticated recovery session.
    flow: "",
    callback: valid ? { type, token_hash: tokenHash } : null,
    error: legacy || (tokenHash && !valid) || hash.get("error") || parsed.searchParams.get("error")
      ? "Link đặt mật khẩu không hợp lệ hoặc đã hết hạn. Hãy yêu cầu email mới."
      : "",
  };
}

let passwordSetupProof = null;
export function rememberPasswordSetup(session, flow) {
  if (!["invite", "recovery"].includes(flow) || !session?.user?.id || !session.access_token) throw new Error("Invalid verified callback");
  passwordSetupProof = { userId: session.user.id, token: session.access_token, flow, expires: Date.now() + 10 * 60_000 };
}
export function clearPasswordSetup() { passwordSetupProof = null; }
export function passwordSetupAllowed(session, flow) {
  return Boolean(passwordSetupProof && passwordSetupProof.expires > Date.now() &&
    passwordSetupProof.flow === flow && passwordSetupProof.userId === session?.user?.id && passwordSetupProof.token === session?.access_token);
}

export function passwordError(password, confirmation) {
  if (password.length < 15) return "Mật khẩu cần ít nhất 15 ký tự.";
  if (password.length > 128) return "Mật khẩu không được dài hơn 128 ký tự.";
  if (password !== confirmation) return "Hai mật khẩu không khớp.";
  return "";
}
