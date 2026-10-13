// Bộ soạn thảo trực quan lưu Markdown: dựng HTML từ Markdown rồi chuyển ngược
// về Markdown phải giữ nguyên nội dung, và chỉ giữ những định dạng cho phép.
import assert from "node:assert/strict";
import test from "node:test";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { renderMarkdown } from "../src/lib/markdown.js";
import { changeCase, cleanPastedHtml, markdownFromEditor, safeLinkHref } from "../src/lib/rich-text.js";
import { createEditorHistory, captureEditorSelection, restoreEditorSelection } from "../src/lib/editor-history.js";

function withDom(run) {
  const window = new JSDOM("").window;
  try {
    return run(window, createDOMPurify(window));
  } finally {
    window.close();
  }
}

/* Markdown → HTML (như bộ soạn mở bài) → Markdown (như lúc lưu). */
function roundTrip(markdown, window, purifier) {
  const area = window.document.createElement("div");
  area.innerHTML = renderMarkdown(markdown, purifier);
  return markdownFromEditor(area);
}

const normalize = (html, window) => {
  const holder = window.document.createElement("div");
  holder.innerHTML = html;
  return holder.innerHTML.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
};

test("standalone images become captioned figures; placeholder and inline images do not", () => withDom((window, purifier) => {
  const html = renderMarkdown(
    "![Ruộng bậc thang <b>Sapa</b>](https://x.test/a.jpg)\n\n![Mô tả ảnh](https://x.test/b.jpg)\n\nText ![inline](https://x.test/c.jpg) more",
    purifier,
  );
  const document = new JSDOM(html).window.document;
  const figures = document.querySelectorAll("figure");
  assert.equal(figures.length, 2);
  // Chú thích là chữ thuần: thẻ HTML gõ vào mô tả ảnh không thành thẻ thật.
  assert.equal(figures[0].querySelector("figcaption").textContent, "Ruộng bậc thang <b>Sapa</b>");
  assert.equal(figures[0].querySelector("figcaption b"), null);
  // Chữ giữ chỗ cũ "Mô tả ảnh" không hiện thành chú thích.
  assert.equal(figures[1].querySelector("figcaption"), null);
  assert.equal(figures[1].querySelector("img").getAttribute("alt"), "");
  // Ảnh nằm trong câu giữ nguyên là ảnh thường.
  assert.equal(document.querySelector("p img").getAttribute("alt"), "inline");
}));

test("round trip keeps headings, emphasis, links, lists, quotes, tables, rules, breaks and images", () => withDom((window, purifier) => {
  const source = `# Big title

## Section

### Sub section

Plain with **bold**, *italic*, ***both***, a [link](https://example.com/path?q=1) and \`code\`.

Line one\\
line two after a hard break.

- First
- Second with **bold**
  - Nested item

1. One
2. Two

> Quoted *sentence*.

| Month | Weather |
| :---: | ---: |
| May | **Warm** |
| Dec | Cold \\| foggy |

---

![Bản Cát Cát lúc bình minh](https://x.test/img%20one.jpg)

Special chars: 5 * 3, under_score, [brackets], a < b > c, AT&T, # not a heading.
`;
  const first = renderMarkdown(source, purifier);
  const saved = roundTrip(source, window, purifier);
  const second = renderMarkdown(saved, purifier);
  assert.equal(normalize(second, window), normalize(first, window));
  // Lưu lần nữa không đổi gì (ổn định).
  assert.equal(roundTrip(saved, window, purifier), saved);
  const document = new JSDOM(second).window.document;
  assert.equal(document.querySelector("figure figcaption").textContent, "Bản Cát Cát lúc bình minh");
  assert.equal(document.querySelectorAll("table tr").length, 3);
  assert.equal(document.querySelector("th").getAttribute("align"), "center");
  assert.equal(document.querySelectorAll("td")[3].textContent, "Cold | foggy");
  assert.equal(document.querySelectorAll("br").length, 1);
  assert.equal(document.querySelectorAll("ul ul li").length, 1);
  assert.match(document.body.textContent, /Special chars: 5 \* 3, under_score, \[brackets\], a < b > c, AT&T, # not a heading\./);
}));

test("serializer keeps only whitelisted formatting and turns unsafe links into plain text", () => withDom((window) => {
  const area = window.document.createElement("div");
  area.innerHTML = [
    '<p style="color:red"><span style="font-size:30px;font-family:Comic Sans">Big red</span> <font color="blue">blue</font>',
    ' <b>bold</b> <u>under</u> <a href="javascript:alert(1)">bad link</a> <a href="/journey/hanoi-to-sapa-private-transfer/">good link</a></p>',
    '<figure contenteditable="false"><img src="https://x.test/a.jpg" alt="old"><figcaption>New caption</figcaption>',
    '<button data-rte-ui data-rte-remove>×</button></figure>',
  ].join("");
  const markdown = markdownFromEditor(area);
  assert.equal(
    markdown,
    "Big red blue **bold** under bad link [good link](/journey/hanoi-to-sapa-private-transfer/)\n\n![New caption](https://x.test/a.jpg)\n",
  );
}));

test("link targets: web, site, mail and phone are allowed; scripts and bare words are not", () => {
  assert.equal(safeLinkHref("https://hoangluxury.travel/booking/"), "https://hoangluxury.travel/booking/");
  assert.equal(safeLinkHref("hoangluxury.travel/booking/"), "https://hoangluxury.travel/booking/");
  assert.equal(safeLinkHref("/journey/hanoi-to-sapa-private-transfer/"), "/journey/hanoi-to-sapa-private-transfer/");
  assert.equal(safeLinkHref("mailto:hoangluxury.travel@gmail.com"), "mailto:hoangluxury.travel@gmail.com");
  assert.equal(safeLinkHref("tel:+84839779888"), "tel:+84839779888");
  assert.equal(safeLinkHref("#faq"), "#faq");
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<b>x</b>", "vbscript:x", "//evil.test", "hello world", "", "  "]) {
    assert.equal(safeLinkHref(bad), null, bad);
  }
});

test("pasted Google Docs HTML keeps real bold, italic and links but drops styles and the fake bold wrapper", () => withDom((window, purifier) => {
  const html = '<b style="font-weight:normal;" id="docs-internal-guid-x"><p dir="ltr" style="line-height:1.38">'
    + '<span style="font-size:11pt;font-weight:400">Plain </span><span style="font-weight:700">bold words</span>'
    + '<span style="font-weight:400"> and </span><a href="https://www.google.com/maps"><span style="color:#1155cc">map</span></a>'
    + '<span style="font-style:italic;font-weight:400"> tail</span><img src="x" onerror="alert(1)"><script>alert(2)</script></p></b>';
  const clean = cleanPastedHtml(html, purifier, window.document);
  assert.doesNotMatch(clean, /style=|docs-internal|onerror|<script|<img|<span/);
  const area = window.document.createElement("div");
  area.innerHTML = clean;
  assert.equal(markdownFromEditor(area), "Plain **bold words** and [map](https://www.google.com/maps) *tail*\n");
}));

test("case conversion keeps Vietnamese diacritics", () => {
  assert.equal(changeCase("đường đèo Ô Quy Hồ", "upper"), "ĐƯỜNG ĐÈO Ô QUY HỒ");
  assert.equal(changeCase("ĐƯỜNG ĐÈO Ô QUY HỒ", "lower"), "đường đèo ô quy hồ");
});

test("editing old articles preserves H1-H6, deletion, nested code backticks, language and list starts", () => withDom((window, purifier) => {
  const source = '# Legacy title\n\n#### Four\n\n##### Five\n\n###### Six\n\n~~Old price~~ and **~~bold deleted~~**, ``a ` b``.\n\n5. Fifth\n6. Sixth\n\n````js\nconst s = `test`;\nconst fence = "```";\n````\n';
  const saved = roundTrip(source, window, purifier);
  assert.equal(normalize(renderMarkdown(saved, purifier), window), normalize(renderMarkdown(source, purifier), window));
  assert.equal(roundTrip(saved, window, purifier), saved);
  const pasted = cleanPastedHtml('<h6>Six</h6><p><del>old</del></p><ol start="5"><li>Five</li></ol>', purifier, window.document);
  assert.match(pasted, /<h6>Six<\/h6>/);
  assert.match(pasted, /<del>old<\/del>/);
  assert.match(pasted, /start="5"/);
}));

test("bounded history groups typing, separates commands, and discards redo after a new edit", () => {
  const history = createEditorHistory({maxEntries:4});
  const snapshot = (html) => ({html,selection:null});
  history.reset(snapshot(''));
  history.record(snapshot('a'),'typing',100);
  history.record(snapshot('ab'),'typing',200);
  history.record(snapshot('<b>ab</b>'),'command',300);
  assert.equal(history.undo().html,'ab');
  assert.equal(history.undo().html,'');
  assert.equal(history.redo().html,'ab');
  history.record(snapshot('new'),'typing',400);
  assert.equal(history.canRedo(),false);
  for (let i=0;i<20;i++) history.record(snapshot(`command${i}`),'command',500+i);
  let undos=0; while(history.undo()) undos++;
  assert.equal(undos,3);
  const capped = createEditorHistory({maxBytes:60}); capped.reset(snapshot('x'.repeat(15)));
  for(let i=0;i<10;i++) capped.record(snapshot(String(i).repeat(15)));
  assert.ok(capped.undo()); assert.equal(capped.undo(),null);
});

test("history selection survives DOM reconstruction including captions and backwards selection", () => withDom((window) => {
  const root = window.document.createElement('div'); root.setAttribute('contenteditable','true');
  root.innerHTML='<p>Before <b>bold</b></p><figure contenteditable="false"><figcaption contenteditable="true">Mô tả ảnh</figcaption></figure>';
  window.document.body.append(root);
  const text=root.querySelector('figcaption').firstChild;
  window.getSelection().setBaseAndExtent(text,5,text,1);
  const saved=captureEditorSelection(root);
  root.innerHTML=root.innerHTML;
  restoreEditorSelection(root,saved);
  assert.equal(window.getSelection().anchorOffset,5);
  assert.equal(window.getSelection().focusOffset,1);
  assert.equal(window.getSelection().toString(),'ô tả');
  assert.equal(window.document.activeElement.tagName,'FIGCAPTION');
}));
