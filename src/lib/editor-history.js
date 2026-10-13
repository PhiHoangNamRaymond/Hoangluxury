// One bounded history for typing AND DOM formatting; no dependence on the
// browser's separate execCommand undo stack. Stored only in component memory.
export function createEditorHistory({ maxEntries = 100, maxBytes = 8_000_000 } = {}) {
  let entries = [], index = -1, lastGroup = "", lastTime = 0;
  const bytes = (entry) => entry.html.length * 2;
  const breakGroup = () => { lastGroup = ""; };
  return {
    reset(snapshot) { entries = [snapshot]; index = 0; breakGroup(); },
    current() { return entries[index]; },
    selection(selection) { if (entries[index]) entries[index] = { ...entries[index], selection }; },
    record(snapshot, group = "command", time = Date.now()) {
      if (entries[index]?.html === snapshot.html) { this.selection(snapshot.selection); return; }
      const merge = group === "typing" && lastGroup === group && time - lastTime < 800 && index === entries.length - 1 && index > 0;
      entries = entries.slice(0, index + 1);
      if (merge) entries[index] = snapshot;
      else { entries.push(snapshot); index += 1; }
      let size = entries.reduce((sum, entry) => sum + bytes(entry), 0);
      while (entries.length > 2 && (entries.length > maxEntries || size > maxBytes)) {
        size -= bytes(entries.shift()); index -= 1;
      }
      lastGroup = group; lastTime = time;
    },
    breakGroup,
    canUndo() { return index > 0; },
    canRedo() { return index < entries.length - 1; },
    undo() { breakGroup(); return index > 0 ? entries[--index] : null; },
    redo() { breakGroup(); return index < entries.length - 1 ? entries[++index] : null; },
  };
}

export function captureEditorSelection(root) {
  const selection = root.ownerDocument.defaultView.getSelection();
  if (!selection?.rangeCount || !root.contains(selection.anchorNode) || !root.contains(selection.focusNode)) return null;
  const path = (node) => {
    const result = [];
    while (node !== root) {
      result.unshift([...node.parentNode.childNodes].indexOf(node)); node = node.parentNode;
    }
    return result;
  };
  return { anchor: path(selection.anchorNode), anchorOffset: selection.anchorOffset, focus: path(selection.focusNode), focusOffset: selection.focusOffset };
}

export function restoreEditorSelection(root, bookmark) {
  const selection = root.ownerDocument.defaultView.getSelection();
  const resolve = (path) => path.reduce((node, index) => node?.childNodes[index], root);
  const anchor = bookmark && resolve(bookmark.anchor), focus = bookmark && resolve(bookmark.focus);
  if (!anchor || !focus) { root.focus(); return; }
  const limit = (node, offset) => Math.min(offset, node.nodeType === 3 ? node.length : node.childNodes.length);
  const parent = anchor.nodeType === 3 ? anchor.parentElement : anchor;
  (parent.closest?.('figcaption[contenteditable="true"]') || root).focus();
  if (selection.setBaseAndExtent) selection.setBaseAndExtent(anchor, limit(anchor, bookmark.anchorOffset), focus, limit(focus, bookmark.focusOffset));
  else {
    selection.collapse(anchor, limit(anchor, bookmark.anchorOffset));
    selection.extend(focus, limit(focus, bookmark.focusOffset));
  }
}
