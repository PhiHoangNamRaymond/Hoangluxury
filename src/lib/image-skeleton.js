/* Lightweight image loading state. No background probing, geometry reads,
   global reveal animation, or hiding of partially loaded images. */
const SKIP_PATTERN = /icon|logo|watermark|flag|ornament|crown|qr|artwork|decoration/i;
const INSTANCE = Symbol.for("hlt.imageLoadingCleanup");

export function setupImageSkeletons() {
  if (typeof document === "undefined") return undefined;
  window[INSTANCE]?.();
  const sources = new WeakMap();
  let active = true;

  const sourceKey = (img) =>
    [img.getAttribute("src"), img.getAttribute("srcset"), img.currentSrc].join("|");
  const eligible = (img) =>
    !SKIP_PATTERN.test(img.className) && !SKIP_PATTERN.test(img.alt || "") &&
    !img.closest(".hlt-icon, .hlt-brand, .hlt-header, .hlt-footer-qr, [data-no-skeleton]");
  const settle = (img, failed = false) => {
    img.classList.remove("hlt-img-pending", "is-loaded", "hlt-img-error");
    img.classList.add(failed ? "hlt-img-error" : "is-loaded");
  };
  const track = (img, refresh = false) => {
    if (!(img instanceof HTMLImageElement) || !eligible(img)) return;
    const key = sourceKey(img);
    if (!refresh && sources.get(img) === key) return;
    sources.set(img, key);
    img.dataset.hltSkeleton = "1";
    if (img.complete) {
      settle(img, img.naturalWidth === 0);
    } else {
      img.classList.remove("is-loaded", "hlt-img-error");
      img.classList.add("hlt-img-pending");
    }
  };
  const scan = (root) => {
    if (root instanceof HTMLImageElement) track(root);
    else root.querySelectorAll?.("img").forEach((img) => track(img));
  };
  const onLoad = (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.hltSkeleton) return;
    const current = img.currentSrc || img.src;
    const done = () => {
      if (active && img.isConnected && (img.currentSrc || img.src) === current) settle(img);
    };
    // Decoding completes without adding another visual transition.
    if (typeof img.decode === "function") img.decode().then(done, done);
    else done();
  };
  const onError = (event) => {
    const img = event.target;
    if (img instanceof HTMLImageElement && img.dataset.hltSkeleton) settle(img, true);
  };
  document.addEventListener("load", onLoad, true);
  document.addEventListener("error", onError, true);
  scan(document.body);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "childList") record.addedNodes.forEach(scan);
      else if (record.target instanceof HTMLImageElement) track(record.target, true);
      else if (record.target instanceof HTMLSourceElement) {
        const img = record.target.parentElement?.querySelector("img");
        if (img) track(img, true);
      }
    }
  });
  observer.observe(document.body, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ["src", "srcset"],
  });
  const cleanup = () => {
    active = false;
    observer.disconnect();
    document.removeEventListener("load", onLoad, true);
    document.removeEventListener("error", onError, true);
    document.querySelectorAll("img.hlt-img-pending").forEach((img) => img.classList.remove("hlt-img-pending"));
    if (window[INSTANCE] === cleanup) delete window[INSTANCE];
  };
  window[INSTANCE] = cleanup;
  return cleanup;
}
