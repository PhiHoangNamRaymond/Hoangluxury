const escapeAttribute = (value) => String(value).replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Callback replacements return literal metadata; writer-controlled $&, $', $`
// must never be interpreted as replacement-string instructions.
export function renderRoute(shell, origin, { path, title, description, private: isPrivate }) {
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);
  const safeUrl = escapeAttribute(`${origin}${path}`);
  const html = shell
    .replace(/<title>.*?<\/title>/s, () => `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, () => `<meta name="description" content="${safeDescription}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, () => `<link rel="canonical" href="${safeUrl}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, () => `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s, () => `<meta property="og:description" content="${safeDescription}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, () => `<meta property="og:url" content="${safeUrl}" />`);
  return isPrivate ? html.replace("</head>", () => '<meta name="robots" content="noindex, nofollow" /></head>') : html;
}
