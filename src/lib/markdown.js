import DOMPurify from "dompurify";
import { marked } from "marked";

// Cùng một renderer cho preview và bài công khai. Không tin HTML do writer nhập.
export function renderMarkdown(markdown, purifier = DOMPurify) {
  return purifier.sanitize(marked.parse(markdown || "", { gfm: true, breaks: false }), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["form", "input", "button", "textarea", "select", "style", "iframe", "object", "embed", "base", "link", "meta", "audio", "video", "source"],
    FORBID_ATTR: ["style", "srcset", "target"],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
