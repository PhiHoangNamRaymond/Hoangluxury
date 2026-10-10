// Offline React regressions: mocked CAPTCHA and fetch, never writes a real Sheet.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { transformWithEsbuild } from "vite";

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', {url:"http://localhost:5173/feedback/"});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const proxyUrl = "https://fixture.supabase.co/functions/v1/forms-proxy";
const fileUrl = new URL("../src/FeedbackPage.jsx", import.meta.url);
let source = await readFile(fileUrl,"utf8");
source = source
  .replace('from "react"', `from ${JSON.stringify(pathToFileURL(require.resolve("react")).href)}`)
  .replace('import Header from "./components/layout/Header.jsx";', 'const Header = () => null;')
  .replace('import Footer from "./components/layout/Footer.jsx";', 'const Footer = () => null;')
  .replace('import ExperienceSlider from "./components/home/ExperienceSlider.jsx";', 'const ExperienceSlider = () => null;')
  .replace(/import \{[^}]+\} from "\.\/config\/assets.js";/,
    'const curatedMountainDecorationUrl="/fixture.png", servicesBackgroundUrl="/fixture.png", feedbackReviewImages=Array(8).fill("/fixture.png"), feedbackStatIcons=Array(4).fill("/fixture.png");')
  .replace('import usePageEntered from "./hooks/usePageEntered.js";', 'const usePageEntered = () => true;')
  .replace('import Turnstile from "./components/Turnstile.jsx";', `
    function Turnstile({onToken,resetKey}) {
      useEffect(() => { onToken(""); }, [onToken,resetKey]);
      return <button type="button" data-fixture-captcha onClick={() => onToken("offline-token")}>Offline verification</button>;
    }`)
  .replace("import.meta.env.VITE_FORMS_PROXY_URL", JSON.stringify(proxyUrl))
  .replace(/from "(\.\/lib\/[^\"]+)"/g, (_match,relative) => `from ${JSON.stringify(new URL(relative,fileUrl).href)}`);
const {code} = await transformWithEsbuild(source,"FeedbackPage.jsx",{loader:"jsx",jsx:"transform"});
const FeedbackPage = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;

async function fill(input,value) {
  await act(async () => {
    const prototype = input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype,"value").set.call(input,value);
    input.dispatchEvent(new window.Event("input",{bubbles:true}));
  });
}
async function fillFeedback(host) {
  await fill(host.querySelector('input[name="bookingId"]'),"test");
  await fill(host.querySelector('textarea[name="experience"]'),"A comfortable journey.");
  await act(async () => host.querySelector('input[name="rating"][value="5"]').click());
}
async function verify(host) {
  await act(async () => host.querySelector("[data-fixture-captcha]").click());
}

test("public Feedback opens from navigation without autofill and submits manual fields after CAPTCHA",async () => {
  const originalFetch = globalThis.fetch;
  try {
    for(const path of ["/feedback/","/feedback/?bookingId=OLD-ID&token=obsolete-fixture-token"]) {
      window.history.replaceState(null,"",path);
      document.body.innerHTML='<div id="root"></div>';
      const host = document.getElementById("root");
      const calls = [];
      globalThis.fetch = async (url,options) => { calls.push({url,fields:Object.fromEntries(options.body)}); return Response.json({ok:true}); };
      const root = createRoot(host);
      try {
        await act(async () => root.render(React.createElement(React.StrictMode,null,React.createElement(FeedbackPage))));
        assert.equal(host.querySelector('input[name="bookingId"]').value,"");
        assert.doesNotMatch(host.textContent,/personal feedback link/);
        assert.equal(window.location.search,"");
        const button = host.querySelector('button[type="submit"]');
        assert.equal(button.disabled,true,"CAPTCHA remains mandatory");
        await fillFeedback(host);
        assert.equal(button.disabled,true);
        assert.equal(host.querySelector('textarea[name="experience"]').maxLength,4000);
        await verify(host);
        assert.equal(button.disabled,false,"no invitation required after verification");
        assert.equal(host.querySelector("form").checkValidity(),true);
        await act(async () => button.click());
        assert.equal(calls.length,1);
        assert.equal(calls[0].url,proxyUrl);
        assert.equal(calls[0].fields.form,"feedback");
        assert.equal(calls[0].fields.bookingId,"test");
        assert.equal(calls[0].fields.rating,"5");
        assert.equal(calls[0].fields.feedback,"A comfortable journey.");
        assert.equal(calls[0].fields.turnstileToken,"offline-token");
        assert.equal("feedbackToken" in calls[0].fields,false);
        assert.match(calls[0].fields.requestId,/^[a-f0-9-]{36}$/);
        assert.match(host.textContent,/Your feedback has been sent/);
        assert.equal(host.querySelector('[role="dialog"]').getAttribute("aria-labelledby"),"feedback-success-title");
        assert.equal(host.querySelector(".hlt-feedback-submit-note.is-success"),null,"success uses the Booking-style popup, not duplicate inline text");
        assert.equal(button.disabled,true,"completed submission cannot be sent again accidentally");
      } finally { await act(async () => root.unmount()); }
    }
  } finally { globalThis.fetch = originalFetch; }
});

test("public Feedback rejects missing or whitespace-only fields without sending a request",async () => {
  window.history.replaceState(null,"","/feedback/");
  document.body.innerHTML='<div id="root"></div>';
  const host = document.getElementById("root");
  const root = createRoot(host);
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ok:true}); };
  try {
    await act(async () => root.render(React.createElement(FeedbackPage)));
    await verify(host);
    await act(async () => host.querySelector("form").dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true})));
    assert.equal(calls,0);
    assert.match(host.textContent,/Please enter your Booking ID/);
    await fillFeedback(host);
    await fill(host.querySelector('input[name="bookingId"]'),"   ");
    await act(async () => host.querySelector("form").dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true})));
    assert.equal(calls,0);
    assert.match(host.textContent,/Please enter your Booking ID/);
  } finally {
    await act(async () => root.unmount());
    globalThis.fetch = originalFetch;
  }
});

test("failed public Feedback keeps entered data and retries with the same request ID after new verification",async () => {
  window.history.replaceState(null,"","/feedback/");
  document.body.innerHTML='<div id="root"></div>';
  const host = document.getElementById("root");
  const root = createRoot(host);
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (_url,options) => { calls.push(Object.fromEntries(options.body)); return Response.json({ok:calls.length > 1}); };
  try {
    await act(async () => root.render(React.createElement(FeedbackPage)));
    await fillFeedback(host);
    await verify(host);
    const button = host.querySelector('button[type="submit"]');
    await act(async () => button.click());
    assert.equal(calls.length,1);
    assert.match(host.textContent,/We could not send your feedback/);
    assert.equal(host.querySelector('[role="dialog"]'),null,"failed acknowledgement never shows a success popup");
    assert.equal(host.querySelector('input[name="bookingId"]').value,"test");
    assert.equal(host.querySelector('textarea[name="experience"]').value,"A comfortable journey.");
    assert.equal(button.disabled,true,"failed request resets CAPTCHA, not entered data");
    await verify(host);
    await act(async () => button.click());
    assert.equal(calls.length,2);
    assert.equal(calls[0].requestId,calls[1].requestId);
    assert.match(host.textContent,/Your feedback has been sent/);
  } finally {
    await act(async () => root.unmount());
    globalThis.fetch = originalFetch;
  }
});

test("Feedback success popup waits for acknowledgement, traps focus and closes accessibly",async () => {
  const originalFetch = globalThis.fetch;
  const originalOverflow = document.body.style.overflow;
  try {
    for (const closeWith of ["done","close","backdrop","escape","unmount"]) {
      window.history.replaceState(null,"","/feedback/");
      document.body.innerHTML='<div id="root"></div>';
      document.body.style.overflow="scroll";
      const host = document.getElementById("root");
      const root = createRoot(host);
      let acknowledge;
      globalThis.fetch = () => new Promise((resolve) => { acknowledge=resolve; });
      try {
        await act(async () => root.render(React.createElement(React.StrictMode,null,React.createElement(FeedbackPage))));
        await fillFeedback(host);
        await verify(host);
        const submitButton = host.querySelector('button[type="submit"]');
        submitButton.focus();
        await act(async () => submitButton.click());
        assert.equal(host.querySelector('[role="dialog"]'),null,"no success before the server confirms it");
        assert.equal(document.body.style.overflow,"scroll");
        await act(async () => acknowledge(Response.json({ok:true})));
        const dialog = host.querySelector('[role="dialog"]');
        const done = dialog.querySelector(".hlt-book-success-done");
        const close = dialog.querySelector(".hlt-book-success-close");
        assert.equal(dialog.getAttribute("aria-modal"),"true");
        assert.match(dialog.textContent,/Feedback Received.*Thank You.*Your feedback has been sent/);
        assert.equal(dialog.parentElement.parentElement,host.firstElementChild,"overlay stays outside the animated main");
        assert.equal(document.body.style.overflow,"hidden");
        assert.equal(document.activeElement,done);
        assert.equal(host.querySelector('input[name="bookingId"]').value,"");
        assert.equal(host.querySelector('textarea[name="experience"]').value,"");
        assert.equal(host.querySelector('input[name="rating"]:checked'),null);
        await act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Tab",bubbles:true,cancelable:true})));
        assert.equal(document.activeElement,close);
        await act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Tab",shiftKey:true,bubbles:true,cancelable:true})));
        assert.equal(document.activeElement,done);
        await act(async () => dialog.dispatchEvent(new window.MouseEvent("mousedown",{bubbles:true})));
        assert.equal(host.querySelector('[role="dialog"]'),dialog,"clicking inside the popup does not dismiss it");
        await act(async () => {
          if (closeWith === "done") done.click();
          if (closeWith === "close") close.click();
          if (closeWith === "backdrop") dialog.parentElement.dispatchEvent(new window.MouseEvent("mousedown",{bubbles:true}));
          if (closeWith === "escape") document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true}));
          if (closeWith === "unmount") root.unmount();
        });
        assert.equal(host.querySelector('[role="dialog"]'),null);
        assert.equal(document.body.style.overflow,"scroll","restores the previous body scroll style");
        if (closeWith !== "unmount") {
          assert.equal(document.activeElement,host.querySelector('input[name="bookingId"]'));
          assert.equal(submitButton.disabled,true,"new submission still needs CAPTCHA verification");
        }
      } finally { if (closeWith !== "unmount") await act(async () => root.unmount()); }
    }
  } finally {
    globalThis.fetch=originalFetch;
    document.body.style.overflow=originalOverflow;
  }
});
