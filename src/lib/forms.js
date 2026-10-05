export function validFormsProxy(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) &&
      url.pathname === "/functions/v1/forms-proxy" && !url.search && !url.hash && !url.port && !url.username && !url.password;
  } catch { return false; }
}

export function requestIdFor(reference, fields) {
  const snapshot = JSON.stringify(Object.entries(fields).sort(([a],[b]) => a.localeCompare(b)));
  if (reference.current?.snapshot !== snapshot) reference.current = { snapshot, id:crypto.randomUUID() };
  return reference.current.id;
}

export async function submitForm(endpoint, fields, fetcher = fetch) {
  if (!validFormsProxy(endpoint)) throw new Error("Online forms are being configured. Please contact us via WhatsApp.");
  const response = await fetcher(endpoint,{method:"POST",credentials:"omit",body:new URLSearchParams(fields),signal:AbortSignal.timeout(30000)});
  if (!response.ok || (await response.json()).ok !== true) throw new Error("We could not confirm your request. Please retry or contact us via WhatsApp.");
}
