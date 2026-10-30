import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { setupContentProtection } from '../src/lib/content-protection.js';

function fixture(path = '/') {
  const dom = new JSDOM(`<div id="root"><main><p id="story">Original travel content</p>
    <a id="contact" href="tel:123">123</a><a href="/album"><img id="photo" src="/photo.webp"></a>
    <input id="phone" value="123"><textarea id="notes">My trip</textarea>
    <div id="editor" contenteditable="true">Editing</div>
    <p id="booking-id" data-allow-copy>HLT-301026-RKS001-001</p></main></div>
    <p id="outside">Outside app</p>`, { url: `https://hoangluxury.travel${path}` });
  const doc = dom.window.document;
  const fire = (id, type) => {
    const e = new dom.window.Event(type, { bubbles: true, cancelable: true });
    doc.getElementById(id).dispatchEvent(e); return e;
  };
  return { dom, doc, fire };
}

test('public content deters ordinary copying and media dragging without blocking links or editing', () => {
  const { dom, doc, fire } = fixture();
  try {
    const cleanup = setupContentProtection(doc);
    for (const type of ['copy', 'contextmenu', 'dragstart']) assert.equal(fire('story', type).defaultPrevented, true);
    for (const type of ['contextmenu', 'dragstart']) assert.equal(fire('photo', type).defaultPrevented, true);
    for (const id of ['phone', 'notes', 'editor', 'booking-id', 'contact', 'outside']) {
      for (const type of ['copy', 'contextmenu', 'dragstart']) assert.equal(fire(id, type).defaultPrevented, false, `${id}: ${type}`);
    }
    // Browser copy events can target the document rather than the selected node.
    const range = doc.createRange(); range.selectNodeContents(doc.getElementById('story'));
    doc.getSelection().removeAllRanges(); doc.getSelection().addRange(range);
    const copy = new dom.window.Event('copy', { bubbles: true, cancelable: true });
    doc.dispatchEvent(copy); assert.equal(copy.defaultPrevented, true);
    cleanup();
    assert.equal(doc.getElementById('root').classList.contains('hlt-content-protected'), false);
    assert.equal(fire('photo', 'contextmenu').defaultPrevented, false);
  } finally { dom.window.close(); }
});

test('admin routes, disabled setup and developer shortcuts are not locked', () => {
  for (const path of ['/admin/', '/admin/writer']) {
    const { dom, doc, fire } = fixture(path);
    try { setupContentProtection(doc); assert.equal(fire('story', 'copy').defaultPrevented, false); }
    finally { dom.window.close(); }
  }
  const { dom, doc, fire } = fixture();
  try {
    setupContentProtection(doc, { enabled: false });
    assert.equal(fire('story', 'copy').defaultPrevented, false);
    setupContentProtection(doc);
    const key = new dom.window.KeyboardEvent('keydown', { key: 'F12', bubbles: true, cancelable: true });
    doc.dispatchEvent(key); assert.equal(key.defaultPrevented, false);
  } finally { dom.window.close(); }
});
