import React, { useEffect } from "react";

// Keep protection off while the site is being tested. Set to true before launch.
const CONTENT_PROTECTION_ENABLED = false;

const isEditableElement = (target) =>
  target instanceof HTMLElement &&
  (target.matches("input, textarea, select") || target.isContentEditable);

export default function ContentProtection({ children }) {
  useEffect(() => {
    if (!CONTENT_PROTECTION_ENABLED) return undefined;

    const preventDefault = (event) => event.preventDefault();
    const preventProtectedSelection = (event) => {
      if (!isEditableElement(event.target)) event.preventDefault();
    };
    const preventProtectedClipboard = (event) => {
      if (!isEditableElement(event.target)) event.preventDefault();
    };
    const preventProtectedShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const modifierPressed = event.ctrlKey || event.metaKey;
      const editable = isEditableElement(event.target);

      if (event.key === "F12") {
        event.preventDefault();
        return;
      }

      if (
        modifierPressed &&
        event.shiftKey &&
        ["c", "i", "j"].includes(key)
      ) {
        event.preventDefault();
        return;
      }

      if (!editable && modifierPressed && ["a", "c", "x", "s", "p", "u"].includes(key)) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventProtectedClipboard);
    document.addEventListener("cut", preventProtectedClipboard);
    document.addEventListener("selectstart", preventProtectedSelection);
    document.addEventListener("dragstart", preventDefault);
    document.addEventListener("keydown", preventProtectedShortcuts);

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventProtectedClipboard);
      document.removeEventListener("cut", preventProtectedClipboard);
      document.removeEventListener("selectstart", preventProtectedSelection);
      document.removeEventListener("dragstart", preventDefault);
      document.removeEventListener("keydown", preventProtectedShortcuts);
    };
  }, []);

  return children;
}
