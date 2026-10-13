import DOMPurify from "dompurify";
import { Marked } from "marked";

/* Chữ giữ chỗ cũ khi chèn ảnh ("![Mô tả ảnh](…)"). Không phải mô tả thật nên
   không hiện thành chú thích dưới ảnh. */
export const imageCaptionPlaceholder = "Mô tả ảnh";

export const imageCaption = (alt) => {
  const text = String(alt || "").replace(/\s+/g, " ").trim();
  return text === imageCaptionPlaceholder ? "" : text;
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

/* Bản Marked riêng (không sửa đối tượng marked dùng chung). Ảnh đứng một mình
   thành một đoạn được dựng thành <figure>, mô tả ảnh (alt) hiện thành chú thích
   chữ nhỏ bên dưới. Ảnh nằm lẫn trong câu chữ giữ nguyên như cũ. */
const markdown = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    paragraph({ tokens }) {
      const parts = tokens.filter((token) => !(token.type === "text" && !token.raw.trim()));
      if (parts.length !== 1 || parts[0].type !== "image") return false;
      const { href, text } = parts[0];
      const caption = imageCaption(text);
      return `<figure><img src="${escapeHtml(href)}" alt="${escapeHtml(caption)}">${
        caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""
      }</figure>\n`;
    },
  },
});

// Cùng một renderer cho preview, bộ soạn thảo và bài công khai. Không tin HTML do writer nhập.
export function renderMarkdown(source, purifier = DOMPurify) {
  return purifier.sanitize(markdown.parse(source || ""), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["form", "input", "button", "textarea", "select", "style", "iframe", "object", "embed", "base", "link", "meta", "audio", "video", "source"],
    FORBID_ATTR: ["style", "srcset", "target"],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
