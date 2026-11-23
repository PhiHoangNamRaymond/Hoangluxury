import test from "node:test";
import assert from "node:assert/strict";
import { browserName, createFormsHandler } from "../supabase/functions/forms-proxy/index.js";
import { validFormsProxy } from "../src/lib/forms.js";
test("browser labels and approved same-origin gateway", () => {
  for (const [ua, label] of [["Chrome/130 Safari/537 Edg/130", "Edge"], ["Version/18 Safari/604", "Safari"], ["CriOS/130", "Chrome"], ["FxiOS/130", "Firefox"], ["Chrome/130 SamsungBrowser/26", "Samsung Internet"], ["", "Unknown"]]) assert.equal(browserName(ua), label);
  assert.ok(validFormsProxy("https://hoangluxury.travel/api/forms"));
  assert.equal(validFormsProxy("https://evil.invalid/api/forms"), false);
});
test("server location overrides spoofed fields without forwarding raw IP", async () => {
  let forwarded;
  const handler = createFormsHandler({endpoint:"https://script.google.com/macros/s/fixture/exec",proxySecret:"x".repeat(40),turnstileSecret:"fixture",
    visitorLocation: () => ({city:"New York",region:"New York",country:"US"}),
    fetcher: async (url, options) => {
      if (url.includes("siteverify")) return Response.json({success:true,hostname:"hoangluxury.travel",action:"booking"});
      forwarded = options.body; return Response.json({ok:true});
    }});
  const response = await handler(new Request("https://hoangluxury.travel/api/forms", {method:"POST",headers:{Origin:"https://hoangluxury.travel","Content-Type":"application/x-www-form-urlencoded","User-Agent":"Version/18 Safari/604","CF-Connecting-IP":"192.0.2.1"},body:new URLSearchParams({form:"booking",turnstileToken:"fixture",requestId:"12345678-1234-4234-8234-123456789012",browser:"Fake",ipCity:"Fake"})}));
  assert.equal(response.status,200);
  assert.equal(forwarded.get("browser"),"Safari");
  assert.equal(forwarded.get("ipCity"),"New York");
  assert.equal(forwarded.get("ipCountry"),"US");
  assert.equal(forwarded.toString().includes("192.0.2.1"),false);
});
