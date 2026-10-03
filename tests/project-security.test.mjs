// No live calls: Apps Script executes in a VM with fake Google services.
import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { publicEnvError, publicConfigError, safeCatalogUrl, validFormsEndpoint, formTextError } from "../src/lib/public-config.js";
import { createInviteHandler } from "../supabase/functions/invite-writer/index.js";

test("public env guards reject misplaced server keys and unsafe destinations without echoing secrets", () => {
  const fakeSecret = "sb_secret_ThisIsOnlyAnOfflineTestValue";
  const jwt = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role:"service_role" })).toString("base64url")}.testOnlySignature`;
  for (const env of [{VITE_OTHER:fakeSecret}, {VITE_OTHER:jwt}, {VITE_DATABASE_PASSWORD:"fake"},
    {VITE_BOOKING_SHEET_ENDPOINT:"https://evil.invalid/macros/s/test/exec"}, {VITE_CATALOG_URL:"javascript:alert(1)"}]) {
    const message = publicEnvError(env);
    assert.ok(message); assert.ok(!message.includes(fakeSecret)); assert.ok(!message.includes(jwt));
  }
  assert.equal(publicEnvError({VITE_BOOKING_SHEET_ENDPOINT:"https://script.google.com/macros/s/test-id/exec"}), "");
  assert.equal(validFormsEndpoint("https://script.google.com.evil.invalid/macros/s/test/exec"), false);
  assert.equal(validFormsEndpoint("https://script.google.com/macros/s/test/exec?secret=bad"), false);
  assert.equal(safeCatalogUrl("//evil.invalid", "fallback"), "fallback");
  assert.equal(safeCatalogUrl("/\\evil.invalid", "fallback"), "fallback");
  assert.equal(safeCatalogUrl("/catalog.pdf", "fallback"), "/catalog.pdf");
  assert.ok(publicConfigError("https://user:pass@project.supabase.co", "sb_publishable_test"));
  assert.equal(formTextError({requirements:"x".repeat(4000)}),"");
  assert.ok(formTextError({experience:"x".repeat(4001)}));
  assert.ok(formTextError({fullName:"name\u0000"}));
});

function gasFixture() {
  const logs=[];
  const context=vm.createContext({ console:{error:(message)=>logs.push(message)},
    ContentService:{MimeType:{JSON:"json"},createTextOutput:(text)=>({text,setMimeType(){return this;}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})} });
  return readFile(new URL("../google-apps-script/Code.gs",import.meta.url),"utf8").then((code)=>{
    vm.runInContext(code,context); return {context,logs};
  });
}
const booking={fullName:"Test Guest",phone:"+84839779888",departureDate:"2026-10-20",pickup:"Airport",dropoff:"Hotel",passengers:"4",journeyType:"One-way"};

test("Apps Script validates bounds, enums, passengers, real dates and return order before sheet access", async () => {
  const {context:c}=await gasFixture();
  c.validateBooking_(booking);
  for (const bad of [{passengers:"4abc"},{passengers:"7"},{phone:"=IMPORTXML()"},{departureDate:"2026-02-30"},
    {departureDate:"2026-10-20",returnDate:"2026-10-19"},{journeyType:"arbitrary"}]) assert.throws(()=>c.validateBooking_({...booking,...bad}));
  assert.throws(()=>c.validateFieldBounds_({requirements:"x".repeat(4001)}));
  assert.throws(()=>c.validateFieldBounds_({fullName:"guest\u0000"}));
  assert.throws(()=>c.validateFieldBounds_({__unknown:"bad"}));
  assert.throws(()=>c.parseRating_("1.5"));
  assert.equal(c.parseRating_("5"),5);
});

test("Apps Script protects formula cells including whitespace prefixes", async () => {
  const {context:c}=await gasFixture();
  for (const value of ["=IMPORTXML(\"https://evil.invalid\")"," +12","\t@SUM(A1)","\r\n-1"]) {
    assert.ok(c.safeCell_(value).startsWith("'"));
  }
  assert.equal(c.safeCell_("Normal guest"),"Normal guest");
});

test("Apps Script responses/logs do not expose internal errors or submitted data", async () => {
  const {context:c,logs}=await gasFixture();
  c.saveBooking_=()=>{throw new Error("private-spreadsheet-id guest@email.invalid");};
  const event={parameter:booking,postData:{type:"application/x-www-form-urlencoded",contents:"test"}};
  for (const input of [event,{...event,parameter:{form:"unknown"}},{...event,postData:{type:"application/json",contents:"{}"}},
    {...event,postData:{type:"application/x-www-form-urlencoded",contents:"x".repeat(32769)}}]) {
    const output=JSON.parse(c.doPost(input).text);
    assert.equal(output.ok,false); assert.doesNotMatch(JSON.stringify(output),/private-spreadsheet|guest@email/);
  }
  assert.doesNotMatch(logs.join(" "),/private-spreadsheet|guest@email/);
  assert.equal(JSON.parse(c.doPost({...event,parameter:{website:"bot"}}).text).ok,true);
});

test("invitation fails closed on missing limiter, rejects MIME, and logs only security metadata", async () => {
  const events=[]; let invites=0; let limit={data:false};
  const query={select:()=>query,eq:()=>query,maybeSingle:async()=>({data:{role:"admin",active:true}})};
  const client={auth:{getUser:async()=>({data:{user:{id:"actor"}}}),admin:{inviteUserByEmail:async()=>{invites++;return {};}}},from:()=>query,rpc:async()=>limit};
  const serve=createInviteHandler({client,allowedOrigins:"https://hoangluxury.travel",logger:(event)=>events.push(event)});
  const request=(type="application/json")=>new Request("https://api.invalid",{method:"POST",headers:{Origin:"https://hoangluxury.travel",Authorization:"Bearer fake-sensitive-token","Content-Type":type},body:JSON.stringify({email:"private@example.invalid"})});
  assert.equal((await serve(request("text/plain"))).status,415);
  assert.equal((await serve(request())).status,429);
  limit={error:new Error("internal DB error")};
  assert.equal((await serve(request())).status,503);
  assert.equal(invites,0);
  assert.doesNotMatch(JSON.stringify(events),/fake-sensitive-token|private@example|internal DB/);
  assert.ok(events.every((event)=>event.request_id && event.actor_id==="actor"));
  const bad=createInviteHandler({client,allowedOrigins:"https://evil.invalid/redirect",logger:()=>{}});
  assert.equal((await bad(new Request("https://api.invalid",{method:"POST"}))).status,503);
});

test("production header configurations block scripts/frames and keep admin uncached", async () => {
  const apache=await readFile(new URL("../public/.htaccess",import.meta.url),"utf8");
  const vercel=JSON.parse(await readFile(new URL("../vercel.json",import.meta.url),"utf8"));
  const headers=Object.fromEntries(vercel.headers[0].headers.map(({key,value})=>[key,value]));
  assert.match(headers["Content-Security-Policy"],/script-src 'self';/);
  assert.doesNotMatch(headers["Content-Security-Policy"],/script-src[^;]*(unsafe-inline|unsafe-eval)/);
  for(const directive of ["object-src 'none'","base-uri 'none'","frame-ancestors 'none'","form-action 'none'"]) assert.ok(headers["Content-Security-Policy"].includes(directive));
  assert.equal(headers["Referrer-Policy"],"no-referrer");
  assert.ok(apache.includes(headers["Content-Security-Policy"]));
  assert.match(apache,/Options -Indexes/);
  assert.match(apache,/Require all denied/);
  assert.ok(apache.includes("RewriteRule (^|/)\\.(?!well-known(?:/|$)) - [F,L]"));
  assert.equal(vercel.headers[1].headers[0].value,"no-store");
});
