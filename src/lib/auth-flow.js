export function readAuthFlow(url) {
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.slice(1));
  const flow = hash.get("type") || parsed.searchParams.get("flow");
  return {
    flow: ["invite", "recovery"].includes(flow) ? flow : "",
    error: hash.get("error") || parsed.searchParams.get("error")
      ? "Link đặt mật khẩu không hợp lệ hoặc đã hết hạn. Hãy yêu cầu email mới."
      : "",
  };
}

export function passwordError(password, confirmation) {
  if (password.length < 15) return "Mật khẩu cần ít nhất 15 ký tự.";
  if (password.length > 128) return "Mật khẩu không được dài hơn 128 ký tự.";
  if (password !== confirmation) return "Hai mật khẩu không khớp.";
  return "";
}
