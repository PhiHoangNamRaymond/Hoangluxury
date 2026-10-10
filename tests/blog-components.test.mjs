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
    articles:[...host.querySelectorAll(".hlt-blog-card h3")].map((heading) => heading.textContent),
    results:host.querySelector(".hlt-blog-results")?.textContent,
  });
  try {
    for (const initial of [null,"Sapa","Ha Long"]) {
      let expected;
      for (const trigger of ["filter","card"]) {
        const root = createRoot(host);
        try {
          await act(async () => root.render(React.createElement(BlogPage)));
          const story = host.querySelector('.hlt-blog-story-cta');
          assert.equal(story.getAttribute('aria-labelledby'), 'blog-story-title');
          assert.equal(story.querySelector('.hlt-blog-story-eyebrow').textContent, 'LOCAL EXPERIENCE. MEANINGFUL JOURNEY');
          assert.equal(story.querySelector('h2').textContent, 'Discover Vietnam in Your Own Way');
          assert.equal(story.querySelector('.hlt-blog-story-description').textContent, 'Our stories go beyond the destinations — they’re about people, culture and the moments that make travel truly meaningful.');
          assert.equal(story.querySelector('a').textContent, 'Explore Our Story');
          assert.equal(story.querySelector('a').getAttribute('href'), '/about/');
          assert.equal(story.querySelectorAll('a').length, 1);
          assert.match(story.style.backgroundImage, /fixture-blog-sunrise/);
          const plan = host.querySelector(".hlt-blog-plan");
          assert.equal(plan.querySelector("h2").textContent,"EXPLORE VIETNAM");
          assert.equal(plan.querySelector("p").textContent,"More Than a Destination. Travel is also about the people you meet, the culture you experience and the stories you remember long after the journey.");
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
          if (trigger === "filter") expected=snapshot();
          else {
            assert.deepEqual(snapshot(),expected,"same toggle, combined filters, sort and pagination as Destinations");
            assert.equal(card.getAttribute("aria-pressed"),destinationButton("Sapa").getAttribute("aria-pressed"));
            assert.equal(scrolls.length,1);
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
    assert.equal(cta.querySelector('h2').textContent, 'Every Journey Begins with a Conversation?');
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

    const body = host.querySelector("textarea.hlt-admin-body");
    await fill(body, "Nội dung thử");
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
