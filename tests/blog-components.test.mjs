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

/* Biên dịch một module thành data: URL. Node không nạp được .jsx thô từ đĩa nên
   import .jsx tương đối cũng phải biên dịch đệ quy; .js thì trỏ thẳng file URL. */
async function compile(fileUrl, stubName) {
  let source = await readFile(fileUrl, "utf8");
  source = source.replace('import { logoGoldUrl } from "../config/assets.js";', 'const logoGoldUrl = "/offline-logo.png";');
  if (fileUrl.pathname.endsWith('/AdminApp.jsx')) {
    source = source.replace('import { logoGoldUrl } from "../config/assets.js";', 'const logoGoldUrl = "/offline-logo.png";')
      .replace('import useSession from "./useSession.js";', `const useSession = () => globalThis.${stubName}.sessionFixture;`)
      .replace('import ArticleList from "./ArticleList.jsx";', 'const ArticleList = ({onNew}) => React.createElement("button", {onClick:onNew}, "New offline article");')
      .replace('import UserManager from "./UserManager.jsx";', 'const UserManager = () => React.createElement("p", null, "Offline users");')
      .replace('import "../styles/admin.css";', '');
  }
  source = source.replace(/import \{([^}]+)\} from "\.\.\/lib\/supabase\.js";/,
    (_match,names) => `const {${names}} = globalThis.${stubName};`)
    .replaceAll('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`);

  for (const [, relative] of [...source.matchAll(/from "(\.\.?\/[^"]+)"/g)]) {
    const target = new URL(relative, fileUrl);
    const resolved = relative.endsWith(".jsx") ? await compile(target, stubName) : target.href;
    source = source.replaceAll(`from "${relative}"`, `from ${JSON.stringify(resolved)}`);
  }

  const name = fileUrl.pathname;
  const { code } = await transformWithEsbuild(source, name, { loader: name.endsWith("jsx") ? "jsx" : "js", jsx: "transform" });
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}

async function component(path, stubName) {
  return (await import(await compile(new URL(`../${path}`, import.meta.url), stubName))).default;
}

async function fill(input, value) {
  await act(async () => {
    const prototype = input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

/* Bộ soạn thảo nội dung là vùng contenteditable: "gõ" = đổi DOM rồi phát sự
   kiện input như trình duyệt làm. */
async function typeInEditor(area, html) {
  await act(async () => {
    area.innerHTML = html;
    area.dispatchEvent(new window.Event("input", { bubbles: true }));
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
    const area=host.querySelector(".hlt-rte-area");
    await typeInEditor(area,"<p>Existing draft</p>");
    const upload=host.querySelector('.hlt-rte-toolbar input[type="file"]');
    Object.defineProperty(upload,"files",{value:[{name:"fake.png",type:"image/png",size:10}]});
    await act(async()=>upload.dispatchEvent(new window.Event("change",{bubbles:true})));
    await typeInEditor(area,"<p>Existing draft. NEW TEXT TYPED DURING UPLOAD</p>");
    await act(async()=>finish({error:null}));
    // Ảnh vào khung có ô chú thích gõ được, chữ gõ trong lúc chờ tải vẫn còn.
    const figure=area.querySelector("figure");
    assert.equal(figure.querySelector("img").getAttribute("src"),"https://fixture.invalid/image.png");
    assert.equal(figure.querySelector("figcaption").getAttribute("contenteditable"),"true");
    assert.match(area.textContent,/NEW TEXT TYPED DURING UPLOAD/);
    // Thứ thật sự được lưu: xem thử dựng lại từ form.body.
    const preview=[...host.querySelectorAll("button")].find((node)=>node.textContent==="Xem thử");
    await act(async()=>preview.click());
    const shown=host.querySelector(".hlt-admin-preview");
    assert.match(shown.textContent,/NEW TEXT TYPED DURING UPLOAD/);
    assert.equal(shown.querySelector("figure img").getAttribute("src"),"https://fixture.invalid/image.png");
  } finally {await act(async()=>root.unmount());delete globalThis.__uploadFixture;}
});

test("real editor uses one undo stack for typing, mixed case, quote, image and deletion, including keyboard input", async () => {
  const Editor = await component('src/admin/RichTextEditor.jsx','__historyFixture');
  const ref=React.createRef(); let latest='';
  function Fixture(){ const [value,setValue]=React.useState('## Đường **đèo**\n'); return React.createElement(Editor,{ref,value,onChange:(value)=>{latest=value;setValue(value);}}); }
  const root=createRoot(host); const oldConfirm=window.confirm; window.confirm=()=>true;
  const press = async (key, options={}) => act(async()=>host.querySelector('.hlt-rte-area').dispatchEvent(new window.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...options})));
  const click = async(label) => act(async()=>host.querySelector(`button[aria-label="${label}"]`).click());
  const select = (node) => {const range=document.createRange();range.selectNodeContents(node);window.getSelection().removeAllRanges();window.getSelection().addRange(range);document.dispatchEvent(new window.Event('selectionchange'));};
  try {
    await act(async()=>root.render(React.createElement(Fixture)));
    const area=host.querySelector('.hlt-rte-area');
    await act(async()=>select(area.querySelector('h2')));
    await click('Đổi vùng chọn thành IN HOA');
    assert.match(area.textContent,/ĐƯỜNG ĐÈO/); assert.ok(area.querySelector('strong'));
    await press('z',{ctrlKey:true}); assert.match(area.textContent,/Đường đèo/);
    await press('z',{ctrlKey:true,shiftKey:true}); assert.match(area.textContent,/ĐƯỜNG ĐÈO/);
    await act(async()=>select(area.querySelector('h2')));
    await click('Trích dẫn'); assert.ok(area.querySelector('blockquote h2'));
    await press('z',{ctrlKey:true}); assert.equal(area.querySelector('blockquote'),null); assert.ok(area.querySelector('h2'));
    await press('y',{ctrlKey:true}); assert.ok(area.querySelector('blockquote h2'));
    await act(async()=>ref.current.insertImage('https://fixture.invalid/image.png'));
    assert.ok(area.querySelector('figure'));
    await click('Hoàn tác (Ctrl+Z)'); assert.equal(area.querySelector('figure'),null);
    await click('Làm lại (Ctrl+Y / Ctrl+Shift+Z)'); assert.ok(area.querySelector('figure'));
    // A keyboard-generated button click follows the same onClick path as mouse/touch.
    await act(async()=>{const remove=area.querySelector('[data-rte-remove]');remove.focus();remove.click();});
    assert.equal(area.querySelector('figure'),null);
    await press('z',{ctrlKey:true}); assert.ok(area.querySelector('figure'));
    assert.ok(latest.includes('https://fixture.invalid/image.png'));
    const undoEvent=new window.InputEvent('beforeinput',{inputType:'historyUndo',bubbles:true,cancelable:true});
    await act(async()=>area.dispatchEvent(undoEvent));
    assert.equal(undoEvent.defaultPrevented,true); assert.equal(area.querySelector('figure'),null);
    // A new edit after undo must discard the redo branch.
    await typeInEditor(area,'<p>Bản mới</p>');
    assert.equal(host.querySelector('button[aria-label="Làm lại (Ctrl+Y / Ctrl+Shift+Z)"]').disabled,true);
    assert.equal(host.querySelector('select option[value="h1"]'),null);
  } finally {window.confirm=oldConfirm; await act(async()=>root.unmount());}
});

test("preview keeps editor mounted and undo history; dirty exit/reload guarded, failed saves remain dirty", async () => {
  let cancelled=0, dirty=false, saved, fail=true;
  const query={insert:(payload)=>{saved=payload;return query;},select:()=>query,single:async()=>({error:fail?{message:'Offline failed save'}:null})};
  globalThis.__draftFixture={supabase:{from:()=>query},blogImageUrl:()=>''};
  const Editor=await component('src/admin/ArticleEditor.jsx','__draftFixture');
  const root=createRoot(host); const oldConfirm=window.confirm; let allow=false; window.confirm=()=>allow;
  const click=async(label)=>act(async()=>[...host.querySelectorAll('button')].find(b=>b.textContent.trim()===label).click());
  try {
    await act(async()=>root.render(React.createElement(Editor,{profile:{id:'fixture',role:'admin'},onDone:()=>{},onCancel:()=>cancelled++,onDirtyChange:(value)=>{dirty=value;}})));
    let unload=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(unload);assert.equal(unload.defaultPrevented,false);
    await fill(host.querySelector('input'),'Bài thử');
    const area=host.querySelector('.hlt-rte-area'); await typeInEditor(area,'<p>Chữ chưa lưu</p>');
    assert.equal(dirty,true); assert.match(host.querySelector('.hlt-admin-save-state').textContent,/chưa lưu/);
    await click('Xem thử');assert.equal(host.querySelector('.hlt-rte-area'),area);assert.equal(area.parentElement.parentElement.hidden,true);
    await click('Quay lại soạn thảo');assert.equal(area.parentElement.parentElement.hidden,false);
    await act(async()=>area.dispatchEvent(new window.KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true,cancelable:true})));
    assert.doesNotMatch(area.textContent,/Chữ chưa lưu/);
    await typeInEditor(area,'<p>Khôi phục nội dung</p>');
    await click('← Danh sách bài');assert.equal(cancelled,0);
    unload=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(unload);assert.equal(unload.defaultPrevented,true);
    await click('Lưu nháp');assert.equal(dirty,true);assert.match(host.textContent,/Offline failed save/);
    assert.match(saved.body,/Khôi phục nội dung/);
    fail=false; await click('Lưu nháp');assert.equal(dirty,false);
    unload=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(unload);assert.equal(unload.defaultPrevented,false);
    await fill(host.querySelector('input'),'Bài thử khác');allow=true;await click('← Danh sách bài');assert.equal(cancelled,1);
  } finally {window.confirm=oldConfirm;await act(async()=>root.unmount());delete globalThis.__draftFixture;}
});

test("admin navigation, account switch and signout honor unsaved editor guard", async () => {
  let signs=0, allows=false;
  globalThis.__navigationDraftFixture={supabaseReady:true,supabase:{auth:{signOut:async()=>{signs++;}}},sessionFixture:{loading:false,session:{user:{id:'fixture'}},profile:{id:'fixture',role:'admin',active:true,full_name:'Offline Admin'},clearFlow:()=>{}}};
  const App=await component('src/admin/AdminApp.jsx','__navigationDraftFixture');
  const root=createRoot(host), oldConfirm=window.confirm;window.confirm=()=>allows;
  const click=async(label)=>act(async()=>[...host.querySelectorAll('button')].find(b=>b.textContent.trim()===label).click());
  try {
    await act(async()=>root.render(React.createElement(App)));
    await click('New offline article'); await fill(host.querySelector('input'),'Unsaved title');
    await click('Tài khoản');assert.ok(host.querySelector('.hlt-rte-area'));
    await click('Bài viết');assert.ok(host.querySelector('.hlt-rte-area'));
    await act(async()=>host.querySelector('.hlt-admin-me-btn').click());
    await click('Đăng xuất');assert.equal(signs,0);
    await click('Đổi mật khẩu');assert.ok(host.querySelector('.hlt-rte-area'));
    allows=true;await click('Đăng xuất');assert.equal(signs,1);
    await click('Tài khoản');assert.match(host.textContent,/Offline users/);assert.equal(host.querySelector('.hlt-rte-area'),null);
  } finally {window.confirm=oldConfirm;await act(async()=>root.unmount());delete globalThis.__navigationDraftFixture;}
});

test("image upload is keyboard-focusable, captions lock while busy, and link modal traps focus", async () => {
  const Editor=await component('src/admin/RichTextEditor.jsx','__accessFixture');
  const root=createRoot(host);const props={value:'![Caption](https://fixture.invalid/image.png)\n',onChange:()=>{}};
  try {
    await act(async()=>root.render(React.createElement(Editor,props)));
    const upload=host.querySelector('button[aria-label="Chèn ảnh"]');upload.focus();assert.equal(document.activeElement,upload);
    await act(async()=>root.render(React.createElement(Editor,{...props,disabled:true})));
    assert.equal(host.querySelector('figcaption').getAttribute('contenteditable'),'false');
    assert.equal(host.querySelector('[data-rte-remove]').disabled,true);
    await act(async()=>root.render(React.createElement(Editor,props)));
    await act(async()=>host.querySelector('button[aria-label="Gắn liên kết vào chữ đang chọn (Ctrl+K)"]').click());
    const dialog=host.querySelector('[role="dialog"]'); const first=dialog.querySelector('button');const last=dialog.querySelector('button[type="submit"]');
    last.focus();const tab=new window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});
    await act(async()=>last.dispatchEvent(tab));assert.equal(tab.defaultPrevented,true);assert.equal(document.activeElement,first);
    const backwards=new window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true});
    await act(async()=>first.dispatchEvent(backwards));assert.equal(document.activeElement,last);
    await act(async()=>dialog.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
    assert.equal(host.querySelector('[role="dialog"]'),null);
  } finally {await act(async()=>root.unmount());}
});

test("Vietnamese IME composition is one undo step and is not interrupted by Ctrl+Z", async () => {
  const Editor=await component('src/admin/RichTextEditor.jsx','__imeFixture');
  const root=createRoot(host); let latest='';
  function Fixture(){const [value,setValue]=React.useState('Before\n');return React.createElement(Editor,{value,onChange:(value)=>{latest=value;setValue(value);}});}
  try {
    await act(async()=>root.render(React.createElement(Fixture)));
    const area=host.querySelector('.hlt-rte-area');
    await act(async()=>area.dispatchEvent(new window.CompositionEvent('compositionstart',{bubbles:true,data:''})));
    await typeInEditor(area,'<p>đườ</p>');
    const shortcut=new window.KeyboardEvent('keydown',{key:'z',ctrlKey:true,isComposing:true,bubbles:true,cancelable:true});
    await act(async()=>area.dispatchEvent(shortcut));assert.equal(shortcut.defaultPrevented,false);assert.match(area.textContent,/đườ/);
    await typeInEditor(area,'<p>đường đèo</p>');
    await act(async()=>area.dispatchEvent(new window.CompositionEvent('compositionend',{bubbles:true,data:'đường đèo'})));
    assert.match(latest,/đường đèo/);
    await act(async()=>area.dispatchEvent(new window.KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true,cancelable:true})));
    assert.equal(area.textContent.trim(),'Before');
    await act(async()=>area.dispatchEvent(new window.KeyboardEvent('keydown',{key:'y',ctrlKey:true,bubbles:true,cancelable:true})));
    assert.equal(area.textContent.trim(),'đường đèo');
  } finally {await act(async()=>root.unmount());}
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

test("Explore Sapa behaves like the destination filter without navigating to a transfer page", async () => {
  const fileUrl = new URL("../src/BlogPage.jsx", import.meta.url);
  let source = await readFile(fileUrl, "utf8");
  source = source
    .replace('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
    .replace('import Header from "./components/layout/Header.jsx";', 'const Header = () => null;')
    .replace('import Footer from "./components/layout/Footer.jsx";', 'const Footer = () => null;')
    .replace('import ExperienceSlider from "./components/home/ExperienceSlider.jsx";', 'const ExperienceSlider = () => null;')
    .replace('import { aboutImages, journeyCardImages, blogStoryBackgroundUrl } from "./config/assets.js";', 'const aboutImages = {hero:"/fixture.png"}; const journeyCardImages = Array(9).fill("/fixture.png"); const blogStoryBackgroundUrl = "/fixture-blog-sunrise.png";')
    .replace('import { whatsappUrl } from "./data.js";', 'const whatsappUrl = "https://wa.me/fixture";')
    .replace('import usePageEntered from "./hooks/usePageEntered.js";', 'const usePageEntered = () => true;')
    .replace('import usePublicBlog from "./hooks/usePublicBlog.js";', 'const usePublicBlog = () => globalThis.__blogFilterFixture;')
    .replace('from "./config/blog.js"', `from ${JSON.stringify(new URL("../src/config/blog.js", import.meta.url).href)}`);
  const { code } = await transformWithEsbuild(source, "BlogPage.jsx", { loader:"jsx", jsx:"transform" });
  const BlogPage = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;
  globalThis.__blogFilterFixture = {
    loading:false, error:"", retry:() => {},
    articles:Array.from({length:16}, (_,index) => ({
      slug:`guide-${index}`, title:`Guide ${index}`, excerpt:"A local guide.",
      destinations:[index % 2 ? "Ha Long" : "Sapa"], topics:[index % 3 ? "Travel Tips" : "Food & Drink"],
      author:"Fixture", readingMinutes:3, imageUrl:"", featured:index === 0,
    })),
  };
  const previousMatchMedia = window.matchMedia;
  const previousScroll = window.HTMLElement.prototype.scrollIntoView;
  window.matchMedia = () => ({matches:true});
  let scrolls = [];
  window.HTMLElement.prototype.scrollIntoView = function(options) { scrolls.push({element:this,options}); };
  const destinationButton = (name) => [...host.querySelectorAll('[aria-label="Filter articles by destination"] button')].find((button) => button.textContent === name);
  const snapshot = () => ({
    destination:[...host.querySelectorAll('[aria-label="Filter articles by destination"] button')].filter((button) => button.getAttribute("aria-pressed") === "true").map((button) => button.textContent),
    topic:[...host.querySelectorAll('[aria-label="Filter articles by topic"] button')].filter((button) => button.getAttribute("aria-pressed") === "true").map((button) => button.textContent),
    query:host.querySelector('input[type="search"]').value, sort:host.querySelector("select").value,
    title:host.querySelector(".hlt-blog-feed .hlt-blog-section-heading h2").textContent,
    articles:[...host.querySelectorAll(".hlt-blog-card-title")].map((heading) => heading.textContent),
    results:host.querySelector(".hlt-blog-results")?.textContent,
  });
  try {
    for (const initial of [null,"Sapa","Ha Long"]) {
      for (const trigger of ["filter","card"]) {
        const root = createRoot(host);
        try {
          await act(async () => root.render(React.createElement(BlogPage)));
          const story = host.querySelector('.hlt-blog-story-cta');
          assert.equal(story.getAttribute('aria-labelledby'), 'blog-story-title');
          assert.equal(story.querySelector('.hlt-blog-story-eyebrow').textContent, 'LOCAL EXPERIENCE. MEANINGFUL JOURNEY');
          // Tiêu đề CTA không còn là h2 (cấu trúc SEO 28/10/2026), vẫn là nhãn của khối.
          assert.equal(story.querySelector('#blog-story-title').textContent, 'Discover Vietnam in Your Own Way');
          assert.equal(story.querySelector('h2'), null);
          assert.equal(story.querySelector('.hlt-blog-story-description').textContent, 'Our stories go beyond the destinations — they’re about people, culture and the moments that make travel truly meaningful.');
          assert.equal(story.querySelector('a').textContent, 'Explore Our Story');
          assert.equal(story.querySelector('a').getAttribute('href'), '/about/');
          assert.equal(story.querySelectorAll('a').length, 1);
          assert.match(story.style.backgroundImage, /fixture-blog-sunrise/);
          const plan = host.querySelector(".hlt-blog-plan");
          assert.equal(plan.querySelector(".hlt-blog-plan-title").textContent,"EXPLORE MORE. TRAVEL YOUR WAY");
          assert.equal(plan.querySelector("p").textContent,"Save time with private transfers, flexible departures and door-to-door service. Contact us to plan your trip.");
          assert.equal(plan.querySelector("a").textContent,"Plan your journey");
          assert.equal(plan.querySelector("a").getAttribute("href"),"https://wa.me/fixture");
          if (initial) await act(async () => destinationButton(initial).click());
          if (initial === "Ha Long") {
            await act(async () => [...host.querySelectorAll('[aria-label="Filter articles by topic"] button')].find((button) => button.textContent === "Travel Tips").click());
            await fill(host.querySelector('input[type="search"]'),"guide");
            await act(async () => {
              const select = host.querySelector("select"); select.value="oldest";
              select.dispatchEvent(new window.Event("change",{bubbles:true}));
            });
          }
          const loadMore = host.querySelector(".hlt-blog-load button");
          if (loadMore) await act(async () => loadMore.click());
          scrolls=[];
          const card=host.querySelector(".hlt-blog-destination-feature");
          assert.equal(card.tagName,"BUTTON");
          assert.equal(card.hasAttribute("href"),false);
          const url=window.location.href;
          await act(async () => (trigger === "filter" ? destinationButton("Sapa") : card).click());
          assert.equal(window.location.href,url,"stays on Blog");
          if (trigger === "filter") {
            // Nút lọc vẫn bật/tắt: bấm lại đúng điểm đến đang bật thì bỏ lọc.
            assert.deepEqual(snapshot().destination, initial === "Sapa" ? [] : ["Sapa"]);
            assert.equal(scrolls.length,0,"filter chips do not scroll");
          } else {
            // Thẻ Explore Sapa: luôn chỉ hiện bài Sapa, chủ đề và ô tìm kiếm về mặc định,
            // kể cả khi Sapa đang bật sẵn hoặc bấm thẻ lần nữa.
            const sortBefore = host.querySelector("select").value;
            for (const click of [1, 2]) {
              if (click === 2) await act(async () => card.click());
              const state = snapshot();
              assert.deepEqual(state.destination,["Sapa"],`click ${click} keeps Sapa`);
              assert.deepEqual(state.topic,[],"topic reset to default");
              assert.equal(state.query,"","search reset to default");
              assert.equal(state.sort,sortBefore,"sort order is kept");
              assert.equal(card.getAttribute("aria-pressed"),"true");
              assert.ok(state.articles.length > 0 && state.articles.every((title) => Number(title.split(" ")[1]) % 2 === 0),"only Sapa articles");
            }
            assert.equal(scrolls.length,2);
            assert.equal(scrolls[0].element,host.querySelector(".hlt-blog-editorial"));
            assert.equal(scrolls[0].options.behavior,"instant","respects reduced motion");
          }
        } finally { await act(async () => root.unmount()); }
      }
    }
  } finally {
    window.matchMedia=previousMatchMedia;
    window.HTMLElement.prototype.scrollIntoView=previousScroll;
    delete globalThis.__blogFilterFixture;
  }
});

test("About uses the Blog CTA design and background without changing its contact/catalog destinations", async () => {
  let source = await readFile(new URL("../src/AboutPage.jsx", import.meta.url), "utf8");
  source = source
    .replace('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
    .replace('import Header from "./components/layout/Header.jsx";', 'const Header = () => null;')
    .replace('import Footer from "./components/layout/Footer.jsx";', 'const Footer = () => null;')
    .replace('import ExperienceSlider from "./components/home/ExperienceSlider.jsx";', 'const ExperienceSlider = () => null;')
    .replace(/import \{[^}]+\} from "\.\/config\/assets.js";/, `
      const aboutCeoSignatureUrl = "/signature.png", logoGoldUrl = "/logo.png", servicesBackgroundUrl = "/mountains.png";
      const aboutImages = {}, aboutStatIcons = {}, aboutDestinationImages = Array(10).fill("/fixture.png");
      const aboutCtaBackgroundUrl = "/fixture-about-valley.png";
    `)
    .replace('import { catalogPageUrl, getJourneyPageUrl, whatsappUrl } from "./data.js";', 'const catalogPageUrl = "/catalog/", getJourneyPageUrl = () => "/journeys/", whatsappUrl = "https://wa.me/fixture";')
    .replace('import usePageEntered from "./hooks/usePageEntered.js";', 'const usePageEntered = () => true;');
  const { code } = await transformWithEsbuild(source, "AboutPage.jsx", { loader:"jsx", jsx:"transform" });
  const AboutPage = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;
  const root = createRoot(host);
  try {
    await act(async () => root.render(React.createElement(AboutPage)));
    const cta = host.querySelector('.hlt-blog-story-cta');
    assert.ok(cta.classList.contains('hlt-cruise-cta-section'));
    assert.ok(cta.querySelector('.hlt-cruise-cta-overlay'));
    assert.match(cta.style.backgroundImage, /fixture-about-valley/);
    assert.equal(cta.getAttribute('aria-labelledby'), 'about-cta-title');
    assert.equal(cta.querySelector('#about-cta-title').textContent, 'Every Journey Begins with a Conversation?');
    assert.equal(cta.querySelector('.hlt-blog-story-description').textContent, 'Share your plans. Let us take care of the details.');
    const links = [...cta.querySelectorAll('a')];
    assert.deepEqual(links.map(el => [el.textContent, el.getAttribute('href')]), [
      ['Book via WhatsApp', 'https://wa.me/fixture'], ['View Catalog', '/catalog/'],
    ]);
    // Cặp nút chung của trang chủ: vàng đặc + viền, không phải nút riêng của Blog.
    assert.ok(links.every(el => el.classList.contains('hlt-btn')));
    assert.deepEqual(links.map(el => el.classList.contains('hlt-btn-gold')), [true, false]);
    assert.deepEqual(links.map(el => el.classList.contains('hlt-btn-outline')), [false, true]);
    assert.equal(links[0].getAttribute('rel'), 'noopener noreferrer');
    assert.equal(host.querySelector('.hlt-journey-cta-about'), null);
  } finally { await act(async () => root.unmount()); }
});

test.after(() => {
  dom.window.close();
  delete globalThis.__passwordFixture; delete globalThis.__sessionFixture;
  delete globalThis.__expiredFixture;
  delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

test("account dialog only calls the server after confirmation and shows the credentials once", async () => {
  const calls = [];
  const people = [
    { id: "admin-1", email: "admin@example.invalid", full_name: "Admin", role: "admin", active: true },
    { id: "writer-1", email: "writer@example.invalid", full_name: "Writer", role: "writer", active: true },
  ];
  const query = { select: () => query, order: () => query, then: (resolve) => resolve({ data: people, error: null }) };
  globalThis.__usersFixture = { supabase: {
    from: () => query,
    auth: { getSession: async () => ({ data: { session: { access_token: "offline-token" } } }) },
    functions: { invoke: async (name, options) => { calls.push([name, options.body]); return { data: { ok: true, email: options.body.email } }; } },
  } };

  const UserManager = await component("src/admin/UserManager.jsx", "__usersFixture");
  const root = createRoot(host);
  try {
    await act(async () => root.render(React.createElement(UserManager, { profile: people[0] })));
    const button = (label) => [...host.querySelectorAll("button")].find((node) => node.textContent.trim() === label);

    // Biểu mẫu chỉ xuất hiện trong hộp thoại, không nằm sẵn trên trang.
    assert.equal(host.querySelector("form"), null);
    assert.ok(button("Thêm người viết"));

    await act(async () => button("Thêm người viết").click());
    const dialog = host.querySelector('[role="dialog"]');
    assert.ok(dialog, "bấm Thêm người viết phải mở hộp thoại");
    assert.equal(dialog.getAttribute("aria-modal"), "true");

    // Mật khẩu được sinh sẵn, đủ dài theo luật của máy chủ.
    const password = dialog.querySelector(".hlt-admin-pass-row input").value;
    assert.ok(password.length >= 15, `mật khẩu sinh sẵn quá ngắn: ${password.length}`);

    await fill(dialog.querySelector('input[type="email"]'), "new@example.invalid");
    await act(async () => host.querySelector("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));

    assert.deepEqual(calls, [["invite-writer", { email: "new@example.invalid", fullName: "", role: "writer", password }]]);
    assert.match(host.textContent, /Đã tạo tài khoản/);
    assert.match(host.textContent, /new@example\.invalid/);
    assert.ok(host.textContent.includes(password), "màn thành công phải hiện mật khẩu để admin chép lại");

    await act(async () => button("Xong").click());
    assert.equal(host.querySelector('[role="dialog"]'), null);
    assert.equal(host.textContent.includes(password), false, "đóng hộp thoại là mật khẩu không còn trên màn");

    // Đặt lại mật khẩu phải hỏi trước, chưa hỏi thì không được gọi máy chủ.
    await act(async () => button("Đặt lại mật khẩu").click());
    assert.match(host.querySelector('[role="dialog"]').textContent, /Mật khẩu hiện tại sẽ ngừng hoạt động/);
    assert.equal(calls.length, 1, "mới mở hộp thoại hỏi lại mà đã gọi máy chủ");

    await act(async () => button("Huỷ").click());
    assert.equal(calls.length, 1, "bấm Huỷ vẫn không được gọi máy chủ");

    await act(async () => button("Đặt lại mật khẩu").click());
    const confirmLabel = [...host.querySelectorAll(".hlt-admin-modal-foot button")].find((node) => node.textContent.trim() === "Đặt lại mật khẩu");
    await act(async () => confirmLabel.click());
    assert.equal(calls.length, 2);
    assert.equal(calls[1][1].action, "reset");
    assert.equal(calls[1][1].userId, "writer-1");
    assert.ok(calls[1][1].password.length >= 15);
    assert.match(host.textContent, /Đã đặt lại mật khẩu/);
  } finally {
    await act(async () => root.unmount());
  }
});

test("a schedule that lapsed while writing asks before going live, and never publishes silently", async () => {
  const saved = [];
  const insert = { select: () => insert, single: async () => ({ data: { id: "new" }, error: null }) };
  globalThis.__scheduleFixture = { supabase: {
    from: () => ({ insert: (row) => { saved.push(row); return insert; } }),
    storage: { from: () => ({ upload: async () => ({ error: null }) }) },
  }, blogImageUrl: () => "" };

  const Editor = await component("src/admin/ArticleEditor.jsx", "__scheduleFixture");
  const root = createRoot(host);
  const confirms = [];
  const realConfirm = window.confirm;
  try {
    await act(async () => root.render(React.createElement(Editor, { profile: { id: "w" }, onDone: () => {}, onCancel: () => {} })));
    await fill(host.querySelector('input[name="title"], .hlt-admin-field input'), "Bài thử");
    const when = host.querySelector('input[type="datetime-local"]');
    assert.ok(when, "phải có ô chọn giờ đăng");
    assert.ok(when.getAttribute("min"), "ô giờ đăng phải chặn mốc quá khứ bằng thuộc tính min");

    // Mốc giờ đã trôi qua: giao diện phải cảnh báo ngay, không đợi tới lúc lưu.
    const pad = (n) => String(n).padStart(2, "0");
    const past = new Date(Date.now() - 60 * 60 * 1000);
    const local = `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}T${pad(past.getHours())}:${pad(past.getMinutes())}`;
    await fill(when, local);
    assert.match(host.textContent, /đã trôi qua/);

    await typeInEditor(host.querySelector(".hlt-rte-area"), "<p>Nội dung thử</p>");
    const publish = [...host.querySelectorAll("button")].find((node) => /Đăng bài|Lưu và hẹn lịch/.test(node.textContent));

    // Bấm Cancel ở câu hỏi thì tuyệt đối không được ghi gì.
    window.confirm = (message) => { confirms.push(message); return false; };
    await act(async () => publish.click());
    assert.equal(confirms.length, 1);
    assert.match(confirms[0], /đã trôi qua/);
    assert.equal(saved.length, 0, "người dùng đã từ chối mà bài vẫn được ghi");

    // Bấm OK thì mới ghi, và ghi đúng mốc giờ đã chọn.
    window.confirm = () => true;
    await act(async () => publish.click());
    assert.equal(saved.length, 1);
    assert.equal(saved[0].status, "published");
    assert.equal(new Date(saved[0].publish_at).toISOString(), new Date(local).toISOString());
  } finally {
    window.confirm = realConfirm;
    await act(async () => root.unmount());
    delete globalThis.__scheduleFixture;
  }
});

test("admin article list supports accent-insensitive search, sorting, scope, pagination and retry", async () => {
  let fail=false, fetched=0;
  const articles=Array.from({length:25},(_,i)=>({id:`row-${i}`,slug:`row-${i}`,title:i===0?'Đường đèo Sa Pa':`Bài ${String(i).padStart(2,'0')}`,author_id:i%2?'other':'self',status:i%3?'draft':'published',updated_at:new Date(2026,0,i+1).toISOString(),publish_at:i===24?new Date(Date.now()+3600000).toISOString():null,topics:[],destinations:['Sapa']}));
  const query={select:()=>query,order:()=>query,then:(resolve)=>{fetched++;return resolve({data:fail?null:articles,error:fail?{message:'Offline failed'}:null});}};
  globalThis.__articleUxFixture={supabase:{from:()=>query},blogImageUrl:()=>''};
  const List=await component('src/admin/ArticleList.jsx','__articleUxFixture');const root=createRoot(host);const props={profile:{id:'self'},onEdit:()=>{},onNew:()=>{},reloadKey:0};
  const click=async(label)=>act(async()=>[...host.querySelectorAll('button')].find(b=>b.textContent.trim()===label).click());
  try {
    await act(async()=>root.render(React.createElement(List,props)));assert.equal(host.querySelectorAll('.hlt-admin-row').length,20);assert.match(host.textContent,/1–20 \/ 25 bài/);
    await click('Tiếp →');assert.equal(host.querySelectorAll('.hlt-admin-row').length,5);
    await fill(host.querySelector('input[type=search]'),'duong deo');assert.equal(host.querySelectorAll('.hlt-admin-row').length,1);assert.match(host.textContent,/Đường đèo Sa Pa/);
    await fill(host.querySelector('input[type=search]'),'');
    const sort=host.querySelector('[aria-label="Sắp xếp bài viết"]');
    await act(async()=>{sort.value='oldest';sort.dispatchEvent(new window.Event('change',{bubbles:true}));});
    assert.match(host.querySelector('.hlt-admin-row-copy strong').textContent,/Đường đèo Sa Pa/);
    await click('Bài của tôi');assert.equal(host.querySelectorAll('.hlt-admin-row').length,13);assert.equal(host.querySelector('[aria-label="Phân trang bài viết"]'),null);
    assert.equal(host.querySelector('[aria-label="Phạm vi"] button').getAttribute('aria-pressed'),'true');
    fail=true;await act(async()=>root.render(React.createElement(List,{...props,reloadKey:1})));assert.equal(host.querySelectorAll('.hlt-admin-row').length,0);assert.ok(host.querySelector('[role=alert]'));
    const prior=fetched;fail=false;await click('Thử lại');assert.ok(fetched>prior);assert.equal(host.querySelector('[role=alert]'),null);
  } finally {await act(async()=>root.unmount());delete globalThis.__articleUxFixture;}
});

test("published editing saves without stale-schedule warnings, Ctrl+S stays published, unpublish requires confirmation", async () => {
  let saved=[],done=0;
  const article={id:'live',author_id:'self',title:'Existing live article',slug:'existing',body:'## Text\n',status:'published',publish_at:'2020-01-01T00:00:00Z'};
  const query={select:()=>query,eq:()=>query,maybeSingle:async()=>({data:article}),update:(payload)=>{saved.push(payload);return query;},single:async()=>({error:null})};
  globalThis.__publishedUxFixture={supabase:{from:()=>query},blogImageUrl:()=>''};
  const Editor=await component('src/admin/ArticleEditor.jsx','__publishedUxFixture');const root=createRoot(host);const confirm=window.confirm;let prompts=[];window.confirm=(text)=>{prompts.push(text);return false;};
  try {
    await act(async()=>root.render(React.createElement(Editor,{article,profile:{id:'self',role:'admin'},onDone:()=>done++,onCancel:()=>{}})));
    assert.doesNotMatch(host.textContent,/đã trôi qua/);assert.ok(host.querySelector('button[aria-label="Chèn ảnh"]'));
    assert.equal(host.querySelector('.hlt-admin-editor-meta').open,false);
    const saveShortcut=new window.KeyboardEvent('keydown',{key:'s',ctrlKey:true,bubbles:true,cancelable:true});
    await act(async()=>window.dispatchEvent(saveShortcut));assert.equal(saveShortcut.defaultPrevented,true);assert.equal(saved[0].status,'published');assert.equal(prompts.length,0);assert.equal(done,1);
    const unpublish=[...host.querySelectorAll('button')].find(b=>b.textContent==='Chuyển về nháp');
    await act(async()=>unpublish.click());assert.equal(prompts.length,1);assert.equal(saved.length,1);
    window.confirm=()=>true;await act(async()=>unpublish.click());assert.equal(saved[1].status,'draft');
  } finally {window.confirm=confirm;await act(async()=>root.unmount());delete globalThis.__publishedUxFixture;}
});

test("account search/filter and role confirmation keep self-protection and only write after approval", async () => {
  const people=[{id:'self',full_name:'Admin',email:'self@example.invalid',role:'admin',active:true},{id:'writer',full_name:'Đường Việt',email:'writer@example.invalid',role:'writer',active:true},{id:'locked',full_name:'Locked Writer',email:'locked@example.invalid',role:'writer',active:false}];
  const writes=[];let target;
  const query={select:()=>query,order:()=>query,then:resolve=>resolve({data:people}),update:patch=>{writes.push(patch);return query;},eq:(_,id)=>{target=id;return query;},single:async()=>{Object.assign(people.find(p=>p.id===target),writes.at(-1));return {error:null};}};
  globalThis.__accountUxFixture={supabase:{from:()=>query}};
  const Users=await component('src/admin/UserManager.jsx','__accountUxFixture');const root=createRoot(host);
  try {
    await act(async()=>root.render(React.createElement(Users,{profile:people[0]})));
    assert.equal(host.querySelector('select[aria-label="Vai trò của Admin"]').disabled,true);
    await fill(host.querySelector('input[type=search]'),'duong');assert.equal(host.querySelectorAll('tbody tr').length,1);
    const role=host.querySelector('tbody select');await act(async()=>{role.value='admin';role.dispatchEvent(new window.Event('change',{bubbles:true}));});
    assert.equal(writes.length,0);assert.match(host.querySelector('[role=dialog]').textContent,/quản lý tài khoản/);
    await act(async()=>[...host.querySelectorAll('.hlt-admin-modal-foot button')].find(b=>b.textContent==='Huỷ').click());assert.equal(writes.length,0);
    await act(async()=>{role.value='admin';role.dispatchEvent(new window.Event('change',{bubbles:true}));});
    await act(async()=>[...host.querySelectorAll('.hlt-admin-modal-foot button')].find(b=>b.textContent==='Xác nhận đổi vai trò').click());assert.deepEqual(writes,[{role:'admin'}]);
    await fill(host.querySelector('input[type=search]'),'');await act(async()=>[...host.querySelectorAll('[aria-label="Lọc tài khoản"] button')].find(b=>b.textContent==='Đã khoá').click());
    assert.equal(host.querySelectorAll('tbody tr').length,1);assert.match(host.querySelector('tbody').textContent,/Locked Writer/);
  } finally {await act(async()=>root.unmount());delete globalThis.__accountUxFixture;}
});

test("login password visibility is opt-in and credentials/autocomplete stay unchanged", async () => {
  const calls=[];globalThis.__loginUxFixture={supabase:{auth:{signInWithPassword:async(data)=>{calls.push(data);return {error:{message:'offline rejection'}};}}}};
  const Login=await component('src/admin/LoginScreen.jsx','__loginUxFixture');const root=createRoot(host);
  try {
    await act(async()=>root.render(React.createElement(Login)));
    const input=host.querySelector('input[autocomplete="current-password"]');assert.equal(input.type,'password');
    await fill(host.querySelector('input[type=email]'),'offline@example.invalid');await fill(input,'Offline-password-only');
    const reveal=host.querySelector('[aria-label="Hiện mật khẩu"]');await act(async()=>reveal.click());assert.equal(input.type,'text');assert.equal(input.value,'Offline-password-only');
    await act(async()=>host.querySelector('[aria-label="Ẩn mật khẩu"]').click());assert.equal(input.type,'password');
    await act(async()=>host.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
    assert.deepEqual(calls,[{email:'offline@example.invalid',password:'Offline-password-only'}]);assert.match(host.textContent,/Không đăng nhập được/);
  } finally {await act(async()=>root.unmount());delete globalThis.__loginUxFixture;}
});

test("account pagination and pending changes protect navigation/reload and release after completion", async () => {
  const people=Array.from({length:24},(_,i)=>({id:String(i),email:`offline${i}@example.invalid`,full_name:`Người ${i}`,role:i?'writer':'admin',active:true}));
  let finish,busy=false;const pending=new Promise(resolve=>{finish=resolve;});
  const query={select:()=>query,order:()=>query,then:resolve=>resolve({data:people}),update:()=>query,eq:()=>query,single:()=>pending};
  globalThis.__pendingUserFixture={supabase:{from:()=>query}};
  const Users=await component('src/admin/UserManager.jsx','__pendingUserFixture');const root=createRoot(host);
  try {
    await act(async()=>root.render(React.createElement(Users,{profile:people[0],onBusyChange:value=>{busy=value;}})));
    assert.equal(host.querySelectorAll('tbody tr').length,20);
    await act(async()=>[...host.querySelectorAll('[aria-label="Phân trang tài khoản"] button')].find(b=>b.textContent==='Tiếp →').click());assert.equal(host.querySelectorAll('tbody tr').length,4);
    await fill(host.querySelector('input[type=search]'),'offline1@example');assert.equal(host.querySelectorAll('tbody tr').length,1);
    await act(async()=>[...host.querySelectorAll('tbody button')].find(b=>b.textContent==='Khoá').click());
    await act(async()=>{[...host.querySelectorAll('.hlt-admin-modal-foot button')].find(b=>b.textContent==='Khoá tài khoản').click();});
    assert.equal(busy,true);assert.match(host.querySelector('[role=dialog]').textContent,/Đang khoá/);
    let unload=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(unload);assert.equal(unload.defaultPrevented,true);
    await act(async()=>finish({error:null}));assert.equal(busy,false);
    unload=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(unload);assert.equal(unload.defaultPrevented,false);
  } finally {await act(async()=>root.unmount());delete globalThis.__pendingUserFixture;}
});
