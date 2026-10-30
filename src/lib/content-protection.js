// A convenience deterrent, NOT DRM or an access-control boundary. Anything
// delivered to a browser can still be retrieved or captured by its user.
const editable = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';
const practicalCopy = '[data-allow-copy], a, button, .hlt-footer-contact, .hlt-footer-mobile-contact';
const media = 'img, picture, svg, video, canvas';

function elementFor(node) {
  return node?.nodeType === 1 ? node : node?.parentElement;
}

export function setupContentProtection(doc = document, { enabled = true } = {}) {
  const root = doc.getElementById('root');
  const pathname = doc.defaultView?.location.pathname || '/';
  if (!enabled || !root || /^\/admin(?:\/|$)/i.test(pathname)) return () => {};

  function allow(element) {
    return element?.closest(editable) || element?.closest(practicalCopy);
  }
  function preventOrdinaryCopy(event) {
    const target = elementFor(event.target);
    if (target?.closest(editable) || target?.closest('[data-allow-copy]')) return;

    if (event.type === 'copy') {
      const selection = elementFor(doc.getSelection()?.anchorNode);
      const content = selection && root.contains(selection) ? selection : target;
      if (content && root.contains(content) && !allow(content)) event.preventDefault();
      return;
    }
    if (!target || !root.contains(target)) return;
    // Media within a link must not inherit the link's context-menu exception.
    if (target.closest(media) || !allow(target)) event.preventDefault();
  }

  root.classList.add('hlt-content-protected');
  const events = ['contextmenu', 'dragstart', 'copy'];
  for (const name of events) doc.addEventListener(name, preventOrdinaryCopy, true);
  return () => {
    for (const name of events) doc.removeEventListener(name, preventOrdinaryCopy, true);
    root.classList.remove('hlt-content-protected');
  };
}
