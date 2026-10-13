// Chuyển nội dung bộ soạn thảo trực quan (DOM contenteditable) về Markdown để
// lưu. Chỉ hiểu một danh sách thẻ cố định; mọi thứ khác (span, font, style dán
// từ Word/Google Docs…) bị bỏ, chỉ giữ chữ. Markdown lưu xong vẫn đi qua
// renderMarkdown + DOMPurify khi hiển thị, nên đây không phải lớp bảo mật duy
// nhất — nhưng nó bảo đảm thứ được lưu gọn và đúng những gì thanh công cụ làm ra.

import DOMPurify from "dompurify";
import { imageCaption } from "./markdown.js";

const ELEMENT = 1;
const TEXT = 3;

/* Phần tử chỉ để thao tác trong bộ soạn (nút xoá ảnh…), không phải nội dung. */
const isEditorUi = (node) => node.nodeType === ELEMENT && node.hasAttribute("data-rte-ui");

const BLOCK_TAGS = new Set([
  "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE",
  "FIGURE", "HR", "TABLE", "PRE", "SECTION", "ARTICLE",
]);
const isBlock = (node) => node.nodeType === ELEMENT && BLOCK_TAGS.has(node.tagName);

/* Đường dẫn được phép gắn vào chữ: web, đường dẫn trong site, email, điện thoại,
   neo trong trang. Gõ "hoangluxury.travel/…" thiếu https:// thì tự thêm. */
export function safeLinkHref(input) {
  const value = String(input || "").trim();
  if (!value || /\s/.test(value)) return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) {
    try {
      const url = new URL(value);
      return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i.test(value)) return safeLinkHref(`https://${value}`);
  return null;
}

/* Chữ thường trong câu: thoát các ký tự Markdown để chúng hiện đúng như gõ. */
const escapeText = (text) => text
  .replace(/\\/g, "\\\\")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/([*_`[\]~|])/g, "\\$1");

/* Ký tự đầu đoạn có thể bị hiểu thành tiêu đề / danh sách / trích dẫn. */
const escapeLineStart = (line) => line
  .replace(/^(\s*)([#+-])/, "$1\\$2")
  .replace(/^(\s*\d+)([.)])/, "$1\\$2");

const escapeAlt = (text) => imageCaption(text).replace(/\\/g, "\\\\").replace(/([[\]])/g, "\\$1");
const escapeUrl = (url) => String(url).replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");

const imageMarkdown = (src, alt) => (src ? `![${escapeAlt(alt)}](${escapeUrl(src)})` : "");

/* Bọc **đậm** / *nghiêng*: dấu phải dính liền chữ, nên đẩy khoảng trắng đầu
   và cuối ra ngoài, nếu không Markdown sẽ không nhận. */
function wrapInline(content, marker) {
  const match = content.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match[2]) return content;
  return `${match[1]}${marker}${match[2]}${marker}${match[3]}`;
}

function inline(nodes, context = {}) {
  let out = "";
  for (const node of nodes) {
    if (node.nodeType === TEXT) {
      out += escapeText(node.data.replace(/\s+/g, " "));
      continue;
    }
    if (node.nodeType !== ELEMENT || isEditorUi(node)) continue;
    const tag = node.tagName;
    const children = [...node.childNodes];
    if (tag === "BR") {
      out += "\\\n";
    } else if (tag === "STRONG" || tag === "B") {
      out += context.bold ? inline(children, context) : wrapInline(inline(children, { ...context, bold: true }), "**");
    } else if (tag === "EM" || tag === "I") {
      out += context.italic ? inline(children, context) : wrapInline(inline(children, { ...context, italic: true }), "*");
    } else if (["DEL", "S", "STRIKE"].includes(tag)) {
      out += context.strike ? inline(children, context) : wrapInline(inline(children, { ...context, strike: true }), "~~");
    } else if (tag === "A") {
      const href = safeLinkHref(node.getAttribute("href"));
      const text = inline(children, { ...context, link: true });
      out += href && text.trim() && !context.link ? `[${text}](${escapeUrl(href)})` : text;
    } else if (tag === "CODE") {
      const code = node.textContent;
      const longest = Math.max(0, ...(code.match(/`+/g) || []).map((run) => run.length));
      const delimiter = "`".repeat(longest + 1);
      const padding = /^`|`$/.test(code) || (/^ .* $/.test(code) && /\S/.test(code)) ? " " : "";
      out += code ? `${delimiter}${padding}${code}${padding}${delimiter}` : "";
    } else if (tag === "IMG") {
      out += imageMarkdown(node.getAttribute("src"), node.getAttribute("alt"));
    } else if (isBlock(node)) {
      // Khối lọt vào giữa câu (dán từ nơi khác): gộp thành chữ liền mạch.
      out += ` ${inline(children, context)} `;
    } else {
      out += inline(children, context);
    }
  }
  return out;
}

const cleanInline = (text) => text.replace(/[ \t]+/g, " ").replace(/ ?\\\n ?/g, "\\\n").replace(/^(\\\n)+|(\\\n)+$/g, "").trim();

function paragraph(nodes) {
  const text = cleanInline(inline(nodes));
  return text ? text.split("\n").map(escapeLineStart).join("\n") : "";
}

function figure(node) {
  const img = node.querySelector("img");
  if (!img) return "";
  const caption = node.querySelector("figcaption");
  return imageMarkdown(img.getAttribute("src"), caption ? caption.textContent : img.getAttribute("alt"));
}

function list(node) {
  const ordered = node.tagName === "OL";
  const lines = [];
  let index = ordered ? (Number(node.getAttribute("start")) || 1) - 1 : 0;
  for (const item of node.children) {
    if (item.tagName !== "LI") continue;
    index += 1;
    const marker = ordered ? `${index}. ` : "- ";
    const own = [];
    const nested = [];
    for (const child of item.childNodes) {
      if (child.nodeType === ELEMENT && (child.tagName === "UL" || child.tagName === "OL")) nested.push(child);
      else own.push(child);
    }
    lines.push(marker + cleanInline(inline(own)).replace(/\n/g, `\n${" ".repeat(marker.length)}`));
    for (const sub of nested) {
      lines.push(list(sub).split("\n").map((line) => " ".repeat(marker.length) + line).join("\n"));
    }
  }
  return lines.join("\n");
}

function table(node) {
  const rows = [...node.querySelectorAll("tr")];
  if (!rows.length) return "";
  const cell = (element) => cleanInline(inline([...element.childNodes])).replace(/\\\n/g, " ").replace(/\n/g, " ") || " ";
  const width = Math.max(...rows.map((row) => row.children.length));
  const pad = (cells) => [...cells, ...Array(width - cells.length).fill(" ")];
  const header = pad([...rows[0].children].map(cell));
  const align = pad([...rows[0].children].map((element) => {
    const value = (element.getAttribute("align") || "").toLowerCase();
    if (value === "center") return ":---:";
    if (value === "right") return "---:";
    if (value === "left") return ":---";
    return "---";
  })).map((value) => (value === " " ? "---" : value));
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [line(header), line(align), ...rows.slice(1).map((row) => line(pad([...row.children].map(cell))))].join("\n");
}

function block(node) {
  const tag = node.tagName;
  if (/^H[1-6]$/.test(tag)) {
    const text = cleanInline(inline([...node.childNodes])).replace(/\\\n/g, " ");
    return text ? `${"#".repeat(Number(tag[1]))} ${text}` : "";
  }
  if (tag === "UL" || tag === "OL") return list(node);
  if (tag === "BLOCKQUOTE") {
    const inner = blocks(node);
    return inner ? inner.split("\n").map((line) => (line ? `> ${line}` : ">")).join("\n") : "";
  }
  if (tag === "FIGURE") return figure(node);
  if (tag === "HR") return "---";
  if (tag === "TABLE") return table(node);
  if (tag === "PRE") {
    const code = node.textContent.replace(/\n$/, "");
    const language = node.querySelector("code")?.className.match(/(?:^|\s)language-([a-z0-9_+-]+)/i)?.[1] || "";
    const longest = Math.max(0, ...(code.match(/`+/g) || []).map((run) => run.length));
    const fence = "`".repeat(Math.max(3, longest + 1));
    return code ? `${fence}${language}\n${code}\n${fence}` : "";
  }
  // P, DIV, SECTION…: DIV/SECTION có thể chứa khối con (trình duyệt tự tạo).
  if ([...node.childNodes].some(isBlock)) return blocks(node);
  return paragraph([...node.childNodes]);
}

function blocks(root) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length) out.push(paragraph(run));
    run = [];
  };
  for (const node of root.childNodes) {
    if (isEditorUi(node)) continue;
    if (isBlock(node)) {
      flush();
      out.push(block(node));
    } else if (node.nodeType === ELEMENT && node.tagName === "IMG") {
      flush();
      out.push(imageMarkdown(node.getAttribute("src"), node.getAttribute("alt")));
    } else {
      run.push(node);
    }
  }
  flush();
  return out.filter(Boolean).join("\n\n");
}

/** DOM của bộ soạn thảo → Markdown để lưu. */
export function markdownFromEditor(root) {
  const text = blocks(root);
  return text ? `${text}\n` : "";
}

/* Dán từ Google Docs / Word: giữ đậm, nghiêng, link, tiêu đề, danh sách; bỏ hết
   font, màu, cỡ chữ. Google Docs bọc cả đoạn trong <b style="font-weight:normal">
   — không phải chữ đậm thật, phải gỡ ra trước khi lọc style. */
export function cleanPastedHtml(html, purifier = DOMPurify, documentRef = document) {
  const holder = documentRef.createElement("div");
  holder.innerHTML = purifier.sanitize(html, { RETURN_TRUSTED_TYPE: false, FORBID_TAGS: ["style", "script"] });
  for (const element of [...holder.querySelectorAll("b, strong, span, i, em")]) {
    const style = (element.getAttribute("style") || "").toLowerCase();
    const weight = (style.match(/font-weight\s*:\s*([a-z0-9]+)/) || [])[1];
    const isBold = weight && (weight === "bold" || Number(weight) >= 600);
    const isNormal = weight && (weight === "normal" || Number(weight) <= 500);
    const isItalic = /font-style\s*:\s*italic/.test(style);
    let target = element;
    if ((element.tagName === "B" || element.tagName === "STRONG") && isNormal) {
      target = documentRef.createElement("span");
      target.append(...element.childNodes);
      element.replaceWith(target);
    }
    if (target.tagName === "SPAN" && isBold) {
      const strong = documentRef.createElement("strong");
      strong.append(...target.childNodes);
      target.append(strong);
    }
    if (target.tagName === "SPAN" && isItalic) {
      const em = documentRef.createElement("em");
      em.append(...target.childNodes);
      target.append(em);
    }
  }
  return purifier.sanitize(holder.innerHTML, {
    ALLOWED_TAGS: ["p", "br", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "del", "s", "a", "ul", "ol", "li", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "pre", "code", "hr"],
    ALLOWED_ATTR: ["href", "start", "align"],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

/* IN HOA / in thường theo tiếng Việt (giữ đúng dấu). */
export const changeCase = (text, mode) => (mode === "upper" ? text.toLocaleUpperCase("vi") : text.toLocaleLowerCase("vi"));
