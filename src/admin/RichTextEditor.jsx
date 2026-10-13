import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { renderMarkdown, imageCaptionPlaceholder } from "../lib/markdown.js";
import { changeCase, cleanPastedHtml, markdownFromEditor, safeLinkHref } from "../lib/rich-text.js";
import AdminModal from "./AdminModal.jsx";
import { createEditorHistory, captureEditorSelection, restoreEditorSelection } from "../lib/editor-history.js";

/* Bộ soạn thảo trực quan cho nội dung bài. Gõ và định dạng như Word, nhưng
   giá trị vào / ra vẫn là Markdown: bài cũ, trang blog và lớp lọc DOMPurify
   giữ nguyên. Ảnh hiện dạng khung có dòng chú thích chữ nhỏ gõ ngay bên dưới. */

const CAPTION_HINT = "Gõ mô tả ảnh — hiện thành chữ nhỏ dưới ảnh";

const BLOCK_OPTIONS = [
  ["p", "Đoạn văn"],
  ["h2", "Tiêu đề lớn"],
  ["h3", "Tiêu đề vừa"],
  ["h4", "Tiêu đề cấp 4"],
  ["h5", "Tiêu đề cấp 5"],
  ["h6", "Tiêu đề cấp 6"],
];

/* Dùng lệnh định dạng sẵn của trình duyệt; lịch sử riêng phía dưới bao phủ cả
   lệnh này lẫn thay đổi DOM trực tiếp. Không dùng native undo song song. */
const run = (command, value = null) => {
  try {
    return typeof document.execCommand === "function" && document.execCommand(command, false, value);
  } catch {
    return false;
  }
};
const queryState = (command) => {
  try {
    return typeof document.queryCommandState === "function" && document.queryCommandState(command);
  } catch {
    return false;
  }
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function decorateFigure(figure, disabled = false) {
  figure.classList.add("hlt-rte-figure");
  figure.setAttribute("contenteditable", "false");
  let caption = figure.querySelector("figcaption");
  if (!caption) {
    caption = document.createElement("figcaption");
    figure.appendChild(caption);
  }
  if (caption.textContent.trim() === imageCaptionPlaceholder) caption.textContent = "";
  caption.setAttribute("contenteditable", String(!disabled));
  caption.setAttribute("tabindex", disabled ? "-1" : "0");
  caption.setAttribute("role", "textbox");
  caption.setAttribute("aria-label", "Chú thích ảnh");
  caption.setAttribute("data-placeholder", CAPTION_HINT);
  if (!figure.querySelector("[data-rte-remove]")) {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "hlt-rte-figure-remove";
    remove.setAttribute("data-rte-ui", "");
    remove.setAttribute("data-rte-remove", "");
    remove.setAttribute("aria-label", "Xoá ảnh");
    remove.title = "Xoá ảnh";
    remove.textContent = "×";
    figure.appendChild(remove);
  }
  figure.querySelector("[data-rte-remove]").disabled = disabled;
}

function buildFigure(src) {
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  figure.appendChild(img);
  decorateFigure(figure);
  return figure;
}

const emptyParagraph = () => {
  const p = document.createElement("p");
  p.appendChild(document.createElement("br"));
  return p;
};

function closestIn(area, node, test) {
  let current = node && node.nodeType === 3 ? node.parentNode : node;
  while (current && current !== area) {
    if (test(current)) return current;
    current = current.parentNode;
  }
  return null;
}

const topLevelBlock = (area, node) => closestIn(area, node, (element) => element.parentNode === area);

const RichTextEditor = forwardRef(function RichTextEditor(
  { value, onChange, onImageFile, imageAccept, imageHint, disabled = false, placeholder = "" },
  ref,
) {
  const areaRef = useRef(null);
  const lastValue = useRef(null);
  const savedRange = useRef(null);
  const fileRef = useRef(null);
  const history = useRef(createEditorHistory());
  const changing = useRef(false);
  const composing = useRef(false);
  const mounted = useRef(true);
  const [historyState, setHistoryState] = useState({ undo: false, redo: false });
  const [state, setState] = useState({ block: "p", bold: false, italic: false, ul: false, ol: false, quote: false, link: false });
  const [empty, setEmpty] = useState(!value);
  const [linkDialog, setLinkDialog] = useState(null);

  const syncHistory = useCallback(() => setHistoryState({ undo: history.current.canUndo(), redo: history.current.canRedo() }), []);
  const emit = useCallback((group = "command", record = true) => {
    const area = areaRef.current;
    if (!area) return;
    const markdown = markdownFromEditor(area);
    if (record && !composing.current) {
      history.current.record({ html: area.innerHTML, selection: captureEditorSelection(area) }, group);
      syncHistory();
    }
    lastValue.current = markdown;
    setEmpty(!area.textContent.trim() && !area.querySelector("img"));
    onChange(markdown);
  }, [onChange, syncHistory]);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const prepare = () => {
    const area = areaRef.current;
    if (area) history.current.selection(captureEditorSelection(area));
  };
  const mutate = (action) => {
    if (disabled || composing.current) return;
    prepare();
    changing.current = true;
    try { action(); } finally { changing.current = false; }
    emit();
  };
  const travelHistory = (direction) => {
    if (disabled || composing.current) return;
    const snapshot = history.current[direction]();
    if (!snapshot) return;
    const area = areaRef.current;
    area.innerHTML = snapshot.html;
    area.querySelectorAll("figure").forEach((figure) => decorateFigure(figure, disabled));
    restoreEditorSelection(area, snapshot.selection);
    const selection = window.getSelection();
    savedRange.current = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    emit("command", false);
    syncHistory();
  };

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return undefined;
    const beforeInput = (event) => {
      if (event.inputType === "historyUndo" || event.inputType === "historyRedo") {
        event.preventDefault();
        travelHistory(event.inputType === "historyUndo" ? "undo" : "redo");
      } else if (!composing.current && !changing.current) prepare();
    };
    // Native listener: React's beforeInput abstraction does not expose every
    // InputEvent on every browser (including mobile/context-menu undo).
    area.addEventListener("beforeinput", beforeInput);
    return () => area.removeEventListener("beforeinput", beforeInput);
  }, [disabled, emit]);

  /* Chỉ dựng lại DOM khi giá trị đổi từ bên ngoài (mở bài khác, tải bài xong).
     Giá trị do chính bộ soạn phát ra thì bỏ qua, không sẽ mất vị trí con trỏ. */
  useEffect(() => {
    const area = areaRef.current;
    if (!area || value === lastValue.current) return;
    area.innerHTML = renderMarkdown(value);
    area.querySelectorAll("figure").forEach((figure) => decorateFigure(figure, disabled));
    if (!area.firstChild) area.appendChild(emptyParagraph());
    lastValue.current = value;
    savedRange.current = null;
    history.current.reset({ html: area.innerHTML, selection: null });
    syncHistory();
    setEmpty(!area.textContent.trim() && !area.querySelector("img"));
  }, [value]);

  useEffect(() => {
    areaRef.current?.querySelectorAll("figure").forEach((figure) => decorateFigure(figure, disabled));
  }, [disabled]);

  const selectionRange = () => {
    const area = areaRef.current;
    const selection = window.getSelection?.();
    if (!area || !selection || !selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    return area.contains(range.commonAncestorContainer) ? range : null;
  };

  const rememberSelection = () => {
    const range = selectionRange();
    if (range) savedRange.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const range = savedRange.current;
    const area = areaRef.current;
    if (!range || !area || !area.contains(range.commonAncestorContainer)) return false;
    area.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  /* Trạng thái nút (đang đậm, đang là tiêu đề…) theo vị trí con trỏ. */
  useEffect(() => {
    const update = () => {
      const area = areaRef.current;
      const range = selectionRange();
      if (!area || !range) return;
      const node = range.startContainer;
      savedRange.current = range.cloneRange();
      const block = closestIn(area, node, (element) => /^(P|H[1-6])$/.test(element.tagName));
      const tag = block ? block.tagName.toLowerCase() : "p";
      setState({
        block: /^h[1-6]$/.test(tag) ? tag : "p",
        bold: queryState("bold") || Boolean(closestIn(area, node, (element) => /^(B|STRONG)$/.test(element.tagName))),
        italic: queryState("italic") || Boolean(closestIn(area, node, (element) => /^(I|EM)$/.test(element.tagName))),
        ul: Boolean(closestIn(area, node, (element) => element.tagName === "UL")),
        ol: Boolean(closestIn(area, node, (element) => element.tagName === "OL")),
        quote: Boolean(closestIn(area, node, (element) => element.tagName === "BLOCKQUOTE")),
        link: Boolean(closestIn(area, node, (element) => element.tagName === "A")),
      });
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  /* Nút thanh công cụ không lấy focus: giữ nguyên vùng chữ đang chọn. */
  const keepSelection = (event) => event.preventDefault();

  const command = (name, arg) => {
    restoreSelection();
    areaRef.current?.focus();
    mutate(() => run(name, arg));
  };

  const setBlock = (tag) => {
    areaRef.current?.focus();
    restoreSelection();
    mutate(() => run("formatBlock", `<${tag}>`));
  };

  /* Trích dẫn: bọc / gỡ khung <blockquote> quanh các khối đang chọn. Không dùng
     formatBlock vì nó thay luôn thẻ của khối — bật rồi tắt trích dẫn trên một
     tiêu đề sẽ biến tiêu đề thành đoạn thường. */
  const toggleQuote = () => {
    restoreSelection();
    const area = areaRef.current;
    const range = selectionRange();
    if (!area || !range) return;
    mutate(() => {
    const quote = closestIn(area, range.startContainer, (element) => element.tagName === "BLOCKQUOTE");
    let caretTarget;
    if (quote) {
      caretTarget = quote.firstChild;
      while (quote.firstChild) quote.before(quote.firstChild);
      quote.remove();
    } else {
      const first = range.startContainer === area ? area.childNodes[range.startOffset] : topLevelBlock(area, range.startContainer);
      const last = (range.endContainer === area ? area.childNodes[Math.max(0, range.endOffset - 1)] : topLevelBlock(area, range.endContainer)) || first;
      if (!first || first.tagName === "FIGURE") return;
      const wrapper = document.createElement("blockquote");
      first.before(wrapper);
      let node = first;
      while (node) {
        const next = node.nextSibling;
        wrapper.appendChild(node);
        if (node === last) break;
        node = next;
      }
      caretTarget = wrapper.firstChild;
    }
    if (caretTarget) {
      const caret = document.createRange();
      caret.selectNodeContents(caretTarget);
      caret.collapse(false);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(caret);
    }
    });
  };

  /* IN HOA / in thường. Vùng chọn nằm gọn trong một đoạn chữ thì thay bằng
     insertText để Ctrl+Z còn hoàn tác được; chọn qua nhiều định dạng thì đổi
     từng mẩu chữ tại chỗ để không làm mất chữ đậm / nghiêng bên trong. */
  const applyCase = (mode) => {
    restoreSelection();
    const range = selectionRange();
    if (!range || range.collapsed) return;
    mutate(() => {
    if (range.startContainer === range.endContainer && range.startContainer.nodeType === 3) {
      const text = range.toString();
      if (!run("insertText", changeCase(text, mode))) {
        const node = range.startContainer;
        node.data = node.data.slice(0, range.startOffset) + changeCase(text, mode) + node.data.slice(range.endOffset);
      }
    } else {
      const area = areaRef.current;
      const walker = document.createTreeWalker(area, window.NodeFilter.SHOW_TEXT);
      const edits = [];
      let node = walker.nextNode();
      while (node) {
        if (range.intersectsNode(node) && !node.parentElement.closest("[data-rte-ui]")) {
          const start = node === range.startContainer ? range.startOffset : 0;
          const end = node === range.endContainer ? range.endOffset : node.data.length;
          edits.push({ node, start, end });
        }
        node = walker.nextNode();
      }
      for (const { node, start, end } of edits) node.data = node.data.slice(0, start) + changeCase(node.data.slice(start, end), mode) + node.data.slice(end);
    }
    });
  };

  const openLink = () => {
    rememberSelection();
    const range = savedRange.current;
    const area = areaRef.current;
    const anchor = range && closestIn(area, range.startContainer, (element) => element.tagName === "A");
    setLinkDialog({
      href: anchor ? anchor.getAttribute("href") : "",
      text: range ? range.toString() : "",
      needsText: !range || range.collapsed,
      error: "",
    });
  };

  /* Bỏ link: con trỏ / vùng chọn nằm trong một link thì gỡ trọn link đó. Lệnh
     unlink của trình duyệt chỉ gỡ phần đang chọn nên dễ chẻ đôi link. */
  const removeLink = () => {
    restoreSelection();
    const area = areaRef.current;
    const range = selectionRange();
    if (!area || !range) return;
    const anchor = closestIn(area, range.startContainer, (element) => element.tagName === "A");
    if (anchor) {
      const whole = document.createRange();
      whole.selectNodeContents(anchor);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(whole);
    }
    mutate(() => { if (!run("unlink") && anchor) anchor.replaceWith(...anchor.childNodes); });
  };

  const confirmLink = () => {
    const href = safeLinkHref(linkDialog.href);
    if (!href) {
      setLinkDialog({ ...linkDialog, error: "Đường dẫn chưa hợp lệ. Ví dụ: https://… hoặc /journey/hanoi-to-sapa-private-transfer/" });
      return;
    }
    if (linkDialog.needsText && !linkDialog.text.trim()) {
      setLinkDialog({ ...linkDialog, error: "Nhập chữ sẽ hiển thị cho liên kết." });
      return;
    }
    setLinkDialog(null);
    const area = areaRef.current;
    if (!restoreSelection()) {
      area.focus();
      const range = document.createRange();
      range.selectNodeContents(area);
      range.collapse(false);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
    mutate(() => {
    if (linkDialog.needsText) {
      if (!run("insertHTML", `<a href="${escapeHtml(href)}">${escapeHtml(linkDialog.text.trim())}</a>`)) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = linkDialog.text.trim();
        (topLevelBlock(area, window.getSelection()?.anchorNode) || area.lastChild || area).appendChild(a);
      }
    } else if (!run("createLink", href)) {
      const range = savedRange.current;
      if (range) {
        const a = document.createElement("a");
        a.href = href;
        a.appendChild(range.extractContents());
        range.insertNode(a);
      }
    }
    });
  };

  /* Chèn ảnh: nhớ chỗ con trỏ trước khi hộp chọn file lấy mất focus, tải xong
     thì đặt khung ảnh ngay sau đoạn đang đứng. Range là "sống" nên chữ gõ thêm
     trong lúc chờ tải vẫn giữ nguyên, ảnh không đè lên. */
  const insertImage = useCallback((src, range = savedRange.current) => {
    const area = areaRef.current;
    if (!area || !src || !mounted.current) return;
    prepare();
    const figure = buildFigure(src);
    const anchor = range && area.contains(range.startContainer) ? topLevelBlock(area, range.startContainer) : null;
    if (anchor) anchor.after(figure);
    else area.appendChild(figure);
    if (!figure.nextSibling) figure.after(emptyParagraph());
    figure.querySelector("figcaption")?.focus();
    emit();
  }, [emit]);

  useImperativeHandle(ref, () => ({ insertImage, element: () => areaRef.current }), [insertImage]);

  const onImageInput = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onImageFile) return;
    const range = savedRange.current;
    const src = await onImageFile(file);
    if (src && mounted.current) insertImage(src, range);
  };

  const onKeyDown = (event) => {
    if (disabled || event.nativeEvent.isComposing || composing.current) return;
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && (key === "z" || key === "y")) {
      event.preventDefault();
      travelHistory(key === "y" || event.shiftKey ? "redo" : "undo");
      return;
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Tab"].includes(event.key)) history.current.breakGroup();
    const area = areaRef.current;
    const caption = closestIn(area, event.target, (element) => element.tagName === "FIGCAPTION");
    // Enter trong ô chú thích: không xuống dòng trong chú thích, nhảy ra đoạn mới sau ảnh.
    if (caption && event.key === "Enter") {
      event.preventDefault();
      mutate(() => {
      const figure = caption.closest("figure");
      let next = figure.nextElementSibling;
      if (!next || next.tagName === "FIGURE") {
        next = emptyParagraph();
        figure.after(next);
      }
      const range = document.createRange();
      range.setStart(next, 0);
      range.collapse(true);
      area.focus();
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      });
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openLink();
    }
  };

  const onPaste = (event) => {
    if (disabled) return;
    const data = event.clipboardData;
    if (!data) return;
    event.preventDefault();
    const inCaption = closestIn(areaRef.current, event.target, (element) => element.tagName === "FIGCAPTION");
    const html = data.getData("text/html");
    const text = data.getData("text/plain");
    mutate(() => {
    if (inCaption || !html) {
      const clean = inCaption ? text.replace(/\s+/g, " ") : text;
      const parts = clean.replace(/\r/g, "").split(/\n+/).filter((part) => part.trim());
      if (parts.length <= 1) run("insertText", parts[0] || "");
      else run("insertHTML", parts.map((part) => `<p>${escapeHtml(part)}</p>`).join(""));
    } else {
      run("insertHTML", cleanPastedHtml(html));
    }
    });
  };

  const onRemoveImage = (event) => {
    if (disabled) return;
    const remove = event.target.closest?.("[data-rte-remove]");
    if (!remove) return;
    event.preventDefault();
    const figure = remove.closest("figure");
    if (figure && window.confirm("Xoá ảnh này khỏi bài?")) {
      mutate(() => { figure.remove(); if (!areaRef.current.firstChild) areaRef.current.appendChild(emptyParagraph()); });
    }
  };

  const onFocus = () => {
    run("defaultParagraphSeparator", "p");
  };

  const button = (label, title, onClick, active = false, extra = {}) => (
    <button
      type="button"
      className={`hlt-rte-btn${active ? " is-active" : ""}`}
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={keepSelection}
      onClick={onClick}
      disabled={disabled}
      {...extra}
    >
      {label}
    </button>
  );

  return (
    <div className={`hlt-rte${disabled ? " is-disabled" : ""}`}>
      <div className="hlt-rte-toolbar" role="toolbar" aria-label="Định dạng nội dung" onKeyDown={(event) => {
        if (event.target.tagName === "SELECT" || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        const controls = [...event.currentTarget.querySelectorAll("button:not(:disabled), select:not(:disabled)")];
        const current = controls.indexOf(event.target);
        if (current < 0) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? controls.length - 1 : (current + (event.key === "ArrowLeft" ? -1 : 1) + controls.length) % controls.length;
        controls[next]?.focus();
      }}>
        {button(<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h9a7 7 0 0 1 7 7" /></svg>, "Hoàn tác (Ctrl+Z)", () => travelHistory("undo"), false, { disabled: disabled || !historyState.undo })}
        {button(<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 5 5-5 5m5-5h-9a7 7 0 0 0-7 7" /></svg>, "Làm lại (Ctrl+Y / Ctrl+Shift+Z)", () => travelHistory("redo"), false, { disabled: disabled || !historyState.redo })}
        <select
          className="hlt-rte-select"
          value={state.block}
          onMouseDown={rememberSelection}
          onFocus={rememberSelection}
          onChange={(event) => setBlock(event.target.value)}
          disabled={disabled}
          aria-label="Kiểu chữ"
        >
          {BLOCK_OPTIONS.map(([tag, label]) => <option key={tag} value={tag}>{label}</option>)}
          {state.block === "h1" && <option value="h1">H1 của bài cũ</option>}
        </select>
        <span className="hlt-rte-sep" aria-hidden="true" />
        {button(<b>B</b>, "Chữ đậm (Ctrl+B)", () => command("bold"), state.bold)}
        {button(<i>I</i>, "Chữ nghiêng (Ctrl+I)", () => command("italic"), state.italic)}
        {button("AA", "Đổi vùng chọn thành IN HOA", () => applyCase("upper"))}
        {button("aa", "Đổi vùng chọn thành in thường", () => applyCase("lower"))}
        <span className="hlt-rte-sep" aria-hidden="true" />
        {button("•", "Gạch đầu dòng", () => command("insertUnorderedList"), state.ul)}
        {button("1.", "Danh sách đánh số", () => command("insertOrderedList"), state.ol)}
        {button("❝", "Trích dẫn", toggleQuote, state.quote)}
        <span className="hlt-rte-sep" aria-hidden="true" />
        {button("Gắn link", "Gắn liên kết vào chữ đang chọn (Ctrl+K)", openLink, state.link, { className: `hlt-rte-btn is-text${state.link ? " is-active" : ""}` })}
        {button("Bỏ link", "Bỏ liên kết", removeLink, false, { className: "hlt-rte-btn is-text", disabled: disabled || !state.link })}
        <span className="hlt-rte-sep" aria-hidden="true" />
        {button("Chèn ảnh", "Chèn ảnh", () => { rememberSelection(); fileRef.current?.click(); }, false, { className: "hlt-rte-btn is-text", title: imageHint })}
        <input ref={fileRef} type="file" hidden aria-label="Chọn ảnh cho bài viết" accept={imageAccept} onChange={onImageInput} disabled={disabled} />
      </div>

      <div
        ref={areaRef}
        className={`hlt-rte-area hlt-article-body${empty ? " is-empty" : ""}`}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Nội dung bài"
        aria-readonly={disabled}
        data-placeholder={placeholder}
        onInput={(event) => {
          if (disabled || changing.current) return;
          const type = event.nativeEvent.inputType || "insertText";
          emit(/^(insertText|deleteContentBackward|deleteContentForward)$/.test(type) ? "typing" : "command");
        }}
        onCompositionStart={() => { prepare(); composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; emit("composition"); }}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onClick={onRemoveImage}
        onMouseDown={() => history.current.breakGroup()}
        onFocus={onFocus}
        onBlur={rememberSelection}
      />

      {linkDialog && (
        <AdminModal title="Gắn liên kết" onClose={() => setLinkDialog(null)} labelId="hlt-rte-link-title">
          <form
            className="hlt-admin-modal-body"
            onSubmit={(event) => {
              event.preventDefault();
              confirmLink();
            }}
          >
            <label className="hlt-admin-field">
              <span>Đường dẫn</span>
              <input
                type="text"
                inputMode="url"
                value={linkDialog.href}
                onChange={(event) => setLinkDialog({ ...linkDialog, href: event.target.value, error: "" })}
                placeholder="https://… hoặc /journey/hanoi-to-sapa-private-transfer/"
              />
            </label>
            {linkDialog.needsText && (
              <label className="hlt-admin-field">
                <span>Chữ hiển thị</span>
                <input
                  type="text"
                  value={linkDialog.text}
                  onChange={(event) => setLinkDialog({ ...linkDialog, text: event.target.value, error: "" })}
                  placeholder="Ví dụ: xe riêng Hà Nội – Sa Pa"
                />
              </label>
            )}
            {!linkDialog.needsText && <p className="hlt-admin-note">Gắn vào: “{linkDialog.text}”</p>}
            {linkDialog.error && <p className="hlt-admin-note is-error" role="alert">{linkDialog.error}</p>}
            <div className="hlt-admin-modal-foot">
              <button type="button" className="hlt-admin-btn is-ghost" onClick={() => setLinkDialog(null)}>Huỷ</button>
              <button type="submit" className="hlt-admin-btn">Gắn link</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
});

export default RichTextEditor;
