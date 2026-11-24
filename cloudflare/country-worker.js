// Website and API geo restriction. Country is trusted Cloudflare metadata only.
// forms-worker.js applies this guard before forwarding pages or processing forms.
export const blockedCountries = new Set(['VN', 'CN', 'HK', 'LA', 'KH', 'MM']);
export const maintenanceImagePath = '/unavailable/Maintenance%20HLT.png';
const maintenanceHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>This Page Is Currently Unavailable | Hoang Luxury Travel</title><style>html,body{margin:0;min-height:100%;background:#fff}body{min-height:100vh;min-height:100svh;display:grid;place-items:center}img{display:block;width:100%;max-width:1536px;max-height:100vh;max-height:100svh;object-fit:contain}</style></head><body><img src="${maintenanceImagePath}" width="1536" height="1024" alt="Hoang Luxury Travel. This page is currently unavailable. Please try again later."></body></html>`;

export async function handleCountryRequest(request, fetchOrigin = fetch) {
  const url = new URL(request.url);
  if (!['hoangluxury.travel', 'www.hoangluxury.travel'].includes(url.hostname)) {
    return new Response('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  const country = request.cf?.country;
  // Only the supplied public maintenance image is exempt, never /admin or assets.
  const isMaintenanceImage = url.pathname === maintenanceImagePath && ['GET', 'HEAD'].includes(request.method);
  if (!blockedCountries.has(country) || isMaintenanceImage) return fetchOrigin(request);
  const headers = {
    'Content-Type': 'text/html; charset=UTF-8',
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  };
  return new Response(request.method === 'HEAD' ? null : maintenanceHtml, { status: 403, headers });
}

export default { fetch: request => handleCountryRequest(request) };
