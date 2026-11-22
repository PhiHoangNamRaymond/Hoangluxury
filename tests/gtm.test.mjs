import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { GTM_ID, setupGtm } from "../src/lib/gtm.js";

const page = (path = "/") => new JSDOM("<!doctype html><html><head></head><body></body></html>", { url: `https://hoangluxury.travel${path}` }).window;

test("GTM loads once on public pages with the container's gtag snippet", () => {
  const win = page("/routes/");
  try {
    assert.equal(setupGtm(win), true);
    assert.equal(setupGtm(win), true);
    const scripts = win.document.querySelectorAll("script");
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
    assert.equal(scripts[0].async, true);
    assert.equal(win.dataLayer.length, 1);
    assert.equal(win.dataLayer[0][0], "js");
  } finally { win.close(); }
});

test("GTM is not loaded on admin pages or with an invalid id", () => {
  for (const path of ["/admin", "/admin/", "/admin/writer"]) {
    const win = page(path);
    try {
      assert.equal(setupGtm(win), false);
      assert.equal(win.document.querySelector("script"), null);
      assert.equal(win.dataLayer, undefined);
    } finally { win.close(); }
  }
  const win = page();
  try { assert.equal(setupGtm(win, { id: "GTM-<x>" }), false); } finally { win.close(); }
});
