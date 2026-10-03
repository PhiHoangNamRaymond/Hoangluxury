// Real React components in jsdom, with Auth API stubbed. No account/password changes.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { transformWithEsbuild } from "vite";

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
  let source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  source = source.replace(/import \{[^}]+\} from "\.\.\/lib\/supabase\.js";/,
    `const { supabase, supabaseReady, initialAuthFlow } = globalThis.${stubName};`)
    .replaceAll('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
    .replace('from "../lib/auth-flow.js"', `from ${JSON.stringify(new URL("../src/lib/auth-flow.js", import.meta.url).href)}`);
  const { code } = await transformWithEsbuild(source, path, { loader: path.endsWith("jsx") ? "jsx" : "js", jsx: "transform" });
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;
}

async function fill(input, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(input, value);
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
      await act(async () => root.render(React.createElement(PasswordScreen, { flow, session: { user: { email: "test@example.invalid" } }, onDone: () => {} })));
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
      assert.deepEqual(calls.at(-1), ["update", { password: "New-fixture-password-123!" }]);
      if (flow === "change") assert.deepEqual(calls.at(-2), ["signIn", { email: "test@example.invalid", password: "current-fixture-password" }]);
    } finally { await act(async () => root.unmount()); }
  }
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
    assert.equal(result.flow, "recovery");
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
    assert.equal(result.flow, "recovery");
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
