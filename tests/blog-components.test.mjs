// Real React components in jsdom, with Auth API stubbed. No account/password changes.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { transformWithEsbuild } from "vite";
import { rememberPasswordSetup, clearPasswordSetup } from "../src/lib/auth-flow.js";

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url: "http://fixture.invalid/admin/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const host = document.getElementById("root");

async function component(path, stubName) {
  const fileUrl = new URL(`../${path}`, import.meta.url);
  let source = await readFile(fileUrl, "utf8");
  source = source.replace(/import \{([^}]+)\} from "\.\.\/lib\/supabase\.js";/,
    (_match,names) => `const {${names}} = globalThis.${stubName};`)
    .replaceAll('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
    .replace(/from "(\.\.\/[^\"]+)"/g, (_match,relative) => `from ${JSON.stringify(new URL(relative,fileUrl).href)}`);
  const { code } = await transformWithEsbuild(source, path, { loader: path.endsWith("jsx") ? "jsx" : "js", jsx: "transform" });
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;
}

async function fill(input, value) {
  await act(async () => {
    const prototype = input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

test("real password screen saves invite/recovery, validates confirmation and reauthenticates changes", async () => {
  const calls = [];
  globalThis.__passwordFixture = { supabase: { auth: {
    signInWithPassword: async (data) => { calls.push(["signIn", data]); return {}; },
    updateUser: async (data) => { calls.push(["update", data]); return {}; },
    signOut: async () => ({}),
  } } };
  const PasswordScreen = await component("src/admin/PasswordScreen.jsx", "__passwordFixture");
  for (const flow of ["invite", "recovery", "change"]) {
    const root = createRoot(host);
    try {
    const session = { user: { id: "fixture-user", email: "test@example.invalid" }, access_token: "offline-token" };
    clearPasswordSetup();
    if (flow !== "change") rememberPasswordSetup(session, flow);
    await act(async () => root.render(React.createElement(PasswordScreen, { flow, session, onDone: () => {} })));
      const inputs = [...host.querySelectorAll("input")];
      if (flow === "change") await fill(inputs.shift(), "current-fixture-password");
      await fill(inputs[0], "New-fixture-password-123!");
      await fill(inputs[1], "wrong-confirmation");
      const before = calls.length;
      await act(async () => host.querySelector("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
      assert.match(host.textContent, /không khớp/);
      assert.equal(calls.length, before);
      await fill(inputs[1], "New-fixture-password-123!");
      await act(async () => host.querySelector("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
      assert.match(host.textContent, /Đã lưu mật khẩu/);
      assert.deepEqual(calls.at(-1), ["update", { password: "New-fixture-password-123!", ...(flow === "change" ? { current_password: "current-fixture-password" } : {}) }]);
      if (flow === "change") assert.deepEqual(calls.at(-2), ["signIn", { email: "test@example.invalid", password: "current-fixture-password" }]);
    } finally { await act(async () => root.unmount()); }
  }
});

test("forged recovery/invite intent cannot update password without current-password verification",async () => {
  clearPasswordSetup(); let updates = 0; let signs = 0;
  globalThis.__forgedFixture = {supabase:{auth:{signInWithPassword:async()=>{signs++;return {error:new Error("Wrong password")};},updateUser:async()=>{updates++;return {};}}}};
  const Screen = await component("src/admin/PasswordScreen.jsx","__forgedFixture");
  for(const flow of ["recovery","invite"]) {
    const root = createRoot(host);
    try {
      await act(async()=>root.render(React.createElement(Screen,{flow,session:{user:{id:"existing-user",email:"existing@example.invalid"},access_token:"ordinary-session"},onDone:()=>{}})));
      const inputs = [...host.querySelectorAll("input")];
      assert.equal(inputs.length,3,"unproven recovery requires current password");
      await fill(inputs[1],"New-fixture-password-123!"); await fill(inputs[2],"New-fixture-password-123!");
      await act(async()=>host.querySelector("form").dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true})));
      assert.equal(updates,0);
      await fill(inputs[0],"wrong-current-password");
      await act(async()=>host.querySelector("form").dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true})));
      assert.equal(updates,0);
    } finally {await act(async()=>root.unmount());}
  }
  assert.equal(signs,2); delete globalThis.__forgedFixture;
});

test("real email callback screen preserves old session until explicit account confirmation",async () => {
  let installed = 0, accepted = 0;
  const candidate={user:{id:"target",email:"target@example.invalid"},access_token:"offline-target-token",refresh_token:"offline-target-refresh"};
  globalThis.__emailFixture = {callbackSupabase:{auth:{verifyOtp:async()=>({data:{session:candidate}})}},supabase:{auth:{setSession:async()=>{installed++;return {data:{session:candidate}};}}}};
  const Screen = await component("src/admin/EmailCallbackScreen.jsx","__emailFixture");
  const root=createRoot(host);
  try {
    await act(async()=>root.render(React.createElement(Screen,{callback:{type:"invite",token_hash:"b".repeat(64)},session:{user:{email:"old-admin@example.invalid"}},onAccepted:()=>{accepted++;},onCancel:()=>{}})));
    assert.equal(installed,0);
    await act(async()=>host.querySelector("button").click());
    assert.match(host.textContent,/target@example.invalid/); assert.equal(installed,0);
    await act(async()=>host.querySelector("button").click());
    assert.equal(installed,1); assert.equal(accepted,1);
  } finally {await act(async()=>root.unmount());clearPasswordSetup();delete globalThis.__emailFixture;}
});

test("inline upload inserts image into latest body without losing text typed while waiting",async () => {
  let finish; const waiting=new Promise((resolve)=>{finish=resolve;});
  globalThis.__uploadFixture={supabase:{storage:{from:()=>({upload:()=>waiting})}},blogImageUrl:()=>"https://fixture.invalid/image.png"};
  const Editor=await component("src/admin/ArticleEditor.jsx","__uploadFixture");
  const root=createRoot(host);
  try {
    await act(async()=>root.render(React.createElement(Editor,{profile:{id:"fixture-writer"},onDone:()=>{},onCancel:()=>{}})));
    const body=host.querySelector("textarea.hlt-admin-body");
    await fill(body,"Existing draft");
    const upload=host.querySelector('input[type="file"]');
    Object.defineProperty(upload,"files",{value:[{name:"fake.png",type:"image/png",size:10}]});
    await act(async()=>upload.dispatchEvent(new window.Event("change",{bubbles:true})));
    await fill(body,"Existing draft. NEW TEXT TYPED DURING UPLOAD");
    await act(async()=>finish({error:null}));
    assert.match(body.value,/NEW TEXT TYPED DURING UPLOAD/);
    assert.match(body.value,/!\[Mô tả ảnh\]/);
  } finally {await act(async()=>root.unmount());delete globalThis.__uploadFixture;}
});

test("session callback never queries DB inside auth callback; refresh keeps unsaved editor mounted", async () => {
  let callback; let inCallback = false; let queries = 0; let mounts = 0; let result;
  const session = { user: { id: "fixture-user", email: "test@example.invalid" }, access_token: "first-fake-token" };
  const profile = { id: "fixture-user", role: "admin", active: true };
  globalThis.__sessionFixture = { supabaseReady: true, initialAuthFlow: { flow: "", error: "" }, supabase: {
    auth: { getSession: async () => ({ data: { session } }),
      onAuthStateChange: (fn) => { callback = fn; return { data: { subscription: { unsubscribe: () => {} } } }; } },
    from: () => {
      assert.equal(inCallback, false, "DB calls must not run inside SDK callback"); queries += 1;
      const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: profile }) };
      return query;
    },
  } };
  const useSession = await component("src/admin/useSession.js", "__sessionFixture");
  function Editor() {
    const [value, setValue] = React.useState("Unsaved draft");
    React.useEffect(() => { mounts += 1; }, []);
    return React.createElement("input", { value, onChange: (event) => setValue(event.target.value) });
  }
  function App() { result = useSession(); return result.loading ? React.createElement("p", null, "loading") : React.createElement(Editor); }
  const root = createRoot(host);
  try {
    await act(async () => root.render(React.createElement(App)));
    assert.equal(result.profile.role, "admin");
    await fill(host.querySelector("input"), "Do not lose this draft");
    await act(async () => {
      inCallback = true; callback("TOKEN_REFRESHED", { ...session, access_token: "second-fake-token" }); inCallback = false;
    });
    assert.equal(mounts, 1);
    assert.equal(queries, 1);
    assert.equal(host.querySelector("input").value, "Do not lose this draft");
    assert.equal(result.session.access_token, "second-fake-token");
    await act(async () => callback("PASSWORD_RECOVERY", session));
    assert.equal(result.flow, "", "an auth event without verified callback provenance is not recovery permission");
    await act(async () => result.clearFlow());
    assert.equal(result.flow, "");
    assert.equal(mounts, 1);
  } finally { await act(async () => root.unmount()); }
});

test("expired recovery error is retained for UI; normal sign-in clears stale callback intent", async () => {
  let callback; let result;
  const session = { user: { id: "fixture-user" } };
  globalThis.__expiredFixture = { supabaseReady: true, initialAuthFlow: { flow: "recovery", error: "Expired email link" }, supabase: {
    auth: { getSession: async () => ({ data: { session } }),
      onAuthStateChange: (fn) => { callback = fn; return { data: { subscription: { unsubscribe: () => {} } } }; } },
    from: () => { const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: { id: "fixture-user" } }) }; return query; },
  } };
  const useSession = await component("src/admin/useSession.js", "__expiredFixture");
  function App() { result = useSession(); return null; }
  const root = createRoot(host);
  try {
    await act(async () => root.render(React.createElement(App)));
    assert.equal(result.authError, "Expired email link");
    assert.equal(result.flow, "");
    await act(async () => callback("SIGNED_IN", session));
    assert.equal(result.authError, "");
    assert.equal(result.flow, "");
  } finally { await act(async () => root.unmount()); }
});

test.after(() => {
  dom.window.close();
  delete globalThis.__passwordFixture; delete globalThis.__sessionFixture;
  delete globalThis.__expiredFixture;
  delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});
