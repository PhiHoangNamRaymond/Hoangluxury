import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCountryRequest, maintenanceImagePath } from '../cloudflare/country-worker.js';
import siteWorker from '../cloudflare/forms-worker.js';

function request(country, path = '/', method = 'GET', headers = {}) {
  const req = new Request(`https://hoangluxury.travel${path}`, { method, headers });
  Object.defineProperty(req, 'cf', { value: { country } });
  return req;
}
test('all six blocked countries cannot request pages, admin, assets or form routes', async () => {
  for (const country of ['VN', 'CN', 'HK', 'LA', 'KH', 'MM']) {
    for (const path of ['/', '/booking/', '/admin/', '/assets/app.js', '/api/forms']) {
      const result = await handleCountryRequest(request(country, path), () => assert.fail('Origin must not be called'));
      assert.equal(result.status, 403);
      assert.match(await result.text(), /Maintenance%20HLT\.png/);
      assert.match(result.headers.get('cache-control'), /no-store/);
    }
  }
});
test('allowed locations pass through, and client headers cannot spoof country', async () => {
  for (const country of ['DE', 'SG', 'US', 'GB', undefined]) {
    let forwarded;
    const req = request(country, '/booking/?utm_source=test', 'GET', { 'CF-IPCountry': 'VN' });
    const result = await handleCountryRequest(req, passed => { forwarded = passed; return new Response('origin'); });
    assert.equal(forwarded, req);
    assert.equal(await result.text(), 'origin');
  }
  assert.equal((await handleCountryRequest(request('VN', '/', 'GET', { 'CF-IPCountry': 'US' }))).status, 403);
});
test('only the supplied maintenance image is readable in blocked countries; HEAD has no body', async () => {
  assert.equal(await (await handleCountryRequest(request('VN', maintenanceImagePath), () => new Response('image'))).text(), 'image');
  for (const path of ['/unavailable/', '/unavailable/other.png', `${maintenanceImagePath}/other`]) {
    assert.equal((await handleCountryRequest(request('VN', path))).status, 403);
  }
  assert.equal((await handleCountryRequest(request('VN', maintenanceImagePath, 'POST'))).status, 403);
  const result = await handleCountryRequest(request('VN', '/admin/', 'HEAD'));
  assert.equal(result.status, 403);
  assert.equal(await result.text(), '');
});
test('production worker preserves normal page forwarding and the verified form handler', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('origin page'));
  assert.equal(await (await siteWorker.fetch(request('SG', '/booking/'), {})).text(), 'origin page');
  const formRequest = request('SG', '/api/forms', 'OPTIONS', { Origin: 'https://hoangluxury.travel' });
  const formResponse = await siteWorker.fetch(formRequest, { FORMS_ALLOWED_ORIGINS: 'https://hoangluxury.travel' });
  assert.equal(formResponse.status, 204);
  assert.equal(formResponse.headers.get('access-control-allow-origin'), 'https://hoangluxury.travel');
  assert.equal((await siteWorker.fetch(request('VN', '/api/forms', 'OPTIONS'), {})).status, 403);
  const www = new Request('https://www.hoangluxury.travel/admin/');
  Object.defineProperty(www, 'cf', { value: { country: 'HK' } });
  assert.equal((await siteWorker.fetch(www, {})).status, 403);
});
