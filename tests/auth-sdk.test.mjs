// Actual installed SDK + app configuration with fixture env/storage, no network.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
const require=createRequire(import.meta.url);

test("public and admin URLs cannot silently replace a persisted account via implicit callback",async () => {
  const originalFetch=globalThis.fetch;
  const source=await readFile(new URL("../src/lib/supabase.js",import.meta.url),"utf8");
  const session={user:{id:"existing-admin",email:"admin@example.invalid"},expires_at:Math.floor(Date.now()/1000)+3600,access_token:"offline-stored-token",refresh_token:"offline-refresh",token_type:"bearer"};
  for(const pathname of ["/blog/","/admin/"]) {
    const dom=new JSDOM("",{url:`https://fixture.invalid${pathname}#access_token=attacker-fixture&refresh_token=attacker-refresh&type=recovery&expires_in=3600&token_type=bearer`});
    globalThis.window=dom.window; globalThis.document=dom.window.document; globalThis.localStorage=dom.window.localStorage;
    globalThis.__sdkEnv={VITE_SUPABASE_URL:"https://fixture.supabase.co",VITE_SUPABASE_ANON_KEY:"sb_publishable_offline_fixture"};
    globalThis.fetch=async()=>{throw new Error("This test must never contact a service");};
    const key="sb-fixture-auth-token";
    window.localStorage.setItem(key,JSON.stringify(session));
    const transformed=source.replaceAll("import.meta.env","globalThis.__sdkEnv")
      .replace('from "@supabase/supabase-js"',`from ${JSON.stringify(pathToFileURL(require.resolve("@supabase/supabase-js")).href)}`)
      .replace(/from "(\.\/[^\"]+)"/g,(_match,relative)=>`from ${JSON.stringify(new URL(relative,new URL("../src/lib/supabase.js",import.meta.url)).href)}`);
    let module;
    try {
      module=await import(`data:text/javascript;base64,${Buffer.from(transformed+`\n// ${pathname}`).toString("base64")}`);
      if(pathname==="/blog/") {assert.equal(module.supabase,null);assert.equal(module.callbackSupabase,null);}
      else assert.equal((await module.supabase.auth.getSession()).data.session.user.id,"existing-admin");
      assert.equal(JSON.parse(window.localStorage.getItem(key)).user.id,"existing-admin");
      assert.equal(window.location.hash,""); assert.equal(module.initialAuthFlow.flow,"");
      assert.ok(module.initialAuthFlow.error);
    } finally {
      for(const client of [module?.supabase,module?.callbackSupabase,module?.publicSupabase]) {
        client?.auth.stopAutoRefresh(); client?.auth.broadcastChannel?.close();
        if(client?.auth.broadcastChannel) client.auth.broadcastChannel=null;
      }
      dom.window.close(); delete globalThis.window; delete globalThis.document; delete globalThis.localStorage; delete globalThis.__sdkEnv;
      globalThis.fetch=originalFetch;
    }
  }
});
