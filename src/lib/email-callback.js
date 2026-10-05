// Only an explicit confirmation exchanges a one-time email token. Neither URL
// flags nor ordinary SIGNED_IN events grant password-setup provenance.
export async function acceptEmailCallback(verifier, callback) {
  if (!callback || !["invite", "recovery"].includes(callback.type) ||
      !/^[a-zA-Z0-9_-]{20,256}$/.test(callback.token_hash || "")) throw new Error("Invalid email callback");
  const verified = await verifier.auth.verifyOtp(callback);
  if (verified.error || !verified.data?.session?.user?.email) throw new Error("Email verification failed");
  return verified.data.session;
}

export async function installEmailSession(client, candidate) {
  const result = await client.auth.setSession({ access_token: candidate.access_token, refresh_token: candidate.refresh_token });
  if (result.error || !result.data?.session || result.data.session.user.id !== candidate.user.id) throw new Error("Invalid callback session");
  return result.data.session;
}
