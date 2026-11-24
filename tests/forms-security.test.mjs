// Offline: actual handler/GAS source, fake CAPTCHA/Google only. No real writes.
import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createFormsHandler } from "../supabase/functions/forms-proxy/index.js";
import { bookingDevice, submitForm, requestIdFor } from "../src/lib/forms.js";

const endpoint = "https://script.google.com/macros/s/offline-fixture/exec";
const secret = "offline-fixture-not-a-live-secret-123456789";
const proxyUrl = "https://fixture.supabase.co/functions/v1/forms-proxy";
const booking = {form:"booking",fullName:"Offline Guest",phone:"+84839779888",departureDate:"2026-10-20",pickup:"Airport",dropoff:"Hotel",passengers:"4",journeyType:"One-way"};

test("booking records coarse device categories without using viewport width", () => {
  assert.equal(bookingDevice({userAgent:"Windows NT 10.0",maxTouchPoints:10}),"PC");
  assert.equal(bookingDevice({userAgent:"Macintosh",maxTouchPoints:0}),"PC");
  assert.equal(bookingDevice({userAgent:"Macintosh",maxTouchPoints:5}),"Mobile");
  assert.equal(bookingDevice({userAgent:"Android",userAgentData:{mobile:false}}),"Mobile");
  assert.equal(bookingDevice({userAgent:"iPhone"}),"Mobile");
  assert.equal(bookingDevice({userAgentData:{mobile:true}}),"Mobile");
});

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
  const cacheStore = new Map(); const mails = [];
  const context = vm.createContext({console:{error:()=>{}},
    CacheService:{getScriptCache:()=>({get:(key)=>cacheStore.get(key) ?? null,put:(key,value)=>cacheStore.set(key,String(value)),remove:(key)=>cacheStore.delete(key)})},
    MailApp:{sendEmail:(message)=>mails.push(message)},
    PropertiesService:{getScriptProperties:()=>properties},
    LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:(name)=>sheets.get(name),insertSheet:sheet}),flush:()=>{}},
    Session:{getScriptTimeZone:()=>"Asia/Ho_Chi_Minh"},
    Utilities:{DigestAlgorithm:{SHA_256:"sha256"},Charset:{UTF_8:"utf8"},computeDigest:(_algorithm,value)=>[...createHash("sha256").update(value).digest()],formatDate:(_date,_zone,pattern)=>pattern === "yyyy-MM-dd" ? "2026-10-05" : "051026"},
    ContentService:{MimeType:{JSON:"json"},createTextOutput:(text)=>({text,setMimeType(){return this;}})},
  });
  vm.runInContext(await readFile(new URL("../google-apps-script/Code.gs",import.meta.url),"utf8"),context);
  const post = (fields) => JSON.parse(context.doPost({parameter:fields,parameters:Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,[value]])),postData:{type:"application/x-www-form-urlencoded",contents:new URLSearchParams(fields).toString()}}).text);
  return {context,props,sheets,post,mails,cacheStore};
}

test("GAS rejects past departures before writing and accepts today's departure", async () => {
  const f = await fixture();
  const fields = {...booking,proxySecret:secret,requestId:randomUUID()};
  assert.equal(f.post({...fields,departureDate:"2020-01-01"}).ok,false);
  assert.equal(f.sheets.size,0);
  assert.equal(f.post({...fields,departureDate:"2026-10-05"}).ok,true);
});

test("GAS saves Multi-day and device without shifting Source or overwriting old rows", async () => {
  const f = await fixture();
  const send = (changes) => f.post({...booking,proxySecret:secret,requestId:randomUUID(),...changes});
  assert.equal(send({}).ok,true,"older frontend may omit device");
  const rows = f.sheets.get("Bookings").rows;
  rows[1][16] = "Assigned Driver";
  assert.equal(send({device:"=1+1",journeyType:"Multi-day"}).ok,false);
  assert.equal(send({device:"Mobile",journeyType:"Multi-day",source:"RKS002"}).ok,true);
  assert.equal(send({device:"PC",journeyType:"Round Trip"}).ok,true);
  assert.deepEqual(rows[1].slice(15,18),["Status","Device","Source"]);
  assert.equal(rows[2][16],"");
  assert.equal(rows[3][13],"Multi-day");
  assert.deepEqual(rows[3].slice(15,18),["New","Mobile","RKS002"]);
  assert.equal(rows[4][16],"PC");
});

test("GAS appends context and does not duplicate a retry when IP city changes", async () => {
  const f = await fixture();
  const fields = {...booking,proxySecret:secret,requestId:randomUUID(),browser:"Chrome",ipCity:"New York",ipRegion:"New York",ipCountry:"US",locationSource:"Cloudflare IP estimate"};
  assert.equal(f.post(fields).ok,true);
  const rows = f.sheets.get("Bookings").rows;
  assert.deepEqual(rows[2].slice(19,24),["Chrome","New York","New York","US","Cloudflare IP estimate"]);
  assert.equal(f.post({...fields,ipCity:"Boston"}).ok,true);
  assert.equal(rows.length,3);
  assert.equal(rows[2][20],"New York");
});

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
  const data = {form:"feedback",bookingId:"HLT-100826-RKS001-001",rating:"5",feedback:"Offline test",proxySecret:secret,requestId:randomUUID()};
  assert.equal(f.post(data).ok,true);
  assert.equal(f.post(data).ok,true);
  assert.equal(f.sheets.get("Feedback").rows.length,2);
  assert.deepEqual(f.sheets.get("Feedback").rows[1],["HLT-100826-RKS001-001",5,"Offline test",""]);
  assert.equal(f.sheets.has("Bookings"),false,"feedback must not look up/create the bookings sheet");
  assert.equal(f.post({...data,feedback:"Changed content"}).ok,false,"changed payload cannot reuse a request ID");
  assert.equal(f.post({...data,requestId:randomUUID()}).ok,true,"new feedback is not limited to one lifetime submission per ID");
  assert.equal(f.sheets.get("Feedback").rows.length,3);
  assert.equal([...f.props.keys()].some((key)=>key.startsWith("feedback-token:")),false);
});

test("public feedback still requires the proxy secret and validates input and spreadsheet formulas",async () => {
  const f = await fixture();
  const fields = {form:"feedback",bookingId:"HLT-100826-RKS001-001",rating:"5",feedback:"Offline test",requestId:randomUUID()};
  assert.equal(f.post(fields).ok,false);
  for (const changes of [{proxySecret:"wrong"},{bookingId:" "},{feedback:" "},{rating:""},{rating:"0"},{rating:"6"},{rating:"1.5"},{feedback:"x".repeat(4001)},{bookingId:"x".repeat(101)},{bookingId:"test"},{bookingId:"HLT-100826-RKS001-01"},{bookingId:"HLT-321326-RKS001-001"},{bookingId:"=HLT-100826-RKS001-001"}]) {
    assert.equal(f.post({...fields,proxySecret:secret,...changes}).ok,false);
  }
  assert.equal(f.sheets.has("Feedback"),false);
  assert.equal(f.post({...fields,proxySecret:secret,feedback:"=SUM(1,2)"}).ok,true);
  assert.deepEqual(f.sheets.get("Feedback").rows[1],["HLT-100826-RKS001-001",5,"'=SUM(1,2)",""]);
});

test("public feedback rate limits entered IDs, preserves the global cap and prevents uncertain retries",async () => {
  const f = await fixture();
  const fields = {form:"feedback",bookingId:"HLT-100826-RKS001-001",rating:"5",feedback:"Offline test",proxySecret:secret};
  for(let i=0;i<5;i++) assert.equal(f.post({...fields,requestId:randomUUID()}).ok,true);
  assert.equal(f.post({...fields,bookingId:" hlt-100826-rks001-001 ",requestId:randomUUID()}).ok,false);
  assert.equal(f.post({...fields,bookingId:"HLT-100826-RKS001-002",requestId:randomUUID()}).ok,true);
  assert.equal(f.sheets.get("Feedback").rows.length,7);
  const global = await fixture(); global.props.set("FORM_HOURLY_LIMIT","2");
  for(const bookingId of ["HLT-100826-RKS001-011","HLT-100826-RKS001-012"]) assert.equal(global.post({...fields,bookingId,requestId:randomUUID()}).ok,true);
  assert.equal(global.post({...fields,bookingId:"HLT-100826-RKS001-013",requestId:randomUUID()}).ok,false);
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
  const request = (changes={}) => new Request("https://edge.invalid",{method:"POST",headers:{Origin:"http://localhost:5173","Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({form:"feedback",bookingId:"HLT-100826-RKS001-001",rating:"5",feedback:"Offline test",requestId:randomUUID(),turnstileToken:"offline-token",...changes})});
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

// Log lỗi gửi form (tab Errors): không CAPTCHA nhưng chỉ nhận trường cố định, không dữ liệu khách.
const errorLog = (changes={}) => ({form:"error-log",sourceForm:"booking",category:"server",status:"503",device:"Mobile",page:"/booking/",occurredAt:new Date().toISOString(),reportId:randomUUID(),...changes});

test("GAS writes error logs to the Errors tab once, validates every field and requires the proxy secret",async () => {
  const f = await fixture();
  assert.equal(f.post(errorLog()).ok,false,"direct write without proxy secret");
  assert.equal(f.sheets.has("Errors"),false);
  const report = errorLog({proxySecret:secret,browser:"Chrome"});
  assert.equal(f.post(report).ok,true);
  assert.equal(f.post(report).ok,true,"retried report is accepted");
  const rows = f.sheets.get("Errors").rows;
  assert.equal(rows.length,2,"header plus exactly one row");
  assert.deepEqual(rows[0].slice(0,5),["Received At","Occurred At","Form","Error Category","HTTP Status"]);
  assert.deepEqual(rows[1].slice(2,9),["booking","server","503","Mobile","Chrome","/booking/",report.reportId]);
  for (const bad of [{fullName:"Guest"},{phone:"+84839779888"},{category:"other"},{sourceForm:"admin"},{status:"50"},{device:"=1+1"},{page:"https://evil.test/"},{page:"/a?b=c"},{reportId:"x"},{occurredAt:"yesterday"}]) {
    assert.equal(f.post(errorLog({proxySecret:secret,...bad})).ok,false,JSON.stringify(bad));
  }
  assert.equal(rows.length,2);
  assert.equal(f.sheets.has("Bookings"),false,"error logs never touch bookings");
});

test("GAS emails server/network/unknown errors at most every 15 minutes and never for validation",async () => {
  const f = await fixture();
  f.post(errorLog({proxySecret:secret}));
  assert.equal(f.mails.length,0,"no email without ERROR_ALERT_EMAIL");
  f.props.set("ERROR_ALERT_EMAIL","ops@example.com, bad-address");
  f.post(errorLog({proxySecret:secret,category:"validation",status:""}));
  assert.equal(f.mails.length,0,"validation is logged only");
  f.post(errorLog({proxySecret:secret,category:"network",status:""}));
  assert.equal(f.mails.length,1);
  assert.equal(f.mails[0].to,"ops@example.com");
  assert.match(f.mails[0].body,/network/);
  f.post(errorLog({proxySecret:secret}));
  f.post(errorLog({proxySecret:secret,category:"unknown",status:""}));
  assert.equal(f.mails.length,1,"throttled");
  f.cacheStore.delete("error-alert-sent");
  f.post(errorLog({proxySecret:secret}));
  assert.equal(f.mails.length,2);
  assert.match(f.mails[1].body,/2 lỗi khác/);
  assert.equal(f.sheets.get("Errors").rows.length,7,"header plus all 6 errors are still logged");
  f.context.MailApp.sendEmail = () => { throw new Error("quota"); };
  f.cacheStore.delete("error-alert-sent");
  assert.equal(f.post(errorLog({proxySecret:secret})).ok,true,"email failure keeps the log");
  assert.equal(f.sheets.get("Errors").rows.length,8);
});

test("GAS caps error log rows per hour",async () => {
  const f = await fixture(); f.props.set("ERROR_LOG_HOURLY_LIMIT","2");
  for (let i=0;i<4;i++) assert.equal(f.post(errorLog({proxySecret:secret})).ok,true);
  assert.equal(f.sheets.get("Errors").rows.length,3);
});

test("proxy forwards valid error logs without CAPTCHA and rejects anything else",async () => {
  let siteverify = 0; const forwarded = [];
  const handler = createFormsHandler({endpoint,proxySecret:secret,turnstileSecret:"offline",fetcher:async (url,options)=>{
    if (url.includes("siteverify")) { siteverify++; return Response.json({success:false}); }
    forwarded.push(Object.fromEntries(options.body));
    return Response.json({ok:true});
  }});
  const request = (fields,origin="https://hoangluxury.travel") => new Request("https://edge.invalid",{method:"POST",headers:{Origin:origin,"Content-Type":"application/x-www-form-urlencoded","User-Agent":"Mozilla/5.0 Chrome/120"},body:new URLSearchParams(fields)});
  assert.equal((await handler(request(errorLog()))).status,200);
  assert.equal(siteverify,0);
  assert.equal(forwarded[0].proxySecret,secret);
  assert.equal(forwarded[0].browser,"Chrome");
  for (const bad of [{fullName:"Guest"},{turnstileToken:"x"},{category:"other"},{page:"/a?b"},{occurredAt:new Date(Date.now()-9*864e5).toISOString()},{reportId:"1"},{proxySecret:"injected"}]) {
    assert.equal((await handler(request(errorLog(bad)))).status,400,JSON.stringify(bad));
  }
  assert.equal((await handler(request(errorLog(),"https://evil.test"))).status,403);
  assert.equal(forwarded.length,1);
});

test("client error log carries no customer data, queues while offline and flushes once online",async () => {
  const { buildErrorReport, reportFormError, flushFormErrorQueue } = await import("../src/lib/form-error-log.js");
  const store = new Map();
  const win = { navigator:{userAgent:"iPhone"}, location:{pathname:"/booking/",search:"?src=RKS002&token=secret"},
    crypto:{randomUUID}, localStorage:{getItem:(k)=>store.get(k) ?? null,setItem:(k,v)=>store.set(k,v),removeItem:(k)=>store.delete(k)} };
  const report = buildErrorReport({form:"booking",category:"server",status:503},win);
  assert.deepEqual(Object.keys(report).sort(),["category","device","form","occurredAt","page","reportId","sourceForm","status"]);
  assert.deepEqual([report.sourceForm,report.category,report.status,report.device,report.page],["booking","server","503","Mobile","/booking/"]);
  assert.equal(buildErrorReport({form:"feedback",category:"weird"},win).category,"unknown");
  let online = false; const sent = [];
  const fetcher = async (_url,options) => { if (!online) throw new TypeError("offline"); sent.push(Object.fromEntries(options.body)); return Response.json({ok:true}); };
  assert.equal(await reportFormError("https://evil.test/",{form:"booking",category:"server"},{win,fetcher}),false);
  assert.equal(store.size,0,"never queue for an unknown endpoint");
  assert.equal(await reportFormError(proxyUrl,{form:"booking",category:"network"},{win,fetcher}),false);
  assert.equal(JSON.parse(store.get("hlt-form-error-log")).length,1);
  online = true;
  assert.equal(await flushFormErrorQueue(proxyUrl,{win,fetcher}),1);
  assert.equal(store.size,0);
  assert.equal(sent[0].category,"network");
  assert.equal(await reportFormError(proxyUrl,{form:"feedback",category:"validation"},{win,fetcher}),true);
  assert.doesNotMatch(JSON.stringify(sent),/secret|RKS002|token/);
});

test("submitForm classifies failures for the error log without changing messages",async () => {
  const { FormSubmitError } = await import("../src/lib/forms.js");
  const outcome = (fetcher,url=proxyUrl) => submitForm(url,{},fetcher).then(()=>"ok",(error)=>error instanceof FormSubmitError ? `${error.category}:${error.status}` : "other");
  assert.equal(await outcome(async()=>{throw new TypeError("Failed to fetch");}),"network:");
  assert.equal(await outcome(async()=>{throw new DOMException("t","TimeoutError");}),"network:");
  assert.equal(await outcome(async()=>Response.json({ok:true},{status:503})),"server:503");
  assert.equal(await outcome(async()=>Response.json({ok:false},{status:400})),"server:400");
  assert.equal(await outcome(async()=>Response.json({ok:false})),"server:200");
  assert.equal(await outcome(async()=>new Response("<html>")),"server:200");
  assert.equal(await outcome(async()=>Response.json({ok:true}),"https://evil.test/"),"unknown:");
});

test("client drops error logs the server rejects (4xx) and keeps them on 5xx",async () => {
  const { reportFormError } = await import("../src/lib/form-error-log.js");
  const store = new Map();
  const win = { navigator:{userAgent:"Windows"}, location:{pathname:"/feedback/"}, crypto:{randomUUID}, localStorage:{getItem:(k)=>store.get(k) ?? null,setItem:(k,v)=>store.set(k,v),removeItem:(k)=>store.delete(k)} };
  assert.equal(await reportFormError(proxyUrl,{form:"feedback",category:"server"},{win,fetcher:async()=>Response.json({ok:false},{status:400})}),false);
  assert.equal(store.size,0);
  assert.equal(await reportFormError(proxyUrl,{form:"feedback",category:"server"},{win,fetcher:async()=>Response.json({ok:false},{status:503})}),false);
  assert.equal(JSON.parse(store.get("hlt-form-error-log")).length,1);
});
