// Offline: actual handler/GAS source, fake CAPTCHA/Google only. No real writes.
import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createFormsHandler } from "../supabase/functions/forms-proxy/index.js";
import { submitForm, requestIdFor } from "../src/lib/forms.js";

const endpoint = "https://script.google.com/macros/s/offline-fixture/exec";
const secret = "offline-fixture-not-a-live-secret-123456789";
const proxyUrl = "https://fixture.supabase.co/functions/v1/forms-proxy";
const booking = {form:"booking",fullName:"Offline Guest",phone:"+84839779888",departureDate:"2026-10-20",pickup:"Airport",dropoff:"Hotel",passengers:"4",journeyType:"One-way"};

test("booking free-text fields inherit disabled browser spellcheck and autocorrect", async () => {
  const source = await readFile(new URL("../src/BookingPage.jsx", import.meta.url), "utf8");
  assert.match(source, /<form[^>]+spellCheck=\{false\}[^>]+autoCorrect="off"/);
  assert.doesNotMatch(source, /spellCheck=\{true\}|autoCorrect="on"/);
});

test("booking phone input accepts only digits and caps typed/pasted values at 15", async () => {
  const source = await readFile(new URL("../src/BookingPage.jsx", import.meta.url), "utf8");
  const start = source.indexOf("const updateField =");
  const end = source.indexOf("const closeSuccessPopup", start);
  assert.ok(start >= 0 && end > start);
  const handlerSource = source.slice(start, end);
  assert.match(source, /pattern="\[0-9\]\{6,15\}" maxLength="15"/);
  for (const [value, expected] of [
    ["123456789012345", "123456789012345"],
    ["12345678901234567890", "123456789012345"],
    ["123 456-78901234567890", "123456789012345"],
    ["abc123xyz456", "123456"],
    ["", ""],
  ]) {
    let form = {phone:""};
    vm.runInNewContext(handlerSource + '\nupdateField(event);', {
      event:{target:{name:"phone",type:"tel",value}},
      setForm:(update) => { form = update(form); },
    });
    assert.equal(form.phone, expected);
    assert.ok(form.phone.length <= 15);
  }
});

async function fixture() {
  const props = new Map([["FORMS_PROXY_SECRET",secret]]);
  const sheets = new Map();
  const sheet = (name) => {
    if (sheets.has(name)) return sheets.get(name);
    const rows = [];
    const range = (row,col,height=1,width=1) => ({
      setValues(values) { for(let r=0;r<height;r++) { rows[row+r-1] ||= []; for(let c=0;c<width;c++) rows[row+r-1][col+c-1]=values[r][c]; } return this; },
      getDisplayValues() { return Array.from({length:height},(_,r)=>Array.from({length:width},(_,c)=>String(rows[row+r-1]?.[col+c-1] ?? ""))); },
      setNumberFormat() { return this; },
    });
    const result = {rows,getRange:range,getMaxRows:()=>100,getMaxColumns:()=>30,getLastRow:()=>rows.length};
    sheets.set(name,result); return result;
  };
  const properties = {getProperty:(key)=>props.get(key) ?? null,setProperty:(key,value)=>props.set(key,value),deleteProperty:(key)=>props.delete(key),getProperties:()=>Object.fromEntries(props)};
  const context = vm.createContext({console:{error:()=>{}},
    PropertiesService:{getScriptProperties:()=>properties},
    LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:(name)=>sheets.get(name),insertSheet:sheet}),flush:()=>{}},
    Session:{getScriptTimeZone:()=>"Asia/Ho_Chi_Minh"},
    Utilities:{DigestAlgorithm:{SHA_256:"sha256"},Charset:{UTF_8:"utf8"},computeDigest:(_algorithm,value)=>[...createHash("sha256").update(value).digest()],formatDate:()=>"051026"},
    ContentService:{MimeType:{JSON:"json"},createTextOutput:(text)=>({text,setMimeType(){return this;}})},
  });
  vm.runInContext(await readFile(new URL("../google-apps-script/Code.gs",import.meta.url),"utf8"),context);
  const post = (fields) => JSON.parse(context.doPost({parameter:fields,parameters:Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,[value]])),postData:{type:"application/x-www-form-urlencoded",contents:new URLSearchParams(fields).toString()}}).text);
  return {context,props,sheets,post};
}

test("GAS denies direct writes and deduplicates identical bookings without accepting changed retries",async () => {
  const f = await fixture();
  assert.equal(f.post({...booking,requestId:randomUUID()}).ok,false);
  assert.equal(f.sheets.size,0);
  const fields = {...booking,proxySecret:secret,requestId:randomUUID()};
  assert.equal(f.post(fields).ok,true);
  assert.equal(f.post({...fields,clientTimestamp:"new-retry-time"}).ok,true);
  assert.equal(f.sheets.get("Bookings").rows.length,3,"header row 2 plus exactly one booking");
  assert.equal(f.post({...fields,dropoff:"Changed"}).ok,false);
  assert.equal(f.sheets.get("Bookings").rows.length,3);
});

test("GAS accepts public feedback with a manually entered ID and deduplicates retries without a booking lookup",async () => {
  const f = await fixture();
  const data = {form:"feedback",bookingId:"test",rating:"5",feedback:"Offline test",proxySecret:secret,requestId:randomUUID()};
  assert.equal(f.post(data).ok,true);
  assert.equal(f.post(data).ok,true);
  assert.equal(f.sheets.get("Feedback").rows.length,2);
  assert.deepEqual(f.sheets.get("Feedback").rows[1],["test",5,"Offline test",""]);
  assert.equal(f.sheets.has("Bookings"),false,"feedback must not look up/create the bookings sheet");
  assert.equal(f.post({...data,feedback:"Changed content"}).ok,false,"changed payload cannot reuse a request ID");
  assert.equal(f.post({...data,requestId:randomUUID()}).ok,true,"new feedback is not limited to one lifetime submission per ID");
  assert.equal(f.sheets.get("Feedback").rows.length,3);
  assert.equal([...f.props.keys()].some((key)=>key.startsWith("feedback-token:")),false);
});

test("public feedback still requires the proxy secret and validates input and spreadsheet formulas",async () => {
  const f = await fixture();
  const fields = {form:"feedback",bookingId:"test",rating:"5",feedback:"Offline test",requestId:randomUUID()};
  assert.equal(f.post(fields).ok,false);
  for (const changes of [{proxySecret:"wrong"},{bookingId:" "},{feedback:" "},{rating:""},{rating:"0"},{rating:"6"},{rating:"1.5"},{feedback:"x".repeat(4001)},{bookingId:"x".repeat(101)}]) {
    assert.equal(f.post({...fields,proxySecret:secret,...changes}).ok,false);
  }
  assert.equal(f.sheets.has("Feedback"),false);
  assert.equal(f.post({...fields,proxySecret:secret,bookingId:"=123",feedback:"=SUM(1,2)"}).ok,true);
  assert.deepEqual(f.sheets.get("Feedback").rows[1],["'=123",5,"'=SUM(1,2)",""]);
});

test("public feedback rate limits entered IDs, preserves the global cap and prevents uncertain retries",async () => {
  const f = await fixture();
  const fields = {form:"feedback",bookingId:"Manual-ID",rating:"5",feedback:"Offline test",proxySecret:secret};
  for(let i=0;i<5;i++) assert.equal(f.post({...fields,requestId:randomUUID()}).ok,true);
  assert.equal(f.post({...fields,bookingId:" manual-id ",requestId:randomUUID()}).ok,false);
  assert.equal(f.post({...fields,bookingId:"another-id",requestId:randomUUID()}).ok,true);
  assert.equal(f.sheets.get("Feedback").rows.length,7);
  const global = await fixture(); global.props.set("FORM_HOURLY_LIMIT","2");
  for(const bookingId of ["a","b"]) assert.equal(global.post({...fields,bookingId,requestId:randomUUID()}).ok,true);
  assert.equal(global.post({...fields,bookingId:"c",requestId:randomUUID()}).ok,false);
  const pending = await fixture();
  const data = {...fields,requestId:randomUUID()};
  pending.context.finishRequest_=()=>{throw new Error("Simulated partial failure");};
  assert.equal(pending.post(data).ok,false);
  assert.equal(pending.post(data).ok,false);
  assert.equal(pending.sheets.get("Feedback").rows.length,2);
});

test("public feedback goes through CAPTCHA verification and the protected GAS writer without an invitation",async () => {
  const f = await fixture(); let forwarded=0;
  let captcha = {success:true,hostname:"localhost",action:"feedback"};
  const handler = createFormsHandler({endpoint,proxySecret:secret,turnstileSecret:"offline",allowedOrigins:"http://localhost:5173",fetcher:async (url,options)=>{
    if(url.includes("siteverify")) return Response.json(captcha);
    forwarded++;
    assert.equal(options.body.has("feedbackToken"),false);
    return Response.json(f.post(Object.fromEntries(options.body)));
  }});
  const request = (changes={}) => new Request("https://edge.invalid",{method:"POST",headers:{Origin:"http://localhost:5173","Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({form:"feedback",bookingId:"test",rating:"5",feedback:"Offline test",requestId:randomUUID(),turnstileToken:"offline-token",...changes})});
  assert.equal((await handler(request())).status,200);
  assert.equal(forwarded,1);
  assert.equal(f.sheets.get("Feedback").rows.length,2);
  assert.equal((await handler(request({turnstileToken:""}))).status,400);
  for(const invalid of [{success:false},{success:true,hostname:"wrong.invalid",action:"feedback"},{success:true,hostname:"localhost",action:"booking"}]) {
    captcha=invalid;
    assert.equal((await handler(request())).status,400);
  }
  assert.equal(forwarded,1,"failed CAPTCHA must never reach GAS");
});

test("GAS rate limits new writes and refuses replay after uncertain partial failure",async () => {
  const f = await fixture();
  for(let i=0;i<5;i++) assert.equal(f.post({...booking,proxySecret:secret,requestId:randomUUID()}).ok,true);
  assert.equal(f.post({...booking,proxySecret:secret,requestId:randomUUID()}).ok,false);
  const pending = await fixture();
  const data = {...booking,proxySecret:secret,requestId:randomUUID()};
  pending.context.finishRequest_=()=>{throw new Error("Simulated partial failure");};
  assert.equal(pending.post(data).ok,false);
  assert.equal(pending.post(data).ok,false);
  assert.equal(pending.sheets.get("Bookings").rows.length,3,"uncertain success must not create a second row");
});

test("proxy fails closed on CAPTCHA, hostname, action, CORS, config and upstream error",async () => {
  let calls = 0; let captcha = {success:true,hostname:"hoangluxury.travel",action:"booking"}; let upstream = {ok:true};
  const handler = createFormsHandler({endpoint,proxySecret:secret,turnstileSecret:"offline",fetcher:async (url,options)=>{
    calls++;
    if(url.includes("siteverify")) return Response.json(captcha);
    assert.equal(url,endpoint); assert.equal(options.body.get("proxySecret"),secret);
    assert.equal(options.body.has("turnstileToken"),false);
    return Response.json(upstream);
  }});
  const request = (changes={}) => new Request("https://edge.invalid",{method:"POST",headers:{Origin:"https://hoangluxury.travel","Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({...booking,requestId:randomUUID(),turnstileToken:"offline-token",...changes})});
  assert.equal((await handler(request())).status,200);
  for (const bad of [{success:false},{success:true,hostname:"evil.invalid",action:"booking"},{success:true,hostname:"hoangluxury.travel",action:"feedback"}]) {
    captcha=bad; const before=calls; assert.equal((await handler(request())).status,400); assert.equal(calls,before+1,"no forwarding on failed CAPTCHA");
  }
  captcha={success:true,hostname:"hoangluxury.travel",action:"booking"}; upstream={ok:false};
  assert.equal((await handler(request())).status,400);
  const before=calls;
  assert.equal((await handler(request({proxySecret:"injected"}))).status,400);
  assert.equal((await handler(new Request("https://edge.invalid",{method:"POST",headers:{Origin:"http://localhost:5173"}}))).status,403);
  assert.equal(calls,before);
  const unconfigured=createFormsHandler({endpoint,proxySecret:"short",turnstileSecret:"offline",fetcher:()=>{throw new Error("must not fetch");}});
  assert.equal((await unconfigured(request())).status,503);
  const dummy = createFormsHandler({endpoint,proxySecret:secret,turnstileSecret:"1x" + "0".repeat(29) + "AA",fetcher:()=>{throw new Error("dummy key must fail closed");}});
  assert.equal((await dummy(request())).status,503);
});

test("client requires readable positive acknowledgement; request ID persists on retry but changes with fields",async () => {
  await assert.rejects(submitForm(endpoint,{},()=>{throw new Error("old direct endpoint must not be called");}));
  for(const response of [Response.json({ok:false}),Response.json({ok:true},{status:400}),Response.json({})]) await assert.rejects(submitForm(proxyUrl,{},async()=>response));
  await submitForm(proxyUrl,{},async()=>Response.json({ok:true}));
  const ref={current:null}; const id=requestIdFor(ref,{fullName:"a"});
  assert.equal(requestIdFor(ref,{fullName:"a"}),id);
  assert.notEqual(requestIdFor(ref,{fullName:"b"}),id);
});
